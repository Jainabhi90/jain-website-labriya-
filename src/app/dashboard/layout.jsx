"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (profile && !profile.is_profile_complete) {
        router.push("/complete-profile");
      }
    }
  }, [isAuthenticated, profile, loading, router]);

  // Loading skeleton while resolving auth/session/profile
  if (loading || !isAuthenticated || (profile && !profile.is_profile_complete)) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-bg-custom px-6">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Soft breathing orange outer border */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-1000" />
            {/* Spinning indicator */}
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {/* Lotus or spiritual indicator marker */}
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

  return <>{children}</>;
}
