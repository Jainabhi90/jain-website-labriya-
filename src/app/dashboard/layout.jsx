"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log({
    loading,
    isAuthenticated,
    profile,
  });

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log("[DEBUG] Dashboard redirect: to /login");
        router.replace("/login");
      } else if (!profile || !profile.is_profile_complete) {
        console.log("[DEBUG] CompleteProfile redirect: to /complete-profile");
        router.replace("/complete-profile");
      }
    }
  }, [isAuthenticated, profile, loading, router]);

  // Render spinner ONLY during active authentication/profile loading phase
  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-bg-custom px-6">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Soft breathing orange outer border */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-1000" />
            {/* Spinning indicator */}
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {/* Lotus indicator marker */}
            <span className="absolute text-[10px]">🪷</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary text-sm">
              Connecting to Devotee Portal
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
              Please wait while we verify your credentials and secure your connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Once loading completes, render the children immediately. Any redirects are executed reactively.
  return <>{children}</>;
}
