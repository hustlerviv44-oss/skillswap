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
  const [connecting, setConnecting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

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

  const handleConnect = () => {
    if (connecting) return;
    setConnecting(true);
    const popup = document.createElement("div");
    popup.innerHTML = `🎉 Connection request sent to <b>${skillData.name}</b>!`;
    popup.className =
      "fixed bottom-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg backdrop-blur-md bg-gradient-to-r from-purple-500/90 to-pink-500/90 animate-fadeInOut z-[999]";
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.remove();
      setConnecting(false);
    }, 3000);
  };

  const getYouTubeId = (url) => {
    try {
      const reg =
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(reg);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

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

  // ✅ Replace broken mock data URLs with working topic-based ones
  const workingLectures = skillData.lectures.map((lec) => {
    const topic = lec.title.toLowerCase();
    if (topic.includes("writing"))
      return { ...lec, url: "https://www.youtube.com/watch?v=Q3VjaCy5gck" };
    if (topic.includes("character"))
      return { ...lec, url: "https://www.youtube.com/watch?v=fqzR2XHsu3Y" };
    if (topic.includes("edit"))
      return { ...lec, url: "https://www.youtube.com/watch?v=7sZqQ2j8Yfs" };
    if (topic.includes("dance"))
      return { ...lec, url: "https://www.youtube.com/watch?v=QOZxF1B8hcc" };
    if (topic.includes("python"))
      return { ...lec, url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" };
    if (topic.includes("ui") || topic.includes("ux"))
      return { ...lec, url: "https://www.youtube.com/watch?v=9BxtKzL13zY" };
    if (topic.includes("baking"))
      return { ...lec, url: "https://www.youtube.com/watch?v=KzKJt2k5fM4" };
    if (topic.includes("guitar"))
      return { ...lec, url: "https://www.youtube.com/watch?v=2NQuj6tFJ3I" };
    if (topic.includes("fitness"))
      return { ...lec, url: "https://www.youtube.com/watch?v=UBMk30rjy0o" };
    if (topic.includes("mindfulness"))
      return { ...lec, url: "https://www.youtube.com/watch?v=inpok4MKVLM" };
    if (topic.includes("speaking"))
      return { ...lec, url: "https://www.youtube.com/watch?v=RjQJ-2-xz3M" };
    if (topic.includes("design"))
      return { ...lec, url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU" };
    return lec;
  });

  return (
    <section className="min-h-screen flex flex-col items-center px-6 md:px-16 py-10 bg-gradient-to-br from-[#F8F9FA] to-[#E9EBEF] dark:from-[#1A1B1E] dark:to-[#111216] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(186,178,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(147,197,253,0.15)_0%,transparent_40%)] animate-[pulse_12s_ease-in-out_infinite]"></div>

      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center relative z-10">
        <Link
          to="/browse"
          className="px-5 py-2.5 text-white text-sm font-semibold bg-gradient-to-r from-purple-400/80 to-blue-400/80 rounded-[50px_50px_50px_20px] shadow-[0_10px_30px_-10px_rgba(147,112,219,0.5)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all backdrop-blur-sm"
        >
          ← Back to Browse
        </Link>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className={`px-5 py-2.5 text-white text-sm font-semibold rounded-[50px_50px_20px_50px] shadow-[0_10px_30px_-10px_rgba(219,112,147,0.5)] transform hover:-translate-y-0.5 transition-all backdrop-blur-sm ${
            connecting
              ? "bg-gray-400/80 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500/80 to-pink-400/80 hover:shadow-xl"
          }`}
        >
          {connecting ? "Request Sent..." : `Connect with ${skillData.name}`}
        </button>
      </div>

      {/* Main Info */}
      <div className="max-w-6xl flex flex-col items-center justify-center text-center mt-16 relative z-10">
        <img
          src={avatar}
          alt={skillData.name}
          className="w-36 h-36 rounded-full border-4 border-white/80 dark:border-gray-800 shadow-lg object-cover mb-6"
        />
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
      </div>

      {/* 🎬 Lectures */}
      <div className="max-w-7xl w-full mt-20 bg-white/80 dark:bg-[#1f1f1f]/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-10 rounded-3xl shadow-lg relative z-10">
        <h2 className="text-3xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-10 text-center">
          Watch Lectures
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workingLectures.map((lec, i) => {
            const vid = getYouTubeId(lec.url);
            const thumb = vid
              ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
              : null;
            const isActive = activeVideo === i;

            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-white dark:bg-[#2a2a2a] shadow-md hover:shadow-purple-300/40 dark:hover:shadow-purple-800/50 transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                {!isActive && thumb ? (
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => setActiveVideo(i)}
                  >
                    <img
                      src={thumb}
                      alt={lec.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-play text-purple-600 text-xl ml-1"></i>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${vid}`}
                    title={lec.title}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
                <div className="p-4 text-center">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {lec.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(15px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(15px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
}
