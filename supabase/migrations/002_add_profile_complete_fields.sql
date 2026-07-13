-- =====================================================================
-- DATABASE MIGRATION: 002_add_profile_complete_fields.sql
-- DESCRIPTION: Adds columns for profile completion tracking and login telemetry.
-- =====================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
