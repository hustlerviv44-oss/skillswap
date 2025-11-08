// src/firebaseClient.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// 🔥 Firebase Config — same as before
const firebaseConfig = {
  apiKey: "AIzaSyATSX9zfdbmPaeJRLljvkh7_OUTmwk_1JM",
  authDomain: "skillswap-project-13c19.firebaseapp.com",
  projectId: "skillswap-project-13c19",
  storageBucket: "skillswap-project-13c19.firebasestorage.app", // ✅ keep as-is
  messagingSenderId: "219107094687",
  appId: "1:219107094687:web:cefd70c4d0fdd137dc72aa",
  measurementId: "G-1VSTKSDNNV",
};

// 🚀 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔐 Authentication setup
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const googleProvider = new GoogleAuthProvider();

// 🧠 Firestore database (for users, skills, etc.)
const db = getFirestore(app);

// 🎥 Storage (for skill lecture videos or thumbnails)
const storage = getStorage(app);

// 📊 Analytics (optional — runs only if supported)
isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

// ✅ Exports
export { app, auth, googleProvider, db, storage };
export default app;
