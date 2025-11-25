import { useState } from "react";
import { Mail, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordCardProps {
    onBackToLogin?: () => void;
}

export function ForgotPasswordCard({ onBackToLogin }: ForgotPasswordCardProps) {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate sending reset link to email
        console.log("Password reset link sent to:", email);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
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
                        <h1 className="text-white mb-2">Check Your Email</h1>
                        <p className="text-white/70">
                            We have sent a password reset link to
                        </p>
                        <p className="text-white mt-2">{email}</p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
                        <p className="text-white/80 text-center">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                    </div>


                    {/* Back to Login */}
                    <Link href="/login">
                        <button
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mx-auto"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </button>
                    </Link>

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
                        <Mail className="text-white" size={32} />
                    </div>
                    <h1 className="text-white mb-2">Forgot Password?</h1>
                    <p className="text-white/70">
                        No worries, we will send you reset instructions
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-white/90 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                                <Mail size={20} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl py-3 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
                    >
                        Reset Password
                    </button>
                </form>


                {/* Back to Login */}
                <Link href="/login">
                    <button
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mx-auto"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </button>
                </Link>
            </div>
        </div>
    );
}

