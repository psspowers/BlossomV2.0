# Wisdom Engine - Clinical Education System

## Overview

The **Wisdom Engine** is an evidence-based educational system designed to close the "Education & Trust Gap" in the Blossom PCOS tracking application. It delivers personalized, clinically-validated insights based on the user's tracked health patterns.

## Architecture

### 1. Database Layer (Supabase)

**Table:** `wisdom_cards`

```sql
CREATE TABLE wisdom_cards (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  text text NOT NULL,
  source text NOT NULL,
  category text NOT NULL CHECK (category IN ('Physical', 'Metabolic', 'Emotional', 'Cycle')),
  triggers text[] NOT NULL,
  active boolean DEFAULT true,
  priority integer DEFAULT 50,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Security:** Row Level Security (RLS) enabled with public read access for active cards.

### 2. Client Integration

**Location:** `src/lib/hooks/useWisdomEngine.ts`

The hook provides:
- Real-time wisdom card fetching from Supabase
- Intelligent context analysis based on user logs
- Smart card selection using priority and trigger matching
- Refresh functionality for new insights

**Location:** `src/lib/supabase.ts`

Provides the Supabase client and TypeScript interfaces.

### 3. UI Component

**Location:** `src/components/DailyWisdom.tsx`

Displays:
- Personalized wisdom cards with evidence-based content
- Clinical source citations
- Category badges (Physical, Metabolic, Emotional, Cycle)
- Refresh button for alternative insights
- Loading and error states

## How It Works

### Context Analysis Algorithm

The Wisdom Engine analyzes the user's last 7 days of logs to identify:

1. **Active Triggers**
   - `low_sleep`: 2+ days with <6h sleep in last 3 days
   - `high_stress`: 2+ days with high stress/anxiety
   - `high_pain`: Any day with cramp severity ≥7
   - `sugar_cravings`: 2+ days with diet cravings
   - `luteal_phase`: Currently in luteal phase
   - `emotional`: Low mood (≤4) or negative body image
   - `morning`: Currently morning hours (5am-10am)

2. **Dominant Issues**
   - Scores each issue category based on frequency and severity
   - Identifies top 3 problem areas
   - Uses for card prioritization

### Card Selection Algorithm

1. **Fetch all active cards** from Supabase
2. **Score each card:**
   - Base score = card's priority (0-100)
   - +20 points per matching trigger
   - +15 points if card addresses dominant issue
3. **Select from top scorers** (randomized for variety)

### Personalization Indicators

- Sparkles icon appears when 2+ triggers are active
- Footer shows "Personalized to your patterns"
- Cards adapt in real-time as user logs new data

## Starter Content (6 Cards)

### 1. Sleep Powers Your Metabolism
**Category:** Metabolic
**Triggers:** `low_sleep`, `metabolic`
**Source:** National Sleep Foundation
**Priority:** 90

> "Sleep deprivation (<6h) reduces insulin sensitivity by up to 30%. Prioritize rest to stabilize metabolism."

### 2. Calm the Stress-Hormone Loop
**Category:** Emotional
**Triggers:** `high_stress`, `emotional`
**Source:** NIH
**Priority:** 85

> "Cortisol spikes can trigger androgen production. A 5-minute breathing exercise can lower this biological response."

### 3. Luteal Energy Shifts Are Normal
**Category:** Cycle
**Triggers:** `luteal_phase`, `low_energy`
**Source:** ACOG
**Priority:** 80

> "Energy dips are natural in the Luteal phase. Your BMR increases, and you may need more rest."

### 4. Evidence-Based Pain Relief
**Category:** Physical
**Triggers:** `high_pain`, `physical`
**Source:** Mayo Clinic
**Priority:** 85

> "Magnesium and heat therapy are evidence-backed ways to reduce pelvic inflammation."

### 5. You Are Resilient
**Category:** Emotional
**Triggers:** `general`, `emotional`
**Source:** Blossom Affirmations
**Priority:** 70

> "PCOS is a complex endocrine condition, not a personal failure. You are managing it with resilience."

### 6. Breakfast Protein Stabilizes Blood Sugar
**Category:** Metabolic
**Triggers:** `sugar_cravings`, `metabolic`, `morning`
**Source:** Glucose Revolution
**Priority:** 75

> "Protein at breakfast helps stabilize blood sugar curves for the rest of the day."

## Adding New Wisdom Cards

### Via Supabase Dashboard

1. Navigate to the `wisdom_cards` table
2. Click "Insert row"
3. Fill in all required fields:
   - `title`: Clear, action-oriented headline
   - `text`: Evidence-based educational content
   - `source`: Clinical citation
   - `category`: Physical | Metabolic | Emotional | Cycle
   - `triggers`: Array of trigger keywords
   - `priority`: 0-100 (higher = more important)
   - `active`: true

### Via SQL

```sql
INSERT INTO wisdom_cards (title, text, source, category, triggers, priority)
VALUES (
  'Your Title Here',
  'Your evidence-based content here.',
  'Clinical Source Name',
  'Metabolic',
  ARRAY['trigger1', 'trigger2'],
  80
);
```

## Available Triggers

### Lifestyle Triggers
- `low_sleep` - Sleep deprivation patterns
- `high_stress` - Elevated stress levels
- `sugar_cravings` - Dietary cravings
- `low_energy` - Fatigue patterns
- `morning` - Morning hours (5am-10am)

### Physical Triggers
- `high_pain` - Severe pain episodes
- `physical` - General physical symptoms

### Metabolic Triggers
- `metabolic` - Metabolic health concerns

### Emotional Triggers
- `emotional` - Mental health patterns
- `high_stress` - Stress and anxiety

### Cycle Triggers
- `follicular` - Follicular phase
- `ovulatory` - Ovulatory phase
- `luteal` - Luteal phase
- `luteal_phase` - Luteal phase (specific)
- `menstrual` - Menstrual phase

### General Triggers
- `general` - Always applicable baseline content

## Content Guidelines

### Evidence-Based Standards

1. **Clinical Sources Only**
   - Academic research
   - Clinical guidelines (ACOG, Monash, NIH)
   - Medical institutions (Mayo Clinic, etc.)
   - Peer-reviewed studies

2. **Tone & Language**
   - Empowering, not prescriptive
   - Plain language, no jargon
   - Action-oriented
   - Non-judgmental

3. **Content Structure**
   - **Title:** 3-7 words, benefit-focused
   - **Text:** 1-2 sentences, clear insight + actionable takeaway
   - **Source:** Specific citation

### Quality Checklist

- [ ] Clinically accurate
- [ ] Evidence-based source cited
- [ ] Relevant to PCOS management
- [ ] Actionable or insightful
- [ ] Empowering language
- [ ] Appropriate trigger mapping
- [ ] No medical advice (educational only)

## Future Enhancements

### Planned Features

1. **Admin Dashboard**
   - Content management interface
   - Analytics on card engagement
   - A/B testing for messaging

2. **Advanced Personalization**
   - Machine learning for pattern detection
   - Predictive card suggestions
   - User feedback integration

3. **Multi-Language Support**
   - Translation pipeline
   - Culturally-adapted content

4. **Bookmark & History**
   - Save favorite insights
   - Review past cards
   - Share functionality

5. **Interactive Elements**
   - Embedded breathing exercises
   - Quick action buttons
   - Progress tracking integration

## Technical Notes

### Performance

- Cards cached in React state after initial fetch
- Supabase query optimized with indexes
- Refresh triggers re-analysis without re-fetching

### Error Handling

- Graceful degradation if Supabase unavailable
- User-friendly error messages
- Fallback to general content if no matches

### Privacy

- No user data sent to Supabase
- Analysis happens client-side
- Cards are public, non-identifying content

## Maintenance

### Regular Tasks

1. **Monthly:** Review card performance metrics
2. **Quarterly:** Update sources with latest research
3. **Annually:** Comprehensive content audit

### Monitoring

- Watch for Supabase query errors
- Track card distribution patterns
- Monitor user engagement (future)

## Support

For technical issues or content suggestions, see the main project documentation.

---

**Version:** 1.0.0
**Last Updated:** 2026-01-19
**Status:** Production Ready
