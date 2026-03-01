# Clinical System Report: The Blossom Wellness Engine

**Subject**: Algorithm Methodology, Scoring Logic, and Interpretation Guide
**Version**: 1.0 (MVP)
**Target Pathology**: Polycystic Ovary Syndrome (PCOS) & Comorbidities
**Last Updated**: March 2026

---

## 1. Executive Summary

The **Blossom Score** is a longitudinal composite index (0–100) designed to quantify the bio-psycho-social burden of PCOS. Unlike traditional cycle trackers that focus primarily on fertility, Blossom utilizes a multi-domain weighted algorithm to visualize the interplay between physical symptoms, metabolic hygiene, and emotional well-being.

The system operates on a **"Normalize-First" architecture**: heterogeneous inputs (Likert scales, hours of sleep, categorical mood states) are first converted into a unified **Wellness Scale (0–10)**, where **higher always equals better health**, before being aggregated into the final score.

---

## 2. Scoring Methodology

The composite score is derived from four orthogonal factors, calculated over a **7-day rolling window**.

### 2.1 The Four Factors

| Factor | Base Weight | Clinical Definition |
|--------|-------------|---------------------|
| **Symptom Factor** | 0.25 | **Physical Burden**. Derived from the inverse severity of 5 key Rotterdam/Hyperandrogenic symptoms: Acne, Hirsutism, Alopecia, Bloating, and Pelvic Pain. <br>(Formula: `10 - Severity`). |
| **Self-Care Factor** | 0.25 | **Metabolic Consistency**. Measures the frequency of beneficial behaviors (Sleep, Movement, Diet), not peak intensity. It tracks "Days with adequate metabolic support." |
| **Emotional Factor** | 0.25 | **Psychological Wellness**. A composite average of Mood, Stress (inverted), and Anxiety (inverted). Validates the mental health burden of PCOS. |
| **Stability Factor** | 0.25 | **Cycle Regularity**. Derived from an analysis of the patient's full cycle history. Returns 50 (Neutral) if insufficient data exists. |

### 2.2 The Personalization Engine (Dynamic Weighting)

During onboarding, patients select specific priorities (e.g., "Mental Health" or "Weight Management").

**Mechanism**: The algorithm adds a **+0.15 coefficient** to the priority's corresponding factor.

**Normalization**: All weights are re-calculated to ensure they sum to exactly **1.0**.

**Result**: The final score reflects the patient's specific quality-of-life goals, not just a generic medical standard.

### 2.3 The "Sleep Gate" (Clinical Guardrail)

To prevent the system from rewarding "burnout" behavior, the Self-Care algorithm enforces a strict floor on sleep:

**Rule**: If Sleep < 6 hours (Depleted State), the day **cannot** count as a Self-Care day, regardless of exercise intensity or diet quality.

**Rationale**: Sleep deprivation induces insulin resistance and cortisol spikes, negating the benefits of other lifestyle interventions.

---

## 3. Chart Interpretation

### 3.1 The Wellness Radar (5-Axis Spider Chart)

A snapshot of the patient's balance **today**.

- **Axes**: Physical, Metabolic, Emotional, Cycle, Lifestyle.
- **Scale**: 0 (Critical) to 10 (Optimal).
- **Baseline**: The chart includes a dashed "Neutral" line at 5.0.

**Interpretation**:
- **Asymmetry**: A chart expanding toward "Metabolic" but collapsing on "Emotional" indicates the patient is adhering to lifestyle protocols but suffering psychological distress.

### 3.2 Trend Velocity (Longitudinal Analysis)

A metric determining the **rate of change** between the current week and the previous week.

**Formula**: `(Current Avg - Previous Avg) / 10 (Full Scale) * 100`

**Why this formula?** It prevents mathematical exaggeration. Improving from a score of 2 to 4 is a **20% gain in wellness** (2 points on a 10-point scale), not a "100% increase," which would be misleadingly optimistic.

**Threshold**: Changes smaller than **±5%** are filtered as "Stable" (Noise).

#### Critical Note on Polarity:

- The **Trend Line Chart** plots **Raw Severity** (for intuitive reading)
- The **Velocity Badge** displays **Wellness Change**

**Example**:
- **Stress Chart**: Line goes UP (Higher Stress).
- **Velocity Text**: "Worsening (-20%)" (Wellness Score dropped).
- **Clinical Takeaway**: Visual direction and mathematical sign both indicate a negative outcome.

---

## 4. Golden Rules of the Algorithm

### Rule 1: "Rest is Productive"

A **"Rest Day"** (No exercise) is scored as **Neutral (5/10)**, not Failure (0/10). This prevents the "all-or-nothing" mindset that leads to abandonment of therapy.

### Rule 2: Missing Data Strategy (Passive Logging)

**Numeric Symptoms**: Undefined = **10 (Perfect)**. If a patient does not touch the "Acne" slider, the system assumes the symptom is absent.

**Categorical Lifestyle**: Undefined = **5 (Neutral)**. If a patient skips the "Diet" question, the system assumes average behavior, avoiding penalties for administrative fatigue.

### Rule 3: Sleep Optimization

- **7–9 Hours**: Scored as **Optimal (9/10)**.
- **>9 Hours**: Scored as **Maintenance (9/10)**. We do not penalize hypersomnia, acknowledging it is often a symptom of the condition itself.

---

## 5. Detailed Factor Calculations

### 5.1 Symptom Factor (Physical Burden)

**Source Metrics**:
- Acne (0–10 severity scale)
- Hirsutism (0–10 severity scale)
- Alopecia (0–10 severity scale)
- Bloating (0–10 severity scale)
- Pelvic Pain (0–10 severity scale)

**Conversion to Wellness**:
```
Wellness Score = 10 - Severity
```

**Aggregation**:
```
Symptom Factor = Average of all inverted symptom scores
```

**Missing Data Handling**: If a symptom is not logged, it defaults to **10 (no symptom)**.

**Clinical Justification**: The Rotterdam criteria require at least 2 of 3 findings (hyperandrogenism, ovulatory dysfunction, polycystic ovaries). These five symptoms represent the most commonly reported manifestations of hyperandrogenism and metabolic dysfunction in PCOS.

---

### 5.2 Self-Care Factor (Metabolic Consistency)

**Source Metrics**:
- Sleep (hours per night)
- Movement (categorical: Rest, Light, Moderate, Intense)
- Diet (categorical: Poor, Fair, Good, Excellent)

**Sleep Scoring**:
```
< 4 hours:  Score = 2 (Critical)
4–6 hours:  Score = 4 (Depleted)
6–7 hours:  Score = 7 (Maintenance)
7–9 hours:  Score = 9 (Optimal)
> 9 hours:  Score = 9 (Maintenance, not penalized)
```

**Movement Scoring**:
```
Rest Day:    Score = 5 (Neutral, not failure)
Light:       Score = 6
Moderate:    Score = 8
Intense:     Score = 9
```

**Diet Scoring**:
```
Poor:        Score = 2
Fair:        Score = 5
Good:        Score = 7
Excellent:   Score = 9
```

**The "Sleep Gate"**:
```
IF Sleep < 6 hours THEN
  Self-Care Day = FALSE
  (Exercise and diet scores ignored for that day)
ELSE
  Self-Care Day = TRUE
  Daily Score = Average(Sleep, Movement, Diet)
END IF
```

**Aggregation**:
```
Self-Care Factor = (Number of Self-Care Days / 7) * 10
```

**Clinical Justification**: PCOS is fundamentally a metabolic disorder. Consistency of metabolic support (regular sleep, movement, nutrition) is more clinically relevant than peak performance on isolated days.

---

### 5.3 Emotional Factor (Psychological Wellness)

**Source Metrics**:
- Mood (categorical: Terrible, Poor, Okay, Good, Great)
- Stress (0–10 severity scale)
- Anxiety (0–10 severity scale)

**Mood Scoring**:
```
Terrible:    Score = 1
Poor:        Score = 3
Okay:        Score = 5
Good:        Score = 7
Great:       Score = 9
```

**Stress & Anxiety Conversion**:
```
Wellness Score = 10 - Severity
```

**Aggregation**:
```
Emotional Factor = Average(Mood, 10-Stress, 10-Anxiety)
```

**Missing Data Handling**: Defaults to **5 (Neutral)**.

**Clinical Justification**: PCOS patients experience depression and anxiety at 3x the rate of the general population. The emotional burden is not a "soft" symptom—it is a core feature of the syndrome that deserves equal weight in quality-of-life assessment.

---

### 5.4 Stability Factor (Cycle Regularity)

**Source Data**: Full cycle history (date of each period start, flow intensity).

**Algorithm**:
1. Extract all cycle lengths (days between periods)
2. Calculate mean cycle length
3. Calculate standard deviation of cycle lengths
4. Compute coefficient of variation: `CV = (StdDev / Mean) * 100`

**Scoring**:
```
CV < 10%:    Score = 9 (Regular, Rotterdam-negative for this criterion)
CV 10–20%:   Score = 7 (Mild irregularity)
CV 20–30%:   Score = 5 (Moderate irregularity)
CV 30–40%:   Score = 3 (Severe irregularity, Rotterdam-positive)
CV > 40%:    Score = 1 (Extreme irregularity)

Insufficient data (<2 cycles): Score = 5 (Neutral, not penalized)
```

**Clinical Justification**: Oligomenorrhea (irregular periods) is one of the Rotterdam diagnostic criteria. A coefficient of variation > 30% indicates clinically significant menstrual dysfunction.

---

## 6. Composite Score Calculation

### 6.1 Base Formula (No Personalization)

```
Blossom Score = (
  0.25 * Symptom Factor +
  0.25 * Self-Care Factor +
  0.25 * Emotional Factor +
  0.25 * Stability Factor
) * 10
```

**Scale**: 0–100

### 6.2 Personalized Formula (With Priority Weighting)

**Example**: Patient selects "Mental Health" as priority.

**Step 1 - Apply Boost**:
```
Emotional Weight = 0.25 + 0.15 = 0.40
```

**Step 2 - Normalize**:
```
Total = 0.25 + 0.25 + 0.40 + 0.25 = 1.15
Normalized Emotional Weight = 0.40 / 1.15 = 0.348
Normalized Other Weights = 0.25 / 1.15 = 0.217 each
```

**Step 3 - Calculate**:
```
Blossom Score = (
  0.217 * Symptom Factor +
  0.217 * Self-Care Factor +
  0.348 * Emotional Factor +
  0.217 * Stability Factor
) * 10
```

---

## 7. Data Quality & Validation

### 7.1 Minimum Data Requirements

| Component | Minimum Data | Fallback Behavior |
|-----------|--------------|-------------------|
| Symptom Factor | 0 symptoms logged | Assumes **10** (no symptoms) |
| Self-Care Factor | 0 days logged | Assumes **5** (neutral behavior) |
| Emotional Factor | 0 entries | Assumes **5** (neutral wellness) |
| Stability Factor | < 2 cycles | Returns **5** (neutral, not scored) |
| Blossom Score | < 7 days of data | Returns **NULL** (insufficient data) |

### 7.2 Data Integrity Checks

**Cycle Start Detection**:
- A new cycle is triggered **only** when the user logs flow as "Medium" or "Heavy"
- Spotting does **not** trigger a new cycle
- Minimum cycle length: 21 days (shorter periods are flagged as potential data entry errors)

**Outlier Filtering**:
- Sleep > 16 hours: Flagged but not rejected (may indicate depression/fatigue)
- Cycle length < 21 or > 90 days: Flagged for manual review

---

## 8. Limitations & Clinical Disclaimers

### 8.1 Known Limitations

1. **Self-Reporting Bias**: Validity depends on honest patient inputs. Over-reporting or under-reporting of symptoms can skew results.

2. **Linear Model**: The scoring assumes a linear relationship between symptom reduction and quality of life. In reality, some symptoms (e.g., alopecia) may have disproportionate psychological impact.

3. **Cycle Prediction**: Differentiating "Spotting" from "Menses" relies on the patient accurately tagging flow intensity (Medium/Heavy triggers a new cycle).

4. **Correlation, Not Causation**: Pattern recognition (e.g., "Stress correlates with acne flares") does not establish causal relationships.

5. **No Diagnostic Capability**: This is a **self-monitoring tool** for engagement and pattern recognition. It is **not** a diagnostic instrument for acute care.

### 8.2 Clinical Context

**This tool is designed for**:
- Longitudinal self-monitoring between clinical visits
- Pattern recognition for shared decision-making
- Motivation and engagement in lifestyle management
- Export of structured data for provider review

**This tool is NOT designed for**:
- Diagnosing PCOS (requires clinical examination + labs)
- Replacing medical advice
- Acute symptom management (e.g., severe pelvic pain → seek immediate care)
- Fertility tracking (no ovulation prediction)

### 8.3 Ethical Considerations

**Compassionate Design**:
- The algorithm intentionally avoids "punishment" for missing data or rest days
- Terminology is body-positive ("Resting Season" vs "Failure State")
- No gamification or streak mechanics that induce guilt

**Privacy First**:
- All data stored locally (IndexedDB)
- No cloud sync, no analytics, no third-party trackers
- Clinical Snapshot export is user-initiated and encrypted

---

## 9. Clinical Validation Roadmap

### 9.1 Current Status (MVP)

- ✅ Algorithm implemented and tested with synthetic data
- ✅ Face validity: Scores correlate with expected clinical patterns
- ⚠️ **Not yet validated** against standard PCOS quality-of-life instruments (PCOSQ, MFQOLQ)

### 9.2 Planned Validation (Phase 3)

**Goal**: Establish concurrent validity with validated instruments.

**Methodology**:
1. Recruit 50–100 PCOS patients
2. Administer Blossom app for 3 months
3. Administer PCOSQ and MFQOLQ at baseline and endpoint
4. Calculate correlation between Blossom Score and validated instrument scores
5. Target: Pearson's r > 0.7 (strong correlation)

**Timeline**: Q3–Q4 2026 (subject to IRB approval and funding)

---

## 10. References & Further Reading

### Clinical Background

1. **Rotterdam ESHRE/ASRM Consensus (2004)**: Diagnostic criteria for PCOS
2. **Teede et al. (2018)**: International Evidence-Based Guideline for PCOS
3. **Cooney et al. (2017)**: "High prevalence of moderate and severe depressive and anxiety symptoms in PCOS" (Hum Reprod)

### Quality of Life Instruments

4. **Cronin et al. (1998)**: PCOSQ (Polycystic Ovary Syndrome Questionnaire)
5. **Jones et al. (2004)**: MFQOLQ (Modified PCOS Quality of Life Questionnaire)

### Metabolic Management

6. **Moran et al. (2013)**: "Lifestyle changes in women with PCOS" (Cochrane Review)
7. **Szczuko et al. (2021)**: "Nutrition Strategy and Life Style in PCOS" (Nutrients)

---

## 11. Appendix: Code Implementation References

For developers implementing or auditing this system:

| Component | File Path | Key Function |
|-----------|-----------|--------------|
| Blossom Score | `src/lib/logic/blossomScore.ts` | `calculateBlossomScore()` |
| Factor Calculations | `src/lib/logic/blossomScore.ts` | `calculateFactors()` |
| Wellness Conversions | `src/lib/logic/conversions.ts` | `toWellness*()` functions |
| Trend Velocity | `src/lib/logic/velocity.ts` | `calculateVelocity()` |
| Cycle Detection | `src/lib/logic/cycle.ts` | `detectCycleStart()` |
| Personalization | `src/lib/logic/blossomScore.ts` | `applyPriorityWeights()` |
| Pattern Stories | `src/lib/logic/stories.ts` | `generatePatternStories()` |

**Technical Documentation**: See `docs/TECHNICAL_MANUAL.md` → Section 6: Soul Injection Core Logic

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial clinical system report (MVP scope) |

---

## 13. Contact & Contributions

**Clinical Advisors**: [To be determined]
**Lead Developer**: [Project maintainer]
**Feedback**: For clinical feedback or validation proposals, please open an issue in the project repository.

---

**End of Clinical System Report**

*This document is intended for healthcare professionals, clinical researchers, and technical auditors. For user-facing documentation, see `docs/FEATURES.md` and `README.md`.*
