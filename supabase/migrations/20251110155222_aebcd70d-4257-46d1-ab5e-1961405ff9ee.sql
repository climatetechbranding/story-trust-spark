-- Create brand_settings table
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Colors (stored as HSL format to match existing design system)
  primary_color TEXT NOT NULL DEFAULT '217 91% 60%',
  secondary_color TEXT NOT NULL DEFAULT '142 76% 36%',
  text_color TEXT NOT NULL DEFAULT '222.2 84% 4.9%',
  
  -- Typography
  primary_font TEXT NOT NULL DEFAULT 'Inter',
  secondary_font TEXT NOT NULL DEFAULT 'Inter',
  
  -- Assets (URLs to Supabase Storage)
  favicon_url TEXT,
  share_image_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraint (loose for POC)
  CONSTRAINT brand_settings_user_id_check CHECK (user_id IS NOT NULL)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON public.brand_settings(user_id);

-- Enable RLS (permissive for POC)
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- Permissive policy for POC
CREATE POLICY "Allow all operations for POC" ON public.brand_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Add custom branding columns to stories table
ALTER TABLE public.stories 
  ADD COLUMN IF NOT EXISTS custom_branding JSONB,
  ADD COLUMN IF NOT EXISTS use_custom_brand BOOLEAN DEFAULT FALSE;

-- Index for querying stories with custom branding
CREATE INDEX IF NOT EXISTS idx_stories_use_custom_brand 
  ON public.stories(use_custom_brand) WHERE use_custom_brand = TRUE;

-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for brand assets (permissive for POC)
CREATE POLICY "Allow all operations for POC" ON storage.objects
  FOR ALL
  USING (bucket_id = 'brand-assets')
  WITH CHECK (bucket_id = 'brand-assets');

-- Insert default brand settings for the POC user
INSERT INTO public.brand_settings (
  user_id,
  primary_color,
  secondary_color,
  text_color,
  primary_font,
  secondary_font
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '217 91% 60%',
  '142 76% 36%',
  '222.2 84% 4.9%',
  'Inter',
  'Inter'
) ON CONFLICT (user_id) DO NOTHING;