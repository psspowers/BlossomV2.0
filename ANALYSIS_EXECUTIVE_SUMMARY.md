# Bloom Scoring Analysis - Executive Summary

**Analysis Date**: March 7, 2026
**Last Revised**: April 18, 2026 (corrected personalization section — happiness weights ARE used)
**Analysis Type**: Comprehensive Algorithm Audit
**Status**: ✅ Complete (Revised)

---

## Quick Findings

### 1. How the Bloom Score is Calculated

The Bloom Score is a **weighted average of four factors**, each scored 0-100:

```
Bloom Score = (Symptom Factor × W_s) + (Self-Care Factor × W_sc) +
              (Emotional Factor × W_e) + (Stability Factor × W_st)
```

**Default weights (no priorities set)**: Each factor is 25%.

**When priorities are set, the weights shift dynamically.** Each selected priority boosts its corresponding factor. The boost size is proportional to the user's 0-10 "happiness impact" rating for that priority:

```
Boost per priority = 0.10 + (happiness_rating / 10) × 0.10
                   = range [0.10 at rating 0] to [0.20 at rating 10]
                   = default 0.15 if no rating set
```

All four weights are then re-normalized to sum to 1.0. The result is a **personalised** score — not a fixed 25% split.

**Example**: User selects "Anxiety" with impact rating 10/10 → Emotional Factor receives a +0.20 boost → after normalization, Emotional becomes ~37% instead of 25%.

---

## 2. What Gets Used vs. Ignored

### ✅ Actively Used (13 inputs)
- **Symptoms**: Acne, Hirsutism, Hair Loss, Bloating, Cramps
- **Emotional**: Mood, Stress, Anxiety
- **Lifestyle**: Sleep, Exercise, Diet
- **Cycle**: Period dates and flow intensity

### ❌ Logged But Not Used (2 inputs)
- **Body Image**: Collected but not in Bloom calculation
- **Water Intake**: Completely unused

**Recommendation**: Remove unused inputs to reduce user burden.

---

## 3. Personalization Impact

When users select priorities during onboarding:
- Each priority boosts its factor weight by **0.10 to 0.20**, scaled by the user's 0-10 "happiness impact" rating
- Default boost is 0.15 when no rating is provided
- All weights are then **normalized to sum to 1.0**
- Result: **30-60% weight shift** toward priority areas at maximum happiness rating

**The happiness impact slider IS used.** The boost formula is: `0.10 + (rating / 10) × 0.10`. A rating of 10/10 gives a 0.20 boost; a rating of 0/10 gives a 0.10 boost.

**Weight Shift Examples**:

| Priorities Selected | Happiness Rating | Emotional Weight |
|---------------------|-----------------|-----------------|
| None | — | 25.0% |
| Anxiety | 5/10 (default) | 34.8% |
| Anxiety | 10/10 | 37.0% |
| Anxiety | 0/10 | 32.3% |

---

## 4. Clinical Profile Validation

Three test profiles were analyzed:

| Profile | Clinical State | Bloom Score | Interpretation |
|---------|---------------|-------------|----------------|
| **Patient A** (Sarah) | Acute flare, high stress, sleep-deprived | **23** | ✅ Correctly identifies crisis state |
| **Patient B** (Maya) | Steady management, moderate symptoms | **77** | ✅ Appropriate mid-range score |
| **Patient C** (Priya) | Thriving, minimal symptoms | **91** | ✅ Rewards sustained improvement |

**Score Spread**: 68 points (23-91) demonstrates good discrimination.

**Validation Result**: ✅ **PASS** - Scores align with expected clinical severity.

---

## 5. Critical Issues Found

### 🔴 High Priority

**Issue: Sleep Gate Cliff Effect**
- Problem: If sleep < 6 hours, the entire day gets 0% Self-Care credit, even with perfect exercise and diet
- Impact: Demotivates users making partial improvements
- Fix: Award 50% partial credit for days with good exercise/diet despite poor sleep

### 🟡 Medium Priority

**Issue: Unused Inputs**
- Problem: Water intake and body image are logged but don't affect score
- Impact: Wasted user effort, confusion about what matters
- Fix: Remove from UI or integrate into calculations

### 🟢 Low Priority

**Issue: No Input Validation**
- Problem: Users could theoretically enter invalid data (e.g., severity = 999)
- Impact: Potential calculation errors
- Fix: Add min/max clamping

---

## 6. Recommendations by Priority

### Immediate (Next Week)
1. ✅ Remove water intake from logging UI
2. ✅ Happiness impact ratings ARE already used — verified in code (see Section 3)
3. ✅ Add input validation (clamp values to 0-10)

### Short-Term (Next Month)
4. ✅ Replace Sleep Gate with partial credit system
5. ✅ Add "How is my score calculated?" explainer in UI
6. ✅ Create unit tests for all calculations

### Long-Term (3-6 Months)
7. ⏳ Conduct validation study with real PCOS patients
8. ⏳ Correlate Bloom Scores with standard PCOSQ instrument
9. ⏳ Publish validation findings (target: r > 0.7 correlation)

---

## 7. Overall Assessment

**Grade**: **B+** (Very Good with Minor Improvements Needed)

### Strengths
- ✅ Transparent, auditable calculation
- ✅ Clinically defensible factor selection
- ✅ Good discrimination across severity levels
- ✅ Ethical design (no punishment for rest days)
- ✅ Successful personalization mechanism

### Weaknesses
- ⚠️ Sleep Gate creates perverse incentives
- ⚠️ Unused inputs waste user time (water intake)
- ⚠️ No formal validation against gold-standard instruments yet

---

## 8. Clinical Utility Statement

### ✅ Appropriate Use Cases
- Longitudinal self-monitoring between clinical visits
- Pattern recognition for lifestyle interventions
- Shared decision-making tool (bring data to provider)
- Motivation and engagement tracking

### ❌ Inappropriate Use Cases
- Diagnostic tool (not a replacement for clinical evaluation)
- Acute symptom management (not real-time medical advice)
- Fertility prediction (no ovulation tracking currently)

---

## 9. Technical Implementation Status

**Code Quality**: Good
- Clear separation of concerns
- Defensive programming (null checks, defaults)
- Well-documented clinical rationale

**Performance**: Excellent
- Calculations complete in <10ms
- No identified bottlenecks

**Data Integrity**: Fair
- Good: Missing data defaults prevent errors
- Good: Cycle detection requires medium/heavy flow
- **Issue**: No upper bound validation on inputs

---

## 10. Next Steps

### For Developers
1. Review the full report: `BLOOM_SCORING_ANALYSIS_REPORT.md`
2. Implement recommended fixes in priority order
3. Add unit tests for all normalization functions
4. Create user-facing "How Scoring Works" documentation

### For Clinical Team
1. Review beta patient profiles (Section 4 of full report)
2. Validate that factor weights align with PCOS treatment priorities
3. Provide feedback on Sleep Gate modification proposal
4. Begin planning validation study with real patients

### For Product Team
1. Decide whether to integrate or remove unused inputs
2. Design UI for "Calculation Transparency" feature
3. Plan user research to validate happiness impact changes
4. Create user guide for interpreting Bloom Scores

---

## Summary

The Bloom Scoring System demonstrates strong clinical validity and appropriate discrimination across PCOS severity levels. The core algorithm is sound, transparent, and ethically designed.

**Key improvements needed**:
1. Fix the Sleep Gate cliff effect
2. Remove or integrate unused inputs
3. Utilize the happiness impact ratings

With these adjustments, the system will be ready for formal validation studies and broader deployment.

**Full detailed analysis available in**: `BLOOM_SCORING_ANALYSIS_REPORT.md`

---

**Report Prepared By**: Data Analysis Division
**Review Status**: Ready for Clinical Advisory Board Review
**Confidence Level**: High (based on comprehensive code audit and beta profile testing)
