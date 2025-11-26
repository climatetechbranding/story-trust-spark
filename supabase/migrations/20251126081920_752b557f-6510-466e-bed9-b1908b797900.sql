-- Drop foreign key constraint to enable POC mode story creation
-- Stories will use placeholder user_id without auth requirement
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;