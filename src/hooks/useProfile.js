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
  const { 
    profile, 
    profilesList, 
    loading, 
    refreshProfile, 
    selectProfile, 
    createSecondaryProfile 
  } = useAuth();

  // Re-fetch devotee profile details directly from Supabase
  const refresh = useCallback(async () => {
    if (!profile?.id) return null;
    return await refreshProfile(profile.id);
  }, [profile?.id, refreshProfile]);

  // Update devotee profile details in Supabase
  const update = useCallback(async (updates) => {
    if (!profile?.id) throw new Error("No active profile selected to update.");
    
    // Call the service to update in Supabase
    const updatedData = await profileService.updateProfile(profile.id, updates);
    
    // Refresh context state to synchronize everywhere instantly
    await refreshProfile(profile.id);
    
    return updatedData;
  }, [profile?.id, refreshProfile]);

  // Complete profile onboarding in Supabase
  const complete = useCallback(async (updates) => {
    if (!profile?.id) throw new Error("No active profile selected to complete onboarding.");
    
    // Call service to update is_profile_complete = true in database
    const completedData = await profileService.completeProfile(profile.id, updates);
    
    // Refresh context state
    await refreshProfile(profile.id);
    
    return completedData;
  }, [profile?.id, refreshProfile]);

  // Calculate completeness based on context profile data
  const isProfileComplete = profileService.isProfileComplete(profile);

  return {
    profile,
    profilesList,
    loading,
    refresh,
    update,
    complete,
    selectProfile,
    createSecondaryProfile,
    isProfileComplete
  };
}
