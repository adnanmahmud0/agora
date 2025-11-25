/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth/AuthContext.tsx
"use client";

import axiosPrivate from "@/utils/axiosPrivate";
import axiosPublic from "@/utils/axiosPublic";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// === DEBUG HELPER ===
const debugLog = {
  start: (action: string, endpoint: string, method: string = "POST") => {
    console.groupCollapsed(
      `%c[Auth Debug] ${action} → ${method} ${endpoint}`,
      "color: #1e90ff; font-weight: bold; font-size: 12px;"
    );
    console.log(
      "%c⏳ Started at:",
      "color: #ff9800;",
      new Date().toLocaleTimeString()
    );
  },
  payload: (data: any) => {
    console.log("%c📤 Payload:", "color: #4caf50; font-weight: bold;", data);
  },
  success: (res: any) => {
    console.log(
      "%c✅ Success:",
      "color: #4caf50; font-weight: bold;",
      res.data
    );
  },
  token: (token: string) => {
    console.log(
      "%c🔑 Token:",
      "color: #9c27b0; font-weight: bold;",
      token?.slice(0, 20) + "..."
    );
  },
  user: (user: any) => {
    console.log("%c👤 User Updated:", "color: #2196f3; font-weight: bold;", {
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      verified: user?.verified,
    });
  },
  storage: (key: string, value: any) => {
    console.log(
      `%c💾 localStorage.setItem("${key}")`,
      "color: #ff5722; font-style: italic;",
      value
    );
  },
  error: (err: any, message: string) => {
    console.log("%c❌ Error:", "color: #f44336; font-weight: bold;", message);
    if (err.response) {
      console.log("%cServer Response:", "color: #f44336;", {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.log("%cNetwork/JS Error:", "color: #f44336;", err.message);
    }
  },
  end: () => {
    console.log("%c⏹ End", "color: #9e9e9e; font-size: 10px;");
    console.groupEnd();
  },
};

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  image?: string;
  averageRating?: number;
  ratingsCount?: number;
  isBlocked?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Auth Actions
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (email: string, otp: number) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetOtp: (email: string, otp: number) => Promise<string>;
  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  contact: string;
  password: string;
  location: string;
  image?: File;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      debugLog.start("Load Auth from Storage", "localStorage", "GET");
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken) debugLog.token(storedToken);
      if (storedUser) debugLog.user(JSON.parse(storedUser));

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedToken) {
        console.log(
          "%cToken exists, no user → fetching profile...",
          "color: #ff9800;"
        );
        await refreshUser();
      }
      setIsLoading(false);
      debugLog.end();
    };

    loadAuth();
  }, []);

  // Helper: Save auth state
  const saveAuth = (jwt: string, userData: User) => {
    debugLog.storage("accessToken", jwt.slice(0, 20) + "...");
    debugLog.storage("user", { _id: userData._id, email: userData.email });
    localStorage.setItem("accessToken", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  };

  // Fetch user profile
  const fetchUserProfile = async (): Promise<User> => {
    debugLog.start("Fetch User Profile", "/user/profile", "GET");
    try {
      const res = await axiosPrivate.get("/user/profile");
      debugLog.success(res);
      debugLog.end();
      return res.data.data as User;
    } catch (error: any) {
      debugLog.error(error, "Failed to fetch profile");
      debugLog.end();
      throw error;
    }
  };

  // Refresh user
  const refreshUser = async () => {
    debugLog.start("Refresh User", "/user/profile", "GET");
    try {
      const userData = await fetchUserProfile();
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      debugLog.user(userData);
      debugLog.end();
    } catch (error: any) {
      debugLog.error(error, "Refresh failed");
      debugLog.end();
    }
  };

  // 1. Register
  const register = async (data: RegisterData) => {
    debugLog.start("Register User", "/user/register");
    debugLog.payload({ ...data, password: "******", image: data.image ? (data.image as File).name : undefined });
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("contact", data.contact);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("location", data.location);
      if (data.image) {
        formData.append("image", data.image);
      }

      const res = await axiosPublic.post("/user/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const userData = res.data.data;
      debugLog.success(res);
      debugLog.user(userData);
      debugLog.storage("user", userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      debugLog.end();
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Registration failed"
      );
      throw new Error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Email
  const verifyEmail = async (email: string, otp: number) => {
    debugLog.start("Verify Email", "/auth/verify-email");
    debugLog.payload({ email, oneTimeCode: otp });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post("/auth/verify-email", {
        email,
        oneTimeCode: otp,
      });
      debugLog.success(res);
      await refreshUser();
      debugLog.end();
    } catch (error: any) {
      debugLog.error(error, error.response?.data?.message || "Invalid OTP");
      throw new Error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend OTP
  const resendOtp = async (email: string) => {
    debugLog.start("Resend OTP", "/auth/resend-otp");
    debugLog.payload({ email });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post("/auth/resend-otp", { email });
      debugLog.success(res);
      debugLog.end();
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Failed to resend OTP"
      );
      throw new Error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Login
  const login = async (email: string, password: string) => {
    debugLog.start("Login User", "/auth/login");
    debugLog.payload({ email, password: "******" });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post("/auth/login", { email, password });
      const raw = res.data?.data;
      const jwt = typeof raw === "string" ? raw : raw?.token || raw?.accessToken || raw?.jwt || "";
      debugLog.success(res);
      debugLog.token(jwt);

      if (jwt) {
        localStorage.setItem("accessToken", jwt);
        setToken(jwt);
      }

      const userData = await fetchUserProfile();
      if (jwt) {
        saveAuth(jwt, userData);
      } else {
        setUser(userData);
      }
      debugLog.end();
    } catch (error: any) {
      debugLog.error(error, error.response?.data?.message || "Login failed");
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Logout
  const logout = () => {
    debugLog.start("Logout User", "local", "CLEAR");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    console.log("%c🧹 Auth state cleared", "color: #ff5722;");
    debugLog.end();
    window.location.href = "/login";
  };

  // 6. Forgot Password
  const forgotPassword = async (email: string) => {
    debugLog.start("Forgot Password", "/auth/forget-password");
    debugLog.payload({ email });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post("/auth/forget-password", { email });
      debugLog.success(res);
      debugLog.end();
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Failed to send reset OTP"
      );
      throw new Error(
        error.response?.data?.message || "Failed to send reset OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Verify Reset OTP
  const verifyResetOtp = async (
    email: string,
    otp: number
  ): Promise<string> => {
    debugLog.start("Verify Reset OTP", "/auth/verify-email");
    debugLog.payload({ email, oneTimeCode: otp });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post("/auth/verify-email", {
        email,
        oneTimeCode: otp,
      });
      const tempToken = res.data.data;
      debugLog.success(res);
      debugLog.token(tempToken);
      debugLog.end();
      return tempToken;
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Invalid reset OTP"
      );
      throw new Error(error.response?.data?.message || "Invalid reset OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Reset Password
  const resetPassword = async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    debugLog.start("Reset Password", "/auth/reset-password");
    debugLog.payload({ newPassword: "******", confirmPassword: "******" });
    setIsLoading(true);
    try {
      const res = await axiosPublic.post(
        "/auth/reset-password",
        { newPassword, confirmPassword },
        { headers: { Authorization: token } }
      );
      debugLog.success(res);
      debugLog.end();
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Password reset failed"
      );
      throw new Error(error.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Change Password (Authenticated)
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    debugLog.start("Change Password", "/auth/reset-password", "POST (auth)");
    debugLog.payload({ currentPassword: "******", newPassword: "******" });
    setIsLoading(true);
    try {
      const res = await axiosPrivate.post("/auth/reset-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      debugLog.success(res);
      console.log("%cPassword changed → forcing logout", "color: #ff9800;");
      logout();
      debugLog.end();
    } catch (error: any) {
      debugLog.error(
        error,
        error.response?.data?.message || "Failed to change password"
      );
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        register,
        verifyEmail,
        resendOtp,
        login,
        logout,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
