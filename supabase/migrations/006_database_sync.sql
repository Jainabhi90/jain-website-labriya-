-- =====================================================================
-- DATABASE MIGRATION: 006_database_sync.sql
-- DESCRIPTION: Corrects schema mismatches by creating missing tables,
--              columns (including longest_streak), and defining RLS policies.
-- =====================================================================

-- 1. Profiles Table column sync
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0 NOT NULL CONSTRAINT check_positive_longest_streak CHECK (longest_streak >= 0);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. Create Table: Profile Badges (if not exists)
CREATE TABLE IF NOT EXISTS public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_profile_badge UNIQUE(profile_id, badge_id)
);

-- 3. Create Table: Timetable Schedules (if not exists)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time VARCHAR(50) NOT NULL,
  activity VARCHAR(100) NOT NULL,
  session VARCHAR(20) NOT NULL CONSTRAINT check_session CHECK (session IN ('Morning', 'Evening')),
  order_num INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create Table: Donations Receipts (if not exists)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  amount NUMERIC NOT NULL CONSTRAINT check_amount_positive CHECK (amount > 0),
  txn_id VARCHAR(100) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Create Table: Subscriptions waitlists (if not exists)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  event_title VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Re-create Panchang Table matching React client queries (replacing daily_panchang)
DROP TABLE IF EXISTS public.daily_panchang CASCADE;

CREATE TABLE IF NOT EXISTS public.panchang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_str VARCHAR(50) UNIQUE NOT NULL,
  tithi VARCHAR(100) NOT NULL,
  sunrise VARCHAR(50),
  sunset VARCHAR(50),
  paksha VARCHAR(50),
  month VARCHAR(50),
  festival VARCHAR(200),
  shubh_din VARCHAR(200),
  samayik VARCHAR(200),
  event VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchang ENABLE ROW LEVEL SECURITY;

-- 8. Redefine public.profiles policies to resolve family account RLS issues
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own secondary profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can delete their own secondary profile" ON public.profiles FOR DELETE USING ((auth.uid() = user_id AND member_number = 2) OR public.is_admin(auth.uid()));

-- 9. Define Security Policies for newly synchronized tables
-- profile_badges
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.profile_badges;
DROP POLICY IF EXISTS "Users can insert their own badges" ON public.profile_badges;
CREATE POLICY "Badges are viewable by everyone" ON public.profile_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own badges" ON public.profile_badges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- schedules
DROP POLICY IF EXISTS "Schedules are viewable by everyone" ON public.schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;
CREATE POLICY "Schedules are viewable by everyone" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admins can manage schedules" ON public.schedules FOR ALL USING (
  public.is_admin(auth.uid())
);

-- donations
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can manage donations" ON public.donations;
CREATE POLICY "Users can view their own donations" ON public.donations FOR SELECT USING (
  phone = (SELECT mobile FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
  phone = (SELECT CONCAT('+91', mobile) FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
  public.is_admin(auth.uid())
);
CREATE POLICY "Anyone can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage donations" ON public.donations FOR ALL USING (
  public.is_admin(auth.uid())
);

-- subscriptions
DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view subscriptions" ON public.subscriptions FOR SELECT USING (
  public.is_admin(auth.uid())
);
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (
  public.is_admin(auth.uid())
);

-- panchang
DROP POLICY IF EXISTS "Panchang is viewable by everyone" ON public.panchang;
DROP POLICY IF EXISTS "Admins can manage panchang" ON public.panchang;
CREATE POLICY "Panchang is viewable by everyone" ON public.panchang FOR SELECT USING (true);
CREATE POLICY "Admins can manage panchang" ON public.panchang FOR ALL USING (
  public.is_admin(auth.uid())
);

-- 10. HELPER FUNCTION FOR ADMIN CHECKS
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'admin'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. STREAK CALCULATION FUNCTION (Gaps & Islands algorithm)
CREATE OR REPLACE FUNCTION public.calculate_streak(target_profile_id UUID)
RETURNS TABLE (
  current_streak INT,
  longest_streak INT,
  last_activity_date DATE
) AS $$
DECLARE
  v_last_active DATE := NULL;
  v_curr_date DATE;
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
BEGIN
  -- Get the last active date
  SELECT MAX(activity_date) INTO v_last_active
  FROM public.user_activities
  WHERE profile_id = target_profile_id;

  IF v_last_active IS NULL THEN
    RETURN QUERY SELECT 0, 0, NULL::DATE;
    RETURN;
  END IF;

  -- Calculate Current Streak
  IF v_last_active < CURRENT_DATE - 1 THEN
    v_current_streak := 0;
  ELSE
    v_curr_date := v_last_active;
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.user_activities 
        WHERE profile_id = target_profile_id AND activity_date = v_curr_date
      ) THEN
        v_current_streak := v_current_streak + 1;
        v_curr_date := v_curr_date - 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- Calculate Longest Streak (Gaps & Islands solution)
  WITH date_groups AS (
    SELECT 
      activity_date,
      activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::INT AS grp
    FROM (
      SELECT DISTINCT activity_date 
      FROM public.user_activities 
      WHERE profile_id = target_profile_id
    ) d
  ),
  group_counts AS (
    SELECT COUNT(*) AS streak_len
    FROM date_groups
    GROUP BY grp
  )
  SELECT COALESCE(MAX(streak_len), 0) INTO v_longest_streak
  FROM group_counts;

  RETURN QUERY SELECT v_current_streak, GREATEST(v_current_streak, v_longest_streak), v_last_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. TRIGGER FUNCTION ON VOW SUBMISSIONS
CREATE OR REPLACE FUNCTION public.on_user_activity_change()
RETURNS trigger AS $$
DECLARE
  target_profile_id UUID;
  v_current_streak INT;
  v_longest_streak INT;
  v_last_active DATE;
  points_sum INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_profile_id := OLD.profile_id;
  ELSE
    target_profile_id := NEW.profile_id;
  END IF;

  -- Recalculate streak values
  SELECT current_streak, longest_streak, last_activity_date 
  FROM public.calculate_streak(target_profile_id) 
  INTO v_current_streak, v_longest_streak, v_last_active;

  -- Recalculate total points from Approved logs
  SELECT COALESCE(SUM(points_awarded), 0) INTO points_sum
  FROM public.user_activities
  WHERE profile_id = target_profile_id AND status = 'Approved'::public.submission_status;

  -- Update devotee profile counters
  UPDATE public.profiles
  SET 
    total_points = points_sum,
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_last_active,
    updated_at = now()
  WHERE id = target_profile_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Activity Trigger
DROP TRIGGER IF EXISTS trg_user_activity_change ON public.user_activities;
CREATE TRIGGER trg_user_activity_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_activities
FOR EACH ROW EXECUTE FUNCTION public.on_user_activity_change();

-- 13. BADGES AUTOMATIC UNLOCKS TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.check_and_unlock_badges()
RETURNS trigger AS $$
DECLARE
  v_points INT;
  v_streak INT;
  v_seva_exists BOOLEAN;
  v_has_logs BOOLEAN;
BEGIN
  v_points := NEW.total_points;
  v_streak := NEW.current_streak;

  -- First Check-in: check if they have any logs submitted
  SELECT EXISTS (
    SELECT 1 FROM public.user_activities WHERE profile_id = NEW.id
  ) INTO v_has_logs;

  IF v_has_logs THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_first_checkin')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 7 Day Streak
  IF v_streak >= 7 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_7_streak')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 30 Day Streak
  IF v_streak >= 30 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_30_streak')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 100 Points
  IF v_points >= 100 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_100_points')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- Volunteer Seva: check if they have any Approved logs categorized as Seva
  SELECT EXISTS (
    SELECT 1 FROM public.user_activities ua
    JOIN public.activities a ON ua.activity_id = a.id
    WHERE ua.profile_id = NEW.id 
      AND a.category = 'Seva'::public.activity_category 
      AND ua.status = 'Approved'::public.submission_status
  ) INTO v_seva_exists;

  IF v_seva_exists THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_volunteer')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Profiles Stats Trigger
DROP TRIGGER IF EXISTS trg_profiles_stats_change ON public.profiles;
CREATE TRIGGER trg_profiles_stats_change
AFTER UPDATE OF total_points, current_streak ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_and_unlock_badges();
