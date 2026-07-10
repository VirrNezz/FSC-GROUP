import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAo329LS96Wl_kJBvKLVESt0ySoECYSZmw",
  authDomain: "fsc-group.firebaseapp.com",
  projectId: "fsc-group",
  storageBucket: "fsc-group.firebasestorage.app",
  messagingSenderId: "477035240014",
  appId: "1:477035240014:web:947b528ba0ab401e43011f"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
