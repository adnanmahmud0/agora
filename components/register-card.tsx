import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface RegisterCardProps {
  onSignupComplete: (email: string) => void;
}

export function RegisterCard({ onSignupComplete }: RegisterCardProps) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register({
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        image: photoFile ?? undefined,
      });
      onSignupComplete(formData.email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
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
          <h1 className="text-white mb-2">Create Account</h1>
          <p className="text-white/70">Sign up to get started</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500/80 backdrop-blur-sm text-white rounded-full p-1 hover:bg-red-600/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 cursor-pointer hover:bg-white/20 transition-all"
                >
                  <Upload className="text-white/70" size={32} />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-white/60 mt-2">Upload Photo</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-white/90 block">
              Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <User size={20} />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
            </div>
          </div>

          {/* Contact Input */}
          <div className="space-y-2">
            <label htmlFor="contact" className="text-white/90 block">
              Contact
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <Phone size={20} />
              </div>
              <input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white/90 block">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <Mail size={20} />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-white/90 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <Lock size={20} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-white/90 block">
              Location
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <MapPin size={20} />
              </div>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter your location"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl py-3 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign Up
          </button>
          {error && <p className="text-red-300 text-center mt-2">{error}</p>}
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/70">
            Already have an account?{" "}
            <a href="/login" className="text-white hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
