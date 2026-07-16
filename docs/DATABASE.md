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
  - `longest_streak` (INTEGER, Default: `0` NOT NULL)
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

---

### 4. `public.profile_badges`
Devotional milestones unlocked by devotees.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `profile_id` (UUID, Foreign Key -> `profiles(id)` ON DELETE CASCADE)
  - `badge_id` (VARCHAR, Not Null)
  - `unlocked_at` (TIMESTAMPTZ, Default: `now()`)

---

### 5. `public.schedules`
Morning/Evening daily worship timetable templates.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `time` (VARCHAR, Not Null)
  - `activity` (VARCHAR, Not Null)
  - `session` (VARCHAR, Not Null)
  - `order_num` (INTEGER, Default: `10`)

---

### 6. `public.donations`
UPI donation records submitted by devotees for administrative approval.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `donor_name` (VARCHAR, Not Null)
  - `phone` (VARCHAR, Not Null)
  - `amount` (NUMERIC, Not Null)
  - `txn_id` (VARCHAR, Unique, Not Null)
  - `verified` (BOOLEAN, Default: `false`)
  - `created_at` (TIMESTAMPTZ, Default: `now()`)
  - `updated_at` (TIMESTAMPTZ, Default: `now()`)

---

### 7. `public.subscriptions`
Event waitlist subscription registers.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `name` (VARCHAR, Not Null)
  - `phone` (VARCHAR, Not Null)
  - `event_title` (VARCHAR, Not Null)
  - `created_at` (TIMESTAMPTZ, Default: `now()`)
  - `updated_at` (TIMESTAMPTZ, Default: `now()`)

---

### 8. `public.panchang`
Centralized Lunar calendar coordinates.
- **Columns**:
  - `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
  - `date_str` (VARCHAR, Unique, Not Null)
  - `tithi` (VARCHAR, Not Null)
  - `sunrise` (VARCHAR, Nullable)
  - `sunset` (VARCHAR, Nullable)
  - `paksha` (VARCHAR, Nullable)
  - `month` (VARCHAR, Nullable)
  - `festival` (VARCHAR, Nullable)
  - `shubh_din` (VARCHAR, Nullable)
  - `samayik` (VARCHAR, Nullable)
  - `event` (VARCHAR, Nullable)

---

## 🔐 Security (Row-Level Security) & Verification

### Profiles Table Policies
- **Select**: Viewable by everyone (`USING (true)`).
- **Insert**: Allowed only for authenticated owners (`WITH CHECK (auth.uid() = user_id)`). This enables both primary and secondary profile creations.
- **Update**: Allowed only for authenticated owners (`USING (auth.uid() = user_id)`) or Admins (`USING (public.is_admin(auth.uid()))`).
- **Delete**: Allowed only for secondary profiles (`member_number = 2`) owned by the authenticated user or by Admins.

### User Activities (Logs) Table Policies
- **Select**: Viewable if devotee is the owner of the profile (`profiles.user_id = auth.uid()`) OR if requester is an Admin.
- **Insert**: Allowed if profile is owned by user (`profiles.user_id = auth.uid()`).
- **Update**: Allowed if profile is owned by user AND logs are in `'Pending'` status OR if requester is an Admin.
- **Delete**: Allowed if profile is owned by user AND logs are in `'Pending'` status.

### Profile Badges Table Policies
- **Select**: Viewable by everyone (`USING (true)`).
- **Insert**: Allowed if profile is owned by user (`profiles.user_id = auth.uid()`).

### Timetable Schedules Table Policies
- **Select**: Viewable by everyone (`USING (true)`).
- **Insert/Update/Delete**: Restrained strictly to verified system administrators (`public.is_admin(auth.uid())`).

### Donations Policies
- **Select**: Allowed for matching phone numbers or admin.
- **Insert**: Allowed for everyone (`WITH CHECK (true)`).
- **Update**: Admin only.

### Subscriptions Policies
- **Select**: Admin only.
- **Insert**: Allowed for everyone (`WITH CHECK (true)`).

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
-   **`badge_first_checkin`**: Unlocks on the devotee's first daily log submission.
-   **`badge_7_streak`**: Unlocks when current streak is 7 or more days.
-   **`badge_30_streak`**: Unlocks when current streak is 30 or more days.
-   **`badge_100_points`**: Unlocks when total points sum reaches 100.
-   **`badge_volunteer`**: Unlocks when at least one Approved activity logged is categorized as `'Seva'`.
