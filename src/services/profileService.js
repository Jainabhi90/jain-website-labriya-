import { supabase } from "@/lib/supabase";
import { isProfileComplete as checkComplete } from "@/lib/auth-utils";

/**
 * Profile Database Service
 * Handles all CRUD operations on the 'profiles' table in Supabase.
 */
export const profileService = {
  /**
   * Retrieves a user's profile from the database.
   *
   * @param {string} userId - UUID of the devotee user
   * @returns {Promise<Object>} The devotee profile record
   */
  async getCurrentProfile(userId) {
    if (!userId) throw new Error("User ID is required to fetch profile.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
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
   * @param {string} userId - UUID of the devotee user
   * @param {Object} updates - Fields to be modified (fullName, city)
   * @returns {Promise<Object>} The updated profile record
   */
  async updateProfile(userId, updates) {
    if (!userId) throw new Error("User ID is required to update profile.");
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
      .eq("id", userId)
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
   * @param {string} userId - UUID of the devotee user
   * @param {Object} updates - Registration values (fullName, city, phone)
   * @returns {Promise<Object>} The completed profile record
   */
  async completeProfile(userId, updates) {
    if (!userId) throw new Error("User ID is required to complete profile.");
    if (!supabase) throw new Error("Supabase is not configured.");

    const dbUpdates = {
      id: userId,
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

      .eq("id", userId)

      .select()

      .single();

    if (error) {
      console.error("Error in completeProfile:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Telemetry update for devotee login timestamps.
   *
   * @param {string} userId - UUID of the devotee user
   * @returns {Promise<void>}
   */
  async updateLastLogin(userId) {
    if (!userId) return;
    if (!supabase) return;

    const { error } = await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating last login timestamp:", error.message);
    }
  },

  /**
   * Re-fetches a profile. Identical to getCurrentProfile but semantically used for refetching.
   *
   * @param {string} userId - UUID of the devotee user
   * @returns {Promise<Object>}
   */
  async refreshProfile(userId) {
    return this.getCurrentProfile(userId);
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
