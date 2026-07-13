-- =====================================================================
-- DATABASE MIGRATION: 001_initial_schema.sql
-- AUTHOR: Principal Database Architect
-- DESCRIPTION: Sets up schema upgrades, enums, triggers, RLS, and seed data.
-- =====================================================================

-- 1. CREATE ENUM TYPES (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_category') THEN
    CREATE TYPE public.activity_category AS ENUM ('Fasting', 'Prayer', 'Meditation', 'Learning', 'Temple', 'Seva');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_difficulty') THEN
    CREATE TYPE public.activity_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE public.submission_status AS ENUM ('Pending', 'Approved', 'Rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_source') THEN
    CREATE TYPE public.submission_source AS ENUM ('Website', 'Admin', 'Mobile');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE public.event_status AS ENUM ('Upcoming', 'Completed', 'Cancelled');
  END IF;
END$$;

-- 2. HELPER TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 3. CREATE TABLE: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  city VARCHAR(100),
  role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
  total_points INTEGER DEFAULT 0 NOT NULL CONSTRAINT check_positive_points CHECK (total_points >= 0),
  current_streak INTEGER DEFAULT 0 NOT NULL CONSTRAINT check_positive_streak CHECK (current_streak >= 0),
  avatar_url VARCHAR(255),
  bio TEXT,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Stores devotee profile details extending the system auth.users table.';
COMMENT ON COLUMN public.profiles.id IS 'Primary key referencing the built-in Supabase auth.users table.';
COMMENT ON COLUMN public.profiles.role IS 'Security access role: user or admin.';

-- 4. CREATE TABLE: ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0 NOT NULL CONSTRAINT check_activity_points CHECK (points >= 0),
  category public.activity_category NOT NULL,
  icon VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  difficulty public.activity_difficulty DEFAULT 'Easy'::public.activity_difficulty NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 0 NOT NULL CONSTRAINT check_duration CHECK (estimated_duration_minutes >= 0),
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.activities IS 'Stores configuration details and points values for available spiritual vows.';

-- 5. CREATE TABLE: USER_ACTIVITIES
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE RESTRICT,
  activity_date DATE NOT NULL,
  points_awarded INTEGER NOT NULL CONSTRAINT check_awarded_points CHECK (points_awarded >= 0),
  status public.submission_status DEFAULT 'Pending'::public.submission_status NOT NULL,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  admin_note TEXT,
  submission_source public.submission_source DEFAULT 'Website'::public.submission_source NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.user_activities IS 'Tracks historical entries of daily devotee vow completion logs.';

-- 6. CREATE TABLE: EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  image_url VARCHAR(255),
  registration_required BOOLEAN DEFAULT false NOT NULL,
  max_participants INTEGER CONSTRAINT check_max_participants CHECK (max_participants IS NULL OR max_participants > 0),
  registration_deadline TIMESTAMPTZ,
  status public.event_status DEFAULT 'Upcoming'::public.event_status NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.events IS 'Manages upcoming temple festivals, pujas, and assembly schedules.';

-- 7. CREATE TABLE: ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(250) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' NOT NULL CONSTRAINT check_announcement_priority CHECK (priority IN ('low', 'normal', 'high')),
  published BOOLEAN DEFAULT true NOT NULL,
  image_url VARCHAR(255),
  expires_at TIMESTAMPTZ,
  pinned BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.announcements IS 'Public notice boards, Operational updates, and bulletins.';

-- 8. CREATE TABLE: SETTINGS (SINGLETON)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_guard BOOLEAN DEFAULT true NOT NULL CONSTRAINT settings_singleton CHECK (singleton_guard = true),
  temple_name VARCHAR(255) NOT NULL,
  temple_logo VARCHAR(255),
  hero_banner VARCHAR(255),
  email VARCHAR(255),
  about_text TEXT,
  trust_registration_number VARCHAR(100),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  donation_qr VARCHAR(255),
  upi_id VARCHAR(100),
  bank_name VARCHAR(150),
  account_holder VARCHAR(200),
  account_number VARCHAR(100),
  ifsc VARCHAR(50),
  contact_number VARCHAR(50),
  temple_address TEXT,
  facebook VARCHAR(255),
  instagram VARCHAR(255),
  youtube VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT settings_singleton_uniq UNIQUE (singleton_guard)
);

COMMENT ON TABLE public.settings IS 'Centralized settings table restricted to at most one record storing temple profiles.';

-- 9. CREATE TABLE: DAILY_PANCHANG
CREATE TABLE IF NOT EXISTS public.daily_panchang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  tithi VARCHAR(100) NOT NULL,
  paksha VARCHAR(100) NOT NULL,
  masa VARCHAR(100) NOT NULL,
  samvat VARCHAR(50) NOT NULL,
  sunrise VARCHAR(50) NOT NULL,
  sunset VARCHAR(50) NOT NULL,
  special_notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.daily_panchang IS 'Stores daily coordinates and auspicious solar calculations for the calendar.';

-- 10. CREATE TABLE: DAILY_QUOTES
CREATE TABLE IF NOT EXISTS public.daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author VARCHAR(255),
  language VARCHAR(10) DEFAULT 'en' NOT NULL,
  display_date DATE UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.daily_quotes IS 'Stores inspiring quotes to display daily on the devotee dashboard.';

-- 11. SYSTEM TRIGGERS: AUTOMATED MODTIMES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_modtime') THEN
    CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_activities_modtime') THEN
    CREATE TRIGGER update_activities_modtime BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_activities_modtime') THEN
    CREATE TRIGGER update_user_activities_modtime BEFORE UPDATE ON public.user_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_modtime') THEN
    CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_announcements_modtime') THEN
    CREATE TRIGGER update_announcements_modtime BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_modtime') THEN
    CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_panchang_modtime') THEN
    CREATE TRIGGER update_daily_panchang_modtime BEFORE UPDATE ON public.daily_panchang FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_quotes_modtime') THEN
    CREATE TRIGGER update_daily_quotes_modtime BEFORE UPDATE ON public.daily_quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 12. USER SIGNUP PROFILE SYNCHRONIZATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    mobile, 
    city, 
    role, 
    total_points, 
    current_streak, 
    is_active, 
    last_activity_date, 
    avatar_url
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Devotee'),
    new.phone,
    COALESCE(new.raw_user_meta_data->>'city', 'Labriya'),
    'user'::public.user_role,
    0,
    0,
    true,
    NULL,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- 13. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_panchang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- 14. SECURITY POLICIES (RLS) - Idempotent Policy Helper
DO $$
BEGIN
  -- Drop existing to avoid conflicts
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
  DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
  DROP POLICY IF EXISTS "Admins have full access on activities" ON public.activities;
  DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activities;
  DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activities;
  DROP POLICY IF EXISTS "Users or admins can update logs" ON public.user_activities;
  DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
  DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
  DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
  DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
  DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
  DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
  DROP POLICY IF EXISTS "Daily panchang is viewable by everyone" ON public.daily_panchang;
  DROP POLICY IF EXISTS "Admins can manage daily panchang" ON public.daily_panchang;
  DROP POLICY IF EXISTS "Daily quotes are viewable by everyone" ON public.daily_quotes;
  DROP POLICY IF EXISTS "Admins can manage daily quotes" ON public.daily_quotes;
END$$;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Activities
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins have full access on activities" ON public.activities FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- User Activities
CREATE POLICY "Users can view their own activity logs" ON public.user_activities FOR SELECT USING (
  auth.uid() = profile_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);
CREATE POLICY "Users can insert their own activity logs" ON public.user_activities FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);
CREATE POLICY "Users or admins can update logs" ON public.user_activities FOR UPDATE USING (
  (auth.uid() = profile_id AND status = 'Pending'::public.submission_status) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Events
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Announcements
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Settings
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Daily Panchang
CREATE POLICY "Daily panchang is viewable by everyone" ON public.daily_panchang FOR SELECT USING (true);
CREATE POLICY "Admins can manage daily panchang" ON public.daily_panchang FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- Daily Quotes
CREATE POLICY "Daily quotes are viewable by everyone" ON public.daily_quotes FOR SELECT USING (true);
CREATE POLICY "Admins can manage daily quotes" ON public.daily_quotes FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role
);

-- 15. DATA INDEXES
CREATE INDEX IF NOT EXISTS idx_user_activities_profile_date ON public.user_activities(profile_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_date ON public.user_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON public.user_activities(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

-- 16. SEED INITIAL VALUES (Triggers truncate/re-insert inside migrations helper if executing fresh)
TRUNCATE TABLE public.user_activities CASCADE;
TRUNCATE TABLE public.activities CASCADE;
TRUNCATE TABLE public.settings CASCADE;
TRUNCATE TABLE public.daily_quotes CASCADE;

-- Seed: activities
INSERT INTO public.activities (
  name, 
  description, 
  points, 
  category, 
  icon, 
  display_order, 
  difficulty, 
  estimated_duration_minutes, 
  active
) VALUES
('Upvas', 'Complete fasting for 24 hours consuming only warm boiled water.', 10, 'Fasting'::public.activity_category, 'utensils-crossed', 10, 'Hard'::public.activity_difficulty, 1440, true),
('Ekasana', 'Eating only a single meal in a sitting at one place.', 5, 'Fasting'::public.activity_category, 'bowl', 20, 'Medium'::public.activity_difficulty, 60, true),
('Beasana', 'Eating only two meals in sittings at one place.', 4, 'Fasting'::public.activity_category, 'two-bowls', 30, 'Easy'::public.activity_difficulty, 90, true),
('Ayambil', 'Dry grain meal without dairy, oil, ghee, sugar, green vegetables, or fruits.', 8, 'Fasting'::public.activity_category, 'dry-food', 40, 'Hard'::public.activity_difficulty, 60, true),
('Navkar Mala', 'Chanting one complete mala (108 counts) of the Navkar Mantra.', 2, 'Prayer'::public.activity_category, 'rosary', 50, 'Easy'::public.activity_difficulty, 15, true),
('Samayik', '48 minutes of silent meditation, study, or prayer.', 3, 'Meditation'::public.activity_category, 'peace', 60, 'Medium'::public.activity_difficulty, 48, true),
('Pratikraman', 'Devotional self-reflection and seek forgiveness prayers.', 5, 'Prayer'::public.activity_category, 'prayer-hands', 70, 'Medium'::public.activity_difficulty, 60, true),
('Swadhyay', 'Self-study of scriptures and spiritual texts.', 3, 'Learning'::public.activity_category, 'book-open', 80, 'Easy'::public.activity_difficulty, 30, true),
('Temple Visit', 'Darshan at Shree Labriya Jain Mandir.', 1, 'Temple'::public.activity_category, 'mandir', 90, 'Easy'::public.activity_difficulty, 20, true),
('Pravachan', 'Attending spiritual discourse by Pujya Gurudev.', 2, 'Learning'::public.activity_category, 'lecture', 100, 'Easy'::public.activity_difficulty, 90, true),
('Chaitya Vandan', 'Singing devotional praises in the temple.', 2, 'Temple'::public.activity_category, 'incense', 110, 'Easy'::public.activity_difficulty, 15, true),
('Volunteer Seva', 'Offering volunteer services for temple management.', 5, 'Seva'::public.activity_category, 'hands-helping', 120, 'Easy'::public.activity_difficulty, 120, true);

-- Seed: settings singleton
INSERT INTO public.settings (
  id,
  singleton_guard,
  temple_name,
  temple_logo,
  hero_banner,
  email,
  about_text,
  trust_registration_number,
  latitude,
  longitude,
  donation_qr,
  upi_id,
  bank_name,
  account_holder,
  account_number,
  ifsc,
  contact_number,
  temple_address,
  facebook,
  instagram,
  youtube,
  website
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  true,
  'Shree Labriya Jain Shwetambar Mandir',
  '/logo.png',
  '/jain_hero_spiritual.png',
  'contact@labriyajainmandir.org',
  'Welcome to the historical Shree Labriya Jain Shwetambar Mandir. This portal connects devotees during Chaturmas 2026.',
  'TRN-38472948-MP',
  22.450800,
  75.123500,
  '/upi_qr_code.png',
  'shreelabriyatrust@okaxis',
  'State Bank of India',
  'Shree Labriya Jain Mandir Trust',
  '38472948194',
  'SBIN0030129',
  '+91 98765 43210',
  'Mandir Marg, Labriya, Dhar District, Madhya Pradesh - 454111, India',
  'https://facebook.com',
  'https://instagram.com',
  'https://youtube.com',
  'https://labriyajainmandir.org'
);

-- Seed: daily_quotes
INSERT INTO public.daily_quotes (quote, author, language, display_date, active) VALUES
('The greatest mistake of a soul is non-recognition of its real self and can only be corrected by self-realization.', 'Lord Mahavira', 'en', '2026-07-11', true),
('Live and let live. Love all, serve all.', 'Lord Mahavira', 'en', '2026-07-12', true),
('A man is seated on top of a tree in the midst of a burning forest. He sees all living beings perish, yet he doesn’t realize that the same fate awaits him.', 'Lord Mahavira', 'en', '2026-07-13', true);
