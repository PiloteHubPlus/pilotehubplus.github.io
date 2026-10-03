import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';

/**
 * =========================================================================
 * PILOTEHUB+ FIREBASE CONFIGURATION
 * =========================================================================
 */
export const USE_FIREBASE_PROD: boolean = true;

// Helper to determine if we are currently running in live Firebase mode
export const isFirebaseActive = (): boolean => {
  return true;
};

// Safe asynchronous timeout utility for network calls
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Network operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Set runtime toggle in UI
export const setRuntimeFirebaseMode = (active: boolean) => {
  try {
    localStorage.setItem('pilotehub_runtime_use_firebase', active ? 'true' : 'false');
  } catch {}
};

/**
 * Firebase project configuration credentials
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCOKIPOtXyuAk7gmQmg7R-T3fKiqY18OWY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pilotehub-id.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pilotehub-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pilotehub-id.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293166318125",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:293166318125:web:ae3803fc33c487e83beea4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YJS99EFHB7",
};

// Lazy singletons
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!app) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    } catch (err) {
      console.warn('[Pilotehub+ Firebase] Initialization notice:', err);
      return null;
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    const fApp = getFirebaseApp();
    if (fApp) {
      try {
        auth = getAuth(fApp);
      } catch (err) {
        console.warn('[Pilotehub+ Auth] Initialization notice:', err);
      }
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!db) {
    const fApp = getFirebaseApp();
    if (fApp) {
      try {
        // Initialize Firestore with auto-detect long polling to prevent 10s backend unreachable hang
        db = initializeFirestore(fApp, {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
        });
      } catch {
        try {
          db = getFirestore(fApp);
        } catch (innerErr) {
          console.warn('[Pilotehub+ Firestore] Initialization notice:', innerErr);
        }
      }
    }
  }
  return db;
}

