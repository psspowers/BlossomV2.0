/*
  # Enforce Sovereign Privacy Model

  1. Overview
    - Remove ALL health data tables from server
    - Keep ONLY identity table (profiles)
    - All health data stays on device in Dexie

  2. Changes
    - DROP user_logs (health data belongs on device)
    - DROP user_settings (preferences belong on device)
    - DROP user_priorities (priorities belong on device)
    - DROP wisdom_cards (content can be static/client-side)
    - KEEP profiles (identity only: id, email, last_seen_at, created_at)

  3. Security
    - This enforces the Privacy Firewall
    - Server cannot access health data
    - User has full sovereignty over their data
*/

-- Drop all health data tables
DROP TABLE IF EXISTS public.user_logs CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.user_priorities CASCADE;
DROP TABLE IF EXISTS public.wisdom_cards CASCADE;

-- Profiles table remains (already minimal from previous migration)
-- No changes needed to profiles table
