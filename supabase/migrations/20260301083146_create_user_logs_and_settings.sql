/*
  # Create user logs and settings tables for cloud sync

  ## Summary
  This migration creates the core data tables to enable cross-device synchronization
  and single source of truth for user health data.

  ## New Tables

  ### `user_logs`
  Stores daily health log entries for authenticated users.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log entry identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `date` (date) - Log entry date
  - `cycle_phase` (text) - Current cycle phase
  - `flow` (text) - Menstrual flow intensity
  - `symptoms` (jsonb) - Symptom scores (acne, hirsutism, hairLoss, bloat, cramps)
  - `psych` (jsonb) - Psychological data (stress, bodyImage, mood, anxiety)
  - `lifestyle` (jsonb) - Lifestyle data (sleep, waterIntake, exercise, diet)
  - `custom_values` (jsonb) - User-defined custom symptom tracking
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_settings`
  Stores user preferences and configuration.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique settings identifier
  - `user_id` (uuid, foreign key, unique) - One settings record per user
  - `theme` (text) - UI theme preference
  - `design_theme` (text) - Visual design variant
  - `notifications` (boolean) - Notification preferences
  - `custom_symptom_definitions` (jsonb) - User-defined symptom tracking
  - `priorities` (text[]) - Array of priority IDs
  - `happiness_weights` (jsonb) - Calculated happiness impact weights
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security (RLS Policies)

  ### user_logs policies:
  - Users can only SELECT their own logs
  - Users can only INSERT logs for themselves
  - Users can only UPDATE their own logs
  - Users can only DELETE their own logs

  ### user_settings policies:
  - Users can only SELECT their own settings
  - Users can only INSERT settings for themselves
  - Users can only UPDATE their own settings
  - Users can only DELETE their own settings

  ## Indexes
  - `user_logs(user_id, date)` - Fast lookup by user and date range
  - `user_settings(user_id)` - Unique constraint enforced via unique index

  ## Important Notes
  1. All user data is isolated via RLS using auth.uid()
  2. JSONB columns allow flexible schema evolution
  3. Timestamps track data history for sync conflict resolution
  4. One settings record per user enforced by unique constraint
  5. Logs support multiple entries per day (no unique constraint on date)
*/

-- Create user_logs table
CREATE TABLE IF NOT EXISTS user_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  cycle_phase text NOT NULL DEFAULT 'unknown',
  flow text DEFAULT NULL,
  symptoms jsonb DEFAULT '{}'::jsonb,
  psych jsonb DEFAULT '{}'::jsonb,
  lifestyle jsonb DEFAULT '{}'::jsonb,
  custom_values jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (cycle_phase IN ('follicular', 'ovulatory', 'luteal', 'menstrual', 'unknown')),
  CHECK (flow IS NULL OR flow IN ('none', 'spotting', 'light', 'medium', 'heavy'))
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark',
  design_theme text NOT NULL DEFAULT 'default',
  notifications boolean NOT NULL DEFAULT true,
  custom_symptom_definitions jsonb DEFAULT '[]'::jsonb,
  priorities text[] DEFAULT ARRAY[]::text[],
  happiness_weights jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (theme IN ('dark', 'light', 'auto')),
  CHECK (design_theme IN ('default', 'lotus'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_logs_user_date ON user_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_logs_user_created ON user_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_logs
CREATE POLICY "Users can view own logs"
  ON user_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON user_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON user_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON user_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_logs_updated_at ON user_logs;
CREATE TRIGGER update_user_logs_updated_at
  BEFORE UPDATE ON user_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();