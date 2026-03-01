# Blossom - PCOS Companion

**A privacy-first, body-positive sanctuary for PCOS management.**

**Version**: 3.0 (Cloud Sync & Priority System)
**Last Updated**: March 2026

A compassionate PCOS companion that transforms symptom tracking into a journey of self-discovery and empowerment. Built on evidence-based research and body-positive principles, Blossom helps you understand your patterns without judgment or guilt.

**New in v3.0**: Multi-device cloud sync, personalized priority system, and user authentication while maintaining privacy-first principles through Row Level Security.

---

## Mission

Living with PCOS often means navigating an invisible weight of symptoms, uncertainty, and a healthcare system that doesn't always understand. Blossom is different. It meets you where you are, validates your experience, and helps you discover what works for your unique body through gentle daily logging and personalized pattern discovery.

This is not another fitness app demanding streaks or perfect days. This is a companion that embodies our core philosophies:

---

## Core Philosophies: True North

### 1. "The Unseen Weight" - Mental Health Focus

PCOS comes with invisible burdens that traditional health apps ignore entirely: anxiety spirals, body image struggles, feeling broken or defective. Worse, some apps add shame through missed-streak notifications.

**How Blossom Addresses This:**
- Body-positive affirmations grounded in self-compassion research
- Resting seasons that validate low-energy periods as productive
- No gamification, no streaks, no punishment mechanics
- Emotional well-being weighted equally to physical symptoms (30% of Blossom Score)
- Mental health tracking: mood, anxiety, stress, body image

**The Philosophy:** Your mental health is not secondary to your physical symptoms - it's an equal partner in your wellness journey.

---

### 2. "Guilt to Grace" - Seasons, Not Streaks

Many PCOS journeys are marked by guilt: guilt for symptoms you can't control, guilt for "imperfect" choices, guilt for not doing enough. Traditional apps punish you for missed days and broken streaks.

**How Blossom Transforms This:**
- **Seasons System** replaces linear progress with cyclical wellness:
  - **Resting (🍂)**: "Winter is necessary for Spring. Rest is productive."
  - **Growing (🌱)**: "Your roots are deepening. Consistency is magic."
  - **Blooming (🌸)**: "You are radiant. Your efforts are bearing fruit."
- Pattern Stories show what **actually works for your body** (not generic advice)
- Clinical Snapshots turn chaos into clarity for doctor conversations
- No streak counters, no missed-day guilt, no binary success/failure

**The Philosophy:** Healing is not linear. Rest is part of progress, not failure.

---

### 3. "Proof and Heart" - Evidence-Based Logic

Compassionate doesn't mean unscientific. Blossom integrates rigorous research with warmth.

**How Blossom Delivers Both:**
- **Monash University Research** (PCOS gold standard) integrated into Daily Wisdom
- **Pattern Detection Algorithms** that find sleep-mood and stress-symptom correlations
- **Compassionate Language** that avoids medical judgment
- **Statistical Rigor**: 15%+ difference thresholds, n≥3 samples per group
- **Blossom Score Formula**: Symptom factor (40%) + Self-care (30%) + Emotional (30%)

**The Philosophy:** Science + Kindness. Evidence-based doesn't mean cold.

## Core Features

### 0. Onboarding & Priority System (New in v3.0)
**Your Journey Starts Here**

#### Multi-Step Onboarding:
1. **Welcome**: Introduction to True North principles
2. **Authentication**: Secure account creation with email/password
3. **Priority Selection**: Choose up to 3 priorities that matter most to you
4. **Dashboard**: Enter your personalized sanctuary

#### Priority & Happiness System:
Select from 12 pre-defined priorities across symptoms and goals, or add your own custom priority:
- **Symptoms**: Acne, Facial Hair, Hair Loss, Bloating, Pain & Cramps, Cravings, Mood Swings/Sleep
- **Goals**: Cycle Regularity, Fertility, Weight & Metabolism, Daily Energy

Rate each priority's impact on your happiness (0-10 scale). Blossom adapts insights and wisdom based on YOUR priorities.

**BloomLotus Visualization**: Watch an interactive lotus bloom as you select priorities, reflecting your progress.

**Privacy**: All data stored securely in Supabase with Row Level Security. Only you can access your information.

---

### 1. Blossom Score: Your Holistic Health Snapshot
Unlike binary metrics or shame-inducing point systems, the Blossom Score (0-100) reflects three dimensions of wellness:
- **Symptom Factor (40%)**: Week-over-week symptom trends, not isolated bad days
- **Self-Care Factor (30%)**: Nourishing choices like sleep, movement, and hydration
- **Emotional Factor (30%)**: Your mood and mental well-being

This isn't about being perfect. It's about understanding your patterns and celebrating small victories.

### 2. Seasons: Where You Are Right Now
Your journey through PCOS has natural rhythms. The Seasons system honors this reality:

- **Resting (🍂)**: Lower energy, higher symptoms. *"Winter is necessary for Spring. Rest is productive."*
- **Growing (🌿)**: Building consistency and strength. *"Your roots are deepening. Consistency is magic."*
- **Blooming (🌸)**: Feeling balanced and thriving. *"You are radiant. Enjoy this season."*

Seasons adapt based on your Blossom Score and recent logging. No guilt for Resting seasons - they're part of healing.

### 3. Pattern Stories: Your Body's Whispers
The app analyzes your last 30 days of logs to discover personalized insights:
- "On nights you sleep 7h+, your anxiety is noticeably lower. Rest is your medicine."
- "Movement fuels you. You reported 18% more energy on active days."
- "Lower stress days correlate with fewer physical symptoms. Your mind-body connection is strong."

These aren't generic tips from the internet. They're patterns unique to **your body**, written in plain English.

### 4. Daily Wisdom: Affirmations & Insights
Each day, you receive either:
- **Evidence-based research** from Monash University (PCOS gold standard)
- **Personalized whispers** when patterns emerge (e.g., sleep-mood links)
- **Body-positive affirmations**: "You are not broken. You are navigating a complex path with grace."

### 5. Daily Logging: Quick, Non-Judgmental Input
Track what matters in under 2 minutes:
- Physical symptoms (acne, bloating, cramps, hair changes)
- Emotional state (mood, anxiety, stress, body image)
- Lifestyle factors (sleep hours, exercise, diet quality, hydration)
- Cycle tracking (phase, flow intensity)

No guilt for skipped days. No streaks to maintain. Just gentle invitations to check in with yourself.

### 6. Lotus Visualization: Nature-Inspired Beauty
Your wellness is visualized as a realistic lotus bloom:
- Petals bloom and glow based on your Blossom Score
- Seasonal colors adapt to your current state
- Smooth, organic animations reflect body-positive design
- No harsh gamification or progress bars

### 7. Clinical Snapshot Export
Bridge the gap between patient and doctor with the Clinical Snapshot feature:
- Downloads a human-readable .txt report (not JSON!)
- Includes cycle history, symptom averages, lifestyle correlations
- Flags concerning patterns (e.g., extended cycles, high variability)
- Designed for doctors to scan in under 60 seconds

### 8. Educational Foundation
Grounded in evidence from Monash University (world leaders in PCOS research):
- Low-GI nutrition guidance
- Insulin resistance and metabolic health
- Anti-inflammatory lifestyle strategies
- Mind-body connection for hormone balance

### 9. Complete Privacy & Data Control (Updated in v3.0)
- **Row Level Security (RLS)**: Your data is isolated from all other users at the database level
- **Secure Authentication**: Email/password with PKCE flow and optional password leak detection
- **Multi-Device Sync**: Access your data from any device while maintaining complete privacy
- **Export anytime**: JSON backup of all your data
- **Delete Account**: One-click deletion of ALL local and cloud data permanently
- **No ads, no analytics**: No tracking, no third-party SDKs, no telemetry
- **Open Source Transparency**: All code visible, auditable security

## How to Use

### Daily Practice (2 Minutes)
1. Open the app and observe your lotus bloom
2. Click the floating + button to add a daily log
3. Quickly rate symptoms on gentle sliders (0-10)
4. Log lifestyle choices (sleep, movement, food, hydration)
5. Mark your cycle phase if tracking
6. Read your Daily Wisdom for the day
7. Close and return tomorrow (no pressure for perfect consistency)

### Discovering Your Patterns
1. After 5-7 days of logging, Pattern Stories begin to appear
2. View your Blossom Score breakdown (symptom/self-care/emotional)
3. Notice which Season you're in (Resting/Growing/Blooming)
4. Review lifestyle correlations in the Insights section
5. Use the Clinical Snapshot export before doctor appointments

### When You Need Support
- Read body-positive affirmations in Daily Wisdom
- Review your Pattern Stories to validate what your body is telling you
- Remember: Resting seasons are not failures - they're necessary
- Export your data if you need a break (it's always yours)

### Sharing with Healthcare Providers
1. Go to Settings > Privacy Vault
2. Click "Clinical Snapshot"
3. Download the human-readable .txt report
4. Bring to appointments for evidence-based conversations

## Privacy & Security: The Sacred Rules

Your health data is yours alone. Period. Blossom is built on three non-negotiable privacy principles:

1. **Local-Only Storage**: All data lives in your browser's IndexedDB. Nothing is ever transmitted to servers, clouds, or third parties.
2. **No Account, No Tracking**: No sign-up, no email, no analytics, no cookies, no fingerprinting. You are completely anonymous.
3. **Complete Data Sovereignty**: Export or delete all your data with one click. No lock-in, no questions asked.

This isn't just a feature - it's a fundamental right. PCOS data is deeply personal. We never compromise on privacy.

## True North Alignment: A New Class of Benefit

Blossom delivers **"Empathetic Proof"** - a hybrid approach that honors both heart and science. This isn't just symptom tracking or wellness woo. It's a new paradigm:

### The Unseen Weight
PCOS comes with invisible burdens: anxiety spirals, body image struggles, feeling broken or defective. Traditional health apps ignore this emotional dimension entirely, or worse, add shame through missed-streak notifications.

Blossom acknowledges **"The Unseen Weight"** through:
- Body-positive affirmations grounded in self-compassion research
- Resting seasons that validate low-energy periods
- No gamification, no streaks, no punishment mechanics

### From Guilt to Grace
Many PCOS journeys are marked by guilt: guilt for symptoms you can't control, guilt for "imperfect" choices, guilt for not doing enough. Blossom transforms this through:
- Pattern Stories that show what **actually works for your body** (not generic advice)
- Seasons that honor natural rhythms (not linear progress)
- Clinical Snapshots that turn chaos into clarity for doctor conversations

### The Different Path: Science + Kindness
Evidence-based doesn't mean cold. Blossom integrates:
- **Monash University research** (PCOS gold standard) into Daily Wisdom
- **Pattern detection algorithms** that find sleep-mood and stress-symptom links
- **Compassionate language** that avoids medical judgment

This is the "Different Path" - rigorous science delivered with warmth.

### Seen, Supported, Sovereign
The app's core promise (True North):
1. **Seen**: Your patterns are validated through personalized stories, not generic tips
2. **Supported**: Daily Wisdom and Seasons meet you where you are
3. **Sovereign**: Complete privacy and data control - your journey belongs to you alone

## Medical Disclaimer

Blossom is a companion tool for tracking and understanding your PCOS journey. It is not medical advice and does not replace professional healthcare. Always consult with your healthcare provider for diagnosis, treatment, and medical guidance.

## Technical Stack

- **Frontend**: React 18 + TypeScript (full type safety)
- **Build Tool**: Vite (fast HMR, optimized production builds)
- **UI Components**: Radix UI (accessible primitives) + Tailwind CSS (utility-first)
- **Animations**: Framer Motion (smooth lotus bloom, seasonal transitions)
- **Database**: Dexie.js wrapper for IndexedDB (5-10MB client-side storage)
- **Charts**: Recharts (responsive data visualizations)
- **State Management**: React Query for async state, Context for themes
- **PWA**: Installable as mobile app (offline-first architecture)
- **No Backend**: 100% client-side (no servers, no APIs, no tracking)

## Roadmap: What's Next

### Phase 1: Logic Audit (Completed)
- Blossom Score algorithm (symptom/self-care/emotional weighting)
- Seasons engine (Resting/Growing/Blooming states)
- Pattern Stories generator (sleep-mood, movement-energy correlations)
- Daily Wisdom affirmations
- Clinical Snapshot export

### Phase 2: User Research (In Progress)
- Persona validation with PCOS community
- Usability testing of Seasons messaging
- Clinical Snapshot doctor feedback
- Pattern Stories confidence tuning

### Phase 3: Enhancements (Next)
- **Cycle Variability Index**: Flag irregular cycles for clinical conversations
- **Spotting vs Period Clarity**: Differentiate flow types for hyperandrogenism tracking
- **Predictive Insights**: "Your anxiety tends to spike 3 days before your period"
- **Custom Metrics**: User-defined symptoms beyond core set
- **Export Formats**: PDF Clinical Snapshot, CSV for research consent

### Future Considerations
- Multi-language support (Spanish, Mandarin priority)
- Accessibility audit (WCAG 2.1 AAA compliance)
- Community-sourced Pattern Stories (anonymous aggregation with consent)

## Installation & Development

```bash
npm install
npm run dev       # Start dev server at localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

All data is client-side. No environment variables or backend setup required.

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **Mobile**: Optimized for touch, installable as PWA

## Data Storage

- **Per log**: 0.5-2 KB
- **1 year**: ~180-730 KB
- **5 years**: ~900 KB - 3.6 MB
- **Browser limit**: 5-10 MB (decades of daily logs)

## Developer Documentation

For contributors and technical teams:

- **[Documentation Index](./DOCUMENTATION_INDEX.md)** - Navigation hub for all docs
- **[Technical Manual](./TECHNICAL_MANUAL.md)** - Architecture, Soul Injection algorithms, API reference
- **[Features Guide](./FEATURES.md)** - Page-by-page breakdown with True North ties
- **[Privacy Guide](./PRIVACY.md)** - Sacred Rules and data sovereignty details
- **[Theme System Guide](./THEME_SYSTEM_GUIDE.md)** - Body-positive UX and theme customization
- **[Roadmap](./ROADMAP.md)** - Phased development plan

## Support & Philosophy

Blossom is built with love for the PCOS community. If you're struggling with symptoms, please know:
- You are not broken
- Your body is doing its best with complex biology
- Healing is not linear - rest is part of progress
- You deserve compassionate care, especially from yourself

For technical issues, consult the documentation above. For PCOS support, please reach out to qualified healthcare providers or PCOS support communities.
