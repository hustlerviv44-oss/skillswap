// src/Layout.jsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const location = useLocation();

  // 🌓 Theme setup
  useEffect(() => {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 19 || currentHour < 6;
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) setDarkMode(storedTheme === "dark");
    else {
      setDarkMode(isNight);
      localStorage.setItem("theme", isNight ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🧠 Listen to auth changes + handle popup + Firestore avatar
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoggedIn(!!u);

      if (u) {
        try {
          // Load Firestore user data on login
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.uploadedImg) setUserAvatar(data.uploadedImg);
            else if (data.avatar) setUserAvatar(data.avatar);
            else setUserAvatar(null);

            // Sync to localStorage
            localStorage.setItem("userProfile", JSON.stringify(data));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }

        setTimeout(() => {
          const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
          const dismissed = localStorage.getItem("profilePromptDismissed");
          if ((!savedProfile || !savedProfile.username) && !dismissed) {
            setShowProfilePrompt(true);
          } else {
            setShowProfilePrompt(false);
          }
        }, 500);
      } else {
        setShowProfilePrompt(false);
        setUserAvatar(null);
      }
    });
    return () => unsub();
  }, []);

  // 🧩 Load avatar from localStorage and update when changed
  const loadAvatar = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("userProfile"));
      if (saved?.uploadedImg) setUserAvatar(saved.uploadedImg);
      else if (saved?.avatar) setUserAvatar(saved.avatar);
      else setUserAvatar(null);
    } catch {
      setUserAvatar(null);
    }
  };

  useEffect(() => {
    loadAvatar();
    window.addEventListener("storage", loadAvatar);
    return () => window.removeEventListener("storage", loadAvatar);
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      localStorage.removeItem("userProfile");
      setUserAvatar(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const tabs = [
    { name: "HOME", to: "/" },
    { name: "BROWSE SKILLS", to: "/browse" },
    { name: "MY PROFILE", to: "/profile" },
    { name: "MESSAGES", to: "/messages" },
    { name: "ADD SKILL", to: "/add-skill" },
  ];

  return (
    <div className="bg-gray-300 dark:bg-gray-800 font-[Poppins] min-h-screen">
      <main className="w-full min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9EBEF] dark:from-[#1A1B1E] dark:to-[#111216] flex flex-col p-6 md:p-12 relative overflow-x-hidden transition-all duration-500">
        
        {/* Header */}
        <header className="flex justify-between items-center text-gray-800 dark:text-gray-200 text-[13px] md:text-[16px] font-normal tracking-[0.12em] uppercase select-none mb-8">
          {/* Logo */}
          <div className="flex items-center gap-x-4 cursor-default">
            <span className="text-xl md:text-2xl font-semibold">SS</span>
            <span>SKILLSWAP</span>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-x-6 text-[13px] md:text-[16px] font-normal tracking-wide relative">
            {tabs.map((tab) => {
              const active =
                location.pathname === tab.to ||
                (tab.to === "/" && location.pathname === "/");
              return (
                <Link
                  key={tab.name}
                  to={tab.to}
                  className={`group relative inline-flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors duration-150 ease-out ${
                    active ? "text-blue-500" : "hover:text-blue-400"
                  }`}
                >
                  {tab.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-[3px] bg-blue-500 transition-all duration-200 ease-in-out ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-x-4 md:gap-x-6 relative">

            {/* Search */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowSearch(true)}
              onMouseLeave={() =>
                setTimeout(() => {
                  if (!document.activeElement.classList.contains("search-input"))
                    setShowSearch(false);
                }, 120)
              }
            >
              <button
                aria-label="Open search"
                onClick={() => setShowSearch((s) => !s)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200/40 dark:hover:bg-gray-700/40 transition-all duration-150"
                type="button"
              >
                <span className="material-icons-outlined text-[22px] text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors">
                  search
                </span>
              </button>

              <input
                type="text"
                placeholder="Search..."
                className={`search-input absolute right-10 top-1/2 -translate-y-1/2 text-sm rounded-full outline-none transition-all duration-300 bg-gray-100 dark:bg-[#1f1f1f] text-gray-800 dark:text-gray-200 py-2 ${
                  showSearch ? "w-44 px-3 opacity-100" : "w-0 px-0 opacity-0"
                }`}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setShowSearch(false)}
              />
            </div>

            {/* Login / Logout + Avatar */}
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-br from-purple-200 to-blue-400 dark:from-purple-800/60 dark:to-blue-900/60 text-gray-900 dark:text-gray-200 text-[13px] font-medium shadow-md transition-transform duration-150 hover:scale-105 hover:text-white"
                >
                  LOGOUT
                </button>

                {/* 👇 Avatar Display */}
                {userAvatar && (
                  <Link to="/profile">
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border border-gray-300 shadow-md hover:scale-105 transition-transform"
                    />
                  </Link>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-br from-purple-200 to-blue-400 dark:from-purple-800/60 dark:to-blue-900/60 text-gray-900 dark:text-gray-200 text-[13px] font-medium shadow-md transition-transform duration-150 hover:scale-105 hover:text-white"
              >
                LOGIN
              </Link>
            )}

            {/* Theme */}
            <button
              onClick={() => setDarkMode((s) => !s)}
              className="p-2 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
              aria-label="Toggle theme"
            >
              <span className="text-[20px]">{darkMode ? "☀️" : "🌙"}</span>
            </button>
          </div>
        </header>

        {/* ⚡ Profile Setup Prompt (below logo) */}
        {showProfilePrompt && (
          <div className="fixed top-[6rem] left-[1.5rem] bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-lg shadow-lg rounded-lg p-4 w-[18rem] z-50 border border-gray-300 dark:border-gray-700 animate-slideInLeftSmall">
            <div className="flex justify-between items-start">
              <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-100">
                Complete Your Profile
              </h3>
              <button
                onClick={() => {
                  setShowProfilePrompt(false);
                  localStorage.setItem("profilePromptDismissed", "true");
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1 leading-snug">
              Set up your profile to connect and share skills.
            </p>

            <div className="flex justify-end mt-4">
              <Link
                to="/profile"
                onClick={() => {
                  setShowProfilePrompt(false);
                  localStorage.setItem("profilePromptDismissed", "true");
                }}
                className="px-4 py-1.5 rounded-md text-[13px] font-medium text-white bg-gradient-to-r from-purple-400 to-blue-500 hover:opacity-90 shadow-sm"
              >
                Create
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 w-full flex justify-center items-start md:items-center transition-all duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
