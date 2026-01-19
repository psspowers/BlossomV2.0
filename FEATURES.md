# Blossom Features Guide

**Complete breakdown of pages, features, and True North alignment**

---

## Feature Philosophy

Every feature in Blossom supports the "True North" mission: **Seen, Supported, Sovereign**. This isn't feature creep - it's intentional design where each element validates the user's experience, provides compassionate support, or honors their autonomy.

---

## Core Pages

### 1. Dashboard (Main View)

**Purpose**: At-a-glance wellness overview with emotional resonance

**Components**:

#### Lotus Bloom Visualization
- **What it does**: Central animated lotus that blooms based on Blossom Score
- **True North tie**: **Seen** - Your wellness is visualized as beautiful and natural, not as a number or graph
- **Key features**:
  - Petals open/close based on score (0-100)
  - Seasonal colors (Resting: brown, Growing: green, Blooming: pink)
  - Smooth breathing animation (pulse effect)
  - No "100% goal" - just continuous blooming
- **Files**: `src/components/BioOrb.tsx`, `src/components/WellnessLotus.tsx`
- **Design philosophy**: Nature doesn't fail when a flower closes. Neither do our users.

#### Blossom Score Card
- **What it does**: Shows composite wellness score with breakdown
- **True North tie**: **Seen** - Validates all three dimensions (symptom/self-care/emotional)
- **Display**:
  - Overall score (0-100)
  - Symptom factor (40% weight)
  - Self-care factor (30% weight)
  - Emotional factor (30% weight)
  - Week-over-week trend indicator
- **Files**: `src/components/Dashboard.tsx`, `src/lib/logic/blossomScore.ts`
- **Design philosophy**: Holistic health, not perfection. Symptoms improving by 10% = perfect score, even if baseline is high.

#### Current Season Card
- **What it does**: Displays current wellness season with compassionate message
- **True North tie**: **Supported** - Validates your current state without pressure
- **Three states**:
  - **Resting** (🍂): "Winter is necessary for Spring. Rest is productive."
  - **Growing** (🌿): "Your roots are deepening. Consistency is magic."
  - **Blooming** (🌸): "You are radiant. Enjoy this season."
- **Files**: `src/components/CycleContext.tsx`, `src/lib/logic/seasons.ts`
- **Design philosophy**: Cyclical wellness, not linear progress. Low-energy periods are reframed as productive rest.

#### Daily Wisdom Card
- **What it does**: One personalized insight or affirmation per day
- **True North tie**: **Supported** - Either validates patterns or provides gentle encouragement
- **Content types**:
  - Personalized whisper: "Your body loves rest. Mood lifts when you sleep 7h+."
  - Monash affirmation: "You are not broken. You are navigating a complex path with grace."
  - Evidence-based tip: "Research shows regular movement improves insulin sensitivity by 25%."
- **Files**: `src/components/DailyWisdom.tsx`, `src/lib/logic/narratives.ts`
- **Design philosophy**: "Whisper" framing - the app helps you hear what your body is already saying.

#### Cycle Context Card
- **What it does**: Current menstrual phase with phase-specific insights
- **True North tie**: **Seen** - Acknowledges cycle impact on PCOS symptoms
- **Display**:
  - Current phase (follicular/ovulatory/luteal/menstrual)
  - Days in current phase
  - Phase-appropriate tips
- **Files**: `src/components/CycleContext.tsx`

#### Wellness Radar Chart
- **What it does**: Spider chart of symptom categories (last 7 days)
- **True North tie**: **Seen** - Visual snapshot of symptom patterns
- **Categories**: Acne, hirsutism, hair loss, bloating, cramps
- **Files**: `src/components/WellnessRadar.tsx`

#### Floating Action Button (FAB)
- **What it does**: Opens daily log modal
- **True North tie**: **Sovereign** - Quick access without interruption
- **Design**: Always visible, unobtrusive bottom-right placement
- **Files**: `src/components/Dashboard.tsx`

---

### 2. Daily Log (Modal)

**Purpose**: Quick, non-judgmental symptom and lifestyle logging

**Entry Flow**:

#### Date Selector
- Defaults to today
- Can backfill past days
- No guilt for missed days (no "x days since last log" counter)

#### Cycle Tracking
- **Phase selection**: Follicular, Ovulatory, Luteal, Menstrual, Unknown
- **Flow intensity** (if menstrual): None, Spotting, Light, Medium, Heavy
- **True North tie**: **Seen** - Differentiating spotting vs period is critical for hyperandrogenism tracking

#### Physical Symptoms (Sliders, 0-10)
- Acne severity
- Hirsutism (unwanted hair growth)
- Hair loss
- Bloating
- Cramps

**Design philosophy**: 0-10 scale allows nuance. "Bad day" isn't binary.

#### Psychological State
- **Mood** (slider, 0-10)
- **Stress** (low/medium/high)
- **Anxiety** (none/low/high)
- **Body image** (positive/neutral/negative)

**True North tie**: **Seen** - Validates the mental health burden of PCOS, weighted equally to physical symptoms in Blossom Score.

#### Lifestyle Factors
- **Sleep**: <6h, 6-7h, 7-8h, >8h
- **Exercise**: Rest, Light, Moderate, Intense
- **Diet**: Cravings, Balanced, Restrictive
- **Water intake**: Glasses (0-12)

**Design philosophy**: No "good/bad" labels. Just data collection for pattern discovery.

#### Custom Metrics (Optional)
- User can add custom symptoms beyond core set
- Stored in `customValues` field
- **True North tie**: **Sovereign** - Your body, your metrics

**Files**: `src/components/DailyLog.tsx`, `src/lib/db.ts`

---

### 3. Insights & Trends

**Purpose**: Pattern discovery through data visualization and narrative insights

#### Pattern Stories
- **What it does**: Analyzes 30 days of logs for correlations
- **True North tie**: **Seen** - Your patterns are validated through personalized stories, not generic advice
- **Story categories**:
  - Sleep-Anxiety: "On nights you sleep 7h+, your anxiety is noticeably lower."
  - Movement-Energy: "Movement fuels you. You reported 18% more energy on active days."
  - Diet-Mood: "Balanced nutrition stabilizes your mood. You feel 15% better on those days."
  - Stress-Symptoms: "Lower stress days correlate with fewer physical symptoms."
- **Confidence levels**:
  - High: >15% difference, n≥3 in each group
  - Medium: Weak signal
  - Low: Insufficient data, fallback to education
- **Files**: `src/components/Insights.tsx`, `src/lib/logic/stories.ts`
- **Design philosophy**: Narrative, not charts. "Your anxiety is lower" beats a scatter plot.

#### Trend Velocity
- **What it does**: Shows rate of change for each metric
- **Display**: ↑↑ (rapid improvement), ↑ (improving), → (stable), ↓ (declining)
- **Files**: `src/components/TrendVelocity.tsx`, `src/lib/logic/velocity.ts`

#### Cycle Ring Visualization
- **What it does**: Circular calendar view of cycle phases
- **True North tie**: **Seen** - Visualizes irregular cycles that are core to PCOS diagnosis
- **Files**: `src/components/CycleRing.tsx`

#### Symptom History Charts
- Line charts for each symptom over time (7/14/30/90 days)
- **True North tie**: **Seen** - Long-term trends, not day-to-day fluctuations

---

### 4. Settings Modal

**Purpose**: Customization and data sovereignty

#### Design Theme Selector
- Tesla-Apple (modern, science-forward)
- Lotus Garden (organic, emotionally resonant)
- **True North tie**: **Sovereign** - Choose the aesthetic that feels right for you

#### Privacy Vault
- **Clinical Snapshot Export**:
  - Downloads human-readable .txt report
  - Includes cycle history, symptom averages, lifestyle correlations
  - Flags concerning patterns (extended cycles, high variability)
  - **True North tie**: **Supported** - Bridges gap between patient and doctor
- **Export All Data** (JSON):
  - Complete backup of logs and settings
  - **True North tie**: **Sovereign** - Your data, portable forever
- **Delete All Data**:
  - One-click nuclear option
  - **True North tie**: **Sovereign** - No lock-in, no questions asked
- **Reset Demo Data**:
  - For testing/onboarding

**Files**: `src/components/SettingsModal.tsx`

---

## Feature Alignment with True North

### Seen (Validation & Recognition)

**Features that validate your experience:**
- Blossom Score's 3-factor model (symptoms + self-care + emotional)
- Pattern Stories: "Your anxiety is lower when you sleep 7h+"
- Resting Season: "Rest is productive"
- Cycle tracking with spotting differentiation
- Body image tracking in daily logs
- Weekly symptom trends (not just daily snapshots)

**Why it matters**: PCOS is often invisible. These features say "I see your patterns, your struggles, your wins."

### Supported (Compassionate Guidance)

**Features that provide gentle support:**
- Daily Wisdom affirmations: "You are not broken"
- Seasons messaging: "Your roots are deepening"
- Clinical Snapshot export (doctor conversations)
- Evidence-based Monash tips
- Phase-appropriate cycle insights
- No gamification or shame mechanics

**Why it matters**: PCOS management is hard. Support should feel like a hug, not a command.

### Sovereign (Autonomy & Control)

**Features that honor your agency:**
- 100% local storage (no cloud)
- Export data anytime (JSON)
- Delete data anytime (one click)
- Custom metrics (your body, your symptoms)
- Theme selection (aesthetic autonomy)
- No account required (anonymous)
- No ads, no tracking, no telemetry

**Why it matters**: PCOS patients often feel powerless in their healthcare. Data sovereignty is a fundamental right.

---

## Technical Feature Map

| Feature | Component | Logic | Database |
|---------|-----------|-------|----------|
| Blossom Score | `Dashboard.tsx` | `blossomScore.ts` | Aggregates `logs` table |
| Seasons | `CycleContext.tsx` | `seasons.ts` | Uses Blossom Score |
| Pattern Stories | `Insights.tsx` | `stories.ts` | Analyzes `logs` (30 days) |
| Daily Wisdom | `DailyWisdom.tsx` | `narratives.ts` | Analyzes `logs` (14 days) |
| Lotus Bloom | `BioOrb.tsx`, `WellnessLotus.tsx` | `blossomScore.ts` | Visual mapping of score |
| Daily Log | `DailyLog.tsx` | - | Writes to `logs` table |
| Clinical Snapshot | `SettingsModal.tsx` | Aggregation logic | Reads all `logs` |
| Theme Switch | `SettingsModal.tsx` | `ThemeContext.tsx` | `settings` table |
| Cycle Ring | `CycleRing.tsx` | `cycle.ts` | Reads `logs.cyclePhase` |
| Wellness Radar | `WellnessRadar.tsx` | Aggregation | Last 7 days avg |

---

## Feature Roadmap

### Phase 1: Logic Audit (Completed)
- ✅ Blossom Score algorithm
- ✅ Seasons engine
- ✅ Pattern Stories generator
- ✅ Daily Wisdom
- ✅ Clinical Snapshot export
- ✅ Lotus visualization integration

### Phase 2: User Research (In Progress)
- Persona validation with PCOS community
- Usability testing of Seasons messaging
- Clinical Snapshot doctor feedback
- Pattern Stories confidence tuning

### Phase 3: Enhancements (Next)
- **Cycle Variability Index**: Flag irregular cycles
- **Predictive Insights**: "Your anxiety spikes 3 days before your period"
- **Custom Metrics UI**: Add user-defined symptoms
- **Export Formats**: PDF Clinical Snapshot, CSV for research

### Future Considerations
- Multi-language support
- Accessibility audit (WCAG 2.1 AAA)
- Community Pattern Stories (anonymous, consented)

---

## Design Principles Summary

### What Blossom Has
✅ Cyclical wellness (Seasons)
✅ Holistic scoring (3 factors)
✅ Personalized narratives
✅ Body-positive language
✅ Complete privacy
✅ Data portability
✅ Evidence-based tips
✅ Compassionate affirmations

### What Blossom Does NOT Have
❌ Streak counters
❌ Gamification
❌ Progress bars
❌ Missed-day guilt
❌ Binary success/failure
❌ Comparison to others
❌ Cloud storage
❌ Account requirements

---

## Contributing New Features

When adding features, ask:

1. **Does it validate the user's experience?** (Seen)
2. **Does it provide compassionate support?** (Supported)
3. **Does it honor user autonomy?** (Sovereign)

If it doesn't serve at least one True North principle, question whether it belongs in Blossom.

---

**For technical implementation details, see:**
- [Technical Manual](./TECHNICAL_MANUAL.md) - Soul Injection algorithms
- [Theme System Guide](./THEME_SYSTEM_GUIDE.md) - Body-positive UX principles
- [Privacy Guide](./PRIVACY.md) - Sacred Rules and data sovereignty
