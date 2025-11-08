import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";

export default function RecordLecture() {
  const videoRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stream, setStream] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch {
        alert("Camera or microphone access denied!");
      }
    };
    startCamera();
    return () => stream && stream.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (recording) {
      const interval = setInterval(() => {
        setProgress((p) => (p < 100 ? p + 0.3 : 0));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [recording]);

  const startRecording = () => setRecording(true);
  const stopRecording = () => setRecording(false);
  const handleCancel = () => navigate("/add-skill");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
      {/* Header */}
      <div className="w-full max-w-6xl text-left mb-6 px-4 sm:px-8">
        <h1 className="text-4xl sm:text-[2.5rem] font-semibold tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight drop-shadow-sm">
          SkillSwap Recorder
        </h1>
        <p className="text-sm sm:text-base text-fuchsia-400/80 font-light mt-1 tracking-wide">
          Lecture Title: Intro to Astrophysics
        </p>
      </div>

      {/* Video Container */}
      <div className="relative w-full max-w-6xl aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {!recording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] text-gray-300">
            <Mic className="w-10 h-10 text-purple-400 mb-2 animate-pulse" />
            <span className="text-sm text-gray-200 font-medium">
              Ready to Record...
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/15">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-6 py-2 rounded-full text-white font-medium text-base tracking-wide transition-all shadow-md backdrop-blur-sm ${
            recording
              ? "bg-red-500/90 hover:bg-red-600"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
          }`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>

        <button
          onClick={handleCancel}
          className="px-6 py-2 rounded-full text-white text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
