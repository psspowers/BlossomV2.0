# Interactive Chart Filtering - User Guide

## New Feature: Click-to-Filter Insights

You can now click on individual metrics in the radar chart to see which specific lifestyle factors affect that particular symptom!

---

## How It Works

### Default View
- When you first select a category (Physical, Metabolic, or Emotional), the bar chart shows factors affecting the **overall composite score** of that category
- For example, "Physical" shows factors affecting the combined average of Acne + Hirsutism + Hair Loss

### Filtered View
1. **Click any label** on the radar chart (Acne, Hair Loss, Body Image, etc.)
2. The bar chart **instantly updates** to show factors affecting ONLY that specific metric
3. The selected metric is **highlighted in teal** and **bold** on the radar chart
4. A **filter badge** appears above the bar chart showing which metric is active
5. A **"Show All"** button lets you return to the composite view

---

## Visual Indicators

### On Radar Chart:
- **Selected metric label**: Teal color + bold font
- **Unselected labels**: White/gray color + normal font
- **Hover tooltip**: Shows "Click to filter factors" hint

### On Bar Chart:
- **Filter badge**: Teal background showing "Filtered by: [Metric Name]"
- **Updated title**: Changes from "overall" to specific metric
- **Show All button**: Appears when filter is active

---

## Example Usage

### Scenario: Physical Category

**Composite View (Default):**
- Bar chart shows: "Good Sleep improves overall Physical by 25%"
- Factors affect: Combined average of Acne + Hirsutism + Hair Loss

**Filtered View (Click "Acne"):**
- Bar chart shows: "Good Sleep improves Acne by 30%"
- Factors affect: ONLY Acne severity
- You can see specific correlations with acne flare-ups

**Filtered View (Click "Hair Loss"):**
- Bar chart shows: "Good Hydration improves Hair Loss by 20%"
- Factors affect: ONLY Hair Loss severity
- Different factors may emerge as more impactful

---

## Category-Specific Metrics

### Physical (Hyperandrogenism)
Clickable metrics:
- **Acne** - Track breakout triggers
- **Hirsutism** - Unwanted hair growth factors
- **Hair Loss** - Scalp hair shedding causes
- **Body Image** - Self-perception influences

### Metabolic
Clickable metrics:
- **Energy** - What boosts/drains energy
- **Sleep Quality** - Sleep effectiveness factors
- **Fatigue** - Tiredness contributors
- **Cycle Regularity** - Menstrual pattern stability

### Emotional (Psychological)
Clickable metrics:
- **Stress** - Stress level triggers
- **Body Image** - Self-perception factors
- **Anxiety** - Worry and tension causes
- **Mood** - Emotional state influences

---

## Tips

1. **Compare metrics** - Click through each spoke to see how different metrics respond to the same lifestyle factors
2. **Find your triggers** - Some symptoms may be more sensitive to specific factors
3. **Personalize your approach** - Use insights to prioritize which lifestyle changes to focus on
4. **Category switching** - Changing categories automatically resets the filter
5. **Timeframe changes** - Switching between 7D/30D maintains your current filter selection

---

## Technical Details

### How Correlations Are Calculated

**Composite Method (default):**
- Averages all category metrics together
- Compares days with good vs. poor lifestyle factors
- Shows overall category impact

**Single Metric Method (filtered):**
- Analyzes ONLY the selected symptom
- Compares days with good vs. poor lifestyle factors
- Shows targeted impact percentages

**Example:**
- Good Sleep days: Acne = 3, Hirsutism = 4, Hair Loss = 2
- Poor Sleep days: Acne = 7, Hirsutism = 6, Hair Loss = 5

**Composite:** Good Sleep improves Physical by ~40%
**Filtered (Acne):** Good Sleep improves Acne by ~57%
**Filtered (Hair Loss):** Good Sleep improves Hair Loss by ~60%

This reveals which specific symptoms are most responsive to each lifestyle factor!
