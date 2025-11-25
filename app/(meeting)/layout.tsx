"use client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect } from "react";

export default function MeetingLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, [isLoading, token]);

  if (isLoading) {
    return null;
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}

