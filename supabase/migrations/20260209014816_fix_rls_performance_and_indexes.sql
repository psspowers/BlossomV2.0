/*
  # Security & Performance Fixes

  ## Changes Made
  
  ### 1. RLS Performance Optimization (user_priorities table)
  - Updated all 4 RLS policies to use `(select auth.uid())` instead of `auth.uid()`
  - This prevents re-evaluation of auth function for each row, improving query performance at scale
  - Policies affected:
    - "Users can read own priorities"
    - "Users can insert own priorities"  
    - "Users can update own priorities"
    - "Users can delete own priorities"
  
  ### 2. Index Cleanup (wisdom_cards table)
  - Dropped 3 unused indexes:
    - `idx_wisdom_cards_triggers` (GIN index on triggers array)
    - `idx_wisdom_cards_category` (index on category column)
    - `idx_wisdom_cards_active_priority` (composite index on active and priority)
  - These indexes were not being utilized by queries and added unnecessary overhead
  
  ### 3. Policy Consolidation (wisdom_cards table)
  - Removed duplicate permissive SELECT policies
  - Replaced with single optimized policy allowing:
    - Public access to active cards
    - Authenticated users access to all cards (including inactive)
  
  ## Notes
  - All changes are backward compatible
  - Query behavior remains unchanged
  - Performance should improve for user_priorities queries
*/

-- ============================================
-- 1. Fix user_priorities RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own priorities" ON user_priorities;
DROP POLICY IF EXISTS "Users can insert own priorities" ON user_priorities;
DROP POLICY IF EXISTS "Users can update own priorities" ON user_priorities;
DROP POLICY IF EXISTS "Users can delete own priorities" ON user_priorities;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own priorities"
  ON user_priorities
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own priorities"
  ON user_priorities
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own priorities"
  ON user_priorities
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own priorities"
  ON user_priorities
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 2. Drop unused indexes on wisdom_cards
-- ============================================

DROP INDEX IF EXISTS idx_wisdom_cards_triggers;
DROP INDEX IF EXISTS idx_wisdom_cards_category;
DROP INDEX IF EXISTS idx_wisdom_cards_active_priority;

-- ============================================
-- 3. Consolidate wisdom_cards SELECT policies
-- ============================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Anyone can view active wisdom cards" ON wisdom_cards;
DROP POLICY IF EXISTS "Authenticated users can view all wisdom cards" ON wisdom_cards;

-- Create single optimized policy
CREATE POLICY "Public read access to wisdom cards"
  ON wisdom_cards
  FOR SELECT
  USING (
    active = true OR 
    auth.role() = 'authenticated'
  );
