-- Temporarily disable RLS for POC (will add auth later)
-- This allows all operations without authentication for development

-- Drop existing restrictive policies on stories
DROP POLICY IF EXISTS "Users can view their own stories" ON stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;

-- Create permissive policies for POC
CREATE POLICY "Allow all operations on stories for POC"
ON stories
FOR ALL
USING (true)
WITH CHECK (true);

-- Keep analytics policies as-is (anyone can insert, viewing requires story ownership)
-- This is fine for POC since we're not implementing full analytics yet