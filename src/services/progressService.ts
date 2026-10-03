import { isFirebaseActive, getFirebaseDb, withTimeout } from '../lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GradeId, SchoolLevelId, UserProgressState } from '../types';
import { getLevelFromGrade } from './authService';

const PROGRESS_STORAGE_PREFIX = 'pilotehub_user_progress_';

// Initial pre-configured progress states for demonstration accounts
const SAMPLE_USER_PROGRESS: Record<string, Partial<UserProgressState>> = {
  user_sarra_9g: {
    completedResourceIds: ['9g-ar-c1', '9g-en-c1', '9g-ma-e1', '9g-sc-c1', '9g-fr-c1'],
    bookmarkedResourceIds: ['9g-ph-e1', '9g-ma-ex1'],
    currentStreak: 5,
    longestStreak: 8,
    lastStudyDate: new Date().toISOString().split('T')[0],
    activityHistory: {
      [new Date().toISOString().split('T')[0]]: 45,
    },
    totalMinutesStudied: 320,
    dailyGoalMinutes: 45,
    xp: 420,
    unlockedBadges: ['badge-first-step', 'badge-3-streak', 'badge-5-streak', 'badge-math-whiz'],
    notes: {
      general: 'Focus on Thales Theorem & Nervous system communication for the synthesis exam!',
      Math: 'Review vectors and Thales proportions before the control exam.',
    },
    selectedGrade: '9th Grade',
    selectedLevel: 'Middle School',
    userName: 'Sarra Mansour',
    customTimerPresets: [
      { id: 'sarra-p1', name: 'Maths Spécialité', minutes: 40, category: 'exam' },
      { id: 'sarra-p2', name: 'SVT & Sciences', minutes: 25, category: 'focus' },
      { id: 'sarra-p3', name: 'Pause Thé / Goûter', minutes: 10, category: 'break' },
    ],
  },
  user_amine_freshman: {
    completedResourceIds: ['1s-ma-c1', '1s-ph-c1', '1s-fr-c1'],
    bookmarkedResourceIds: ['1s-cs-c1', '1s-ma-ex1'],
    currentStreak: 4,
    longestStreak: 6,
    lastStudyDate: new Date().toISOString().split('T')[0],
    activityHistory: {
      [new Date().toISOString().split('T')[0]]: 30,
    },
    totalMinutesStudied: 210,
    dailyGoalMinutes: 50,
    xp: 280,
    unlockedBadges: ['badge-first-step', 'badge-3-streak'],
    notes: {
      general: 'Vectors in ℝ² and Python algorithmic functions need more practice.',
    },
    selectedGrade: 'Freshman',
    selectedLevel: 'High School',
    userName: 'Amine Khelifi',
    customTimerPresets: [
      { id: 'amine-p1', name: 'Algorithmique Python', minutes: 35, category: 'focus' },
      { id: 'amine-p2', name: 'Physique Devoir Synthèse', minutes: 50, category: 'exam' },
    ],
  },
  user_nour_8g: {
    completedResourceIds: ['8g-ma-c1', '8g-sc-c1'],
    bookmarkedResourceIds: ['8g-ar-c1'],
    currentStreak: 2,
    longestStreak: 4,
    lastStudyDate: '',
    activityHistory: {},
    totalMinutesStudied: 90,
    dailyGoalMinutes: 30,
    xp: 140,
    unlockedBadges: ['badge-first-step'],
    notes: {
      general: 'Review rational numbers addition and geometry transformations.',
    },
    selectedGrade: '8th Grade',
    selectedLevel: 'Middle School',
    userName: 'Nour Ben Salem',
    customTimerPresets: [
      { id: 'nour-p1', name: 'Arabe & Grammaire', minutes: 20, category: 'focus' },
    ],
  },
};

export const createDefaultProgress = (
  userId: string,
  userName: string = 'Student Scholar',
  grade: GradeId = '9th Grade',
  level?: SchoolLevelId
): UserProgressState => {
  const finalLevel = level || getLevelFromGrade(grade);
  return {
    userId,
    completedResourceIds: [],
    bookmarkedResourceIds: [],
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    activityHistory: {},
    totalMinutesStudied: 0,
    dailyGoalMinutes: 45,
    xp: 50,
    unlockedBadges: ['badge-first-step'],
    notes: {
      general: `Welcome to Pilotehub+! Start exploring ${grade} materials to build your streak.`,
    },
    selectedGrade: grade,
    selectedLevel: finalLevel,
    userName,
    customTimerPresets: [
      { id: `p-init-1`, name: 'Revision Focus', minutes: 30, category: 'focus' },
      { id: `p-init-2`, name: 'Exam Practice', minutes: 45, category: 'exam' },
    ],
  };
};

/**
 * Load user progress (from Firestore in Firebase mode, or localStorage in Test mode)
 */
export const loadUserProgress = async (
  userId: string,
  userName: string,
  grade: GradeId,
  level?: SchoolLevelId
): Promise<UserProgressState> => {
  const fallback =
    SAMPLE_USER_PROGRESS[userId]
      ? ({ ...createDefaultProgress(userId, userName, grade, level), ...SAMPLE_USER_PROGRESS[userId], userId } as UserProgressState)
      : createDefaultProgress(userId, userName, grade, level);

  if (isFirebaseActive()) {
    const db = getFirebaseDb();
    if (db) {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'progress', userId)), 2000);
        if (snap && snap.exists()) {
          return { ...fallback, ...snap.data(), userId } as UserProgressState;
        }
      } catch (err) {
        // Fallback to local storage gracefully without blocking
      }
    }
  }

  // Test mode localStorage retrieval
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_PREFIX + userId);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...fallback, ...parsed, userId };
    }
  } catch {}

  // Save the fallback
  saveUserProgress(fallback);
  return fallback;
};

/**
 * Save user progress (to Firestore if active, and always to isolated localStorage key)
 */
export const saveUserProgress = async (progress: UserProgressState): Promise<void> => {
  if (!progress.userId) return;

  // Local isolation
  try {
    localStorage.setItem(PROGRESS_STORAGE_PREFIX + progress.userId, JSON.stringify(progress));
  } catch {}

  // Firebase Firestore synchronization
  if (isFirebaseActive()) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await withTimeout(setDoc(doc(db, 'progress', progress.userId), progress, { merge: true }), 2500);
      } catch (err) {
        // Silently handled - local cache is already saved
      }
    }
  }
};
