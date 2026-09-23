import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';

const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : ({} as any);

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || configJson.appId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with robust connection settings and offline-first cache
const dbId = metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configJson.firestoreDatabaseId;

const initDb = () => {
  const firestoreSettings = {
    // Enable offline persistence across browser tabs
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    // Force long polling in iframe/preview environments to avoid WebChannel streaming timeouts
    experimentalLongPollingOptions: {
      timeoutSeconds: 20
    }
  };

  try {
    if (dbId && dbId !== '(default)') {
      return initializeFirestore(app, firestoreSettings, dbId);
    }
    return initializeFirestore(app, firestoreSettings);
  } catch {
    // If initializeFirestore fails (e.g. instance already exists), retrieve it
    return dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
  }
};

export const db = initDb();

// Initialize Storage
export const storage = getStorage(app);

export default app;
