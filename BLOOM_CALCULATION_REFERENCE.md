# Bloom Score Calculation - Quick Reference

**Last Updated**: March 7, 2026
**Purpose**: Fast lookup for calculation formulas and normalization rules

---

## 1. Main Formula

```
Bloom Score = (
  Symptom Factor    × Weight_S +
  Self-Care Factor  × Weight_SC +
  Emotional Factor  × Weight_E +
  Stability Factor  × Weight_ST
) × 1.0

Default Weights (no priorities): 0.25 each
Range: [0, 100]
```

---

## 2. Factor Calculations

### Symptom Factor (Physical Burden)
```
Inputs: Acne, Hirsutism, Hair Loss, Bloating, Cramps
Window: Last 7 days

Step 1: Invert severity
  Wellness = 10 - Severity

Step 2: Average
  Symptom Factor = Average(all wellness scores) × 10

Missing Data Default: 10 (no symptom)
Range: [0, 100]
```

### Self-Care Factor (Metabolic Consistency)
```
Inputs: Sleep, Exercise, Diet
Window: Last 7 days

Step 1: Check Sleep Gate
  IF Sleep < 6h THEN
    Self-Care Day = FALSE
  ELSE IF Sleep ≥9 OR Exercise ≥7 OR Diet ≥9 THEN
    Self-Care Day = TRUE
  ELSE
    Self-Care Day = FALSE
  END IF

Step 2: Count days
  Self-Care Factor = (Count of TRUE days / 7) × 100

Missing Data Default: 5 (neutral)
Range: [0, 100]
```

### Emotional Factor (Psychological Wellness — Monash 2023)
```
Inputs: Mood, Stress, Anxiety, Body Image
Window: Last 7 days

Step 1: Normalize all inputs
  Mood_W       = Mood (direct, 0-10)
  Stress_W     = inverted (low=8, medium=5, high=2)
  Anxiety_W    = inverted (none=9, low=7, high=2)
  BodyImage_W  = inverted (positive=9, neutral=5, negative=2)

Step 2: Average all 4 components
  Emotional Factor = ((Mood_W + Stress_W + Anxiety_W + BodyImage_W) / 4) × 10

Missing Data Default: 5 (neutral) — missing inputs do NOT penalize the user
Range: [0, 100]
```

### Stability Factor (Cycle Regularity)
```
Input: Period start dates
Window: Full cycle history (all-time)

Step 1: Extract cycle lengths
  For each period with flow ≥ "medium":
    Calculate days since last period

Step 2: Calculate variability
  Variability = StandardDeviation(cycle lengths)

Step 3: Convert to score
  Stability = max(0, min(100, 100 - Variability×5))

Missing Data Default: 50 (neutral, if <2 cycles)
Range: [0, 100]
```

---

## 3. Normalization Tables

### Symptoms (All use same inversion)
| Raw Severity | Normalized Wellness | Interpretation |
|--------------|---------------------|----------------|
| 0 | 10 | No symptom |
| 1-2 | 9-8 | Minimal |
| 3-4 | 7-6 | Mild |
| 5-6 | 5-4 | Moderate |
| 7-8 | 3-2 | Severe |
| 9-10 | 1-0 | Critical |

### Sleep
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "<6h" | 3 | Depleted |
| "6-7h" | 6 | Maintenance |
| "7-8h" | 9 | Optimal |
| ">8h" | 9 | Optimal |

### Exercise
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "rest" | 5 | Neutral (not failure) |
| "light" | 7 | Good |
| "moderate" | 9 | Excellent |
| "intense" | 10 | Peak |

### Diet
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "restrictive" | 4 | Poor |
| "cravings" | 4 | Poor |
| "balanced" | 9 | Optimal |

### Stress (Inverted)
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "low" | 8 | Good |
| "medium" | 5 | Moderate |
| "high" | 2 | Poor |

### Anxiety (Inverted)
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "none" | 9 | Excellent |
| "low" | 7 | Good |
| "high" | 2 | Poor |

### Mood (Direct)
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| 0-3 | 0-3 | Poor |
| 4-6 | 4-6 | Moderate |
| 7-10 | 7-10 | Good |

### Body Image (Inverted)
| Raw Input | Normalized Wellness | Interpretation |
|-----------|---------------------|----------------|
| "positive" | 9 | Excellent |
| "neutral" | 5 | Moderate |
| "negative" | 2 | Poor |

---

## 4. Personalization Algorithm

```
Step 1: Apply Priority Boost
  For each selected priority P:
    IF P maps to Factor F THEN
      Weight[F] += 0.15
    END IF
  END FOR

Step 2: Normalize to Sum = 1.0
  Total = Sum(all weights)
  For each factor F:
    Weight[F] = Weight[F] / Total
  END FOR

Priority-to-Factor Mapping:
  'acne', 'hirsutism', 'hair_loss', 'bloating', 'cramps', 'pain_cramps', 'skin_hair'
    → Symptom Factor

  'mood_energy', 'anxiety', 'body_image'
    → Emotional Factor

  'weight_metabolic', 'sleep_fatigue'
    → Self-Care Factor

  'cycle_regularity', 'fertility'
    → Stability Factor
```

### Example Weight Calculations

**No Priorities**:
```
All factors: 0.25 (25%)
```

**1 Priority (e.g., Anxiety → Emotional)**:
```
Before normalization:
  Symptom:   0.25
  Self-Care: 0.25
  Emotional: 0.40  (+0.15 boost)
  Stability: 0.25
  Sum: 1.15

After normalization:
  Symptom:   0.217 (21.7%)
  Self-Care: 0.217 (21.7%)
  Emotional: 0.348 (34.8%)
  Stability: 0.217 (21.7%)
```

**3 Priorities (e.g., Acne + Anxiety + Cycle)**:
```
Before normalization:
  Symptom:   0.40  (+0.15)
  Self-Care: 0.25
  Emotional: 0.40  (+0.15)
  Stability: 0.40  (+0.15)
  Sum: 1.45

After normalization:
  Symptom:   0.276 (27.6%)
  Self-Care: 0.172 (17.2%)
  Emotional: 0.276 (27.6%)
  Stability: 0.276 (27.6%)
```

---

## 5. Sleep Gate Logic (Critical Rule)

```
A day qualifies as "Self-Care Day" IF AND ONLY IF:

(Sleep < 6h) → FALSE (disqualified, no credit)

(Sleep ≥ 6h) AND (Sleep ≥9 OR Exercise ≥7 OR Diet ≥9) → TRUE

Otherwise → FALSE
```

**Examples**:

| Sleep | Exercise | Diet | Qualifies? | Reason |
|-------|----------|------|------------|--------|
| 5.9h | intense (10) | balanced (9) | ❌ NO | Sleep Gate blocks |
| 6.0h | rest (5) | cravings (4) | ❌ NO | No threshold met |
| 7.0h | rest (5) | cravings (4) | ✅ YES | Sleep ≥9 |
| 6.5h | moderate (9) | cravings (4) | ✅ YES | Exercise ≥7 |
| 6.5h | rest (5) | balanced (9) | ✅ YES | Diet ≥9 |

---

## 6. Data Window Specifications

| Component | Window Size | Rationale |
|-----------|-------------|-----------|
| Bloom Score | Last 7 days | Recent behavior more relevant than distant past |
| Symptom Factor | Last 7 days | Captures current symptom state |
| Self-Care Factor | Last 7 days | Weekly consistency matters |
| Emotional Factor | Last 7 days | Recent mental state |
| Stability Factor | All-time | Cycle patterns emerge over months |
| Pattern Stories | Last 30 days | Needs more data to detect correlations |

---

## 7. Missing Data Defaults

| Input Type | Missing Data Strategy | Default Value | Rationale |
|------------|----------------------|---------------|-----------|
| Symptoms | Optimistic | 10 (no symptom) | Absence of complaint = absence of symptom |
| Mood | Neutral | 5 | Average baseline |
| Stress | Optimistic | 5 (low-medium) | Assume reasonable baseline |
| Anxiety | Optimistic | 5 (low) | Assume reasonable baseline |
| Sleep | Neutral | 5 | Average behavior |
| Exercise | Neutral | 5 | Average behavior |
| Diet | Neutral | 5 | Average behavior |
| Cycles | Neutral | 50 (if <2 cycles) | Cannot score without data |

---

## 8. Score Interpretation Ranges

| Score Range | Mode | Theme Color | Clinical Interpretation |
|-------------|------|-------------|-------------------------|
| 0-35 | Nurture | Purple | Acute flare or crisis state. Prioritize rest and symptom management. |
| 36-70 | Steady | Sage Green | Maintenance phase. Continue current patterns, address weak areas. |
| 71-100 | Thrive | Coral Amber | Optimal management. Sustained improvement validated. |

---

## 9. Factor Contribution Examples

### Example 1: High Symptom Burden
```
Symptoms: 8/10 severity → Wellness 2 → Factor 20
Self-Care: 100% compliant → Factor 100
Emotional: Moderate → Factor 60
Stability: Regular cycles → Factor 80

Bloom = (20×0.25) + (100×0.25) + (60×0.25) + (80×0.25)
      = 5 + 25 + 15 + 20
      = 65

Interpretation: Good self-care cannot fully offset severe symptoms.
Need medical intervention (e.g., hormonal therapy).
```

### Example 2: Emotional Crisis
```
Symptoms: Mild 3/10 severity → Wellness 7 → Factor 70
Self-Care: Good → Factor 70
Emotional: Severe depression/anxiety → Factor 20
Stability: Regular cycles → Factor 75

Bloom = (70×0.25) + (70×0.25) + (20×0.25) + (75×0.25)
      = 17.5 + 17.5 + 5 + 18.75
      = 58.75

Interpretation: Physical health OK but mental health crisis.
Refer to mental health support (therapy, psychiatry).
```

### Example 3: Balanced Profile
```
Symptoms: Low 2/10 severity → Wellness 8 → Factor 80
Self-Care: 6/7 days → Factor 86
Emotional: Good mood, low stress → Factor 75
Stability: Slightly irregular → Factor 65

Bloom = (80×0.25) + (86×0.25) + (75×0.25) + (65×0.25)
      = 20 + 21.5 + 18.75 + 16.25
      = 76.5

Interpretation: Maintenance phase. All domains functional.
Continue current approach.
```

---

## 10. Code References

| Component | File Path | Key Function |
|-----------|-----------|--------------|
| Main Calculation | `src/lib/logic/blossomScore.ts` | `calculateBlossomScore()` |
| Normalizations | `src/lib/logic/conversions.ts` | `normalize*()` functions |
| Cycle Analysis | `src/lib/logic/cycle.ts` | `analyzeCycleState()` |
| Personalization | `src/lib/logic/blossomScore.ts` | Lines 148-165 (weight adjustment) |
| Pattern Detection | `src/lib/logic/narratives.ts` | `generatePatternStories()` |

---

## 11. Quick Validation Checklist

Use this to manually verify a calculation:

```
[ ] Step 1: Fetch last 7 days of logs
[ ] Step 2: For each symptom, calculate: 10 - severity
[ ] Step 3: Average symptom wellness, multiply by 10 → Symptom Factor
[ ] Step 4: For each day, check Sleep Gate (sleep <6h = FALSE)
[ ] Step 5: Count Self-Care days, divide by 7, multiply by 100 → Self-Care Factor
[ ] Step 6: Normalize mood/stress/anxiety/body image, average all 4, multiply by 10 → Emotional Factor
[ ] Step 7: Calculate cycle variability, score = 100 - variability×5 → Stability Factor
[ ] Step 8: Fetch user priorities, add 0.15 to corresponding factors
[ ] Step 9: Normalize weights to sum to 1.0
[ ] Step 10: Calculate: Σ(Factor × Weight)
[ ] Step 11: Clamp result to [0, 100]
```

---

## 12. Common Calculation Errors to Avoid

**Error 1: Forgetting to Invert**
- ❌ Wrong: `Symptom Factor = Average(raw acne severity)`
- ✅ Correct: `Symptom Factor = Average(10 - raw acne severity) × 10`

**Error 2: Missing the Sleep Gate**
- ❌ Wrong: `Self-Care = Average(sleep, exercise, diet)`
- ✅ Correct: `Self-Care = (Count days passing gate / 7) × 100`

**Error 3: Using Raw Weights**
- ❌ Wrong: `Score = (F1×0.40) + (F2×0.25) + (F3×0.25) + (F4×0.25)` (sums to 1.15)
- ✅ Correct: `Normalize first: 0.40/1.15 = 0.348`

**Error 4: Wrong Normalization Direction**
- ❌ Wrong: `Stress wellness = raw stress value`
- ✅ Correct: `Stress wellness = 10 - raw stress value` (higher stress = lower wellness)

---

**End of Quick Reference**

**For detailed analysis and validation results, see**: `BLOOM_SCORING_ANALYSIS_REPORT.md`
**For executive summary, see**: `ANALYSIS_EXECUTIVE_SUMMARY.md`
