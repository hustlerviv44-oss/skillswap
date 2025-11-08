import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebaseClient";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  // 🧠 Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔐 Load user + registered friends
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      // Fetch all users except the logged-in one
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id !== u.uid && data.username) {
          usersList.push({
            id: docSnap.id,
            name: data.username,
            avatar: data.uploadedImg || data.avatar || "/default-avatar.png",
          });
        }
      });
      setFriends(usersList);
    });

    return () => unsub();
  }, []);

  // 🔥 Load real-time messages when chat selected
  useEffect(() => {
    if (!selectedChat || !user) return;

    const chatId =
      user.uid < selectedChat.id
        ? `${user.uid}_${selectedChat.id}`
        : `${selectedChat.id}_${user.uid}`;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => d.data());
      setMessages(msgs);
    });

    return () => unsub();
  }, [selectedChat, user]);

  // ✉️ Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !selectedChat) return;

    const chatId =
      user.uid < selectedChat.id
        ? `${user.uid}_${selectedChat.id}`
        : `${selectedChat.id}_${user.uid}`;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMsg.trim(),
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });

    setNewMsg("");
  };

  // 📞 Call button clicked
  const handleCallClick = () => {
    alert("📞 Voice/Video Calling — Coming Soon!");
  };

  return (
    <section className="w-full h-[90vh] max-w-7xl flex flex-col md:flex-row mx-auto rounded-2xl overflow-hidden bg-white/60 dark:bg-[#1a1a1a]/50 backdrop-blur-lg border border-gray-200/40 dark:border-gray-700/40 shadow-xl">
      {/* Sidebar */}
      <aside className="md:w-1/3 border-r border-gray-200/30 dark:border-gray-700/30 overflow-y-auto">
        <div className="p-5 border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Conversations
          </h2>
        </div>
        <div className="p-3 space-y-2">
          {friends.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedChat(f)}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedChat?.id === f.id
                  ? "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/40"
                  : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              }`}
            >
              <img
                src={f.avatar}
                alt={f.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-400 shadow"
              />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {f.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Tap to chat
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center gap-4">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-12 h-12 rounded-full object-cover border border-purple-300 shadow"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedChat.name}
                </h3>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full p-2 text-gray-500 hover:bg-gray-200/50 hover:text-purple-500 dark:text-gray-400 dark:hover:bg-gray-700/50"
                onClick={handleCallClick}
              >
                <span className="material-icons-outlined">call</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-3 ${
                  msg.senderId === user.uid ? "flex-row-reverse" : ""
                }`}
              >
                {msg.senderId !== user.uid && (
                  <img
                    src={selectedChat.avatar}
                    alt="sender"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`max-w-xs md:max-w-sm rounded-b-xl p-3 text-sm shadow ${
                    msg.senderId === user.uid
                      ? "rounded-tl-xl bg-gradient-to-r from-purple-500 to-blue-400 text-white"
                      : "rounded-tr-xl bg-white/80 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center gap-4 bg-white/50 dark:bg-gray-900/40 rounded-lg shadow-inner p-2 backdrop-blur-sm">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-800 dark:text-gray-100 text-sm"
              />
              <button
                onClick={sendMessage}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-400 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all shadow"
              >
                <span className="font-medium text-sm">Send</span>
                <span className="material-icons-outlined text-[16px]">
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
          Select a conversation to start chatting
        </div>
      )}
    </section>
  );
}
