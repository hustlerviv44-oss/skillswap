import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseClient";

export default function Navbar() {
  const [userAvatar, setUserAvatar] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🟢 Load avatar safely (even if localStorage loads later)
  const loadAvatar = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("userProfile"));
      console.log("🔍 Loaded avatar data:", saved); // Debug line
      if (saved?.uploadedImg) setUserAvatar(saved.uploadedImg);
      else if (saved?.avatar) setUserAvatar(saved.avatar);
      else setUserAvatar(null);
    } catch (err) {
      console.error("Error loading avatar:", err);
    }
  };

  // 🔄 On mount + when storage updates
  useEffect(() => {
    loadAvatar();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      loadAvatar();
    });

    const handleStorageChange = () => loadAvatar();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userProfile");
      setUserAvatar(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-transparent backdrop-blur-md">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 font-semibold text-lg">
        <span className="text-xl font-bold">SS</span> SkillSwap
      </div>

      {/* Center: Links */}
      <div className="flex items-center gap-10 text-gray-800 dark:text-gray-200 font-medium">
        <Link to="/">Home</Link>
        <Link to="/browse">Browse Skills</Link>
        <Link to="/profile">My Profile</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/add-skill">Add Skill</Link>
      </div>

      {/* Right: Search → Logout → Avatar → Theme */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <button className="text-gray-700 dark:text-gray-200 text-lg">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>

        {/* Logout/Login */}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-purple-400 to-blue-500 text-white font-semibold px-5 py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-gradient-to-r from-purple-400 to-blue-500 text-white font-semibold px-5 py-2 rounded-full shadow hover:opacity-90 transition-all"
          >
            Login
          </Link>
        )}

        {/* 👇 Avatar (after logout button) */}
        {userAvatar && (
          <Link to="/profile">
            <img
              src={userAvatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-gray-300 shadow-md hover:scale-105 transition-transform"
            />
          </Link>
        )}

        {/* 🌙 Theme toggle */}
        <button className="text-xl">
          <i className="fa-regular fa-moon text-gray-700 dark:text-gray-300"></i>
        </button>
      </div>
    </nav>
  );
}
