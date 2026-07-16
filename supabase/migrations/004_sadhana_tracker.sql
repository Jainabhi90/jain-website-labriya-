-- =====================================================================
-- DATABASE MIGRATION: 004_sadhana_tracker.sql
-- DESCRIPTION: Integrates server-side PL/pgSQL calculations for devotee
--              daily check-in streaks, points sums, and automatic badge unlocks.
-- =====================================================================

-- 1. ADD COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0 NOT NULL CONSTRAINT check_positive_longest_streak CHECK (longest_streak >= 0);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. CREATE TABLE: PROFILE BADGES
CREATE TABLE IF NOT EXISTS public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_profile_badge UNIQUE(profile_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.profile_badges;
DROP POLICY IF EXISTS "Users can view their own badges" ON public.profile_badges;

-- Security Policies
CREATE POLICY "Badges are viewable by everyone" ON public.profile_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own badges" ON public.profile_badges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- 3. STREAK CALCULATION FUNCTION (Gaps & Islands algorithm)
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

  -- 1. Calculate Current Streak
  -- If the devotee hasn't logged anything today or yesterday, current streak is 0
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

  -- 2. Calculate Longest Streak (Gaps & Islands solution)
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

-- 4. TRIGGER FUNCTION ON VOW SUBMISSIONS
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

  -- 1. Recalculate streak values
  SELECT current_streak, longest_streak, last_activity_date 
  FROM public.calculate_streak(target_profile_id) 
  INTO v_current_streak, v_longest_streak, v_last_active;

  -- 2. Recalculate total points from Approved logs
  SELECT COALESCE(SUM(points_awarded), 0) INTO points_sum
  FROM public.user_activities
  WHERE profile_id = target_profile_id AND status = 'Approved'::public.submission_status;

  -- 3. Update devotee profile counters
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

-- 5. BADGES AUTOMATIC UNLOCKS TRIGGER FUNCTION
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

  -- 1. First Check-in: check if they have any logs submitted
  SELECT EXISTS (
    SELECT 1 FROM public.user_activities WHERE profile_id = NEW.id
  ) INTO v_has_logs;

  IF v_has_logs THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_first_checkin')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 2. 7 Day Streak
  IF v_streak >= 7 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_7_streak')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 3. 30 Day Streak
  IF v_streak >= 30 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_30_streak')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 4. 100 Points
  IF v_points >= 100 THEN
    INSERT INTO public.profile_badges (profile_id, badge_id)
    VALUES (NEW.id, 'badge_100_points')
    ON CONFLICT (profile_id, badge_id) DO NOTHING;
  END IF;

  -- 5. Volunteer Seva: check if they have any Approved logs categorized as Seva
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
