/*
  # Add Haptics Preference to User Dashboard Preferences

  1. Changes
    - Adds `haptics_enabled` column to `user_dashboard_preferences`
      - boolean, NOT NULL, DEFAULT true
      - Controls whether the app produces haptic feedback on interactions

  2. Notes
    - Default is TRUE so existing users get haptics on without any action needed
    - Crisis flow ignores this preference entirely (no haptics in crisis context by design)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_dashboard_preferences' AND column_name = 'haptics_enabled'
  ) THEN
    ALTER TABLE user_dashboard_preferences ADD COLUMN haptics_enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;
