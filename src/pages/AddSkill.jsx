import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import videoIcon from "../assets/video-24.png";
import notesIcon from "../assets/notes-24.png";

export default function AddSkill() {
  const [skill, setSkill] = useState({
    name: "",
    description: "",
    category: "",
    lectures: [],
    published: false,
  });

  const [lectureType, setLectureType] = useState("video");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Attach recorded video when returning from record page
  useEffect(() => {
    if (
      location.state?.recordedVideo &&
      typeof location.state.recordedIndex === "number"
    ) {
      const { recordedVideo, recordedIndex } = location.state;
      setSkill((prev) => {
        const updated = [...prev.lectures];
        while (updated.length <= recordedIndex) {
          updated.push({ title: `Lecture ${updated.length + 1}`, content: "" });
        }
        updated[recordedIndex] = {
          ...updated[recordedIndex],
          content: recordedVideo,
        };
        return { ...prev, lectures: updated };
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const addLecture = () => {
    setSkill((prev) => ({
      ...prev,
      lectures: [
        ...prev.lectures,
        { title: `Lecture ${prev.lectures.length + 1}`, content: "" },
      ],
    }));
  };

  const removeLecture = (index) => {
    setSkill((prev) => {
      const updated = prev.lectures.filter((_, i) => i !== index);
      const relabeled = updated.map((l, i) => ({
        ...l,
        title: `Lecture ${i + 1}`,
      }));
      return { ...prev, lectures: relabeled };
    });
  };

  const handleLectureChange = (index, field, value) => {
    const updated = [...skill.lectures];
    updated[index][field] = value;
    setSkill((prev) => ({ ...prev, lectures: updated }));
  };

  const calculateCredits = (lectures) => {
    const base = lectures.length * 5;
    const extra = lectures.some((l) => l.content?.startsWith("blob:")) ? 10 : 0;
    return base + extra;
  };

  // Mock save (adds credits)
  const handleSave = async () => {
    if (!skill.name.trim()) {
      alert("Enter skill name!");
      return;
    }

    setSaving(true);
    try {
      const credits = calculateCredits(skill.lectures);
      const prevCredits = Number(localStorage.getItem("timeCredits") || 0);
      const newCredits = prevCredits + credits;
      localStorage.setItem("timeCredits", newCredits);

      const popup = document.createElement("div");
      popup.innerHTML = `🎉 You earned <b>${credits}</b> Time Credits!`;
      popup.className =
        "fixed bottom-6 right-6 px-5 py-3 rounded-xl text-gray-900 text-sm font-semibold shadow-lg backdrop-blur-md border border-gray-200 bg-white/90 animate-fadeInOut z-[999]";
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 3200);

      setSkill({
        name: "",
        description: "",
        category: "",
        lectures: [],
        published: false,
      });
    } catch (err) {
      console.error("Error saving:", err);
      alert("❌ Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const goToRecord = (index) => {
    if (index >= skill.lectures.length) {
      setSkill((prev) => {
        const updated = [...prev.lectures];
        while (updated.length <= index) {
          updated.push({ title: `Lecture ${updated.length + 1}`, content: "" });
        }
        return { ...prev, lectures: updated };
      });
    }
    navigate("/record", { state: { recordedIndex: index } });
  };

  const closePreview = () => setPreviewOpen(false);

  return (
    <section className="min-h-screen flex items-center justify-center px-8 py-16 bg-gradient-to-br from-[#F8F9FA] to-[#E9EBEF] dark:from-[#1A1B1E] dark:to-[#111216]">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-10 bg-white dark:bg-[#0f0f11] rounded-3xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-white/10 p-10 transition-colors duration-300">

        {/* Left */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-6">
              Add a New Skill
            </h1>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Skill Name"
                value={skill.name}
                onChange={(e) => setSkill({ ...skill, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-[#161616] text-gray-800 dark:text-gray-100"
              />
              <textarea
                placeholder="Skill Description"
                value={skill.description}
                onChange={(e) =>
                  setSkill({ ...skill, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#161616] text-gray-800 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Category"
                value={skill.category}
                onChange={(e) =>
                  setSkill({ ...skill, category: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-[#161616] text-gray-800 dark:text-gray-100"
              />

              <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="video"
                    checked={lectureType === "video"}
                    onChange={(e) => setLectureType(e.target.value)}
                  />
                  <img src={videoIcon} className="w-5 h-5" alt="video" /> Video
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="text"
                    checked={lectureType === "text"}
                    onChange={(e) => setLectureType(e.target.value)}
                  />
                  <img src={notesIcon} className="w-5 h-5" alt="notes" /> Text
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={skill.published}
                  onChange={(e) =>
                    setSkill({ ...skill, published: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Publish this skill for everyone
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setPreviewOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full shadow hover:scale-105 transition"
            >
              Preview
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-7 py-2.5 bg-gradient-to-r from-pink-400 to-blue-400 text-white rounded-full disabled:opacity-60 hover:scale-105 transition"
            >
              {saving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#FFFFFF] to-[#F8F9FA] dark:from-[#121216] dark:to-[#0f0f11] rounded-2xl border p-8 shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Lectures</h2>
            <button
              onClick={addLecture}
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-full"
            >
              + Add Lecture
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skill.lectures.map((lec, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border shadow-sm bg-white dark:bg-[#151515]/80"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold mb-3">{lec.title}</h3>
                  <button
                    onClick={() => removeLecture(index)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>

                {lectureType === "video" ? (
                  lec.content ? (
                    <video
                      controls
                      src={lec.content}
                      className="w-full rounded-md h-[220px] object-cover"
                    />
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => goToRecord(index)}
                        className="w-full bg-blue-500 text-white py-2 rounded-md"
                      >
                        Record Lecture
                      </button>
                      <p className="text-sm text-gray-500">
                        Or paste a YouTube link below after recording.
                      </p>
                      <input
                        type="text"
                        placeholder="YouTube link (optional)"
                        value={lec.content}
                        onChange={(e) =>
                          handleLectureChange(index, "content", e.target.value)
                        }
                        className="w-full mt-2 px-3 py-2 rounded-md border bg-white"
                      />
                    </div>
                  )
                ) : (
                  <textarea
                    placeholder="Write tutorial..."
                    value={lec.content}
                    onChange={(e) =>
                      handleLectureChange(index, "content", e.target.value)
                    }
                    className="w-full rounded-md border min-h-[100px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="w-[92%] max-w-4xl bg-white dark:bg-[#0f1113] rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">
                Preview: {skill.name || "Untitled"}
              </h3>
              <button
                onClick={closePreview}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#222] text-sm"
              >
                Close
              </button>
            </div>

            {skill.lectures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No lectures yet.
              </div>
            ) : (
              skill.lectures.map((lec, i) => (
                <div
                  key={i}
                  className="bg-[#F8F9FA] dark:bg-[#121212] p-4 rounded-lg mb-3 border border-gray-100 dark:border-gray-800"
                >
                  <h4 className="font-semibold mb-2">{lec.title}</h4>
                  {lec.content ? (
                    <video
                      src={lec.content}
                      controls
                      className="w-full rounded-md max-h-[380px] shadow-md"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">
                      No video / link for this lecture.
                    </p>
                  )}
                </div>
              ))
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#222]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(15px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(15px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3.2s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
}
