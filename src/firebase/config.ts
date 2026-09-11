import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firestore (with databaseId if configured)
const dbId = metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configJson.firestoreDatabaseId;
export const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
