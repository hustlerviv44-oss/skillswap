import React, { useEffect, useRef } from "react";
import heroVideo from "../assets/hero-video.mp4";

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#F8F9FA] to-[#E9EBEF] dark:from-[#1A1B1E] dark:to-[#111216] select-none">
      
      {/* --- Hero Section (moved slightly up for perfect center) --- */}
      <div className="absolute top-[2vh] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div className="relative w-[22rem] h-[22rem] sm:w-[25rem] sm:h-[25rem] md:w-[27rem] md:h-[27rem] rounded-full overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* --- Text Section (pulled up slightly) --- */}
      <div className="absolute bottom-[20vh] left-[1vw]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wider text-gray-900 dark:text-gray-100">
          MASTER YOUR CRAFT.
        </h1>
        <h2 className="text-sm sm:text-base md:text-lg tracking-[0.2em] font-light text-gray-600 dark:text-gray-300 mt-1">
          SHARE YOUR PASSION.
        </h2>
      </div>

      {/* --- Connect Box (aligned horizontally with text) --- */}
      <div className="absolute bottom-[21vh] right-[1vw] border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase px-5 py-4 text-center backdrop-blur-md bg-white/20 dark:bg-black/20">
        <p>CONNECT</p>
        <p className="border-y border-gray-400 dark:border-gray-600 my-1 py-1">
          LEARN
        </p>
        <p>GROW</p>
      </div>
    </div>
  );
}
