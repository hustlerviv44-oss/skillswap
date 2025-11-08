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

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyATSX9zfdbmPaeJRLljvkh7_OUTmwk_1JM",
  authDomain: "skillswap-project-13c19.firebaseapp.com",
  projectId: "skillswap-project-13c19",
  storageBucket: "skillswap-project-13c19.firebasestorage.app",
  messagingSenderId: "219107094687",
  appId: "1:219107094687:web:cefd70c4d0fdd137dc72aa",
  measurementId: "G-1VSTKSDNNV",
};

// 🚀 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔐 Authentication setup
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Ensure browser persistence is applied safely
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn("Auth persistence setup skipped:", err);
  }
})();

// 🧠 Firestore database (for users, skills, chat, etc.)
const db = getFirestore(app);

// 🎥 Storage (for skill videos)
const storage = getStorage(app);

// 📊 Analytics (optional)
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

// ✅ Exports
export { app, auth, googleProvider, db, storage };
export default app;
