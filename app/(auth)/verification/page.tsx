"use client"


import { VerificationCard } from "@/components/verification-card";


export default function App() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="/video.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/20" />

      {/* VerificationCard Card */}
      <div className="relative z-10 flex items-center justify-center w-full min-h-screen py-8">
        <VerificationCard email="user@example.com" onVerificationComplete={() => alert("Verification completed!")} />
      </div>
    </div>
  );
}
