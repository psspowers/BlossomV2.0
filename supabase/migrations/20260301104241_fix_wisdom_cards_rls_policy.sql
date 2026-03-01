/*
  # Fix wisdom_cards RLS Policy for Performance

  ## Summary
  Optimizes the wisdom_cards RLS policy to prevent re-evaluation of auth functions
  on each row by using the subquery pattern.

  ## Changes
  - Drops and recreates the "Public read access to wisdom cards" policy
  - Uses `(select auth.role())` instead of `auth.role()` for better performance
  - Maintains the same security logic: public can see active cards, authenticated users see all

  ## Performance Impact
  Reduces per-row evaluation overhead when querying wisdom_cards table.
*/

-- Drop existing wisdom_cards policies
DROP POLICY IF EXISTS "Anyone can view active wisdom cards" ON wisdom_cards;
DROP POLICY IF EXISTS "Authenticated users can view all wisdom cards" ON wisdom_cards;
DROP POLICY IF EXISTS "Public read access to wisdom cards" ON wisdom_cards;

-- Create single optimized policy for public read access
CREATE POLICY "Public read access to wisdom cards"
  ON wisdom_cards
  FOR SELECT
  USING (
    (active = true) OR 
    ((select auth.role()) = 'authenticated')
  );