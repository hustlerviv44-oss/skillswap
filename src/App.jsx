// src/App.jsx
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

  // Avoid flicker before Firebase loads
  if (user === undefined) return <div />;

  return (
    <Router>
      <Routes>
        {/* 🔑 Login page — only show if not logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {/* 🌐 All main pages inside Layout */}
        <Route element={<Layout />}>
          {/* 🏠 Home — always visible */}
          <Route
            index
            element={<Home showProfilePrompt={user && !hasProfile} />}
          />

          {/* 👤 Profile — requires login */}
          <Route
            path="profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />

          {/* 💬 Browse skills */}
          <Route
            path="browse"
            element={user ? <BrowseSkills /> : <Navigate to="/login" replace />}
          />

          {/* 🧩 Individual Skill Page */}
          <Route
            path="skill/:id"
            element={user ? <SkillDetail /> : <Navigate to="/login" replace />}
          />

          {/* 🆕 Add Skill Page */}
          <Route
            path="add-skill"
            element={user ? <AddSkill /> : <Navigate to="/login" replace />}
          />

          {/* 🎥 Full-Screen Lecture Recording Page */}
          <Route
            path="record"
            element={user ? <RecordLecture /> : <Navigate to="/login" replace />}
          />

          {/* 💬 Messages placeholder */}
          <Route
            path="messages"
            element={
              user ? (
                <div className="p-6">Messages — (coming soon)</div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 🚫 Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
