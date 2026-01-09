import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4ER2y3_El9WDp32okQNPmREFiwH1s8-w",
  authDomain: "major-project-2026.firebaseapp.com",
  projectId: "major-project-2026",
  storageBucket: "major-project-2026.firebasestorage.app",
  messagingSenderId: "372529551484",
  appId: "1:372529551484:web:00b96ecfe560b07cb211f9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // 🔥 THIS MUST BE getFirestore
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
export const persistence = {
  browserLocalPersistence,
  browserSessionPersistence,
};
