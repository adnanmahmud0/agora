"use client"

import { LoginCard } from "@/components/login-card";


export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="/video.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/20" />

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <LoginCard />
      </div>
    </div>
  );
}
