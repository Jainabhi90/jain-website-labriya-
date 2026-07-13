"use client";

import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import { useCallback } from "react";

/**
 * Reusable Hook: useProfile
 * Consumes the AuthContext to provide profile state and manipulation operations.
 * Ensures data matches database constraints and prevents duplicate queries.
 */
export function useProfile() {
  const { user, profile, loading, refreshProfile } = useAuth();

  // Re-fetch devotee profile details directly from Supabase
  const refresh = useCallback(async () => {
    if (!user?.id) return null;
    return await refreshProfile(user.id);
  }, [user?.id, refreshProfile]);

  // Update devotee profile details in Supabase
  const update = useCallback(async (updates) => {
    if (!user?.id) throw new Error("No active user session found to update profile.");
    
    // Call the service to update in Supabase
    const updatedData = await profileService.updateProfile(user.id, updates);
    
    // Refresh context state to synchronize everywhere instantly
    await refreshProfile(user.id);
    
    return updatedData;
  }, [user?.id, refreshProfile]);

  // Complete profile onboarding in Supabase
  const complete = useCallback(async (updates) => {
    if (!user?.id) throw new Error("No active user session found to complete profile.");
    
    // Call service to update is_profile_complete = true in database
    const completedData = await profileService.completeProfile(user.id, updates);
    
    // Refresh context state
    await refreshProfile(user.id);
    
    return completedData;
  }, [user?.id, refreshProfile]);

  // Calculate completeness based on context profile data
  const isProfileComplete = profileService.isProfileComplete(profile);

  return {
    profile,
    loading,
    refresh,
    update,
    complete,
    isProfileComplete
  };
}
