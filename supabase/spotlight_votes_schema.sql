-- Supabase SQL schema for student spotlight votes
-- This creates a table to track individual votes per user to prevent duplicate voting

-- 1) Create spotlight_votes table to track per-user votes
CREATE TABLE IF NOT EXISTS public.spotlight_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_spotlight_id uuid NOT NULL REFERENCES public.student_spotlights(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_spotlight_id, user_id)
);

-- 2) Helper function to get vote count for a student
CREATE OR REPLACE FUNCTION public.get_spotlight_vote_count(spotlight_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE((SELECT COUNT(*) FROM public.spotlight_votes WHERE student_spotlight_id = spotlight_uuid), 0);
END;
$$ LANGUAGE plpgsql;

-- 3) Helper function to check if user has already voted
CREATE OR REPLACE FUNCTION public.has_user_voted(spotlight_uuid uuid, uid text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM public.spotlight_votes WHERE student_spotlight_id = spotlight_uuid AND user_id = uid);
END;
$$ LANGUAGE plpgsql;

-- 4) Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_spotlight_votes_student_id ON public.spotlight_votes(student_spotlight_id);
CREATE INDEX IF NOT EXISTS idx_spotlight_votes_user_id ON public.spotlight_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_spotlight_votes_timestamp ON public.spotlight_votes("timestamp");

-- 5) Row Level Security (RLS) policies
ALTER TABLE public.spotlight_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT votes (public read)
CREATE POLICY "public_select_spotlight_votes" ON public.spotlight_votes
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT their own votes
CREATE POLICY "insert_spotlight_votes_authenticated" ON public.spotlight_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NOT NULL);

-- Allow users to DELETE their own votes
CREATE POLICY "delete_spotlight_votes_owner" ON public.spotlight_votes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- 6) Optional: seed initial data if needed
-- INSERT INTO public.spotlight_votes (student_spotlight_id, user_id) 
-- VALUES (UUID, 'user-id') ON CONFLICT DO NOTHING;

-- End of schema file
