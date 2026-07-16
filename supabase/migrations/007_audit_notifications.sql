-- =====================================================================
-- DATABASE MIGRATION: 007_audit_notifications.sql
-- DESCRIPTION: Creates public.notifications and public.audit_logs tables,
--              adds admin_notes column to profiles, and sets RLS policies.
-- =====================================================================

-- 1. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. CREATE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  affected_record_id VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. ADD NOTES COLUMNS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin_notes_public BOOLEAN DEFAULT false NOT NULL;

-- 4. ADD MAINTENANCE MODE TO SETTINGS
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "select_audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "insert_audit_logs" ON public.audit_logs;

-- 7. DEFINE NOTIFICATIONS POLICIES
CREATE POLICY "select_notifications" ON public.notifications
  FOR SELECT USING (
    profile_id IS NULL OR 
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_notifications" ON public.notifications
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
    public.is_admin(auth.uid())
  );

-- 8. DEFINE AUDIT LOG POLICIES
CREATE POLICY "select_audit_logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "insert_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
