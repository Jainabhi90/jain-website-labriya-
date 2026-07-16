"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  profilesList: [],
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  selectProfile: async () => {},
  createSecondaryProfile: async () => {},
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
  const [profilesList, setProfilesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // References to keep tracking states stable and prevent recursive state triggers
  const profileRef = useRef(null);
  const isFetchingProfile = useRef(false);
  const lastFetchedUserId = useRef(null);
  const hasRegisteredListener = useRef(false);

  // Wrapper to keep the profileRef in sync with React state
  const updateProfileState = useCallback((newProfile) => {
    profileRef.current = newProfile;
    setProfile(newProfile);
  }, []);

  // Normalizes DB fields to camelCase for page compatibility
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

  // Select profile active choice and save in localStorage
  const selectProfile = useCallback(async (profileId) => {
    if (!user) return null;
    const selected = profilesList.find((p) => p.id === profileId);
    if (selected) {
      localStorage.setItem(`last_profile_id_${user.id}`, selected.id);
      const normalized = normalizeProfile(selected);
      updateProfileState(normalized);
      return normalized;
    }
    return null;
  }, [user, profilesList, normalizeProfile, updateProfileState]);

  // Create secondary family profile (max 2)
  const createSecondaryProfile = useCallback(async (details) => {
    if (!user) throw new Error("No active authenticated session found.");
    
    // Safety check: ensure at most 2 profiles
    if (profilesList.length >= 2) {
      throw new Error("Maximum of two family members is allowed per account.");
    }

    const newProfile = await profileService.createSecondaryProfile(user.id, details);
    
    // Refresh user profiles list
    const updatedList = await profileService.getUserProfiles(user.id);
    setProfilesList(updatedList);

    // Auto-select the newly created profile
    localStorage.setItem(`last_profile_id_${user.id}`, newProfile.id);
    const normalized = normalizeProfile(newProfile);
    updateProfileState(normalized);

    return normalized;
  }, [user, profilesList, normalizeProfile, updateProfileState]);

  // Expose function to refresh user's profile details
  const refreshProfile = useCallback(async (profileIdToFetch) => {
    let targetProfileId = profileIdToFetch || profileRef.current?.id;
    if (!targetProfileId && user) {
      const savedId = localStorage.getItem(`last_profile_id_${user.id}`);
      if (savedId) {
        targetProfileId = savedId;
      }
    }

    if (!targetProfileId) {
      updateProfileState(null);
      return null;
    }

    try {
      const data = await profileService.getCurrentProfile(targetProfileId);
      if (!data) {
        updateProfileState(null);
        return null;
      }

      const normalized = normalizeProfile(data);
      if (!isProfileEqual(profileRef.current, normalized)) {
        updateProfileState(normalized);
      }
      return normalized;
    } catch (err) {
      console.error("[DEBUG] Failed to fetch profile:", err.message);
      updateProfileState(null);
      return null;
    }
  }, [user, normalizeProfile, updateProfileState]);

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
        let list = await profileService.getUserProfiles(currentUser.id);
        setProfilesList(list);

        if (list.length === 1) {
          const normalized = normalizeProfile(list[0]);
          updateProfileState(normalized);
          localStorage.setItem(`last_profile_id_${currentUser.id}`, list[0].id);
        } else if (list.length === 2) {
          const savedId = localStorage.getItem(`last_profile_id_${currentUser.id}`);
          const match = list.find((p) => p.id === savedId);
          if (match) {
            updateProfileState(normalizeProfile(match));
          } else {
            updateProfileState(null);
          }
        } else {
          updateProfileState(null);
        }
      } else {
        setProfilesList([]);
        updateProfileState(null);
      }
    } catch (err) {
      console.error("AuthContext: Error refreshing session:", err.message);
      setSession(null);
      setUser(null);
      setProfilesList([]);
      updateProfileState(null);
    } finally {
      setLoading(false);
    }
  }, [normalizeProfile, updateProfileState]);

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

  // Sign Out function
  const logout = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      setProfilesList([]);
      updateProfileState(null);
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
      setProfilesList([]);
      updateProfileState(null);
      setLoading(false);
    }
  }, [updateProfileState]);

  // Initialize Auth state listener and recover session
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
        try {
          // Fetch profiles with retries in case the db trigger runs with minor delay
          let list = [];
          for (let attempt = 1; attempt <= 3; attempt++) {
            list = await profileService.getUserProfiles(currentUser.id);
            if (list.length > 0) {
              break;
            }
            console.log(`[DEBUG] Profiles empty on attempt ${attempt}/3. Retrying...`);
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          // Trigger fallback primary profile insertion if database trigger did not complete
          if (list.length === 0) {
            console.log("[DEBUG] Creating primary profile fallback.");
            const { data, error } = await supabase
              .from("profiles")
              .insert({
                user_id: currentUser.id,
                member_number: 1,
                full_name: currentUser.user_metadata?.full_name || "Devotee",
                mobile: currentUser.phone || "",
                city: "Labriya",
                role: "user",
                is_profile_complete: false
              })
              .select()
              .single();
            if (!error && data) {
              list = [data];
            }
          }

          setProfilesList(list);

          // Determine active profile
          if (list.length === 1) {
            const normalized = normalizeProfile(list[0]);
            updateProfileState(normalized);
            localStorage.setItem(`last_profile_id_${currentUser.id}`, list[0].id);
            
            if (event === "SIGNED_IN") {
              await profileService.updateLastLogin(list[0].id);
            }
          } else if (list.length === 2) {
            const savedId = localStorage.getItem(`last_profile_id_${currentUser.id}`);
            const match = list.find((p) => p.id === savedId);
            if (match) {
              const normalized = normalizeProfile(match);
              updateProfileState(normalized);
              if (event === "SIGNED_IN") {
                await profileService.updateLastLogin(match.id);
              }
            } else {
              updateProfileState(null);
            }
          } else {
            updateProfileState(null);
          }
        } catch (err) {
          console.error("AuthContext: Error resolving profiles:", err.message);
          setProfilesList([]);
          updateProfileState(null);
        }
      } else {
        setProfilesList([]);
        updateProfileState(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [normalizeProfile, updateProfileState]);

  const isAdmin = profile?.role === "admin";
  const isAuthenticated = !!user;

  const value = {
    session,
    user,
    profile,
    profilesList,
    loading,
    isAdmin,
    isAuthenticated,
    loginWithGoogle,
    logout,
    selectProfile,
    createSecondaryProfile,
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
