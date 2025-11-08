// src/pages/BrowseSkills.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebaseClient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { skills as mockSkills, avatars } from "../data/skillsData";

export default function BrowseSkills() {
  const [skills, setSkills] = useState(mockSkills);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const searchTerm = new URLSearchParams(location.search).get("q")?.toLowerCase() || "";

  // Load credits
  useEffect(() => {
    const stored = localStorage.getItem("timeCredits");
    setCredits(Number(stored || 0));
  }, []);

  // Fetch skills
  useEffect(() => {
    const q = query(collection(db, "skills"), where("published", "==", true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const fetched = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setSkills(
            fetched.map((s) => ({
              ...s,
              creditsRequired: s.creditsRequired || Math.floor(Math.random() * 8) + 3,
            }))
          );
        } else {
          setSkills(
            mockSkills.map((s) => ({
              ...s,
              creditsRequired: s.creditsRequired || Math.floor(Math.random() * 8) + 3,
            }))
          );
        }
      },
      () => {
        setSkills(
          mockSkills.map((s) => ({
            ...s,
            creditsRequired: s.creditsRequired || Math.floor(Math.random() * 8) + 3,
          }))
        );
      }
    );
    return () => unsub();
  }, []);

  // Filtered + highlighted
  const filtered = useMemo(() => {
    if (!searchTerm) return skills;
    return skills.filter((s) =>
      (s.skill || s.name).toLowerCase().includes(searchTerm)
    );
  }, [skills, searchTerm]);

  const highlight = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<mark class='bg-yellow-300 text-black'>$1</mark>");
  };

  // Credit check before viewing
  const handleViewSkill = (skill) => {
    if (credits < skill.creditsRequired) {
      const missing = skill.creditsRequired - credits;
      const popup = document.createElement("div");
      popup.innerHTML = `⚠️ You need <b>${missing}</b> more credits to open this skill.`;
      popup.className =
        "fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg backdrop-blur-md bg-gradient-to-r from-red-400/90 to-pink-500/90 animate-fadeInOut z-[999]";
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 3200);
      return;
    }
    navigate(`/skill/${skill.id}`);
  };

  return (
    <section className="w-full py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
          {searchTerm ? `Results for “${searchTerm}”` : "Discover New Skills"}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 md:px-12">
        {filtered.length > 0 ? (
          filtered.map((user, idx) => (
            <div
              key={user.id || idx}
              className="bg-white/70 dark:bg-[#1f1f1f]/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-blue-400/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <img
                  src={avatars[idx % avatars.length]}
                  alt={user.authorName || user.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-300 dark:border-blue-700"
                />
                <div>
                  <h3
                    className="font-semibold text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{
                      __html: highlight(user.authorName || user.name),
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Skill Offered
                  </p>
                </div>
              </div>

              <h2
                className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                dangerouslySetInnerHTML={{
                  __html: highlight(user.skill || user.name),
                }}
              />
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {user.description}
              </p>

              <p className="text-sm text-center text-gray-700 dark:text-gray-300 font-medium mb-4">
                ⏱ Requires <b>{user.creditsRequired}</b> Credits
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => handleViewSkill(user)}
                  className="px-6 py-2 text-sm rounded-full bg-gradient-to-r from-purple-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition-all"
                >
                  View Skill
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg col-span-full">
            No matching skills found.
          </p>
        )}
      </div>
    </section>
  );
}
