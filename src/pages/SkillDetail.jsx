// src/pages/SkillDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { skills as mockSkills, avatars } from "../data/skillsData";

export default function SkillDetail() {
  const { id } = useParams();
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch from Firestore or fallback to mock data
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const docRef = doc(db, "skills", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          setSkillData({
            id,
            name: data.authorName || data.name,
            skill: data.name || data.skill,
            description: data.description,
            lectures: data.lectures || [],
            creditsRequired: data.creditsRequired || 0,
          });
        } else {
          // fallback to mock
          const fallback = mockSkills.find((s) => s.id === parseInt(id));
          setSkillData(fallback || null);
        }
      } catch (err) {
        console.error("Error fetching skill:", err);
        const fallback = mockSkills.find((s) => s.id === parseInt(id));
        setSkillData(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id]);

  const avatar = avatars[id % avatars.length];

  if (loading)
    return (
      <div className="text-center py-32 text-gray-600 dark:text-gray-400">
        Loading skill details...
      </div>
    );

  if (!skillData)
    return (
      <div className="text-center py-24 text-gray-600 dark:text-gray-400">
        Skill not found 😕
      </div>
    );

  return (
    <section className="min-h-screen flex flex-col items-center px-6 md:px-16 py-10 bg-gradient-to-br from-[#F8F9FA] to-[#E9EBEF] dark:from-[#1A1B1E] dark:to-[#111216] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(186,178,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(147,197,253,0.15)_0%,transparent_40%)] animate-[pulse_12s_ease-in-out_infinite]"></div>

      {/* Top Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center relative z-10">
        <Link
          to="/browse"
          className="px-5 py-2.5 text-white text-sm font-semibold bg-gradient-to-r from-purple-400/80 to-blue-400/80 rounded-[50px_50px_50px_20px] shadow-[0_10px_30px_-10px_rgba(147,112,219,0.5)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all backdrop-blur-sm"
        >
          ← Back to Browse
        </Link>

        <button className="px-5 py-2.5 text-white text-sm font-semibold bg-gradient-to-r from-purple-500/80 to-pink-400/80 rounded-[50px_50px_20px_50px] shadow-[0_10px_30px_-10px_rgba(219,112,147,0.5)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all backdrop-blur-sm">
          Connect with {skillData.name}
        </button>
      </div>

      {/* Header Section */}
      <div className="max-w-6xl flex flex-col items-center justify-center text-center mt-16 relative z-10">
        <div className="relative mb-6">
          <div className="absolute -inset-6 bg-gradient-to-tr from-pink-200/40 via-purple-200/40 to-blue-200/40 rounded-full blur-2xl opacity-80"></div>
          <img
            src={avatar}
            alt={skillData.name}
            className="relative w-36 h-36 rounded-full border-4 border-white/80 dark:border-gray-800 shadow-lg object-cover"
          />
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent leading-tight mb-4">
          {skillData.skill}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
          Offered by{" "}
          <span className="text-blue-500 font-medium">{skillData.name}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          {skillData.description}
        </p>

        {skillData.creditsRequired > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            ⏱ Requires <b>{skillData.creditsRequired}</b> time credits
          </p>
        )}

        <div className="w-28 h-[3px] bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-8"></div>
      </div>

      {/* Lectures Section */}
      <div className="max-w-7xl w-full mt-20 bg-white/80 dark:bg-[#1f1f1f]/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-10 rounded-3xl shadow-lg relative z-10">
        <h2 className="text-3xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-10 text-center">
          {skillData.lectures.length > 0 ? "Watch Lectures" : "No Lectures Added Yet"}
        </h2>

        {skillData.lectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skillData.lectures.map((lec, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden bg-white dark:bg-[#2a2a2a] shadow-md hover:shadow-purple-300/40 dark:hover:shadow-purple-800/50 transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                {lec.type === "text" ? (
                  <div className="p-5 min-h-[200px] flex flex-col justify-center text-center">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      {lec.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {lec.content}
                    </p>
                  </div>
                ) : (
                  <>
                    <iframe
                      src={
                        lec.content?.includes("youtube.com") ||
                        lec.content?.includes("youtu.be")
                          ? lec.content.replace("watch?v=", "embed/")
                          : lec.content
                      }
                      title={lec.title}
                      className="w-full aspect-video rounded-t-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="p-4 text-center">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                        {lec.title}
                      </h3>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No lectures to show for this skill.
          </p>
        )}
      </div>
    </section>
  );
}
