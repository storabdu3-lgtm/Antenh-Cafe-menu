import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';
import fallbackConfig from './firebase-applet-config.json';

// Support both Vite import.meta.env (for browser) and Node process.env (for server API) and fallback configuration
const envSource: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {};

const firebaseConfig = {
  apiKey: envSource.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: envSource.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: envSource.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: envSource.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: envSource.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: envSource.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  firestoreDatabaseId:
    envSource.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    fallbackConfig.firestoreDatabaseId ||
    '(default)',
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore targeting the configured database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Signs in with Google using popup - optimal for AI Studio iframe environment
 */
export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.warn('Google sign-in notice:', error);
    throw error;
  }
}

/**
 * Signs out current user
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Ensures that the client has an active Firebase Auth session so that Firestore operations
 * satisfy security rules requiring an authenticated user (`request.auth != null`).
 */
export async function ensureFirebaseAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (err) {
          // If anonymous sign-in is disabled, resolve with null without crashing
          unsubscribe();
          resolve(null);
        }
      }
    });
  });
}

/**
 * Validates connection to Firestore
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently running in offline cache mode.');
    }
    return false;
  }
}

export const testFirestoreConnection = testConnection;
