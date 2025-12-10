-- Supabase SQL schema for anonymous confessions
-- Run these statements in the Supabase SQL editor or psql against your database.

-- 1) Create confessions table
CREATE TABLE IF NOT EXISTS public.confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  likes integer NOT NULL DEFAULT 0,
  dislikes integer NOT NULL DEFAULT 0,
  is_approved boolean DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  rejection_reason text
);

-- 2) Create confession_comments table
CREATE TABLE IF NOT EXISTS public.confession_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  user_name text,
  "timestamp" timestamptz NOT NULL DEFAULT now()
);

-- 3) Create confession_reactions table to track per-user reactions (recommended)
--    This allows reliable toggling of likes/dislikes per user and avoids double-counting.
CREATE TABLE IF NOT EXISTS public.confession_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (confession_id, user_id)
);

-- 4) Trigger functions to maintain denormalized like/dislike counts on confessions
--    We'll maintain counts by incrementing/decrementing on reaction inserts/updates/deletes.

-- Helper: update counts from aggregated reaction table for a specific confession
CREATE OR REPLACE FUNCTION public.update_confession_counts(conf_uuid uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.confessions
  SET
    likes = COALESCE((SELECT COUNT(*) FROM public.confession_reactions r WHERE r.confession_id = conf_uuid AND r.reaction_type = 'like'), 0),
    dislikes = COALESCE((SELECT COUNT(*) FROM public.confession_reactions r WHERE r.confession_id = conf_uuid AND r.reaction_type = 'dislike'), 0)
  WHERE id = conf_uuid;
END;
$$;

-- Trigger function to call update_confession_counts after insert/update/delete on confession_reactions
CREATE OR REPLACE FUNCTION public.handle_confession_reactions_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.update_confession_counts(NEW.confession_id);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM public.update_confession_counts(NEW.confession_id);
    -- also update for OLD if confession_id changed
    IF (OLD.confession_id IS DISTINCT FROM NEW.confession_id) THEN
      PERFORM public.update_confession_counts(OLD.confession_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.update_confession_counts(OLD.confession_id);
    RETURN OLD;
  END IF;
  RETURN NULL; -- should not reach here
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS trig_confession_reactions_change ON public.confession_reactions;
CREATE TRIGGER trig_confession_reactions_change
AFTER INSERT OR UPDATE OR DELETE ON public.confession_reactions
FOR EACH ROW EXECUTE FUNCTION public.handle_confession_reactions_change();

-- 5) Optional: trigger to set confession timestamp on insert (already has default now())

-- 6) Indexes to improve lookups
CREATE INDEX IF NOT EXISTS idx_confession_comments_confession_id ON public.confession_comments(confession_id);
CREATE INDEX IF NOT EXISTS idx_confession_reactions_confession_id ON public.confession_reactions(confession_id);
CREATE INDEX IF NOT EXISTS idx_confessions_timestamp ON public.confessions("timestamp");

-- 7) Row Level Security (RLS) policies
-- Enable RLS on the tables and add example policies. Customize based on your auth model and security needs.

-- Enable RLS
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confession_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT confessions (public read)
CREATE POLICY "public_select_confessions" ON public.confessions
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT confessions (they can post anonymous confessions)
CREATE POLICY "insert_confessions_authenticated" ON public.confessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to DELETE/UPDATE confessions (adjust role or use a check on auth.uid())
-- Example using a specific admin email(s) stored in a `users` table would be more robust.
-- For simplicity allow the database's service role (server-side) to manage destructive ops.

-- Comments: allow anyone to SELECT comments
CREATE POLICY "public_select_confession_comments" ON public.confession_comments
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT comments
CREATE POLICY "insert_confession_comments_authenticated" ON public.confession_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Reactions: allow authenticated users to manage their own reaction rows
CREATE POLICY "select_confession_reactions_public" ON public.confession_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "insert_confession_reactions_authenticated" ON public.confession_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id::text OR auth.uid() IS NOT NULL);

CREATE POLICY "update_confession_reactions_owner" ON public.confession_reactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id::text);

CREATE POLICY "delete_confession_reactions_owner" ON public.confession_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id::text);

-- Notes:
-- - Replace the `authenticated` role with the role(s) appropriate in your Supabase configuration.
-- - The `auth.uid()` function returns the current user's UID as text in Supabase RLS contexts.
-- - You might want more granular policies (e.g. server-only delete for confessions).

-- 8) Clean up if running multiple times: (optional)
-- You may create DROP statements for triggers/functions if needed before recreating them.

-- 9) Example: seed a sample confession (optional)
-- INSERT INTO public.confessions (content) VALUES ('Welcome to the anonymous confessions board!');

-- End of schema file

/*
Troubleshooting: incompatible key types when adding foreign keys

If you get an error like:
  ERROR: foreign key constraint "confession_reactions_confession_id_fkey" cannot be implemented
  DETAIL: Key columns "confession_id" and "id" are of incompatible types: uuid and bigint.

That means there is already an existing `public.confessions` table whose `id` column uses a different type
than the one used above (we used uuid). Commonly this happens if your app previously created `confessions` with
an integer/bigint primary key.

Steps to resolve:
1) Inspect the existing column type for the `confessions` table:

   -- Run this in Supabase SQL editor to inspect column types
   SELECT column_name, data_type, udt_name
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'confessions';

2) If the `id` column is `bigint` (or integer), use the alternate DDL below which creates the
   `confession_reactions` table and associated triggers using `confession_id bigint` so the foreign key
   types are compatible. Do NOT run the UUID-based `confession_reactions` CREATE statement in that case.

Alternate DDL for databases where `public.confessions.id` is BIGINT
----------------------------------------------------------------

-- Create confession_reactions table that references a bigint confession id
CREATE TABLE IF NOT EXISTS public.confession_reactions_bigint (
  id bigserial PRIMARY KEY,
  confession_id bigint NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (confession_id, user_id)
);

-- Helper function to update counts when confession id is bigint
CREATE OR REPLACE FUNCTION public.update_confession_counts_bigint(conf_uuid bigint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.confessions
  SET
    likes = COALESCE((SELECT COUNT(*) FROM public.confession_reactions_bigint r WHERE r.confession_id = conf_uuid AND r.reaction_type = 'like'), 0),
    dislikes = COALESCE((SELECT COUNT(*) FROM public.confession_reactions_bigint r WHERE r.confession_id = conf_uuid AND r.reaction_type = 'dislike'), 0)
  WHERE id = conf_uuid;
END;
$$;

-- Trigger function to call update_confession_counts_bigint after insert/update/delete on confession_reactions_bigint
CREATE OR REPLACE FUNCTION public.handle_confession_reactions_change_bigint()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.update_confession_counts_bigint(NEW.confession_id);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM public.update_confession_counts_bigint(NEW.confession_id);
    IF (OLD.confession_id IS DISTINCT FROM NEW.confession_id) THEN
      PERFORM public.update_confession_counts_bigint(OLD.confession_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.update_confession_counts_bigint(OLD.confession_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger (use a distinct trigger name to avoid conflict)
DROP TRIGGER IF EXISTS trig_confession_reactions_change_bigint ON public.confession_reactions_bigint;
CREATE TRIGGER trig_confession_reactions_change_bigint
AFTER INSERT OR UPDATE OR DELETE ON public.confession_reactions_bigint
FOR EACH ROW EXECUTE FUNCTION public.handle_confession_reactions_change_bigint();

-- Index for the bigint reactions table
CREATE INDEX IF NOT EXISTS idx_confession_reactions_bigint_confession_id ON public.confession_reactions_bigint(confession_id);

-- RLS example for the bigint table (similar to the uuid variant)
ALTER TABLE public.confession_reactions_bigint ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_confession_reactions_bigint_public" ON public.confession_reactions_bigint FOR SELECT USING (true);
CREATE POLICY "insert_confession_reactions_bigint_authenticated" ON public.confession_reactions_bigint
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id::text OR auth.uid() IS NOT NULL);
CREATE POLICY "update_confession_reactions_bigint_owner" ON public.confession_reactions_bigint FOR UPDATE TO authenticated USING (auth.uid() = user_id::text);
CREATE POLICY "delete_confession_reactions_bigint_owner" ON public.confession_reactions_bigint FOR DELETE TO authenticated USING (auth.uid() = user_id::text);

-- Note: If you prefer to instead migrate your existing `confessions.id` column to UUID, that is also possible
-- but requires careful migration of existing IDs and any dependent tables. If you'd like help with that migration,
-- tell me and I can provide a step-by-step SQL migration plan.

*/
