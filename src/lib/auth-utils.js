/**
 * Authentication and Authorization Utility Helpers
 * Shree Labriya Jain Mandir Portal - Chaturmas 2026
 */

/**
 * Checks whether a devotee profile is considered complete based on the database flag.
 * A profile is complete if and only if `is_profile_complete` is explicitly true.
 *
 * @param {Object} profile - Devotee profile record from database
 * @returns {boolean} True if profile is completely filled out
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  return profile.is_profile_complete === true;
}

/**
 * Validates if the authenticated user and profile match a required role.
 *
 * @param {Object} user - Supabase authenticated user object
 * @param {Object} profile - Devotee profile record from database
 * @param {string} requiredRole - Role required (e.g. 'admin' or 'user')
 * @returns {boolean} True if user is authorized for the role
 */
export function checkUserAccess(user, profile, requiredRole) {
  if (!user || !profile) return false;
  if (!requiredRole) return true;
  
  return profile.role === requiredRole;
}
