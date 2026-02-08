# 🧬 The Narrative Matrix (Version 4.0 Vision)

**Status**: Future Implementation (Tier 2 & Tier 3)
**Purpose**: To store the complete list of 30+ clinical user narratives, their required data correlations, and lag detection logic.

---

## The Maturity Model

- **Tier 1 (Direct)**: Same-day correlation. (e.g., "Low Sugar -> Better Mood")
- **Tier 2 (Contextual)**: Phase-specific or Velocity-based. (e.g., "Exercise in Luteal -> Energy")
- **Tier 3 (Complex)**: Multi-day Lag or Long-term trends. (e.g., "Stress -> Acne flare 2 days later")

---

## 🔮 The Narrative Bank (Clinical Scenarios)

### 🏃‍♀️ Category: Physical (Activity, Acne, Hirsutism)

| Tier | ID | Narrative Insight | Logic / Variables | Citation |
| :--- | :--- | :--- | :--- | :--- |
| **2** | `EXERCISE_ENERGY_LUTEAL` | "Movement creates energy +X%, even in luteal." | `Activity` + `Energy` + `Phase: Luteal` | NIH |
| **3** | `EXERCISE_HAIRLOSS_VELOCITY` | "Exercise improves hair loss -X%/month." | `Activity` + `Hair Loss` (30d Trend) | Gersh |
| **3** | `STRESS_ACNE_LAG` | "Stress links to acne +X% after 2 days — self-compassion helps." | `Stress (High)` + `Acne` + **Lag: 2 Days** | Mayo |
| **1** | `ACTIVITY_BODYIMAGE` | "Activity boosts body image +X% — celebrate." | `Activity` + `Body Image` | Monash |
| **3** | `DIET_HIRSUTISM_LONG` | "Diet reduces hirsutism slowly -X% — patience blooms." | `Diet (Balanced)` + `Hirsutism` (Monthly) | ACOG |
| **2** | `RESTING_ACNE` | "In resting seasons, gentle movement improves acne." | `Season: Resting` + `Activity (Light)` + `Acne` | Briden |
| **3** | `HIRSUTISM_POST_EXERCISE` | "Hirsutism reduces post-exercise -X%." | `Activity` + `Hirsutism` (30d Trend) | NIH |
| **1** | `EXERCISE_MOOD_DIPS` | "Exercise prevents mood dips — bloom with grace." | `Activity` + `Mood` (Preventative) | Gersh |

### ⚡ Category: Metabolic (Sugar, Bloating, Cravings)

| Tier | ID | Narrative Insight | Logic / Variables | Citation |
| :--- | :--- | :--- | :--- | :--- |
| **3** | `SUGAR_BLOATING_LAG` | "High sugar leads to bloating after 2 days — low sugar eased it -X%." | `Diet (High Sugar)` + `Bloating` + **Lag: 2 Days** | ACOG |
| **2** | `LOW_SUGAR_CRAVINGS` | "Low sugar choices reduce cravings -X% over week." | `Diet (Low Sugar)` + `Cravings` (Velocity) | ACOG |
| **3** | `SUGAR_BLOATING_DELAY_LUTEAL` | "Sugar causes bloating delay in luteal — low choices calm it." | `Diet (High Sugar)` + `Bloating` + `Phase: Luteal` | ACOG |
| **2** | `STRESS_CRAVINGS_FOLLICULAR` | "Stress amps cravings in follicular — breathing cuts delay." | `Stress` + `Cravings` + `Phase: Follicular` | Monash |
| **2** | `SUGAR_BLOAT_RESOLVE` | "Bloat from sugar resolves faster with movement." | `Diet` + `Activity` + `Bloat Duration` | ACOG |
| **3** | `CRAVINGS_LONG_CYCLE` | "Cravings in long cycles ease with low sugar -X%." | `Cycle Length (>35d)` + `Diet` + `Cravings` | X Insights |

### 🧠 Category: Emotional (Mood, Anxiety, Stress)

| Tier | ID | Narrative Insight | Logic / Variables | Citation |
| :--- | :--- | :--- | :--- | :--- |
| **2** | `SLEEP_MOOD_FOLLICULAR` | "Mood lifts +X% with 7h+ sleep, especially in follicular." | `Sleep (>7h)` + `Mood` + `Phase: Follicular` | Monash 2023 |
| **3** | `STRESS_ANXIETY_LAG` | "Stress amplifies anxiety with 1-day delay — calm reduces it -X%." | `Stress` + `Anxiety` + **Lag: 1 Day** | Monash |
| **1** | `LOW_SUGAR_MOOD` | "Low sugar lifts mood +X% in 7 days." | `Diet (Low Sugar)` + `Mood` | Monash |
| **2** | `STRESS_ANXIETY_LUTEAL` | "Anxiety eases with calm -X% in anovulatory phases." | `Stress` + `Anxiety` + `Phase: Luteal/Anov` | Briden |
| **3** | `DIET_ANXIETY_VELOCITY` | "Diet eases anxiety -X% — nourish gently." | `Diet` + `Anxiety` (Velocity) | Mayo |
| **2** | `STRESS_BODY_IMAGE` | "Stress-body image improves with rest -X%." | `Stress` + `Body Image` + `Sleep` | Monash |
| **3** | `ANXIETY_VELOCITY_DIET` | "Anxiety slows with diet -X% — whispers of progress." | `Diet` + `Anxiety` (Cycle Trend) | ACOG |

### 🌙 Category: Sleep & Recovery (Cross-Cutting)

| Tier | ID | Narrative Insight | Logic / Variables | Citation |
| :--- | :--- | :--- | :--- | :--- |
| **2** | `SLEEP_BLOATING_LUTEAL` | "Better sleep eases bloating -X% in luteal phase." | `Sleep` + `Bloating` + `Phase: Luteal` | X Insights |
| **3** | `SLEEP_CRAMPS_VELOCITY` | "Sleep reduces cramps -X%/cycle." | `Sleep` + `Cramps` (Cycle Trend) | NIH |
| **1** | `POOR_SLEEP_ENERGY` | "Energy from sleep prevents crashes." | `Sleep (<6h)` + `Energy` (Next Day) | X Insights |
| **3** | `SLEEP_MOOD_CHAIN` | "Sleep-mood lift boosts energy +X%." | `Sleep` -> `Mood` -> `Energy` (Chain) | NIH |

---

## Technical Requirements for v4.0

To activate these Tier 3 narratives, we need to build:
1.  **Lag Engine**: Ability to query `Log[Day X]` vs `Log[Day X + 2]`.
2.  **Velocity Calculator**: Rolling average comparison (Last 7 days vs Previous 7 days).
3.  **Phase Filter**: Strict categorization of logs into Cycle Phases.
