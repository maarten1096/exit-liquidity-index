-- EXITLIQUIDITY Database Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Token holders table (main leaderboard data)
CREATE TABLE public.token_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  avg_entry_price NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  roi_percent NUMERIC NOT NULL DEFAULT 0,
  label TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Token price tracking
CREATE TABLE public.token_price (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- App configuration (store token mint address etc)
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_price ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access
CREATE POLICY "Public read access for token_holders"
  ON public.token_holders FOR SELECT
  USING (true);

CREATE POLICY "Public read access for token_price"
  ON public.token_price FOR SELECT
  USING (true);

CREATE POLICY "Public read access for app_config"
  ON public.app_config FOR SELECT
  USING (true);

-- Insert default config (replace with your token mint address)
INSERT INTO public.app_config (key, value) VALUES 
  ('token_mint', 'YOUR_TOKEN_MINT_ADDRESS_HERE'),
  ('last_indexed', '1970-01-01T00:00:00Z');

-- Create index for faster queries
CREATE INDEX idx_token_holders_roi ON public.token_holders (roi_percent ASC);
CREATE INDEX idx_token_holders_wallet ON public.token_holders (wallet_address);

-- Schedule cron job to run every 10 minutes
-- Note: Replace YOUR_ANON_KEY with your actual Supabase anon key
-- and YOUR_PROJECT_REF with your project reference
/*
SELECT cron.schedule(
  'index-holders-cron',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/index-holders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
*/
