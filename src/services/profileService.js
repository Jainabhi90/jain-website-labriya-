import { supabase } from "@/lib/supabase";
import { isProfileComplete as checkComplete } from "@/lib/auth-utils";

/**
 * Profile Database Service
 * Handles all CRUD operations on the 'profiles' table in Supabase.
 */
export const profileService = {
  /**
   * Retrieves all profiles owned by a specific authenticated user.
   *
   * @param {string} userId - UUID of the authenticated auth.users account
   * @returns {Promise<Array>} List of family profiles
   */
  async getUserProfiles(userId) {
    if (!userId) throw new Error("User ID is required to fetch profiles.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .order("member_number", { ascending: true });

    if (error) {
      console.error("Error in getUserProfiles:", error.message);
      throw error;
    }

    return data || [];
  },

  /**
   * Retrieves a specific family member's profile from the database.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @returns {Promise<Object>} The devotee profile record
   */
  async getCurrentProfile(profileId) {
    if (!profileId) throw new Error("Profile ID is required to fetch profile.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (error) {
      console.error("Error in getCurrentProfile:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Updates text profile fields.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @param {Object} updates - Fields to be modified (fullName, city)
   * @returns {Promise<Object>} The updated profile record
   */
  async updateProfile(profileId, updates) {
    if (!profileId) throw new Error("Profile ID is required to update profile.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const dbUpdates = {
      updated_at: new Date().toISOString()
    };

    if (updates.fullName !== undefined || updates.full_name !== undefined) {
      dbUpdates.full_name = updates.fullName || updates.full_name;
    }
    if (updates.city !== undefined) {
      dbUpdates.city = updates.city;
    }
    if (updates.avatar !== undefined || updates.avatarUrl !== undefined || updates.avatar_url !== undefined) {
      dbUpdates.avatar_url = updates.avatar || updates.avatarUrl || updates.avatar_url;
    }
    if (updates.phone !== undefined || updates.phoneNumber !== undefined || updates.mobile !== undefined) {
      dbUpdates.mobile = updates.phone || updates.phoneNumber || updates.mobile;
    }
    if (updates.totalPoints !== undefined || updates.total_points !== undefined) {
      dbUpdates.total_points = updates.totalPoints !== undefined ? updates.totalPoints : updates.total_points;
    }
    if (updates.streak !== undefined || updates.current_streak !== undefined) {
      dbUpdates.current_streak = updates.streak !== undefined ? updates.streak : updates.current_streak;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error in updateProfile:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Completes a devotee's profile onboarding by checking the completeness flag in the DB.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @param {Object} updates - Registration values (fullName, city, phone)
   * @returns {Promise<Object>} The completed profile record
   */
  async completeProfile(profileId, updates) {
    if (!profileId) throw new Error("Profile ID is required to complete profile.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const dbUpdates = {
      full_name: (updates.fullName || updates.full_name || "").trim(),
      city: (updates.city || "").trim(),
      mobile: (updates.phone || updates.phoneNumber || updates.mobile || "").trim(),
      is_profile_complete: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: dbUpdates.full_name,
        city: dbUpdates.city,
        mobile: dbUpdates.mobile,
        is_profile_complete: true,
        updated_at: dbUpdates.updated_at,
      })
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error in completeProfile:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Creates a secondary family profile under a user.
   *
   * @param {string} userId - UUID of the authenticated user
   * @param {Object} details - Name, phone, city
   * @returns {Promise<Object>} The newly created profile
   */
  async createSecondaryProfile(userId, details) {
    if (!userId) throw new Error("User ID is required.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const dbUpdates = {
      user_id: userId,
      member_number: 2,
      full_name: (details.fullName || details.full_name || "").trim(),
      city: (details.city || "").trim(),
      mobile: (details.phone || details.phoneNumber || details.mobile || "").trim() || null,
      is_profile_complete: true,
      role: "user",
      total_points: 0,
      current_streak: 0,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(dbUpdates)
      .select()
      .single();

    if (error) {
      console.error("Error in createSecondaryProfile:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Deletes a secondary devotee profile. Only member_number = 2 profiles can be deleted.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @returns {Promise<boolean>} Success status
   */
  async deleteSecondaryProfile(profileId) {
    if (!profileId) throw new Error("Profile ID is required for deletion.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId)
      .eq("member_number", 2); // safety lock: only allow deleting secondary profile

    if (error) {
      console.error("Error in deleteSecondaryProfile:", error.message);
      throw error;
    }

    return true;
  },

  /**
   * Telemetry update for devotee login timestamps.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @returns {Promise<void>}
   */
  async updateLastLogin(profileId) {
    if (!profileId) return;
    if (!supabase) return;

    const { error } = await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating last login timestamp:", error.message);
    }
  },

  /**
   * Re-fetches a profile. Identical to getCurrentProfile but semantically used for refetching.
   *
   * @param {string} profileId - UUID of the devotee profile
   * @returns {Promise<Object>}
   */
  async refreshProfile(profileId) {
    return this.getCurrentProfile(profileId);
  },

  /**
   * Evaluates if a profile is complete based on the database column flag.
   *
   * @param {Object} profile - Devotee profile record from database
   * @returns {boolean}
   */
  isProfileComplete(profile) {
    return checkComplete(profile);
  }
};
