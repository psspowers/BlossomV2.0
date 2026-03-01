/*
  # Sovereign Privacy Model - Minimal Profiles Table

  1. Overview
    - Implements strict privacy firewall
    - Server stores ONLY identity data (email/password for account recovery)
    - All health data stays local on device
  
  2. Tables
    - `profiles`: Minimal identity table
      - `id` (uuid, FK to auth.users)
      - `email` (text, for display/recovery)
      - `last_seen_at` (timestamp, for retention metrics)
      - `created_at` (timestamp, record creation)
  
  3. Security
    - RLS enabled on profiles
    - Users can only read their own profile
    - Auto-created on auth signup via trigger
  
  4. What's NOT Here (By Design)
    - NO priorities
    - NO happiness scores
    - NO symptoms
    - NO health data of any kind
    - All that stays in Dexie on device
*/

-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create minimal profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Service role can update last_seen for retention tracking
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, last_seen_at, created_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();