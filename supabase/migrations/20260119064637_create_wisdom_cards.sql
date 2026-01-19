/*
  # Wisdom Engine - Education & Trust Gap Solution

  ## Overview
  Creates the `wisdom_cards` table to serve as the evidence-based knowledge repository
  for the Blossom PCOS tracking application. This addresses the identified "Education & Trust Gap"
  by providing clinically-validated, contextually-relevant educational content.

  ## 1. New Tables
    - `wisdom_cards`
      - `id` (uuid, primary key) - Unique identifier for each card
      - `title` (text, required) - Brief, attention-grabbing headline
      - `text` (text, required) - Full educational content (evidence-based)
      - `source` (text, required) - Clinical citation (e.g., "National Sleep Foundation", "Mayo Clinic")
      - `category` (text, required) - Classification: Physical, Metabolic, Emotional, or Cycle
      - `triggers` (text[], required) - Context-based activation conditions (e.g., 'low_sleep', 'high_stress')
      - `active` (boolean, default true) - Enable/disable cards without deletion
      - `priority` (integer, default 50) - Display ranking (higher = more important)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last modification timestamp

  ## 2. Security
    - Enable RLS on `wisdom_cards` table
    - Public read access (educational content is non-sensitive)
    - Admin-only write access (future enhancement)

  ## 3. Initial Data
    Seeds 6 high-quality starter cards covering:
    - Sleep & metabolism
    - Stress & hormones
    - Cycle awareness
    - Pain management
    - Emotional support
    - Nutrition fundamentals
*/

-- Create wisdom_cards table
CREATE TABLE IF NOT EXISTS wisdom_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  text text NOT NULL,
  source text NOT NULL,
  category text NOT NULL CHECK (category IN ('Physical', 'Metabolic', 'Emotional', 'Cycle')),
  triggers text[] NOT NULL DEFAULT '{}',
  active boolean DEFAULT true,
  priority integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE wisdom_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active wisdom cards
CREATE POLICY "Anyone can view active wisdom cards"
  ON wisdom_cards
  FOR SELECT
  USING (active = true);

-- Policy: Allow authenticated users to view all cards (including inactive)
CREATE POLICY "Authenticated users can view all wisdom cards"
  ON wisdom_cards
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for efficient trigger-based queries
CREATE INDEX IF NOT EXISTS idx_wisdom_cards_triggers ON wisdom_cards USING GIN (triggers);
CREATE INDEX IF NOT EXISTS idx_wisdom_cards_category ON wisdom_cards (category);
CREATE INDEX IF NOT EXISTS idx_wisdom_cards_active_priority ON wisdom_cards (active, priority DESC);

-- Seed 6 high-quality evidence-based starter cards
INSERT INTO wisdom_cards (title, text, source, category, triggers, priority) VALUES
  (
    'Sleep Powers Your Metabolism',
    'Sleep deprivation (<6h) reduces insulin sensitivity by up to 30%. Prioritize rest to stabilize metabolism.',
    'National Sleep Foundation',
    'Metabolic',
    ARRAY['low_sleep', 'metabolic'],
    90
  ),
  (
    'Calm the Stress-Hormone Loop',
    'Cortisol spikes can trigger androgen production. A 5-minute breathing exercise can lower this biological response.',
    'NIH',
    'Emotional',
    ARRAY['high_stress', 'emotional'],
    85
  ),
  (
    'Luteal Energy Shifts Are Normal',
    'Energy dips are natural in the Luteal phase. Your BMR increases, and you may need more rest.',
    'ACOG',
    'Cycle',
    ARRAY['luteal_phase', 'low_energy'],
    80
  ),
  (
    'Evidence-Based Pain Relief',
    'Magnesium and heat therapy are evidence-backed ways to reduce pelvic inflammation.',
    'Mayo Clinic',
    'Physical',
    ARRAY['high_pain', 'physical'],
    85
  ),
  (
    'You Are Resilient',
    'PCOS is a complex endocrine condition, not a personal failure. You are managing it with resilience.',
    'Blossom Affirmations',
    'Emotional',
    ARRAY['general', 'emotional'],
    70
  ),
  (
    'Breakfast Protein Stabilizes Blood Sugar',
    'Protein at breakfast helps stabilize blood sugar curves for the rest of the day.',
    'Glucose Revolution',
    'Metabolic',
    ARRAY['sugar_cravings', 'metabolic', 'morning'],
    75
  )
ON CONFLICT (id) DO NOTHING;
