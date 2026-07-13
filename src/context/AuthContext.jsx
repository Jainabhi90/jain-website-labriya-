"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  refreshSession: async () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // References to prevent duplicate fetch calls
  const isFetchingProfile = useRef(false);
  const lastFetchedUserId = useRef(null);

  // Expose function to refresh user's profile details
  const refreshProfile = useCallback(async (userIdToFetch) => {
    const targetUserId = userIdToFetch || user?.id;
    if (!targetUserId) {
      setProfile(null);
      return null;
    }

    if (isFetchingProfile.current && lastFetchedUserId.current === targetUserId) {
      return;
    }

    isFetchingProfile.current = true;
    lastFetchedUserId.current = targetUserId;

    try {
      const data = await profileService.getCurrentProfile(targetUserId);
      setProfile(data);
      return data;
    } catch (err) {
      console.error("AuthContext: Failed to fetch profile:", err.message);
      setProfile(null);
      return null;
    } finally {
      isFetchingProfile.current = false;
    }
  }, [user?.id]);

  // Expose function to refresh session manually
  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        await refreshProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("AuthContext: Error refreshing session:", err.message);
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  // Sign In function via Supabase OTP
  const login = useCallback(async (phone) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your environment.");
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("AuthContext: Login error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign Out function
  const logout = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      setProfile(null);
      lastFetchedUserId.current = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("session_user");
      }
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clean up local states
      setSession(null);
      setUser(null);
      setProfile(null);
      lastFetchedUserId.current = null;
      
      // Remove any lingering session storage keys (if existing code left them)
      if (typeof window !== "undefined") {
        localStorage.removeItem("session_user");
      }
    } catch (err) {
      console.error("AuthContext: Sign out error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Auth state listener
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initial session recovery
    refreshSession();

    // Setup active listeners for session state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // If a new login or sign-in occurs, update telemetry and refresh the state
        if (event === "SIGNED_IN") {
          await profileService.updateLastLogin(currentUser.id);
        }
        await refreshProfile(currentUser.id);
      } else {
        setProfile(null);
        lastFetchedUserId.current = null;
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession, refreshProfile]);

  const isAdmin = profile?.role === "admin";
  const isAuthenticated = !!user;

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    refreshProfile,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
