// src/pages/AddSkill.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import videoIcon from "../assets/video-24.png";
import notesIcon from "../assets/notes-24.png";
import { auth, db, storage } from "../firebaseClient";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

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
  const navigate = useNavigate();
  const location = useLocation();

  // When returning from RecordLecture page: attach recordedVideo to lecture index
  useEffect(() => {
    // Location state will be in the shape { recordedVideo, recordedIndex }
    if (location.state?.recordedVideo && typeof location.state.recordedIndex === "number") {
      const { recordedVideo, recordedIndex } = location.state;

      setSkill((prev) => {
        // Ensure lectures array has enough slots
        const updated = [...prev.lectures];
        while (updated.length <= recordedIndex) {
          updated.push({ title: `Lecture ${updated.length + 1}`, content: "" });
        }
        // attach recorded blob URL to lecture
        updated[recordedIndex] = {
          ...updated[recordedIndex],
          content: recordedVideo, // blob:... or data url
        };
        return { ...prev, lectures: updated };
      });

      // Clear location.state so refresh won't re-apply the same video
      try {
        // replaceState doesn't break router; it clears the history state
        window.history.replaceState({}, document.title);
      } catch (e) {
        // no-op
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // re-label titles
      const relabeled = updated.map((l, i) => ({ ...l, title: `Lecture ${i + 1}` }));
      return { ...prev, lectures: relabeled };
    });
  };

  const handleLectureChange = (index, field, value) => {
    const updated = [...skill.lectures];
    updated[index][field] = value;
    setSkill((prev) => ({ ...prev, lectures: updated }));
  };

  // Upload lecture video
  const uploadLecture = async (blob, skillName, index) => {
    const fileRef = storageRef(
      storage,
      `lectures/${auth.currentUser.uid}/${skillName}/lecture_${index + 1}.webm`
    );
    const uploadTask = uploadBytesResumable(fileRef, blob);
    await new Promise((resolve, reject) => {
      uploadTask.on("state_changed", null, reject, resolve);
    });
    return await getDownloadURL(uploadTask.snapshot.ref);
  };

  // Calculate time credit
  const calculateCredits = (lectures) => {
    const base = lectures.length * 5;
    const extra = lectures.some((l) => l.content?.startsWith("blob:")) ? 10 : 0;
    return base + extra;
  };

  // Save skill to Firestore
  const handleSave = async () => {
    if (!auth.currentUser) return alert("Please login first.");
    if (!skill.name.trim()) return alert("Enter skill name!");

    setSaving(true);
    try {
      const uploadedLectures = [];

      for (let i = 0; i < skill.lectures.length; i++) {
        const lec = skill.lectures[i];
        let finalURL = lec.content || "";
        if (lec.content && lec.content.startsWith("blob:")) {
          // fetch blob from blob: URL then upload
          const blob = await fetch(lec.content).then((r) => r.blob());
          finalURL = await uploadLecture(blob, skill.name, i);
        }
        uploadedLectures.push({
          title: lec.title,
          content: finalURL,
          type: lectureType,
        });
      }

      const credits = calculateCredits(uploadedLectures);

      await addDoc(collection(db, "skills"), {
        name: skill.name,
        description: skill.description,
        category: skill.category,
        lectures: uploadedLectures,
        creditsRequired: credits,
        published: skill.published,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });

      if (skill.published) {
        const userDoc = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
          await updateDoc(userDoc, {
            timeCredits: (snap.data().timeCredits || 0) + credits,
          });
        } else {
          await setDoc(userDoc, { timeCredits: credits });
        }
      }

      alert("✅ Skill saved successfully!");
      setSkill({
        name: "",
        description: "",
        category: "",
        lectures: [],
        published: false,
      });
    } catch (err) {
      console.error(err);
      alert("❌ Error saving skill. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Navigate to record page — ensure lecture exists first
  const goToRecord = (index) => {
    if (index >= skill.lectures.length) {
      // create until index exists
      setSkill((prev) => {
        const updated = [...prev.lectures];
        while (updated.length <= index) {
          updated.push({ title: `Lecture ${updated.length + 1}`, content: "" });
        }
        return { ...prev, lectures: updated };
      });
      // after state update completes, still navigate immediately — use the index we passed
    }
    navigate("/record", { state: { recordedIndex: index } });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-8 py-16 bg-gradient-to-br from-[#f8f9ff] via-[#edf0ff] to-[#e7ebff] dark:from-[#101010] dark:via-[#17181b] dark:to-[#0f0f11]">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-10 bg-white/70 dark:bg-[#1b1b1f]/70 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg p-10">

        {/* Left Section */}
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
                className="w-full px-4 py-2 rounded-xl border bg-white/70 dark:bg-[#2a2a2a]"
              />
              <textarea
                placeholder="Skill Description"
                value={skill.description}
                onChange={(e) =>
                  setSkill({ ...skill, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border bg-white/70 dark:bg-[#2a2a2a]"
              />
              <input
                type="text"
                placeholder="Category"
                value={skill.category}
                onChange={(e) =>
                  setSkill({ ...skill, category: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border bg-white/70 dark:bg-[#2a2a2a]"
              />

              {/* Type Select */}
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

              {/* Publish */}
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
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full">
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-7 py-2.5 bg-gradient-to-r from-pink-400 to-blue-400 text-white rounded-full disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-50/60 to-blue-50/40 dark:from-[#222] dark:to-[#1a1a1a] rounded-2xl border p-8">
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
                className="p-4 rounded-xl border shadow-sm bg-white/70 dark:bg-[#2a2a2a]/80"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold mb-3">{lec.title}</h3>
                  <button
                    onClick={() => removeLecture(index)}
                    title="Remove lecture"
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
                      className="w-full rounded-md h-[260px] object-cover"
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
                        className="w-full mt-2 px-3 py-2 rounded-md border bg-white/90"
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
    </section>
  );
}
