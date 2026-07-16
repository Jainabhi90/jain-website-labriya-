ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS cms_data JSONB DEFAULT '{}'::jsonb;
