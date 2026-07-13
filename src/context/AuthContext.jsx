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
  loginWithPhone: async () => {},
  loginWithGoogle: async () => {},
  verifyOTP: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  refreshSession: async () => {}
});

// Helper for deep comparison of profile states to avoid duplicate state sets
const isProfileEqual = (p1, p2) => {
  if (!p1 || !p2) return p1 === p2;
  return (
    p1.id === p2.id &&
    p1.full_name === p2.full_name &&
    p1.mobile === p2.mobile &&
    p1.city === p2.city &&
    p1.role === p2.role &&
    p1.total_points === p2.total_points &&
    p1.current_streak === p2.current_streak &&
    p1.avatar_url === p2.avatar_url &&
    p1.is_profile_complete === p2.is_profile_complete
  );
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // References to keep tracking states stable and prevent recursive state triggers
  const profileRef = useRef(null);
  const isFetchingProfile = useRef(false);
  const lastFetchedUserId = useRef(null);
  const refreshProfileCounter = useRef(0);
  const hasRegisteredListener = useRef(false);

  // Wrapper to keep the profileRef in sync with React state
  const updateProfileState = useCallback((newProfile) => {
    profileRef.current = newProfile;
    setProfile(newProfile);
  }, []);

  // Normalizes DB fields to camelCase for page compatibility (totally stable dependency)
  const normalizeProfile = useCallback((data) => {
    if (!data) return null;
    return {
      ...data,
      fullName: data.full_name,
      phone: data.mobile,
      avatar: data.avatar_url,
      totalPoints: data.total_points,
      streak: data.current_streak,
    };
  }, []);

  // Expose function to refresh user's profile details with latency retries.
  // CRITICAL: Must NOT depend on "profile" state or "profileRef" object directly to keep the callback stable.
  const refreshProfile = useCallback(async (userIdToFetch) => {
    let targetUserId = userIdToFetch;
    if (!targetUserId && supabase) {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      targetUserId = currentSession?.user?.id;
    }
    if (!targetUserId) {
      updateProfileState(null);
      return null;
    }

    // Check if fetch is already in progress to avoid duplicate execution
    if (isFetchingProfile.current && lastFetchedUserId.current === targetUserId) {
      console.log("[DEBUG] refreshProfile skipped: already fetching for user", targetUserId);
      return profileRef.current;
    }

    isFetchingProfile.current = true;
    lastFetchedUserId.current = targetUserId;
    refreshProfileCounter.current += 1;
    console.log(`[DEBUG] refreshProfile started. Execution count: ${refreshProfileCounter.current} for user: ${targetUserId}`);

    try {
      let data = null;
      // Retry up to 3 times (1000ms delay) to handle delayed trigger execution
      for (let attempt = 1; attempt <= 3; attempt++) {
        data = await profileService.getCurrentProfile(targetUserId);
        if (data) {
          break;
        }
        console.log(`[DEBUG] Profile row is null. Attempt ${attempt}/3. Retrying in 1000ms...`);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!data) {
        console.warn("[DEBUG] Profile row could not be found after retries.");
        updateProfileState(null);
        return null;
      }

      const normalized = normalizeProfile(data);
      // Avoid setting identical state to eliminate redundant component renders
      if (!isProfileEqual(profileRef.current, normalized)) {
        console.log("[DEBUG] refreshProfile finished: profile changed, updating state.");
        updateProfileState(normalized);
      } else {
        console.log("[DEBUG] refreshProfile finished: profile unchanged, skipping state update.");
      }
      return normalized;
    } catch (err) {
      console.error("[DEBUG] Failed to fetch profile:", err.message);
      updateProfileState(null);
      return null;
    } finally {
      isFetchingProfile.current = false;
    }
  }, [normalizeProfile, updateProfileState]);

  // Expose function to refresh session manually (stable)
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
        updateProfileState(null);
      }
    } catch (err) {
      console.error("AuthContext: Error refreshing session:", err.message);
      setSession(null);
      setUser(null);
      updateProfileState(null);
    } finally {
      setLoading(false);
    }
  }, [refreshProfile, updateProfileState]);

  // Sign In function via Supabase OTP (Phone)
  const loginWithPhone = useCallback(async (phone) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("AuthContext: Login error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = loginWithPhone;

  // Sign In function via Google OAuth
  const loginWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("AuthContext: Google Sign-In error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // OTP Verification
  const verifyOTP = useCallback(async (phone, token) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: "sms"
      });
      if (error) throw error;
      
      if (data.user) {
        await refreshProfile(data.user.id);
      }
      return data;
    } catch (err) {
      console.error("AuthContext: OTP verification error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  // Sign Out function
  const logout = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      updateProfileState(null);
      lastFetchedUserId.current = null;
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("AuthContext: Sign out error:", err.message);
    } finally {
      setSession(null);
      setUser(null);
      updateProfileState(null);
      lastFetchedUserId.current = null;
      setLoading(false);
    }
  }, [updateProfileState]);

  // Initialize Auth state listener and recover session
  // CRITICAL: Registered exactly once. Dependencies are stable, so this effect does not rerun.
  useEffect(() => {
    console.log("[DEBUG] Provider mounted");
    if (!supabase) {
      setLoading(false);
      return;
    }

    if (!hasRegisteredListener.current) {
      console.log("[DEBUG] Listener registered");
      hasRegisteredListener.current = true;
    }

    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[DEBUG] onAuthStateChange event: ${event}`);
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        if (event === "SIGNED_IN") {
          console.log("[DEBUG] SIGNED_IN event triggered");
          try {
            await profileService.updateLastLogin(currentUser.id);
          } catch (err) {
            console.error("AuthContext: Failed to update last login:", err.message);
          }
        } else if (event === "INITIAL_SESSION") {
          console.log("[DEBUG] INITIAL_SESSION event triggered");
        } else if (event === "SIGNED_OUT") {
          console.log("[DEBUG] SIGNED_OUT event triggered");
        }
        await refreshProfile(currentUser.id);
      } else {
        updateProfileState(null);
        lastFetchedUserId.current = null;
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshProfile, updateProfileState]);

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
    loginWithPhone,
    loginWithGoogle,
    verifyOTP,
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
