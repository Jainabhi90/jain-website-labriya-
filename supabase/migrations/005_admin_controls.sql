-- =====================================================================
-- DATABASE MIGRATION: 005_admin_controls.sql
-- DESCRIPTION: Enables Row Level Security (RLS) on schedules and restricts
--              administrative changes strictly to verified admins.
-- =====================================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTINGS
DROP POLICY IF EXISTS "Schedules are viewable by everyone" ON public.schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;

-- 3. DEFINE POLICIES
CREATE POLICY "Schedules are viewable by everyone" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admins can manage schedules" ON public.schedules FOR ALL USING (
  public.is_admin(auth.uid())
);
