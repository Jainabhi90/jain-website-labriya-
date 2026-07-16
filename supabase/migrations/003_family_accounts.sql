-- =====================================================================
-- DATABASE MIGRATION: 003_family_accounts.sql
-- DESCRIPTION: Migrates profiles to support family accounts (up to 2 per user).
-- =====================================================================

-- 1. ADD COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_number INT;

-- 2. MIGRATE EXISTING DATA
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
UPDATE public.profiles SET member_number = 1 WHERE member_number IS NULL;

-- 3. SET CONSTRAINTS
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN member_number SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop existing fkey constraint from id to auth.users if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add check constraint for member_number
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_member_number;
ALTER TABLE public.profiles ADD CONSTRAINT check_member_number CHECK (member_number IN (1, 2));

-- Add unique constraint for (user_id, member_number)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_user_member;
ALTER TABLE public.profiles ADD CONSTRAINT unique_user_member UNIQUE (user_id, member_number);

-- Add partial unique index for phone/mobile numbers (ignore empty or null rows)
DROP INDEX IF EXISTS public.unique_active_mobile;
CREATE UNIQUE INDEX unique_active_mobile ON public.profiles (mobile) WHERE (mobile IS NOT NULL AND mobile <> '');

-- 4. HELPER FUNCTION FOR ADMIN CHECKS
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'admin'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REDEFINE NEW USER TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id,
    member_number,
    full_name, 
    mobile, 
    city, 
    role, 
    total_points, 
    current_streak, 
    is_active, 
    last_activity_date, 
    avatar_url,
    is_profile_complete
  )
  VALUES (
    gen_random_uuid(),
    new.id,
    1,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Devotee'),
    new.phone,
    COALESCE(new.raw_user_meta_data->>'city', 'Labriya'),
    'user'::public.user_role,
    0,
    0,
    true,
    NULL,
    NULL,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. UPDATE SECURITY POLICIES
-- Profiles
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;

CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- Activities
DROP POLICY IF EXISTS "Admins have full access on activities" ON public.activities;
CREATE POLICY "Admins have full access on activities" ON public.activities FOR ALL USING (public.is_admin(auth.uid()));

-- User Activities
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activities;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activities;
DROP POLICY IF EXISTS "Users or admins can update logs" ON public.user_activities;

CREATE POLICY "Users can view their own activity logs" ON public.user_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()) OR public.is_admin(auth.uid())
);
CREATE POLICY "Users can insert their own activity logs" ON public.user_activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);
CREATE POLICY "Users or admins can update logs" ON public.user_activities FOR UPDATE USING (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()) AND status = 'Pending'::public.submission_status) OR public.is_admin(auth.uid())
);

-- Events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));

-- Announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.is_admin(auth.uid()));

-- Settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin(auth.uid()));

-- Daily Panchang
DROP POLICY IF EXISTS "Admins can manage daily panchang" ON public.daily_panchang;
CREATE POLICY "Admins can manage daily panchang" ON public.daily_panchang FOR ALL USING (public.is_admin(auth.uid()));

-- Daily Quotes
DROP POLICY IF EXISTS "Admins can manage daily quotes" ON public.daily_quotes;
CREATE POLICY "Admins can manage daily quotes" ON public.daily_quotes FOR ALL USING (public.is_admin(auth.uid()));
