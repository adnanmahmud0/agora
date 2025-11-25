import { useState, useRef, useEffect } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface VerificationCardProps {
  email: string;
  onVerificationComplete: () => void;
}

export function VerificationCard({ email, onVerificationComplete }: VerificationCardProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const { verifyEmail, resendOtp, isLoading } = useAuth();

  

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
    setCode(newCode);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs[nextIndex].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }
    setError("");
    try {
      await verifyEmail(email, Number(enteredCode));
      onVerificationComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid verification code. Please try again.";
      setError(message);
      setCode(["", "", "", ""]);
      inputRefs[0].current?.focus();
    }
  };

  const resendCode = async () => {
    try {
      await resendOtp(email);
      setCode(["", "", "", ""]);
      setError("");
      inputRefs[0].current?.focus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setError(message);
    }
  };

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
            <Mail className="text-white" size={32} />
          </div>
          <h1 className="text-white mb-2">Verify Your Account</h1>
          <p className="text-white/70">
            We have sent a 4-digit verification code to
          </p>
          <p className="text-white mt-1">{email}</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input */}
          <div className="space-y-2">
            <label className="text-white/90 block text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                />
              ))}
            </div>
            {error && (
              <p className="text-red-300 text-center mt-2">{error}</p>
            )}
          </div>

          {/* Hint */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-center">
              💡 Hint: For demo purposes, try code <span className="text-white">1234</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl py-3 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify Account
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-white/70">
              Did not receive the code?{" "}
              <button
                type="button"
                onClick={resendCode}
                className="text-white hover:underline"
              >
                Resend
              </button>
            </p>
          </div>
        </form>

        {/* Back Button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors mx-auto"
        >
          <ArrowLeft size={16} />
          Back to Sign Up
        </button>
      </div>
    </div>
  );
}
