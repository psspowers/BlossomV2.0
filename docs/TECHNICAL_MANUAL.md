# Blossom - Technical Manual

**Version**: 3.0 (Cloud Sync & Priority System)
**Last Updated**: March 2026
**Target Audience**: Developers, DevOps, Technical Operators, Documentation Architects

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
   - 4.1 [Supabase Cloud Database](#supabase-cloud-database)
   - 4.2 [Local IndexedDB Storage](#local-indexeddb-storage)
   - 4.3 [Hybrid Architecture Strategy](#hybrid-architecture-strategy)
5. [Authentication System](#authentication-system)
   - 5.1 [Supabase Auth Integration](#supabase-auth-integration)
   - 5.2 [Session Management](#session-management)
   - 5.3 [Onboarding Flow](#onboarding-flow)
6. [Component Architecture](#component-architecture)
7. [Soul Injection: Core Logic](#soul-injection-core-logic)
   - 7.1 [Blossom Score Algorithm](#blossom-score-algorithm)
   - 7.2 [Seasons Engine](#seasons-engine)
   - 7.3 [Narratives & Daily Wisdom](#narratives--daily-wisdom)
   - 7.4 [Pattern Stories Generator](#pattern-stories-generator)
8. [Priority & Happiness System](#priority--happiness-system)
9. [State Management](#state-management)
10. [Theme System](#theme-system)
11. [Build & Deployment](#build--deployment)
12. [Testing & Debugging](#testing--debugging)
13. [Extending the App](#extending-the-app)
14. [Performance Optimization](#performance-optimization)
15. [Troubleshooting](#troubleshooting)
16. [API Reference](#api-reference)

---

## Architecture Overview

### Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **UI Components**: Radix UI (18 component libraries)
- **Styling**: Tailwind CSS 3.4.11 + tailwindcss-animate
- **Animations**: Framer Motion 12.25.0
- **Charts**: Recharts 2.12.7 + Chart.js 4.5.1
- **Database (Cloud)**: Supabase PostgreSQL (^2.90.1) - **NEW in v3.0**
- **Database (Local)**: Dexie 4.2.1 (IndexedDB wrapper)
- **Authentication**: Supabase Auth with PKCE flow - **NEW in v3.0**
- **State Management**: React Query (@tanstack/react-query 5.56.2)
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **PWA**: vite-plugin-pwa 1.2.0 + Workbox 7.4.0

### Architecture Pattern

**Hybrid Cloud-Connected Application** (v3.0 Update)
- **Frontend**: React SPA with client-side rendering
- **Backend**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Email/password via Supabase Auth
- **Data Storage**:
  - **Cloud**: User logs, settings, priorities stored in Supabase
  - **Local**: IndexedDB for performance and offline fallback
- **Multi-Device**: Cloud sync enables cross-device data access
- **Progressive Web App (PWA)**: Installable with offline capability
- **Privacy-First**: Row-level security ensures complete data isolation

### Key Design Principles

1. **Privacy First**: Row-level security (RLS) ensures complete data isolation per user
2. **Hybrid Storage**: Cloud sync for multi-device + local caching for performance
3. **Offline Capable**: PWA with service worker caching
4. **Performance**: Optimized database queries with indexes and RLS subquery pattern
5. **Accessibility**: WCAG 2.1 AA compliant
6. **Modularity**: Component-based architecture with clear separation of concerns
7. **Type Safety**: Full TypeScript coverage across frontend and database schemas
8. **Security**: PKCE auth flow, password leak detection, immutable function search paths

---

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or equivalent package manager
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd blossom

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Setup

**Required Environment Variables** (v3.0):

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to Get These Values**:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key
4. Paste into `.env` file

**Security Note**: The anon key is safe to expose client-side. Row Level Security (RLS) policies protect all data.

### Development Server

- **URL**: http://localhost:5173
- **Hot Module Replacement**: Enabled
- **Port**: 5173 (default, configurable in vite.config.ts)

### IDE Setup

**Recommended**: VS Code with extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── BioOrb.tsx       # Main visualization orb
│   │   ├── Dashboard.tsx    # Main dashboard layout
│   │   ├── DailyLog.tsx     # Log entry modal
│   │   ├── SettingsModal.tsx
│   │   ├── CycleContext.tsx # Cycle phase display
│   │   ├── CycleRing.tsx    # Cycle visualization
│   │   ├── DailyWisdom.tsx  # Wisdom card
│   │   ├── Insights.tsx     # Insights section
│   │   ├── TrendVelocity.tsx
│   │   └── WellnessRadar.tsx
│   ├── lib/
│   │   ├── db.ts            # Database schema & helpers
│   │   ├── seed.ts          # Demo data seeder
│   │   ├── resetData.ts     # Data reset utility
│   │   ├── hooks/
│   │   │   └── useInsights.ts
│   │   ├── logic/
│   │   │   ├── achievements.ts
│   │   │   ├── mode.ts      # Interface mode logic
│   │   │   ├── plant.ts     # Plant growth logic
│   │   │   └── velocity.ts  # Trend calculation
│   │   └── themes/
│   │       ├── types.ts     # Theme configs
│   │       └── ThemeContext.tsx
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Build output
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

### Component Hierarchy

```
App (ThemeProvider, QueryClientProvider)
└── Dashboard
    ├── BioOrb (main visualization)
    ├── CycleContext (cycle info card)
    ├── WellnessRadar (symptom radar chart)
    ├── DailyWisdom (wisdom card)
    ├── Insights (trend analysis)
    │   ├── TrendVelocity
    │   └── CycleRing
    ├── DailyLog (modal)
    └── SettingsModal (modal)
```

---

---

## Cycle Logic: True Period vs Spotting

**File**: `src/lib/logic/cycle.ts`

One of Blossom's most clinically important features is differentiating **true periods** from **spotting episodes**. This distinction is critical for PCOS diagnosis and hyperandrogenism tracking.

### The Problem

Many PCOS patients experience irregular bleeding patterns:
- Spotting episodes (1 day, light flow)
- True periods (2+ days, medium/heavy flow)
- Mixed patterns that confuse fertility tracking

**Clinical Impact:** Mistaking spotting for periods leads to:
- Incorrect cycle length calculations
- Failed ovulation predictions
- Misdiagnosis of cycle regularity

---

### The Solution: True Period Detection

**Algorithm:**

```typescript
function isTruePeriod(logs: LogEntry[]): boolean {
  // Requires at least 2 consecutive days
  if (logs.length < 2) return false;

  // Must have medium or heavy flow
  const hasSignificantFlow = logs.some(log =>
    log.flow === 'medium' || log.flow === 'heavy'
  );

  // Days must be within 24 hours of each other
  const isConsecutive = checkConsecutiveDays(logs);

  return hasSignificantFlow && isConsecutive;
}
```

**Logic:**
1. **2+ Day Rule**: True periods last multiple days
2. **Flow Threshold**: At least one day of medium or heavy flow
3. **Consecutive Days**: Days within 24 hours (allows for same-day logging)

**Example:**
- ✅ True Period: Day 1 (medium), Day 2 (heavy), Day 3 (light)
- ❌ Spotting: Day 1 (light), [gap], Day 5 (light)

---

### Cycle Analysis Output

```typescript
interface CycleAnalysis {
  currentDay: number;           // Days since last TRUE period
  isLongCycle: boolean;         // >35 days (PCOS indicator)
  variability: number;          // Cycle length standard deviation
  lastTruePeriod: CycleEvent;   // Most recent confirmed period
  cycleHistory: CycleEvent[];   // All detected true periods
  isUntracked: boolean;         // No periods logged yet
}
```

**Stability Score:**
```typescript
stabilityScore = 100 - (variability × 5)
// Example: 7-day variability = 65% stability score
```

**Variance Days:** Standard deviation of recent cycle lengths

---

### Clinical Insights Generated

Based on cycle analysis, Blossom flags:

1. **Long Cycles**: >35 days (Rotterdam PCOS criteria)
2. **High Variability**: Standard deviation >7 days
3. **Spotting Patterns**: Frequent light flow without true periods
4. **Maintenance Mode**: Extended cycles requiring metabolic support

**Example Output:**
```
CYCLE CONTEXT: Day 42 - Extended Cycle
Stability: 68%
Variance: ±8 days
Phase: Maintenance Mode
Insight: "Long cycles are common with PCOS. You're not broken."
```

---

## Database Architecture

### Storage Technology

**IndexedDB via Dexie.js**
- Key-value object store
- Supports complex queries and indexing
- ~5-10 MB storage limit per origin
- Survives browser restarts

### Schema

```typescript
// Database version 1
class BlossomDB extends Dexie {
  logs!: Table<LogEntry>;
  settings!: Table<Settings>;
}

db.version(1).stores({
  logs: '++id, date',      // Auto-increment ID, indexed date
  settings: '++id'         // Auto-increment ID
});
```

### Data Models

---

#### LogEntry (Core Data Structure)

**Purpose:** Stores daily wellness snapshots with PCOS-specific tracking

```typescript
interface LogEntry {
  // Identity
  id?: number;                    // Auto-increment (Dexie managed)
  date: string;                   // ISO date (YYYY-MM-DD)

  // Cycle Tracking (PCOS-critical)
  cyclePhase: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'unknown';
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

  // Physical Symptoms (40% of Blossom Score)
  symptoms: {
    acne?: number;                // 0-10 scale (hyperandrogenism marker)
    hirsutism?: number;           // 0-10 scale (hyperandrogenism marker)
    hairLoss?: number;            // 0-10 scale (hyperandrogenism marker)
    bloat?: number;               // 0-10 scale (digestive/hormonal)
    cramps?: number;              // 0-10 scale (menstrual symptom)
  };

  // Psychological State (30% of Blossom Score - "The Unseen Weight")
  psych: {
    stress?: string;              // 'low' | 'medium' | 'high'
    bodyImage?: string;           // 'positive' | 'neutral' | 'negative'
    mood?: number;                // 0-10 scale (primary emotional metric)
    anxiety?: string;             // 'low' | 'medium' | 'high'
  };

  // Lifestyle Factors (30% of Blossom Score)
  lifestyle: {
    sleep?: string;               // Hours (e.g., '7')
    waterIntake?: number;         // Glasses (0-12)
    exercise?: string;            // 'none' | 'light' | 'moderate' | 'intense'
    diet?: string;                // 'poor' | 'fair' | 'good' | 'excellent'
  };

  // User-Defined Metrics (Sovereignty)
  customValues?: Record<string, number>;  // e.g., { "libido": 5, "medication_side_effects": 3 }
}
```

**Design Philosophy:**
- **Holistic:** Physical + Mental + Lifestyle = Complete picture
- **Flexible:** Custom values allow personalization
- **Clinical:** Tracks Rotterdam PCOS criteria (cycle, hyperandrogenism)
- **Private:** Stored locally in IndexedDB, never transmitted

#### Settings
```typescript
interface Settings {
  id?: number;                              // Auto-increment
  theme: 'dark' | 'light' | 'auto';        // UI theme
  designTheme: 'default' | 'lotus';        // Design aesthetic
  notifications: boolean;                   // Enable notifications
  customSymptomDefinitions: CustomSymptom[]; // User-defined symptoms
}
```

### Database Helpers

```typescript
// Get or create settings
await getOrCreateSettings(): Promise<Settings>

// Get logs in date range
await getLogsInRange(startDate: string, endDate: string): Promise<LogEntry[]>

// Get last N days of logs
await getLastNDays(days: number): Promise<LogEntry[]>

// Direct Dexie access
db.logs.add(entry)
db.logs.where('date').above('2024-01-01').toArray()
db.logs.update(id, changes)
db.logs.delete(id)
db.logs.clear()
```

### Data Migration Strategy

**Current Version**: 1

**Future Migrations**:
```typescript
// Example: Adding new field
db.version(2).stores({
  logs: '++id, date',
  settings: '++id'
}).upgrade(tx => {
  return tx.table('logs').toCollection().modify(log => {
    log.newField = defaultValue;
  });
});
```

### Storage Estimates

- **Per Log Entry**: ~0.5-2 KB (depending on filled fields)
- **1 Year Daily Logs**: ~180-730 KB
- **5 Years Daily Logs**: ~900 KB - 3.6 MB
- **Browser Limit**: 5-10 MB (years of data)

---

## Component Architecture

### Core Components

#### 1. Dashboard (`Dashboard.tsx`)

**Purpose**: Main application layout and orchestration

**Features**:
- Header with privacy badge and settings button
- BioOrb visualization
- Grid of insight cards
- Floating Action Button (FAB) for adding logs
- Modal management (DailyLog, SettingsModal)

**State**:
```typescript
const { plantState, loading: plantLoading } = usePlantState();
const { themeState, loading: themeLoading } = useInterfaceMode();
const [showDailyLog, setShowDailyLog] = useState(false);
const [showSettings, setShowSettings] = useState(false);
```

#### 2. BioOrb (`BioOrb.tsx`)

**Purpose**: Central health visualization with animated orb

**Props**:
```typescript
interface BioOrbProps {
  health: number;        // 0-100 health score
  streak: number;        // Current streak count
  mode: 'nurture' | 'steady' | 'thrive';  // Interface mode
  name?: string;         // Companion name
}
```

**Features**:
- Animated pulsing orb with color gradients
- Rotating orbital rings
- Streak particle indicators
- Health-based color scheme
- Theme-aware styling

#### 3. DailyLog (`DailyLog.tsx`)

**Purpose**: Full-screen modal for logging daily entries

**Features**:
- Date selector
- Cycle phase picker
- Symptom sliders (0-10)
- Psychological state inputs
- Lifestyle factor inputs
- Form validation
- Success animations
- Auto-save to database

**Form Structure**:
```typescript
interface FormData {
  date: string;
  cyclePhase: string;
  flow: string;
  symptoms: { [key: string]: number };
  psych: { [key: string]: string | number };
  lifestyle: { [key: string]: string | number };
}
```

#### 4. SettingsModal (`SettingsModal.tsx`)

**Purpose**: Settings, achievements, and data management

**Sections**:
1. **Design Theme Selector**: Switch between Tesla-Apple and Lotus Garden
2. **Plant Profile**: Current phase, health score, streak, total logs
3. **Achievements**: Grid of badges with progress bars
4. **Privacy Vault**: Export data, reset demo data, delete all data

#### 5. Insights (`Insights.tsx`)

**Purpose**: Advanced analytics and pattern discovery

**Features**:
- Trend velocity analysis
- Cycle-symptom correlations
- Weekly summaries
- Monthly heatmaps
- Growth comparisons

#### 6. WellnessRadar (`WellnessRadar.tsx`)

**Purpose**: Radar chart showing symptom balance

**Data Source**: Last 7 days average for each symptom category

#### 7. CycleContext (`CycleContext.tsx`)

**Purpose**: Current cycle phase information and insights

**Features**:
- Phase name and description
- Days in current phase
- Phase-specific tips
- Symptom warnings

---

## Soul Injection: Core Logic

The "Soul Injection" represents the compassionate intelligence layer of Blossom. Unlike traditional health apps that use gamification or shame-based mechanics, these algorithms deliver **"Empathetic Proof"** - personalized insights that honor both science and emotional reality.

### Design Philosophy

1. **No Punishment**: No streak counters, no missed-day guilt, no binary success/failure
2. **Pattern Over Perfection**: Focus on trends, not individual bad days
3. **Validation First**: Affirm the user's experience before suggesting changes
4. **Evidence-Based Warmth**: Ground insights in research, deliver with compassion

---

### 6.1 Blossom Score Algorithm

**File**: `src/lib/logic/blossomScore.ts`

The Blossom Score (0-100) is a composite wellness metric that replaces traditional health scores. It's weighted to prioritize symptom trends over lifestyle perfectionism, embodying the "Proof and Heart" philosophy.

---

#### **The Formula**

```typescript
BlossomScore = (SymptomFactor × 0.4) + (SelfCareFactor × 0.3) + (EmotionalFactor × 0.3)
```

**Why These Weights?**
- **40% Symptoms**: Physical manifestations are primary diagnostic criteria
- **30% Self-Care**: Lifestyle factors directly impact insulin resistance
- **30% Emotional**: Mental health burden is equal to lifestyle factors (validates "The Unseen Weight")

---

#### Component Breakdown

**1. Symptom Factor (40% weight)**

Compares the last 7 days of symptom averages to the previous 7 days:

```typescript
// Average all symptoms per log (acne, hirsutism, hairLoss, bloat, cramps)
function getSymptomScore(log: LogEntry): number {
  const symptoms = [
    log.symptoms.acne || 0,
    log.symptoms.hirsutism || 0,
    log.symptoms.hairLoss || 0,
    log.symptoms.bloat || 0,
    log.symptoms.cramps || 0
  ];
  return calculateAverage(symptoms);
}

// Compare weeks
const prevSymptomAvg = calculateAverage(previous7Days.map(getSymptomScore));
const currSymptomAvg = calculateAverage(last7Days.map(getSymptomScore));
const percentChange = ((prevSymptomAvg - currSymptomAvg) / prevSymptomAvg) * 100;

// Scoring
if (percentChange > 10)  return 100;   // Improving symptoms
if (percentChange < -10) return 50;    // Worsening symptoms
else                     return 75;    // Stable symptoms
```

**Key Design Choice (Guilt to Grace):** We use week-over-week trends, not absolute values. A user with high baseline symptoms who improves by 10% gets a perfect symptom score. This avoids punishing chronic conditions - improvement is celebrated regardless of starting point.

**2. Self-Care Factor (30% weight)**

Percentage of days (last 7) with at least one nourishing choice:

```typescript
const nourishingDays = last7Days.filter(log => {
  const hasGoodSleep = sleepHours >= 7;
  const hasMovement = exercise !== 'rest';
  const hasHydration = waterIntake >= 6 glasses;

  return hasGoodSleep || hasMovement || hasHydration;
});

selfCareFactor = (nourishingDays.length / 7) * 100;
```

**Key Design Choice (Guilt to Grace):** It's an OR condition, not AND. You don't need perfect sleep AND exercise AND hydration. One nourishing choice counts. This celebrates small wins instead of demanding perfection.

**3. Emotional Factor (30% weight)**

Average mood score (0-10 scale) from the last 7 days:

```typescript
const moodScores = last7Days.map(log => log.psych.mood || 50);
const emotionalFactor = calculateAverage(moodScores);
```

**Key Design Choice (The Unseen Weight):** Emotional well-being has equal weight to lifestyle factors, and nearly equal to symptoms. This validates the mental health burden of PCOS - your mood matters as much as your metformin.

#### Edge Cases

```typescript
// Insufficient data (< 3 logs in 14 days)
return {
  score: 50,               // Neutral score
  symptomFactor: 50,
  selfCareFactor: 0,       // Not enough data
  emotionalFactor: 50
};
```

#### Usage Example

```typescript
import { calculateBlossomScore } from '@/lib/logic/blossomScore';

const result = await calculateBlossomScore();
console.log(result);
// {
//   score: 72,
//   symptomFactor: 75,
//   selfCareFactor: 85,
//   emotionalFactor: 60
// }
```

---

### 6.2 Seasons Engine

**File**: `src/lib/logic/seasons.ts`

Seasons replace linear progress bars with cyclical wellness states. Inspired by natural rhythms, this system validates low-energy periods as necessary rather than failures.

#### Three Seasons

```typescript
export type SeasonType = 'resting' | 'growing' | 'blooming';
```

#### Season Rules

```typescript
export async function calculateSeason(blossomScore: number): Promise<SeasonState> {
  const recentLogs = await getLastNDays(7);
  const logsInLast7Days = recentLogs.length;

  // RESTING: Low engagement or low score
  if (logsInLast7Days < 3 || blossomScore < 40) {
    return {
      currentSeason: 'resting',
      message: 'Winter is necessary for Spring. Rest is productive.',
      icon: '🍂'
    };
  }

  // BLOOMING: High score and consistent logging
  if (blossomScore >= 80) {
    return {
      currentSeason: 'blooming',
      message: 'You are radiant. Enjoy this season.',
      icon: '🌸'
    };
  }

  // GROWING: Default mid-range state
  return {
    currentSeason: 'growing',
    message: 'Your roots are deepening. Consistency is magic.',
    icon: '🌿'
  };
}
```

#### Messaging Strategy

Each season has compassionate framing:

| Season | Trigger | Message Philosophy |
|--------|---------|-------------------|
| Resting | Score <40 or <3 logs/week | Validate low energy as necessary. "Rest is productive." |
| Growing | Score 40-79 | Encourage consistency without pressure. "Roots are deepening." |
| Blooming | Score 80+ | Celebrate without expectation of permanence. "Enjoy this season." |

**Key Design Choice**: We never say "you failed" or "you're slipping." Resting is reframed as natural and temporary.

#### Visual Theming

```typescript
export function getSeasonColors(season: SeasonType) {
  switch (season) {
    case 'resting':  return { primary: '#A1887F', secondary: '#EFEBE9' };  // Warm browns
    case 'growing':  return { primary: '#66BB6A', secondary: '#E8F5E9' };  // Fresh greens
    case 'blooming': return { primary: '#FF69B4', secondary: '#FFF0F5' };  // Soft pinks
  }
}
```

These colors are applied to the lotus visualization and UI accents.

---

### 6.3 Narratives & Daily Wisdom

**File**: `src/lib/logic/narratives.ts`

Daily Wisdom delivers one insight per day: either a personalized pattern from the user's data, or a Monash University-backed affirmation.

#### Logic Flow

```typescript
export async function generateDailyWisdom(): Promise<DailyWisdom> {
  const allLogs = await getLastNDays(14);

  // Insufficient data → Affirmation
  if (allLogs.length < 5) {
    return {
      message: randomAffirmation(),
      category: 'affirmation',
      hasData: false
    };
  }

  // Test for sleep-mood correlation
  const goodSleepLogs = allLogs.filter(log => sleepHours >= 7);
  const badSleepLogs = allLogs.filter(log => sleepHours < 7);

  if (goodSleepLogs.length >= 3 && badSleepLogs.length >= 2) {
    const goodSleepMood = calculateAverage(goodSleepLogs.map(l => l.psych.mood));
    const badSleepMood = calculateAverage(badSleepLogs.map(l => l.psych.mood));
    const moodDifference = goodSleepMood - badSleepMood;

    if (moodDifference > 10) {
      return {
        message: `Whisper: Your body loves rest. Mood lifts when you sleep 7h+.`,
        category: 'sleep',
        hasData: true
      };
    }
  }

  // Test for movement-energy correlation
  // ... similar logic for exercise vs energy

  // Fallback → Affirmation
  return {
    message: randomAffirmation(),
    category: 'affirmation',
    hasData: false
  };
}
```

#### Affirmations Bank

Aligned with self-compassion research and body-positive messaging:

```typescript
const MONASH_AFFIRMATIONS = [
  "You are not broken. You are navigating a complex path with grace.",
  "Your body is doing its best. Every small choice matters.",
  "PCOS is a constellation of symptoms, not a character flaw.",
  "Healing is not linear. Rest is part of progress.",
  "You deserve compassion, especially from yourself.",
  "Your worth is not measured by your symptoms.",
  "Small, consistent actions create lasting change.",
  "You are learning to listen to your body's wisdom."
];
```

**Key Design Choice**: "Whisper" prefix for personalized insights. This framing suggests the app is helping you hear what your body is already saying, not imposing external rules.

---

### 6.4 Pattern Stories Generator

**File**: `src/lib/logic/stories.ts`

Pattern Stories are the flagship insight feature. They find correlations in 30 days of user data and present them as narrative sentences, not charts.

#### Analysis Categories

1. **Sleep-Anxiety**: "On nights you sleep 7h+, your anxiety is noticeably lower."
2. **Movement-Energy**: "Movement fuels you. You reported 18% more energy on active days."
3. **Diet-Mood**: "Balanced nutrition stabilizes your mood. You feel 15% better on those days."
4. **Stress-Symptoms**: "Lower stress days correlate with fewer physical symptoms."

#### Confidence Levels

```typescript
export interface PatternStory {
  story: string;
  category: 'sleep' | 'movement' | 'diet' | 'stress' | 'education';
  confidence: 'high' | 'medium' | 'low';
}
```

**High Confidence**: Statistical threshold met (e.g., >15% difference, n≥3 in each group)
**Medium Confidence**: Weak signal detected
**Low Confidence**: Insufficient data, fallback to education

#### Example: Sleep-Anxiety Detection

```typescript
const goodSleepLogs = allLogs.filter(log => sleepHours >= 7);
const badSleepLogs = allLogs.filter(log => sleepHours < 6);

if (goodSleepLogs.length >= 3 && badSleepLogs.length >= 3) {
  const goodSleepAnxiety = calculateAverage(goodSleepLogs.map(log => anxietyScore));
  const badSleepAnxiety = calculateAverage(badSleepLogs.map(log => anxietyScore));

  const anxietyDifference = ((badSleepAnxiety - goodSleepAnxiety) / badSleepAnxiety) * 100;

  if (anxietyDifference > 15) {
    stories.push({
      story: `On nights you sleep 7h+, your anxiety is noticeably lower. Rest is your medicine.`,
      category: 'sleep',
      confidence: 'high'
    });
  }
}
```

#### Educational Fallback

If no patterns detected, provide evidence-based tips:

```typescript
const MONASH_TIPS = [
  "Did you know? Consistent sleep helps regulate insulin levels.",
  "Research shows that regular movement can improve insulin sensitivity by up to 25%.",
  "Balanced meals with low-GI foods help stabilize blood sugar throughout the day.",
  // ... 10 total tips from Monash University research
];
```

#### Usage Example

```typescript
import { generatePatternStories } from '@/lib/logic/stories';

const stories = await generatePatternStories();
console.log(stories);
// [
//   {
//     story: "Movement fuels you. You reported 22% more energy on active days.",
//     category: "movement",
//     confidence: "high"
//   },
//   {
//     story: "Lower stress days correlate with fewer physical symptoms.",
//     category: "stress",
//     confidence: "high"
//   }
// ]
```

---

### Soul Injection Integration Points

These logic modules are consumed by UI components:

```typescript
// Dashboard.tsx
const { score, symptomFactor, selfCareFactor, emotionalFactor } = await calculateBlossomScore();
const { currentSeason, message, icon } = await calculateSeason(score);

// DailyWisdom.tsx
const { message, category, hasData } = await generateDailyWisdom();

// Insights.tsx
const stories = await generatePatternStories();
```

The lotus visualization in `BioOrb.tsx` uses the Blossom Score to control bloom intensity and seasonal colors.

---

## State Management

### React Query (TanStack Query)

**Configuration**:
```typescript
const queryClient = new QueryClient();
```

**Usage Pattern**:
```typescript
const { data, loading, error } = useQuery({
  queryKey: ['insights'],
  queryFn: async () => {
    const logs = await getLastNDays(30);
    return calculateInsights(logs);
  },
  staleTime: 5 * 60 * 1000,  // 5 minutes
  refetchOnWindowFocus: true
});
```

### Custom Hooks

#### `useInsights()`
```typescript
// Returns plant state, achievements, theme state
const {
  plantState,     // { phase, health, streak }
  achievements,   // { badges, nextBadge, totalStreak, totalLogs }
  themeState,     // { mode: 'nurture' | 'steady' | 'thrive' }
  loading
} = useInsights();
```

#### `usePlantState()`
```typescript
const { plantState, loading } = usePlantState();
// plantState: { phase: string, health: number, streak: number }
```

#### `useInterfaceMode()`
```typescript
const { themeState, loading } = useInterfaceMode();
// themeState: { mode: 'nurture' | 'steady' | 'thrive' }
```

#### `useAchievements()`
```typescript
const { achievements, loading } = useAchievements();
```

### Theme Context

```typescript
const {
  designTheme,      // 'default' | 'lotus'
  themeConfig,      // Full theme configuration
  setDesignTheme,   // (theme: DesignTheme) => Promise<void>
  loading
} = useTheme();
```

---

## Theme System

### Overview

Two design aesthetics with instant switching:
1. **Tesla-Apple (default)**: Modern, tech-forward
2. **Lotus Garden**: Organic, nature-inspired

### Implementation

**CSS Variables**: Theme colors injected as CSS custom properties

```css
:root {
  --theme-primary: rgb(45, 212, 191);
  --theme-secondary: rgb(192, 132, 252);
  --theme-accent: rgb(251, 191, 36);
  /* ... more variables */
}
```

**Data Attribute**: `data-theme="default"` or `data-theme="lotus"` on `<html>`

**Theme-Specific CSS**:
```css
[data-theme="lotus"] .glass-card {
  @apply border-pink-500/20 bg-zinc-900/80;
}
```

### Adding New Themes

1. **Update `types.ts`**: Add theme to `DesignTheme` union type
2. **Add Config**: Create new theme object in `themeConfigs`
3. **Update Selector**: Add button to `SettingsModal`
4. **CSS Overrides**: Add `[data-theme="newtheme"]` rules

See `THEME_SYSTEM_GUIDE.md` for detailed instructions.

---

## Build & Deployment

### Development Build

```bash
npm run dev
# Starts Vite dev server at http://localhost:5173
# Hot Module Replacement (HMR) enabled
# Source maps included
```

### Production Build

```bash
npm run build
# Output: dist/ directory
# Minified and optimized
# Gzip compression estimates shown
```

**Build Output**:
```
dist/
├── index.html                      # Entry HTML
├── assets/
│   ├── index-[hash].js            # Main bundle (~690 KB)
│   └── index-[hash].css           # Styles (~29 KB)
├── manifest.webmanifest            # PWA manifest
├── sw.js                           # Service worker
├── workbox-[hash].js              # Workbox runtime
├── registerSW.js                   # SW registration
└── [static assets]                 # Images, icons, etc.
```

### PWA Configuration

**Manifest** (`vite.config.ts`):
```typescript
{
  name: 'Blossom - PCOS Companion',
  short_name: 'Blossom',
  description: 'Privacy-first PCOS symptom tracking',
  theme_color: '#2dd4bf',
  background_color: '#020617',
  display: 'standalone',
  icons: [/* ... */]
}
```

**Service Worker**: Workbox with `generateSW` strategy
- Precaches all static assets
- Runtime caching for API calls (none currently)
- Offline fallback

### Deployment Targets

**Static Hosting** (recommended):
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

**Configuration**:
```json
// vercel.json / netlify.toml
{
  "builds": [{ "src": "package.json", "use": "@vercel/static-build" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }]
}
```

**SPA Routing**: Ensure all routes fallback to `index.html`

### Build Optimization

**Current Bundle Size**: ~690 KB minified (~223 KB gzip)

**Optimization Opportunities**:
1. **Code Splitting**: Use dynamic imports for routes
2. **Tree Shaking**: Remove unused Radix components
3. **Lazy Loading**: Defer non-critical components
4. **Image Optimization**: Compress PNG/SVG assets

**Example**:
```typescript
// Before
import { SettingsModal } from './components/SettingsModal';

// After (lazy loaded)
const SettingsModal = lazy(() => import('./components/SettingsModal'));
```

---

## Testing & Debugging

### Browser DevTools

**IndexedDB Inspection**:
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB > BlossomDB
4. View logs and settings tables

**React DevTools**:
- Install React DevTools extension
- Inspect component tree
- View props, state, hooks

**Performance Profiling**:
1. Performance tab in DevTools
2. Record interaction
3. Analyze render times, bottlenecks

### Console Debugging

**Enable Verbose Logging**:
```typescript
// In lib/db.ts
db.on('ready', () => console.log('DB ready'));
db.logs.hook('creating', () => console.log('Creating log'));
```

**Query Debugging**:
```typescript
// Add to useInsights hook
useEffect(() => {
  console.log('Plant state:', plantState);
  console.log('Achievements:', achievements);
}, [plantState, achievements]);
```

### Common Issues

**Issue**: Data not persisting
- **Check**: Browser privacy settings (IndexedDB blocked?)
- **Fix**: Use normal browsing mode (not incognito)

**Issue**: Theme not switching
- **Check**: Console for errors in ThemeContext
- **Debug**: `console.log(designTheme)` in ThemeProvider

**Issue**: Slow rendering
- **Check**: Number of log entries (>1000?)
- **Fix**: Implement pagination or virtualization

### Error Boundaries

Add error boundary for graceful degradation:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Extending the App

### Adding New Symptoms

1. **Update Schema** (`lib/db.ts`):
```typescript
interface LogEntry {
  symptoms: {
    acne?: number;
    newSymptom?: number;  // Add here
  };
}
```

2. **Update Form** (`DailyLog.tsx`):
```tsx
<label>New Symptom</label>
<input type="range" min="0" max="10" />
```

3. **Update Calculations** (`lib/logic/plant.ts`, etc.)

### Adding New Themes

See `THEME_SYSTEM_GUIDE.md` for comprehensive guide.

**Quick Steps**:
1. Add to `DesignTheme` union in `types.ts`
2. Define `ThemeConfig` in `themeConfigs`
3. Add selector button in `SettingsModal`
4. Add CSS overrides in `index.css`

### Adding New Insights

1. **Create Calculation Function** (`lib/logic/`):
```typescript
export function calculateNewInsight(logs: LogEntry[]) {
  // Analysis logic
  return result;
}
```

2. **Add to Hook** (`lib/hooks/useInsights.ts`):
```typescript
const newInsight = useMemo(() => {
  return calculateNewInsight(logs);
}, [logs]);
```

3. **Create Component** (`components/NewInsight.tsx`)
4. **Add to Dashboard**

### Adding New Achievements

Edit `lib/logic/achievements.ts`:
```typescript
const BADGES = [
  // ... existing badges
  {
    id: 'new-achievement',
    name: 'New Achievement',
    description: 'Complete 100 logs',
    icon: '🏆',
    tier: 3,
    condition: (stats) => stats.totalLogs >= 100
  }
];
```

---

## Performance Optimization

### Current Performance

- **Initial Load**: ~1.5s on 3G
- **Time to Interactive**: ~2s
- **Bundle Size**: 690 KB (223 KB gzip)

### Optimization Strategies

#### 1. Code Splitting

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/SettingsModal'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

#### 2. Memoization

```typescript
// Expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Component memoization
export const ExpensiveComponent = memo(({ data }) => {
  // Only re-renders if data changes
});
```

#### 3. Virtual Scrolling

For long lists (>100 items):
```typescript
import { VirtualList } from 'react-window';

<VirtualList
  height={600}
  itemCount={logs.length}
  itemSize={80}
>
  {({ index, style }) => (
    <LogItem style={style} log={logs[index]} />
  )}
</VirtualList>
```

#### 4. Image Optimization

- Use WebP format
- Implement lazy loading
- Serve responsive images

```tsx
<img
  src="image.webp"
  loading="lazy"
  srcSet="small.webp 320w, medium.webp 640w, large.webp 1024w"
/>
```

#### 5. Database Query Optimization

```typescript
// Bad: Load all logs then filter in memory
const logs = await db.logs.toArray();
const filtered = logs.filter(l => l.date > '2024-01-01');

// Good: Filter in database
const filtered = await db.logs
  .where('date')
  .above('2024-01-01')
  .toArray();
```

---

## Troubleshooting

### Common Problems

#### Database Not Initializing

**Symptom**: Blank screen, no data

**Causes**:
- IndexedDB disabled in browser
- Privacy/incognito mode
- Storage quota exceeded
- Corrupted database

**Solutions**:
```javascript
// Check IndexedDB support
if (!window.indexedDB) {
  alert('Your browser does not support IndexedDB');
}

// Clear corrupted database
await db.delete();
location.reload();

// Check storage quota
const estimate = await navigator.storage.estimate();
console.log(`Used: ${estimate.usage}, Quota: ${estimate.quota}`);
```

#### Theme Not Applying

**Symptom**: Colors not changing on theme switch

**Debug**:
```javascript
// Check data-theme attribute
console.log(document.documentElement.getAttribute('data-theme'));

// Check CSS variables
const styles = getComputedStyle(document.documentElement);
console.log(styles.getPropertyValue('--theme-primary'));

// Check theme state
const { designTheme } = useTheme();
console.log('Current theme:', designTheme);
```

**Solutions**:
- Clear browser cache
- Check for CSS specificity conflicts
- Ensure ThemeProvider wraps app
- Verify database has designTheme field

#### PWA Not Installing

**Symptom**: Install prompt not showing

**Requirements**:
- HTTPS (or localhost)
- Valid manifest.json
- Service worker registered
- Meets PWA criteria

**Debug**:
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', reg);
});

// Check manifest
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m));
```

#### Slow Performance

**Symptom**: Laggy UI, slow rendering

**Diagnosis**:
```javascript
// Check log count
const count = await db.logs.count();
console.log('Total logs:', count);

// Profile component renders
// Use React DevTools Profiler

// Check bundle size
// Run: npm run build
```

**Solutions**:
- Implement pagination for logs
- Use React.memo for expensive components
- Debounce user inputs
- Optimize images
- Enable code splitting

#### Build Failures

**Symptom**: `npm run build` fails

**Common Causes**:
- TypeScript errors
- Missing dependencies
- Out of memory

**Solutions**:
```bash
# Fix TypeScript errors
npm run lint

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## API Reference

### Database Functions

#### `getOrCreateSettings()`
```typescript
async function getOrCreateSettings(): Promise<Settings>
```
Returns settings object, creating default if none exists.

#### `getLogsInRange(startDate, endDate)`
```typescript
async function getLogsInRange(
  startDate: string,  // ISO date 'YYYY-MM-DD'
  endDate: string     // ISO date 'YYYY-MM-DD'
): Promise<LogEntry[]>
```
Returns logs between dates (inclusive).

#### `getLastNDays(days)`
```typescript
async function getLastNDays(days: number): Promise<LogEntry[]>
```
Returns logs from last N days.

### Logic Functions

#### `calculatePlantState(logs)`
```typescript
function calculatePlantState(logs: LogEntry[]): PlantState
```
Returns `{ phase: string, health: number, streak: number }`.

#### `calculateAchievements(logs)`
```typescript
function calculateAchievements(logs: LogEntry[]): AchievementState
```
Returns achievement progress and unlocked badges.

#### `determineInterfaceMode(logs)`
```typescript
function determineInterfaceMode(logs: LogEntry[]): InterfaceMode
```
Returns `{ mode: 'nurture' | 'steady' | 'thrive' }`.

#### `calculateVelocity(logs, metric)`
```typescript
function calculateVelocity(
  logs: LogEntry[],
  metric: string
): number
```
Returns rate of change for a metric (-1 to 1).

### Theme Functions

#### `useTheme()`
```typescript
function useTheme(): {
  designTheme: DesignTheme;
  themeConfig: ThemeConfig;
  setDesignTheme: (theme: DesignTheme) => Promise<void>;
  loading: boolean;
}
```
Access theme state and controls.

---

## Security Considerations

### Data Privacy

- **No Network Calls**: Zero telemetry or analytics
- **Local Storage Only**: All data in IndexedDB
- **No Third-Party SDKs**: No tracking libraries
- **No Auth Required**: Completely anonymous

### Content Security Policy

Recommended CSP headers:
```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self';
  img-src 'self' data:;
  connect-src 'self';
```

### XSS Prevention

- All user inputs sanitized
- React auto-escapes by default
- No `dangerouslySetInnerHTML` used

---

## Maintenance

### Regular Tasks

**Weekly**:
- Review console errors in production
- Check bundle size trends
- Monitor user feedback

**Monthly**:
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review analytics (if added)

**Quarterly**:
- Major dependency updates
- Performance audit
- Accessibility audit
- Browser compatibility testing

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update to latest safe versions
npm update

# Update major versions (carefully)
npm install react@latest
```

### Monitoring

Add error tracking (optional):
```typescript
window.addEventListener('error', (event) => {
  // Log to monitoring service
  console.error('Global error:', event.error);
});
```

---

## Resources

### Documentation Links

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Dexie Docs](https://dexie.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com)

### Project Documentation

- `README.md` - User-facing documentation
- `THEME_SYSTEM_GUIDE.md` - Theme implementation
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `CHART_FIX_GUIDE.md` - Chart troubleshooting
- `HYPERANDROGENISM_INSIGHTS.md` - Clinical insights
- `INTERACTIVE_FILTER_GUIDE.md` - Filter system

---

## Version History

### v1.0.0 (Current)
- Initial release
- Theme system (Tesla-Apple, Lotus Garden)
- Achievement system
- PWA support
- Full TypeScript
- Comprehensive insights

---

## Support

For technical issues, refer to:
1. This manual
2. Console error messages
3. Browser DevTools
4. React DevTools

For feature requests or bugs:
- Document issue clearly
- Include browser/version
- Provide steps to reproduce
- Share console errors

---

**End of Technical Manual**

*This document is living documentation. Update as the application evolves.*
