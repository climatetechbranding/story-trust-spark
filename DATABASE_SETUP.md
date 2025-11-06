# Database Setup for Interactive Storytelling Platform

Since this project connects to your existing Clean Claims Supabase database, you'll need to run the following SQL in your Supabase SQL Editor to create the necessary tables.

## Run This SQL in Your Supabase Dashboard

Go to your Supabase project → SQL Editor → New Query, then paste and run:

```sql
-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  category TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_url TEXT UNIQUE,
  qr_code_url TEXT
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view their own stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
  ON public.stories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- Create story_analytics table
CREATE TABLE IF NOT EXISTS public.story_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  story_id UUID NOT NULL REFERENCES public.stories ON DELETE CASCADE,
  scan_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  location TEXT,
  device_type TEXT,
  referrer TEXT,
  is_unique_visitor BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.story_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_analytics
CREATE POLICY "Users can view analytics for their stories"
  ON public.story_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_analytics.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON public.story_analytics FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to stories table
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_short_url ON public.stories(short_url);
CREATE INDEX IF NOT EXISTS idx_story_analytics_story_id ON public.story_analytics(story_id);
CREATE INDEX IF NOT EXISTS idx_story_analytics_timestamp ON public.story_analytics(scan_timestamp);
```

## What This Creates

1. **stories table**: Stores all interactive stories with content blocks, QR codes, and publication status
2. **story_analytics table**: Tracks every QR code scan with device info and location
3. **Row Level Security (RLS)**: Ensures users can only see/edit their own stories
4. **Indexes**: Optimizes query performance

## Next Steps

After running this SQL:
1. ✅ Tables will be created in your existing database
2. ✅ Stories will be accessible by users of both Clean Claims and this storytelling platform
3. ✅ Analytics will track engagement across all story interactions
