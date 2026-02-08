/*
  # User Priorities - Onboarding Multi-Priority Happiness Selector

  1. New Tables
    - `user_priorities`
      - `id` (uuid, primary key) - Unique row identifier
      - `user_id` (uuid, required) - References the authenticated user via auth.uid()
      - `priority_id` (text, required) - Identifier for the symptom/goal (e.g., 'acne', 'fertility', 'custom')
      - `label` (text, required) - Display label for the priority
      - `category` (text, required) - One of 'symptom', 'goal', or 'custom'
      - `happiness_impact` (integer, default 5) - User-rated importance on a 0-10 scale
      - `created_at` (timestamptz) - Row creation timestamp
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Constraints
    - Unique constraint on (user_id, priority_id) to prevent duplicates
    - happiness_impact checked between 0 and 10
    - category checked against allowed values

  3. Security
    - RLS enabled
    - Authenticated users can only read, insert, update, and delete their own rows
*/

CREATE TABLE IF NOT EXISTS user_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  priority_id text NOT NULL,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('symptom', 'goal', 'custom')),
  happiness_impact integer NOT NULL DEFAULT 5 CHECK (happiness_impact >= 0 AND happiness_impact <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, priority_id)
);

ALTER TABLE user_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own priorities"
  ON user_priorities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own priorities"
  ON user_priorities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own priorities"
  ON user_priorities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own priorities"
  ON user_priorities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_priorities_user_id ON user_priorities (user_id);
