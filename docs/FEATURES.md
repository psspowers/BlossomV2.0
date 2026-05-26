# Blossom Features Guide

**Complete breakdown of pages, features, and True North alignment**

**Last Updated**: May 26, 2026 (v3.7 — Dashboard honest-state guards, WellnessRadar refactor, Navbar fix, iOS App Store submission)

---

## Feature Philosophy

Every feature in Blossom supports the "True North" mission: **Seen, Supported, Sovereign**. This isn't feature creep - it's intentional design where each element validates the user's experience, provides compassionate support, or honors their autonomy.

---

## Onboarding Flow (New in March 2026)

### Step 1: Welcome Step
**Purpose**: Introduce True North principles and set expectations

**Key Messages**:
- "Your journey with PCOS is unique"
- "We're here to help you understand your body"
- Privacy-first messaging

**Components**:
- Animated lotus bloom introduction
- True North philosophy explanation
- Call-to-action: "Begin Your Journey"

**Files**: `src/components/onboarding/WelcomeStep.tsx`

---

### Step 2: Authentication Step
**Purpose**: Secure user account creation with privacy emphasis

**Key Messages**:
- "Secure Space" - Your data is protected
- "Your data is sovereign"
- "Sign up to save your journey across devices"

**Features**:
- Email/password authentication via Supabase
- Dual mode: Sign-up and Sign-in
- Password visibility toggle
- 6-character minimum password
- Comprehensive error handling
- PKCE auth flow for security

**Validation**:
- Email format checking
- Password strength requirements
- Already-registered detection
- Invalid credentials handling

**Files**: `src/components/onboarding/AuthStep.tsx`, `src/lib/supabase.ts`

**True North tie**: **Sovereign** - Secure authentication while maintaining privacy promises

---

### Step 3: Priority Selector (Happiness Impact System)
**Purpose**: Identify what matters most to you and how much it affects your happiness

**Philosophy**: Your priorities are unique. Blossom adapts to what YOU care about most.

**Features**:

#### Priority Selection (Choose up to 3)
**Symptom Priorities (7 options)**:
- Acne
- Facial Hair
- Hair Loss
- Bloating
- Pain & Cramps
- Cravings
- Mood Swings/Sleep Quality

**Goal Priorities (4 options)**:
- Cycle Regularity
- Fertility
- Weight & Metabolism
- Daily Energy

**Custom Priority**:
- User can add one custom priority

#### Happiness Impact Scale
For each selected priority, user rates:
- **Scale**: 0-10 slider
- **Question**: "How much does this affect your happiness?"
- **Purpose**: Personalize insights and wisdom recommendations

#### BloomLotus Visualization
- Interactive lotus that blooms as priorities are selected
- Video-based animation with 10 frames
- States: "Select priorities" → "Budding" → "Opening" → "Almost blooming" → "Full bloom"
- Reflects progress visually and emotionally

**Data Storage**: Saves to `user_priorities` table in Supabase
- Columns: priority_id, label, category, happiness_impact (0-10)
- One record per priority per user
- Unique constraint on (user_id, priority_id)

**Files**:
- `src/components/onboarding/PrioritySelector.tsx`
- `src/components/onboarding/BloomLotus.tsx`
- `src/components/onboarding/MiniLotus.tsx`

**True North tie**: **Seen** - Your priorities are recognized and weighted in all insights

---

### Step 4: Enter Dashboard
After onboarding completion, user enters the main app with:
- Saved authentication session
- Personalized priorities loaded
- Ready to start logging

---

## Core Pages

---

### 1. Sanctuary (Dashboard/Home)

**Purpose**: Your daily sanctuary - at-a-glance wellness overview with emotional resonance

**Philosophy:** This is your safe space, not a judgment zone. Every element validates your experience.

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
- **What it does**: Five-axis spider chart showing the most recent logged day's wellness balance
- **True North tie**: **Seen** - Honest visual snapshot — shows only what was actually logged
- **Five axes**:
  - Physical: cramps, acne, bloating, hirsutism
  - Metabolic: sleep, diet, energy
  - Emotional: mood, stress, anxiety
  - Cycle: menstrual regularity stability score
  - Lifestyle: exercise, hydration
- **Honest state design**:
  - Unlogged fields render as null (axis collapses) rather than a false 5/10
  - If today has no log, an invitation card appears in place of the chart
  - Dashed ring = neutral reference at 5/10 (not a goal or population average)
  - Freshness caption shows source date when viewing data from a previous day
  - Card header reads "TODAY'S BALANCE" or "LAST BALANCE" accordingly
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

---

### 3. Insights (Pattern Stories, Not Just Charts)

**Purpose**: Pattern discovery through data visualization and narrative insights

**Philosophy:** Your patterns tell stories. We translate data into human understanding, not just charts.

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

---

### 4. Learn (Evidence-Aligned Education)

**Purpose**: Evidence-based PCOS education and resources

**Philosophy:** Education grounded in Monash University research (world leaders in PCOS) and NIH guidelines.

**Content Categories:**

#### Understanding PCOS
- What is PCOS? (Rotterdam criteria)
- PCOS phenotypes (hyperandrogenic, metabolic, lean)
- Insulin resistance explained
- Hormone balance basics

#### Nutrition & Metabolism
- Low-GI diet principles (Monash evidence)
- Anti-inflammatory foods
- Meal timing and blood sugar
- Supplement evidence (inositol, vitamin D)

#### Lifestyle Interventions
- Exercise for insulin sensitivity
- Sleep hygiene for hormone balance
- Stress management techniques
- Mind-body connection

#### Medical Management
- Metformin and insulin sensitizers
- Birth control for cycle regulation
- Ovulation induction (if trying to conceive)
- When to see an endocrinologist

**Files**: `src/components/Learn.tsx`

**True North Tie:**
- **Seen**: Validates your symptoms as real and treatable
- **Supported**: Evidence-based guidance without judgment
- **Sovereign**: Empowers informed conversations with your doctor

---

### 5. Blossom Companion (In-App AI Chat)

**Purpose**: A floating, in-app chat UI that provides compassionate, body-neutral support — entirely within the app, with no external chat applications required.

**True North tie**: **Supported** — Real-time compassionate support available whenever the user needs it, without leaving the app or sharing data externally.

#### Architecture: Three Operating Modes

**Mode 1: Proactive**
- Local PWA push notifications and contextual prompts surface at meaningful moments (e.g., after a high-stress log entry)
- Powered entirely by local data — no network calls required
- Files: `src/components/ContextualPrompts.tsx`, `src/lib/services/notificationService.ts`

**Mode 2: Support (In-App Chat)**
- User messages are sent to a Supabase Edge Function (`blossom-chat`) which acts as a privacy firewall
- The React frontend sends ONLY the user's text message and a short anonymised context string (e.g., "in a Resting season and having a more challenging time")
- Health data, symptom logs, and personally identifiable information NEVER leave IndexedDB
- The Edge Function injects the Blossom Persona System Prompt and forwards the request to the AI provider
- The AI response is returned to the in-app chat UI
- Files: `src/components/BlossomCompanion.tsx`, `src/lib/services/blossomChatService.ts`

**Mode 3: Escalation (Local Crisis Overlay)**
- A local regex check scans every message for crisis keywords (e.g., "hurt myself", "want to die", "suicide")
- If a crisis keyword is detected, the in-app chat is bypassed entirely — NO external APIs are called
- A warm, full-screen local overlay (`CrisisSupport.tsx`) is rendered immediately, displaying the Thailand 1323 crisis hotline and grounding resources
- A rate-limited background call is made to the `crisis-alert` Supabase Edge Function (max once per 30 minutes) to log the event server-side
- Files: `src/components/CrisisSupport.tsx`, `src/lib/services/escalationService.ts`, `src/lib/services/companionRouter.ts`

#### Session & Rate Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| Max sessions per install | 3 | Prevents over-reliance; encourages professional support |
| Max messages per session | 20 | Per-session rate limit stored in `sessionStorage` |
| Max message length | 500 characters | Input trimmed before sending to Edge Function |
| Crisis alert cooldown | 30 minutes | Prevents duplicate crisis-alert Edge Function calls |

#### Privacy Guarantee

- The Companion is NOT Telegram. It is NOT Discord. It uses NO external chat apps.
- All health data lives in IndexedDB on the user's device.
- The Edge Function receives only: the user's text (max 500 chars) and a 4-word anonymised season/score label.
- API keys (`ANTHROPIC_API_KEY`, `OPENCLAW_ENDPOINT`) are stored exclusively in Supabase Edge Function Secrets — never in the frontend `.env` file.

#### Message Classification

All messages are classified locally before any network call via `companionRouter.ts`:

| Classification | Trigger | Action |
|----------------|---------|--------|
| `crisis` | Crisis keyword detected | Show local `CrisisSupport` overlay, skip AI call |
| `inapp` | Data-related question ("my score", "my cycle") | Show in-app data response, skip AI call |
| `support` | All other messages | Route to `blossom-chat` Edge Function |

---

### 6. Settings & Privacy Vault

**Purpose**: Customization and data sovereignty

#### Design Theme Selector
- Tesla-Apple (modern, science-forward)
- Lotus Garden (organic, emotionally resonant)
- **True North tie**: **Sovereign** - Choose the aesthetic that feels right for you

#### Journey Metrics (New in March 2026)
- **Blossom Score**: Current holistic wellness score (0-100)
- **Current Season**: Resting, Growing, or Blooming state
- Visual display of current health status

#### Privacy Vault
- **Clinical Snapshot Export**:
  - Downloads human-readable .txt report
  - Includes cycle history, symptom averages, lifestyle correlations
  - Flags concerning patterns (extended cycles, high variability)
  - **True North tie**: **Supported** - Bridges gap between patient and doctor
- **Export All Data** (JSON):
  - Complete backup of logs and settings
  - **True North tie**: **Sovereign** - Your data, portable forever
- **Delete Account** (New in March 2026):
  - Permanently deletes all local AND cloud data
  - Removes user_logs, user_settings, user_priorities from Supabase
  - Clears IndexedDB and localStorage
  - Signs out and returns to welcome screen
  - **True North tie**: **Sovereign** - Complete data control, no lock-in
- **Demo Profiles** (New in March 2026):
  - 5 clinical personas for testing
  - Each represents different PCOS phenotypes
  - Quick-load realistic symptom patterns

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

| Feature | Component | Logic | Database (Supabase) |
|---------|-----------|-------|----------|
| Authentication | `AuthStep.tsx` | Supabase Auth | `auth.users` |
| Onboarding | `App.tsx` | Session + localStorage | - |
| Priority Selection | `PrioritySelector.tsx` | Priority mapping | `user_priorities` |
| Blossom Score | `Dashboard.tsx` | `blossomScore.ts` | Aggregates `user_logs` |
| Seasons | `CycleContext.tsx` | `seasons.ts` | Uses Blossom Score |
| Pattern Stories | `Insights.tsx` | `stories.ts` | Analyzes `user_logs` (30 days) |
| Daily Wisdom | `DailyWisdom.tsx` | `narratives.ts` + `wisdom_cards` | `wisdom_cards` table |
| Lotus Bloom | `BioOrb.tsx`, `WellnessLotus.tsx` | `blossomScore.ts` | Visual mapping of score |
| Daily Log | `DailyLog.tsx` | - | Writes to `user_logs` |
| Clinical Snapshot | `SettingsModal.tsx` | Aggregation logic | Reads all `user_logs` |
| Theme Switch | `SettingsModal.tsx` | `ThemeContext.tsx` | `user_settings` |
| Cycle Ring | `CycleRing.tsx` | `cycle.ts` | Reads `user_logs.cyclePhase` |
| Wellness Radar | `WellnessRadar.tsx` | Null-safe per-field normalization | Most recent logged day (props from Dashboard) |
| Account Deletion | `SettingsModal.tsx` | Supabase + IndexedDB cleanup | Deletes from all tables |
| Blossom Companion (Chat) | `BlossomCompanion.tsx` | `blossomChatService.ts`, `companionRouter.ts` | Supabase Edge Function (`blossom-chat`) |
| Crisis Escalation | `CrisisSupport.tsx` | `escalationService.ts` | Supabase Edge Function (`crisis-alert`) |

---

## iOS / Apple App Store Distribution (v3.7)

Blossom is packaged as a native iOS app using **Capacitor 8** on top of the Vite/React PWA build.

### Build Command
```bash
npm run build:ios
# Runs: tsc && CAPACITOR_BUILD=true vite build && npx cap sync ios
```

### Key Files
- `capacitor.config.ts` — App ID, server URL, Capacitor plugin config
- `ios/App/` — Xcode project (open with Xcode to archive and submit)
- `ios/App/App/capacitor.config.json` — Runtime config synced from root
- `ios/App/App/Info.plist` — iOS permissions, bundle identifier
- `ios/App/App/Assets.xcassets/` — App icon and splash screen assets

### App Store Submission Notes
- Bundle ID: configured in `capacitor.config.ts`
- Privacy usage strings required in `Info.plist` for any device capabilities
- No tracking, no analytics, no ATT prompt required (privacy-first architecture)
- Minimum iOS target: as configured in Xcode project settings

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
❌ Telegram or Discord integration
❌ External chat apps
❌ Health data sent to any external service

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
