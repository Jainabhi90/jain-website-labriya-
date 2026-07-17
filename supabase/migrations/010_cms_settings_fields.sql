-- Migration: Add missing CMS settings columns to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS favicon VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS chaturmas_year VARCHAR(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS website_title VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS primary_theme_color VARCHAR(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS secondary_theme_color VARCHAR(50);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS branch VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS donation_instructions TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS eighty_g_info VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_disclaimer TEXT;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_subtitle VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_description TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS welcome_message VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS about_temple_summary TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS featured_quote TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS latest_announcement_banner TEXT;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS footer_description TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS copyright_text VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS designed_by_text VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS quick_contact_text VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS footer_logo VARCHAR(255);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS telegram VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS x_twitter VARCHAR(255);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS temple_history TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS trust_information TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS daily_timings VARCHAR(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS aarti_timing VARCHAR(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS puja_timing VARCHAR(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS office_timing VARCHAR(100);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_closed BOOLEAN DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 500;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS default_event_banner VARCHAR(255);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS allow_new_registration BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS allow_daily_check_in BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS allow_donations BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS allow_family_profiles BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT true;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS portal_logo VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_logo VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS loading_logo VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS login_background VARCHAR(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS dashboard_banner VARCHAR(255);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_analytics_id VARCHAR(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS meta_pixel_id VARCHAR(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS custom_footer_html TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS custom_head_scripts TEXT;
