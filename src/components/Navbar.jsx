import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { auth } from "../firebaseClient";

export default function Navbar() {
  const [userAvatar, setUserAvatar] = useState(null);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [userName, setUserName] = useState("Guest User");
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  // ✅ Load user profile + credits
  const loadUserData = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("userProfile"));
      if (saved?.uploadedImg) setUserAvatar(saved.uploadedImg);
      else if (saved?.avatar) setUserAvatar(saved.avatar);
      else setUserAvatar(null);

      if (saved?.username) setUserName(saved.username);
      const storedCredits = localStorage.getItem("timeCredits") || 0;
      setCredits(storedCredits);
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  useEffect(() => {
    loadUserData();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      loadUserData();
    });
    window.addEventListener("storage", loadUserData);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleOutside = () => setShowDropdown(false);
    if (showDropdown) document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userProfile");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ Handle avatar click — open dropdown at proper position
  const handleAvatarClick = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setDropdownPosition({ x: rect.right - 180, y: rect.bottom + 10 });
    setShowDropdown((prev) => !prev);
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-transparent backdrop-blur-md relative z-[1000]">
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

        {/* Right Side */}
        <div className="flex items-center gap-5 relative">
          {/* Search */}
          <button className="text-gray-700 dark:text-gray-200 text-lg">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {/* Login / Logout */}
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

          {/* Avatar */}
          {userAvatar && (
            <img
              src={userAvatar}
              onClick={handleAvatarClick}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-gray-300 shadow-md hover:scale-105 cursor-pointer transition-transform"
            />
          )}

          {/* Theme toggle */}
          <button className="text-xl">
            <i className="fa-regular fa-moon text-gray-700 dark:text-gray-300"></i>
          </button>
        </div>
      </nav>

      {/* ✅ Portal renders dropdown ABOVE everything */}
      {showDropdown &&
        createPortal(
          <div
            className="fixed bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-56 z-[99999] animate-fadeIn"
            style={{
              top: `${dropdownPosition.y}px`,
              left: `${dropdownPosition.x}px`,
            }}
          >
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {userName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Time Credits:{" "}
              <span className="font-semibold text-purple-500">{credits}</span>
            </p>
          </div>,
          document.body
        )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
    </>
  );
}
