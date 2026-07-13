# Supabase Database Migrations - Labriya Chaturmas Portal

This directory contains database schema definitions and setup guides for the PostgreSQL database hosting the backend of the **Labriya Chaturmas Portal**.

---

## 🛠️ How to Execute the Migration

You can run the schema migration using one of the following methods:

### Method 1: Using Supabase Dashboard (Web SQL Editor)
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project.
2. Select **SQL Editor** from the left-hand navigation menu.
3. Click **New Query** to create a blank workspace.
4. Copy the entire contents of [001_initial_schema.sql](file:///Users/abhijain/Documents/jain-website-labriya-/supabase/migrations/001_initial_schema.sql).
5. Paste the SQL query into the dashboard editor and click **Run** (or press Cmd+Enter / Ctrl+Enter).

### Method 2: Using the Supabase CLI (Local Development)
If you are developing locally with Supabase containers, apply the migration by running:
```bash
supabase migration up
```
Or reset and re-apply:
```bash
supabase db reset
```

---

## 📁 What the Migration Creates

Applying the `001_initial_schema.sql` migration configures the following structures:

### 1. Database Tables
- **`profiles`**: Devotee user data, streaks, points, and roles (`user` or `admin`) referencing Supabase's built-in `auth.users(id)`.
- **`activities`**: Configuration values for daily spiritual vows and point weights.
- **`user_activities`**: Log sheet tracking completed daily devotee tasks and approvals.
- **`events`**: Calendar coordinates and descriptions for temple programs.
- **`announcements`**: Broadcast notices and updates.
- **`settings`**: System configurations restricted to a single configuration row.

### 2. Triggers & Functions
- **`update_updated_at_column()`**: Modtime trigger automatically executing on update actions to refresh the `updated_at` column.
- **`handle_new_user()`**: Profile synchronization trigger executing `AFTER INSERT` on `auth.users` to automatically populate devotee metadata.

### 3. Security (RLS Policies)
- Enforces **Row-Level Security (RLS)** globally on all tables.
- Implements starter policies: public read access for announcements/schedules, owner-restricted access for devotee profiles/activity logs, and total permissions reserved for users carrying the `'admin'` role flag.

### 4. Database Indexes
- Creates database indexes on query filters (e.g. user IDs, event dates) and uniqueness guards to preserve high speed performance.

### 5. Seed Data
- Seeds 12 default spiritual activities (e.g. Upvas, Samayik, Pravachan).
- Seeds one default settings record containing bank transfer details, UPI codes, and temple address parameters.
