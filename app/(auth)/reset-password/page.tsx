"use client"
import { ResetPasswordCard } from "@/components/reset-password-card";
import { useState } from "react";

export default function App() {
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSignupComplete = (email: string) => {
    setUserEmail(email);
    setShowVerification(true);
  };

  const handleVerificationComplete = () => {
    alert("Account verified successfully!");
    // Redirect to dashboard or login page
  };

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

      {/* Reset Password Card - Change to see other pages */}
      <div className="relative z-10 flex items-center justify-center w-full min-h-screen py-8">
        <ResetPasswordCard  />
      </div>
    </div>
  );
}