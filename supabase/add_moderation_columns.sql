-- Migration: Add moderation columns to confessions table
-- This script adds the missing moderation fields for the admin approval system

-- Add moderation columns if they don't exist
ALTER TABLE public.confessions
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by text,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create an index on is_approved for faster filtering
CREATE INDEX IF NOT EXISTS idx_confessions_is_approved ON public.confessions(is_approved);

-- Optional: Update existing confessions to have is_approved = true (since they're already visible)
-- Uncomment if you want to mark existing confessions as approved:
-- UPDATE public.confessions SET is_approved = true WHERE is_approved IS NULL;

-- Add a policy to allow admins to update the is_approved field
-- Note: This requires identifying who the admins are. Update the condition as needed.
-- Example: ALTER POLICY on confessions to allow updates to is_approved for specific users

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'confessions'
ORDER BY ordinal_position;
