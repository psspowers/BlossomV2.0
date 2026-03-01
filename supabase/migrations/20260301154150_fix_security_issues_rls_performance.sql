/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. RLS Performance Optimization
  - Drop existing RLS policies on `profiles` table that re-evaluate auth functions for each row
  - Recreate policies using `(select auth.uid())` pattern for better query performance
  - This prevents N+1 auth function calls and improves scalability

  ### 2. Function Security Hardening
  - Update `handle_new_user` function with immutable search_path
  - Set explicit `search_path` to prevent search path injection attacks
  - Mark function as `SECURITY DEFINER` with restricted search path

  ## Security Notes
  - All policies maintain the same access control logic
  - Performance improvement does not compromise security
  - Function search path is locked to prevent privilege escalation

  ## Important
  - Auth connection strategy and leaked password protection are configuration settings
    that must be changed in Supabase Dashboard, not via SQL migrations
*/

-- Drop existing RLS policies with performance issues
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Fix search path vulnerability in handle_new_user function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
