-- Migration: Add missing Panchang fields and version history
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS nakshatra VARCHAR(100);
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS yoga VARCHAR(100);
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS karana VARCHAR(100);
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS moon_sign VARCHAR(100);
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS special_notes TEXT;
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS fasting_info TEXT;
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS important_timings TEXT;
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS additional_remarks TEXT;
ALTER TABLE public.panchang ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Version History Table
CREATE TABLE IF NOT EXISTS public.panchang_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panchang_id UUID REFERENCES public.panchang(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  date_str VARCHAR(50) NOT NULL,
  tithi VARCHAR(100) NOT NULL,
  sunrise VARCHAR(50),
  sunset VARCHAR(50),
  paksha VARCHAR(50),
  month VARCHAR(50),
  festival VARCHAR(200),
  shubh_din VARCHAR(200),
  samayik VARCHAR(200),
  event VARCHAR(200),
  nakshatra VARCHAR(100),
  yoga VARCHAR(100),
  karana VARCHAR(100),
  moon_sign VARCHAR(100),
  special_notes TEXT,
  fasting_info TEXT,
  important_timings TEXT,
  additional_remarks TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS setup for history
ALTER TABLE public.panchang_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Panchang versions are viewable by everyone" ON public.panchang_versions;
DROP POLICY IF EXISTS "Admins can manage panchang versions" ON public.panchang_versions;

CREATE POLICY "Panchang versions are viewable by everyone" ON public.panchang_versions FOR SELECT USING (true);
CREATE POLICY "Admins can manage panchang versions" ON public.panchang_versions FOR ALL USING (public.is_admin(auth.uid()));
