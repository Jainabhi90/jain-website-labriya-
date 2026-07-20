"use client";

import React from "react";
import { useCMS } from "@/context/CMSContext";
import { useAuth } from "@/context/AuthContext";
import { Wrench, Phone, Mail } from "lucide-react";

export default function MaintenanceWrapper({ children }) {
  const { cms, loading } = useCMS();
  const { profile, loading: authLoading } = useAuth();

  // If loading CMS, show loading logo or simple spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-custom">
        <div className="flex flex-col items-center gap-4">
          {cms?.templeLogo ? (
            <img src={cms.templeLogo} alt="Temple Logo" className="w-12 h-12 rounded-full object-cover shadow-sm animate-pulse-soft" />
          ) : (
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">Loading Temple Portal...</span>
        </div>
      </div>
    );
  }

  // If maintenance mode is enabled and user is NOT an admin
  if (cms.maintenanceMode && profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary/40 via-white to-bg-custom p-6 text-center">
        <div className="max-w-md w-full glass-panel border border-border-custom p-8 rounded-custom-lg shadow-premium flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-primary/20 flex items-center justify-center text-primary text-3xl animate-bounce-soft overflow-hidden">
            {cms.templeLogo ? (
              <img src={cms.templeLogo} alt="Temple Logo" className="w-full h-full object-cover" />
            ) : (
              <span>🪷</span>
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-text-primary text-xl">Portal Under Maintenance</h1>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mt-1">{cms.templeName || "Shree Labriya Jain Mandir"}</p>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            The devotee portal is temporarily offline for scheduled updates and database maintenance. Please check back later.
          </p>
          <div className="w-full border-t border-neutral-100 pt-4 flex flex-col gap-2 text-xs text-text-secondary items-start">
            <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider">Contact Administration:</span>
            {cms.contactNumber && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <span>{cms.contactNumber}</span>
              </div>
            )}
            {cms.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span>{cms.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
