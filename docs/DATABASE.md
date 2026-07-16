# Database Schema & Security - Labriya Chaturmas Portal

This document outlines the PostgreSQL schemas, relations, security policies (RLS), and database trigger architectures configured on Supabase.

---

## 🛢️ Schema Tables

### 1. `public.profiles`
Represents individual devotees registered under a Google Account.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `user_id` (UUID, Foreign Key -> `auth.users(id)` ON DELETE CASCADE)
  - `member_number` (INTEGER, check constraint: `IN (1, 2)`)
  - `full_name` (VARCHAR, Not Null)
  - `mobile` (VARCHAR, Nullable)
  - `city` (VARCHAR, Not Null)
  - `role` (ENUM `public.user_role`, Default: `'user'`)
  - `total_points` (INTEGER, Default: `0`)
  - `current_streak` (INTEGER, Default: `0`)
  - `longest_streak` (INTEGER, Default: `0`)
  - `last_activity_date` (DATE, Nullable)
  - `avatar_url` (TEXT, Nullable)
  - `is_active` (BOOLEAN, Default: `true`)
  - `is_profile_complete` (BOOLEAN, Default: `false`)
  - `last_login_at` (TIMESTAMPTZ, Nullable)
  - `created_at` (TIMESTAMPTZ, Default: `now()`)
  - `updated_at` (TIMESTAMPTZ, Default: `now()`)
- **Indexes**:
  - `idx_profiles_user_id`: Index on `user_id` for fast relationship checks.
  - `unique_active_mobile`: Partial unique index on `mobile` enforcing phone uniqueness devotee-wide for non-empty phone entries.

---

### 2. `public.activities`
Catalog of spiritual activities devotees can log daily.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `name` (VARCHAR, Not Null)
  - `description` (TEXT, Nullable)
  - `points` (INTEGER, Not Null)
  - `category` (ENUM `public.activity_category`, Not Null)
  - `icon` (VARCHAR, Nullable)
  - `display_order` (INTEGER, Default: `0`)
  - `difficulty` (ENUM `public.activity_difficulty`, Default: `'Easy'`)
  - `estimated_duration_minutes` (INTEGER, Default: `30`)
  - `active` (BOOLEAN, Default: `true`)
  - `created_at` (TIMESTAMPTZ, Default: `now()`)
  - `updated_at` (TIMESTAMPTZ, Default: `now()`)

---

### 3. `public.user_activities`
Transactional log sheets of devotee check-ins.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `profile_id` (UUID, Foreign Key -> `profiles(id)` ON DELETE CASCADE)
  - `activity_id` (UUID, Foreign Key -> `activities(id)` ON DELETE RESTRICT)
  - `activity_date` (DATE, Not Null)
  - `points_awarded` (INTEGER, Not Null)
  - `status` (ENUM `public.submission_status`, Default: `'Pending'`)
  - `notes` (TEXT, Nullable)
  - `approved_by` (UUID, Foreign Key -> `profiles(id)` ON DELETE SET NULL)
  - `approved_at` (TIMESTAMPTZ, Nullable)
  - `admin_note` (TEXT, Nullable)
  - `submission_source` (ENUM `public.submission_source`, Default: `'Website'`)
  - `created_at` (TIMESTAMPTZ, Default: `now()`)
  - `updated_at` (TIMESTAMPTZ, Default: `now()`)
- **Indexes**:
  - `idx_user_activities_profile`: Index on `profile_id`.
  - `idx_user_activities_date`: Index on `activity_date`.

---

### 4. `public.profile_badges`
Devotional milestones unlocked by devotees.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `profile_id` (UUID, Foreign Key -> `profiles(id)` ON DELETE CASCADE)
  - `badge_id` (VARCHAR, Not Null)
  - `unlocked_at` (TIMESTAMPTZ, Default: `now()`)
- **Constraints**:
  - `unique_profile_badge`: Unique constraint on `(profile_id, badge_id)`.

---

## 🔐 Security (Row-Level Security)

### Profiles Table Policies
- **Select**: Viewable by authenticated users.
- **Insert**: Allowed only if `user_id = auth.uid()`.
- **Update**: Allowed only if `user_id = auth.uid()`.

### User Activities (Logs) Table Policies
- **Select**: Viewable if devotee is the owner of the profile (`profiles.user_id = auth.uid()`) OR if requester is an Admin.
- **Insert**: Allowed if profile is owned by user (`profiles.user_id = auth.uid()`).
- **Update**: Allowed if profile is owned by user AND logs are in `'Pending'` status OR if requester is an Admin.
- **Delete**: Allowed if profile is owned by user AND logs are in `'Pending'` status.

### Profile Badges Table Policies
- **Select**: Viewable by everyone (`USING (true)`).
- **Insert**: Allowed if profile is owned by user (`profiles.user_id = auth.uid()`).

---

## ⚙️ Trigger Architectures (Server Calculations)

### 1. Streaks & Points Recalculations (`trg_user_activity_change`)
Fires `AFTER INSERT OR UPDATE OR DELETE` on `public.user_activities`.
1.  Calls `calculate_streak(profile_id)` (which computes current consecutive check-ins and the longest streak using a gaps-and-islands partitioning search).
2.  Tally `total_points` from all activities in `'Approved'` status.
3.  Updates the devotee record in `public.profiles`.

### 2. Automated Badges Unlocks (`trg_profiles_stats_change`)
Fires `AFTER UPDATE OF total_points, current_streak` on `public.profiles`.
Evaluates rules and awards badges into `public.profile_badges`:
-   **`badge_first_checkin`**: Unlocks on the first check-in log submission.
-   **`badge_7_streak`**: Unlocks when current streak is 7 or more days.
-   **`badge_30_streak`**: Unlocks when current streak is 30 or more days.
-   **`badge_100_points`**: Unlocks when total points sum reaches 100.
-   **`badge_volunteer`**: Unlocks when at least one Approved activity logged is categorized as `'Seva'`.
