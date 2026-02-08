# Chart Visibility Fix - Quick Guide

## What Was Fixed

The Bar and Radar charts weren't displaying due to missing data structure issues:

### Issues Resolved:
1. **Missing Energy Values**: Seed data didn't include energy metrics required for Metabolic category composite scores
2. **Cycle Regularity Bug**: Code was looking for `log.phase?.regular` but data structure uses `log.cyclePhase`
3. **Incomplete Composite Calculations**: Metrics needed proper fallback values

## How to See the Charts

### Option 1: Reset Demo Data (Recommended)

1. Click the **Settings** button in the top right (gear icon)
2. Scroll to **"Reset Demo Data"** (amber/yellow section)
3. Click **"Reset Data"** button
4. Page will reload with fresh 30-day demo data
5. Navigate to **Insights** tab
6. You should now see all three charts:
   - **Line Chart** (Velocity Trend with gradient)
   - **Radar Chart** (Holistic Balance with velocity arrows)
   - **Bar Chart** (Factor Analysis with fastest shift remark)

### Option 2: Manual Browser Reset

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Find **IndexedDB** → **BlossomDB**
4. Right-click → **Delete database**
5. Refresh the page
6. New seed data will load automatically

## What to Look For

### Charts Should Display:
- ✅ **Line Chart**: Shows composite score trends with velocity-based gradient shading
- ✅ **Radar Chart**: Shows 4 metrics per category with green/red directional arrows
- ✅ **Bar Chart**: Shows top 5 lifestyle factors with a "fastest positive shift" footer

### Category-Specific Metrics:

**Physical (Hyperandrogenism)**
- Composite: Acne + Hirsutism + Hair Loss
- Radar: Acne, Hirsutism, Hair Loss, Body Image

**Metabolic**
- Composite: Energy + Sleep Quality
- Radar: Energy, Sleep Quality, Fatigue, Cycle Regularity

**Emotional (Psychological)**
- Composite: Stress + Body Image + Mood
- Radar: Stress, Body Image, Anxiety, Mood

## Updated Seed Data

The new seed data includes:
- **30 days** of logs
- **Energy values** in customValues (2-9 range)
- Proper cycle phase tracking
- Varied lifestyle patterns for meaningful insights

## Verification

After reset, check:
1. All 3 charts render without errors
2. Velocity arrows appear on radar chart (if metrics changed >5%)
3. Bar chart shows "Fastest positive shift" footer (if positive correlations exist)
4. Line chart gradient intensity reflects velocity magnitude
5. Switch between Physical/Metabolic/Emotional categories - all should work

## Troubleshooting

If charts still don't show:
1. Open browser console (F12) and check for errors
2. Verify you're on the **Insights** tab (not Dashboard)
3. Try switching timeframe between 7D and 30D
4. Ensure demo data loaded: Settings → check "Total Logs" shows 30
