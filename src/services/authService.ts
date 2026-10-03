import {
  isFirebaseActive,
  getFirebaseAuth,
  getFirebaseDb,
  withTimeout,
} from '../lib/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  deleteUser as firebaseDeleteUser,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { GradeId, SchoolLevelId, UserProfile, UserProgressState } from '../types';
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginRateLimit,
  sanitizeText,
  sanitizeEmail,
} from './securityService';

const STORAGE_KEY_USERS = 'pilotehub_registered_users_v2';
const STORAGE_KEY_CURRENT_USER = 'pilotehub_current_auth_user_id';

// Helper to determine school level from grade
export const getLevelFromGrade = (grade: GradeId): SchoolLevelId => {
  if (grade === '7th Grade' || grade === '8th Grade' || grade === '9th Grade') {
    return 'Middle School';
  }
  return 'High School';
};

// Retrieve all local users (if offline)
export const getLocalUsers = (): Array<UserProfile & { password?: string }> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      // Seed default demo accounts
      const defaultUsers: Array<UserProfile & { password?: string }> = [
        {
          uid: 'user_sarra_9g',
          email: 'sarra.mansour@pilote.tn',
          password: 'Password123!',
          displayName: 'Sarra Mansour',
          school: 'Pilote Ariana',
          grade: '9th Grade',
          level: 'Middle School',
          createdAt: '2026-01-15',
          isGuest: false,
        },
        {
          uid: 'user_amine_freshman',
          email: 'amine.khelifi@pilote.tn',
          password: 'Password123!',
          displayName: 'Amine Khelifi',
          school: 'Pilote Bourguiba Tunis',
          grade: 'Freshman',
          level: 'High School',
          createdAt: '2026-02-01',
          isGuest: false,
        },
      ];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Save local users
export const saveLocalUsers = (users: Array<UserProfile & { password?: string }>) => {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch {}
};

/**
 * Sign Up with Email and Password
 */
export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName: string,
  grade: GradeId,
  school?: string
): Promise<UserProfile> => {
  const level = getLevelFromGrade(grade);
  const now = new Date().toISOString().split('T')[0];
  const normalizedEmail = sanitizeEmail(email);
  if (!normalizedEmail) {
    const err: any = new Error('Please enter a valid email address.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  const cleanDisplayName = sanitizeText(displayName, 60) || 'Student Scholar';
  const cleanSchool = sanitizeText(school || '', 80) || 'Pilote School';
  const hashedPassword = await hashPassword(pass);

  const auth = getFirebaseAuth();
  let userUid = '';

  if (auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      await firebaseUpdateProfile(cred.user, { displayName: cleanDisplayName });
      userUid = cred.user.uid;
    } catch (err: any) {
      console.warn('Firebase createUser notice:', err);
      // If error is network-request-failed, allow graceful local account creation
      if (err?.code === 'auth/network-request-failed' || !navigator.onLine) {
        const localUsers = getLocalUsers();
        if (localUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
          const customErr: any = new Error('This email address is already in use.');
          customErr.code = 'auth/email-already-in-use';
          throw customErr;
        }
        userUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      } else {
        throw err;
      }
    }
  } else {
    userUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const profile: UserProfile = {
    uid: userUid,
    email: normalizedEmail,
    displayName: cleanDisplayName,
    school: cleanSchool,
    grade,
    level,
    createdAt: now,
    isGuest: false,
  };

  // Save profile to local storage user repository with securely hashed password
  const currentLocalUsers = getLocalUsers();
  const updatedLocalUsers = [
    ...currentLocalUsers.filter((u) => u.email.toLowerCase() !== normalizedEmail),
    { ...profile, password: hashedPassword },
  ];
  saveLocalUsers(updatedLocalUsers);

  // Save profile to Firestore if available
  const db = getFirebaseDb();
  if (db && !profile.uid.startsWith('usr_')) {
    try {
      await withTimeout(setDoc(doc(db, 'users', profile.uid), profile), 2500);
    } catch {
      // Local storage profile already preserved
    }
  }

  localStorage.setItem(STORAGE_KEY_CURRENT_USER, profile.uid);
  localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(profile));

  return profile;
};

/**
 * Sign In with Email and Password
 */
export const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  const normalizedEmail = sanitizeEmail(email);
  if (!normalizedEmail) {
    const err: any = new Error('Please enter a valid email address.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  // Security Check: Rate limiting to protect against brute-force attacks
  const rateLimit = checkLoginRateLimit(normalizedEmail);
  if (!rateLimit.allowed) {
    const err: any = new Error(
      `Account locked for security reasons. Please wait ${rateLimit.remainingSeconds}s before attempting to sign in again.`
    );
    err.code = 'auth/too-many-requests';
    throw err;
  }

  const auth = getFirebaseAuth();

  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      clearLoginRateLimit(normalizedEmail);

      const db = getFirebaseDb();
      let profile: UserProfile | null = null;

      if (db) {
        try {
          const snap = await withTimeout(getDoc(doc(db, 'users', cred.user.uid)), 2000);
          if (snap && snap.exists()) {
            profile = snap.data() as UserProfile;
          }
        } catch {
          // Graceful fallback to local profile
        }
      }

      if (!profile) {
        profile = {
          uid: cred.user.uid,
          email: cred.user.email || normalizedEmail,
          displayName: cred.user.displayName || 'Student Scholar',
          school: 'Pilote School',
          grade: '9th Grade',
          level: 'Middle School',
          createdAt: new Date().toISOString().split('T')[0],
          isGuest: false,
        };
      }

      // Update local cache with securely hashed password
      const hashedPassword = await hashPassword(pass);
      const localUsers = getLocalUsers();
      saveLocalUsers([
        ...localUsers.filter((u) => u.uid !== profile!.uid),
        { ...profile, password: hashedPassword },
      ]);

      localStorage.setItem(STORAGE_KEY_CURRENT_USER, profile.uid);
      localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(profile));

      return profile;
    } catch (firebaseErr: any) {
      console.warn('Firebase signIn notice:', firebaseErr);
      const code = firebaseErr?.code;

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        recordFailedLoginAttempt(normalizedEmail);
        throw firebaseErr;
      }

      // If it's a network error or offline, fallback to local users registry or auto-provision
      if (code === 'auth/network-request-failed' || !navigator.onLine) {
        const localUsers = getLocalUsers();
        const matchedUser = localUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        if (matchedUser) {
          const isPasswordValid = await verifyPassword(pass, matchedUser.password || '');
          if (!isPasswordValid) {
            recordFailedLoginAttempt(normalizedEmail);
            const err: any = new Error('Invalid email or password.');
            err.code = 'auth/wrong-password';
            throw err;
          }
          clearLoginRateLimit(normalizedEmail);

          const profile: UserProfile = {
            uid: matchedUser.uid,
            email: matchedUser.email,
            displayName: matchedUser.displayName,
            school: matchedUser.school,
            grade: matchedUser.grade,
            level: matchedUser.level,
            createdAt: matchedUser.createdAt,
            isGuest: false,
          };
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, profile.uid);
          localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(profile));
          return profile;
        } else {
          // In offline / preview sandbox mode, automatically register the student locally
          clearLoginRateLimit(normalizedEmail);
          const fallbackDisplayName =
            normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
            'Student Scholar';
          const autoProfile: UserProfile = {
            uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            email: normalizedEmail,
            displayName: fallbackDisplayName,
            school: 'Pilote School',
            grade: '9th Grade',
            level: 'Middle School',
            createdAt: new Date().toISOString().split('T')[0],
            isGuest: false,
          };
          const hashedPassword = await hashPassword(pass);
          saveLocalUsers([...localUsers, { ...autoProfile, password: hashedPassword }]);
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, autoProfile.uid);
          localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(autoProfile));
          return autoProfile;
        }
      }

      recordFailedLoginAttempt(normalizedEmail);
      throw firebaseErr;
    }
  }

  // Pure local fallback mode
  const localUsers = getLocalUsers();
  const matchedUser = localUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (matchedUser) {
    const isPasswordValid = await verifyPassword(pass, matchedUser.password || '');
    if (!isPasswordValid) {
      recordFailedLoginAttempt(normalizedEmail);
      const err: any = new Error('Invalid email or password.');
      err.code = 'auth/wrong-password';
      throw err;
    }
    clearLoginRateLimit(normalizedEmail);

    const profile: UserProfile = {
      uid: matchedUser.uid,
      email: matchedUser.email,
      displayName: matchedUser.displayName,
      school: matchedUser.school,
      grade: matchedUser.grade,
      level: matchedUser.level,
      createdAt: matchedUser.createdAt,
      isGuest: false,
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, profile.uid);
    localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(profile));
    return profile;
  } else {
    clearLoginRateLimit(normalizedEmail);
    const fallbackDisplayName =
      normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
      'Student Scholar';
    const autoProfile: UserProfile = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      displayName: fallbackDisplayName,
      school: 'Pilote School',
      grade: '9th Grade',
      level: 'Middle School',
      createdAt: new Date().toISOString().split('T')[0],
      isGuest: false,
    };
    const hashedPassword = await hashPassword(pass);
    saveLocalUsers([...localUsers, { ...autoProfile, password: hashedPassword }]);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, autoProfile.uid);
    localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(autoProfile));
    return autoProfile;
  }
};


/**
 * Sign Out
 */
export const signOutUser = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign out notice:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  localStorage.removeItem('pilotehub_cached_user_profile');
};

/**
 * Delete User Account permanently from Firebase Auth & Firestore
 */
export const deleteUserAccount = async (uid: string): Promise<void> => {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;

  // 1. Delete Firestore user document & associated user progress if available
  const db = getFirebaseDb();
  if (db && uid) {
    try {
      await withTimeout(deleteDoc(doc(db, 'users', uid)), 2500);
    } catch {
      // Local deletion handled below
    }
    try {
      await withTimeout(deleteDoc(doc(db, 'progress', uid)), 2500);
    } catch {
      // Local deletion handled below
    }
  }

  // 2. Delete local user cache & progress
  try {
    localStorage.removeItem(`pilotehub_user_progress_${uid}`);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    localStorage.removeItem('pilotehub_cached_user_profile');
    const localUsers = getLocalUsers();
    const filtered = localUsers.filter((u) => u.uid !== uid);
    saveLocalUsers(filtered);
  } catch (e) {
    console.warn('Error cleaning local storage on account deletion:', e);
  }

  // 3. Delete from Firebase Authentication
  if (currentUser && currentUser.uid === uid) {
    await firebaseDeleteUser(currentUser);
  }
};

/**
 * Update Profile
 */
export const updateUserProfileData = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  const db = getFirebaseDb();
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', uid), updates, { merge: true }), 2500);
    } catch {
      // Local cache updated below
    }
  }

  const cached = localStorage.getItem('pilotehub_cached_user_profile');
  let current: UserProfile;
  if (cached) {
    current = { ...JSON.parse(cached), ...updates };
  } else {
    current = {
      uid,
      email: 'student@pilotehub.edu',
      displayName: updates.displayName || 'Student Scholar',
      school: updates.school || 'Pilote School',
      grade: updates.grade || '9th Grade',
      level: updates.grade ? getLevelFromGrade(updates.grade) : 'Middle School',
      createdAt: new Date().toISOString().split('T')[0],
      ...updates,
    };
  }

  localStorage.setItem('pilotehub_cached_user_profile', JSON.stringify(current));
  return current;
};

/**
 * Get the initial or stored auth session on app startup
 */
export const getInitialAuthSession = (): UserProfile | null => {
  const currentUid = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!currentUid) return null;

  try {
    const raw = localStorage.getItem('pilotehub_cached_user_profile');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return null;
};

/**
 * Send password reset email via Firebase Auth
 */
export const sendPasswordResetLink = async (email: string): Promise<void> => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not initialized.');

  await sendPasswordResetEmail(auth, email.trim());
};


