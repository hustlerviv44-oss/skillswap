import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // 🌐 Get logged-in user's email
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUserEmail(currentUser.email);
  }, []);

  // 💾 Load saved data from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatar(data.avatar || null);
          setUploadedImg(data.uploadedImg || null);

          // ✅ Sync localStorage for Navbar/Home avatar
          localStorage.setItem("userProfile", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  const avatars = [
    "https://cdn-icons-png.flaticon.com/512/706/706830.png",
    "https://cdn-icons-png.flaticon.com/512/706/706816.png",
    "https://cdn-icons-png.flaticon.com/512/706/706814.png",
    "https://cdn-icons-png.flaticon.com/512/706/706807.png",
    "https://cdn-icons-png.flaticon.com/512/706/706890.png",
    "https://cdn-icons-png.flaticon.com/512/706/706847.png",
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImg(event.target.result);
      setAvatar(null);
    };
    reader.readAsDataURL(file);
  };

  // 💾 Save to Firestore + sync localStorage
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    const data = {
      email: userEmail,
      username,
      bio,
      avatar,
      uploadedImg,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true });

      // ✅ Sync localStorage to keep avatar visible instantly
      localStorage.setItem("userProfile", JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));

      setShowPopup(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <>
      {/* --- Success Popup --- */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 w-[90%] sm:w-[25rem] text-center animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Profile Successfully Saved!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your changes have been saved and your profile is now up to date.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-gradient-to-r from-purple-400 to-blue-500 dark:from-purple-700 dark:to-blue-800 text-white py-2.5 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- Profile Page Layout --- */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 w-full">
        {/* Left side: Avatar selection */}
        <div className="flex flex-col items-center gap-4">
          <label className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-300/20 to-blue-400/30 dark:from-purple-800/40 dark:to-blue-900/30 flex items-center justify-center cursor-pointer overflow-hidden shadow-lg group">
            {uploadedImg ? (
              <img
                src={uploadedImg}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-full"
              />
            ) : avatar ? (
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-300 relative z-10">
                <span className="material-icons-outlined text-6xl mb-2 block">
                  add_a_photo
                </span>
                <p className="font-medium">Upload Image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </label>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Or choose from our avatars:
          </p>
          <div className="flex gap-3">
            {avatars.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setAvatar(img);
                  setUploadedImg(null);
                }}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                  avatar === img
                    ? "border-purple-400 ring-2 ring-purple-300"
                    : "border-transparent hover:border-purple-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Avatar ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right side: Form */}
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Make Your Profile
          </h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., dream_weaver"
              className="w-full bg-white/70 dark:bg-[#121212]/40 rounded-xl py-3 px-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a little about yourself and your skills..."
              rows={4}
              className="w-full bg-white/70 dark:bg-[#121212]/40 rounded-xl py-3 px-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-br from-purple-400 to-blue-500 dark:from-purple-700 dark:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90 transition-all duration-200"
          >
            Save Profile
          </button>
        </div>
      </section>
    </>
  );
}
