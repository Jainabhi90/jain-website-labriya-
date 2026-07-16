# Database Schema & Security - Labriya Chaturmas Portal

This document defines the schema architecture, table relations, query indexes, and security access policies (RLS) for the PostgreSQL database hosted on Supabase.

---

## 🗄️ Database Overview

The Labriya Chaturmas Portal database stores records for devotee profiles, daily schedules, notices, upcoming events, waitlist notifications, transaction reports, and spiritual vow audits. 

### Database Naming Conventions
- **Table Names**: Lowercase, plural, snake_case (e.g. `user_activities`).
- **Column Names**: Lowercase, singular, snake_case (e.g. `created_at`, `order_num`).
- **Foreign Keys**: Suffixed with `_id` (e.g., `user_id`, `profile_id`).
- **Indexes**: Prefixed with `idx_` followed by table and field names (e.g., `idx_user_activities_profile_date`).

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erJiagram
    users {
        uuid id PK
        varchar email
        varchar phone
    }

    profiles {
        uuid id PK
        uuid user_id FK
        integer member_number
        varchar full_name
        varchar mobile
        varchar city
        varchar role
        integer total_points
        integer current_streak
        varchar avatar_url
        text bio
        date last_activity_date
        boolean is_active
        boolean is_profile_complete
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    activities {
        uuid id PK
        varchar name
        text description
        integer points
        varchar category
        varchar icon
        integer display_order
        varchar difficulty
        integer estimated_duration_minutes
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    user_activities {
        uuid id PK
        uuid profile_id FK
        uuid activity_id FK
        date activity_date
        integer points_awarded
        varchar status
        text notes
        uuid approved_by FK
        timestamp approved_at
        text admin_note
        varchar submission_source
        timestamp created_at
        timestamp updated_at
    }

    events {
        uuid id PK
        varchar title
        text description
        varchar location
        date event_date
        time event_time
        varchar image_url
        boolean registration_required
        integer max_participants
        timestamp registration_deadline
        varchar status
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    announcements {
        uuid id PK
        varchar title
        text message
        varchar priority
        boolean published
        varchar image_url
        timestamp expires_at
        boolean pinned
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    settings {
        uuid id PK
        boolean singleton_guard
        varchar temple_name
        varchar temple_logo
        varchar hero_banner
        varchar email
        text about_text
        varchar trust_registration_number
        numeric latitude
        numeric longitude
        varchar donation_qr
        varchar upi_id
        varchar bank_name
        varchar account_holder
        varchar account_number
        varchar ifsc
        varchar contact_number
        text temple_address
        varchar facebook
        varchar instagram
        varchar youtube
        varchar website
        timestamp created_at
        timestamp updated_at
    }

    daily_panchang {
        uuid id PK
        date date
        varchar tithi
        varchar paksha
        varchar masa
        varchar samvat
        varchar sunrise
        varchar sunset
        text special_notes
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    daily_quotes {
        uuid id PK
        text quote
        varchar author
        varchar language
        date display_date
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ profiles : "owns (max 2)"
    profiles ||--o{ user_activities : "performs"
    activities ||--o{ user_activities : "logged"
    profiles ||--o{ events : "creates"
    profiles ||--o{ announcements : "creates"
    profiles ||--o{ daily_panchang : "updates"
```

---

## 📋 Table Definitions

### 1. `profiles`
Stores profile metrics for family member devotees. Linked to Supabase's internal `auth.users` via `user_id`. Supports up to 2 profiles per authenticated account.
- **Primary Key**: `id` (uuid, default: `gen_random_uuid()`)
- **Foreign Key**: `user_id` (uuid) -> `auth.users(id)` (on delete cascade)
- **Check Constraints**: `check_member_number` (`member_number IN (1, 2)`)
- **Unique Constraints**: `unique_user_member` (`UNIQUE (user_id, member_number)`)
- **Unique Indexes**: `unique_active_mobile` (partial unique index on `mobile` column where `mobile IS NOT NULL AND mobile <> ''` to ensure phone uniqueness across devotee profiles globally)
- **Columns**: `full_name` (varchar), `mobile` (varchar), `city` (varchar), `role` (user_role), `total_points` (integer), `current_streak` (integer), `avatar_url` (varchar), `is_profile_complete` (boolean), `last_login_at` (timestamp)

### 2. `activities`
Defines available spiritual tasks and their points values.
- **Primary Key**: `id` (uuid, default: `gen_random_uuid()`)
- **Columns**: `name` (varchar), `points` (integer), `category` (activity_category), `active` (boolean)

### 3. `user_activities`
Tracks devotee daily logs of spiritual task check-ins.
- **Primary Key**: `id` (uuid)
- **Foreign Key**: `profile_id` -> `profiles.id` (on delete cascade)
- **Columns**: `activity_date` (date), `points_awarded` (integer), `status` (submission_status)

### 4. `events`
Stores information on major upcoming Chaturmas events.
- **Primary Key**: `id` (uuid)
- **Columns**: `title` (varchar), `description` (text), `event_date` (date), `event_time` (time), `location` (varchar)

### 5. `announcements`
Stores notices issued by the temple administration.
- **Primary Key**: `id` (uuid)
- **Columns**: `title` (varchar), `message` (text), `published` (boolean)

---

## 🔒 Row-Level Security (RLS) Strategy

Row-Level Security is enabled globally on all tables. Because a user account now owns multiple profiles, policies verify ownership by checking if the matching profile belongs to the authenticated user ID (`auth.uid() = user_id`).

### Helper Function: `public.is_admin(user_uuid UUID)`
To streamline RLS checks, a security definer helper function resolves if the user owns any profile carrying the admin role:
```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'admin'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Security Policies Matrix

| Table Name | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|---|---|---|---|---|
| `profiles` | Public | Auth Users | Owner (`auth.uid() = user_id`) OR Admin | None |
| `activities` | Public | Admin Only | Admin Only | Admin Only |
| `user_activities` | Owner (`profile.user_id = auth.uid()`) OR Admin | Owner (`profile.user_id = auth.uid()`) | Owner (Pending logs only) OR Admin | None |
| `events` | Public | Admin Only | Admin Only | Admin Only |
| `announcements` | Public | Admin Only | Admin Only | Admin Only |
| `settings` | Public | Admin Only | Admin Only | Admin Only |
| `daily_panchang` | Public | Admin Only | Admin Only | Admin Only |
| `daily_quotes` | Public | Admin Only | Admin Only | Admin Only |

---

## ⚡ Indexing Strategy

To maintain sub-millisecond query performance under high load, the following database indexes are applied:

1. **`idx_user_activities_profile_date`**: Compound index on `user_activities(profile_id, activity_date)` for fetching active devotee logs.
2. **`idx_profiles_role`**: Index on `profiles(role)` for sorting admin permissions.
3. **`idx_profiles_total_points`**: Index on `profiles(total_points DESC)` for leaderboard lookups.
4. **`idx_announcements_created`**: Index on `announcements(created_at DESC)` for retrieving news notices.
