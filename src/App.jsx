import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import BrowseSkills from "./pages/BrowseSkills";
import SkillDetail from "./pages/SkillDetail";
import AddSkill from "./pages/AddSkill";
import RecordLecture from "./pages/RecordLecture"; // ✅ New recording studio page
import Messages from "./pages/Messages"; // ✅ New messages page
import { auth, db } from "./firebaseClient";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(undefined);
  const [hasProfile, setHasProfile] = useState(false);

  // 🧠 Monitor auth changes + enable persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);

        if (u) {
          try {
            // 🔍 Check if profile exists in Firestore
            const docRef = doc(db, "users", u.uid);
            const docSnap = await getDoc(docRef);
            setHasProfile(docSnap.exists() && !!docSnap.data()?.username);
          } catch (error) {
            console.error("Error fetching profile:", error);
            setHasProfile(false);
          }
        } else {
          setHasProfile(false);
        }
      });
      return () => unsub();
    });
  }, []);

  // 🕒 Refresh credits when localStorage updates (so Navbar stays in sync)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCredits = localStorage.getItem("timeCredits");
      if (storedCredits !== null) {
        document.dispatchEvent(new Event("creditsUpdated"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Avoid flicker before Firebase loads
  if (user === undefined) return <div />;

  return (
    <Router>
      <Routes>
        {/* 🔑 Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {/* 🌐 Main layout */}
        <Route element={<Layout />}>
          <Route
            index
            element={<Home showProfilePrompt={user && !hasProfile} />}
          />

          <Route
            path="profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="browse"
            element={user ? <BrowseSkills /> : <Navigate to="/login" replace />}
          />

          <Route
            path="skill/:id"
            element={user ? <SkillDetail /> : <Navigate to="/login" replace />}
          />

          <Route
            path="add-skill"
            element={user ? <AddSkill /> : <Navigate to="/login" replace />}
          />

          <Route
            path="record"
            element={user ? <RecordLecture /> : <Navigate to="/login" replace />}
          />

          {/* 💬 Updated: Messages page */}
          <Route
            path="messages"
            element={user ? <Messages /> : <Navigate to="/login" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
