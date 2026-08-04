import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// NOTE ON SECURITY: these values are meant to ship inside the client bundle —
// the Firebase Web SDK cannot function without them, and Google's own docs
// confirm the web `apiKey` is an identifier, not a secret. Moving them into
// env vars here is about config hygiene (easy to change per environment,
// easy to rotate in the Firebase console without touching source) — it is
// NOT what protects your data. That protection comes from firestore.rules
// (already scoped to specific admin emails) and, optionally, Firebase App
// Check. See the security notes shared alongside this file for more detail.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Missing Firebase config: set the VITE_FIREBASE_* variables in .env.local (see .env.example).'
  );
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
