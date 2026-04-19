/*
  # User Dashboard Preferences

  1. New Tables
    - `user_dashboard_preferences`
      - `user_id` (uuid, primary key, references auth.users)
      - `dock_collapsed` (boolean) - whether the bottom action dock is collapsed
      - `density` (text) - visual density preference ('comfortable' or 'compact')
      - `disclaimer_acknowledged` (boolean) - whether the medical disclaimer has been acknowledged
      - `last_action` (text) - the most recently used dock action ('log' or 'ask')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_dashboard_preferences`
    - Policies: each authenticated user can only read/insert/update their own preferences row
    - No DELETE policy - we keep preferences for user history integrity

  3. Notes
    - Used by the new global ActionDock and TodayHero to persist dock state and
      disclaimer acknowledgement across devices.
    - Defaults keep the dock expanded and disclaimer unacknowledged for new users.
*/

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dock_collapsed boolean NOT NULL DEFAULT false,
  density text NOT NULL DEFAULT 'comfortable',
  disclaimer_acknowledged boolean NOT NULL DEFAULT false,
  last_action text NOT NULL DEFAULT 'log',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own dashboard preferences"
  ON user_dashboard_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own dashboard preferences"
  ON user_dashboard_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own dashboard preferences"
  ON user_dashboard_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
