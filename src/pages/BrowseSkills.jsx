// src/pages/BrowseSkills.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebaseClient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { skills as mockSkills, avatars } from "../data/skillsData";

export default function BrowseSkills() {
  const [skills, setSkills] = useState(mockSkills);

  useEffect(() => {
    // 🔥 Listen to all published skills in Firestore
    const q = query(collection(db, "skills"), where("published", "==", true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSkills(fetched);
        } else {
          // fallback to mock data
          setSkills(mockSkills);
        }
      },
      (error) => {
        console.error("Error fetching Firestore skills:", error);
        setSkills(mockSkills);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="w-full py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
          Discover New Skills
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Connect with talented individuals and share your passion for learning.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 md:px-12">
        {skills.map((user, idx) => (
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
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user.authorName || user.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Skill Offered
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {user.name || user.skill}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              {user.description}
            </p>

            {/* ⭐ Ratings — static placeholder or from data */}
            <div className="flex items-center justify-center text-blue-400 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`material-icons-outlined text-[20px] ${
                    i < Math.floor(user.rating || 4)
                      ? "text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  star
                </span>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {(user.rating || 4.0).toFixed(1)}
              </span>
            </div>

            {/* 💰 Show credits if available */}
            {user.creditsRequired && (
              <p className="text-sm text-center text-gray-500 mb-4">
                ⏱ Requires <b>{user.creditsRequired}</b> credits
              </p>
            )}

            <div className="flex justify-center">
              <Link
                to={`/skill/${user.id}`}
                className="px-6 py-2 text-sm rounded-full bg-gradient-to-r from-purple-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition-all"
              >
                View Skill
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
