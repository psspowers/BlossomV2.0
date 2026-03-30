/*
  # Fix User Profiles Security and Performance Issues

  1. Security & Performance Fixes
    - Optimize RLS policies by wrapping auth.uid() in SELECT subqueries
    - This prevents re-evaluation of auth.uid() for each row, improving performance at scale
    - Fix function search_path mutability by setting SECURITY DEFINER and explicit search_path

  2. Changes Made
    - DROP and recreate all three RLS policies on user_profiles with optimized auth.uid() calls
    - UPDATE the trigger function with SECURITY DEFINER and explicit search_path
    - Maintains exact same security logic, just optimized for performance

  3. Performance Impact
    - Queries will evaluate auth.uid() once instead of per-row
    - Significant improvement for users with multiple profile records or complex queries
    - No functional changes to authorization logic

  4. Important Notes
    - This addresses Supabase security recommendations
    - The Auth DB connection strategy must be adjusted separately in Supabase dashboard
    - All existing data and permissions remain unchanged
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate policies with optimized auth.uid() calls wrapped in SELECT
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Fix function search_path mutability issue
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;