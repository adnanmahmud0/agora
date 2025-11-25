import { useState } from "react";
import { Lock, Eye, EyeOff, Check } from "lucide-react";

interface ResetPasswordCardProps {
  onResetComplete?: () => void;
}

export function ResetPasswordCard({ onResetComplete }: ResetPasswordCardProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) {
      return;
    }

    // Simulate password reset
    console.log("Password reset successfully");
    setIsSuccess(true);

    // Redirect after 3 seconds
    setTimeout(() => {
      if (onResetComplete) {
        onResetComplete();
      } else {
        alert("Password reset successful! Redirecting to login...");
        window.location.reload();
      }
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-4">
        {/* Success Glass Card */}
        <div
          className="relative backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8"
          style={{
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30 mb-4">
              <Check className="text-green-300" size={32} />
            </div>
            <h1 className="text-white mb-2">Password Reset!</h1>
            <p className="text-white/70">
              Your password has been successfully reset
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-white/80 text-center">
              You can now sign in with your new password
            </p>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="text-white/70">Redirecting to login...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-4">
      {/* Glass Card */}
      <div
        className="relative backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8"
        style={{
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-white mb-2">Reset Password</h1>
          <p className="text-white/70">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Input */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-white/90 block">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <Lock size={20} />
              </div>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-white/90 block">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <Lock size={20} />
              </div>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl p-3">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-white/70 mb-2">Password must:</p>
            <ul className="space-y-1 text-white/60">
              <li className="flex items-center gap-2">
                <span className={newPassword.length >= 8 ? "text-green-300" : ""}>
                  {newPassword.length >= 8 ? "✓" : "•"}
                </span>
                Be at least 8 characters long
              </li>
              <li className="flex items-center gap-2">
                <span className={newPassword && confirmPassword && newPassword === confirmPassword ? "text-green-300" : ""}>
                  {newPassword && confirmPassword && newPassword === confirmPassword ? "✓" : "•"}
                </span>
                Match the confirmation password
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl py-3 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
