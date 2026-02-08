# Hyperandrogenism Insights - Implementation Overview

## Overview
A comprehensive analytics system for tracking hyperandrogenism symptoms (acne, hirsutism, hair loss) with velocity analysis, lifestyle factor correlations, and multi-dimensional comparisons.

## 1. Database Schema Updates

### Enhanced DailyLog Interface (`src/lib/db.ts`)
```typescript
interface DailyLog {
  // Existing hyperandrogenism tracking
  hyperandrogenism: {
    hirsutism: number;  // 0-10
    acne: number;       // 0-10
    hairLoss: number;   // 0-10
  };

  // NEW: Lifestyle tracking for correlations
  lifestyle?: {
    waterIntake: number;       // glasses per day
    exerciseMinutes: number;   // minutes per day
    sleepHours: number;        // hours per day
  };

  // NEW: Custom user-defined values
  customValues?: Record<string, number>;
}
```

## 2. Velocity & Correlation Analysis

### Velocity Calculation (`src/lib/velocityAnalysis.ts`)
```typescript
calculateVelocity(currentData: number[], pastData: number[]): VelocityResult
```
- Compares current 30-day period vs previous 30-day period
- Calculates linear regression slope
- Returns trend direction: 'improving' | 'stable' | 'worsening'
- Provides weekly rate of change

### Factor Impact Analysis
```typescript
calculateFactorImpact(
  logs: DailyLog[],
  symptom: 'acne' | 'hirsutism' | 'hairLoss',
  factor: 'sleepQuality' | 'stress' | 'waterIntake' | 'exerciseMinutes',
  threshold: number
): FactorImpact
```
- Splits logs into "high factor" and "low factor" groups
- Calculates average symptom scores for each group
- Returns improvement percentage when factor is optimized

## 3. UI Components

### Three Chart Visualizations (`src/screens/HyperandrogenismInsights.tsx`)

#### A. Trend Line Chart
- **Current Period**: Teal line (`rgb(45, 212, 191)`) with subtle fill
- **Past Period**: Dotted grey line (`rgb(71, 85, 105)`)
- **Velocity Badge**: Shows weekly rate of change
  - Green/Teal: Improving trend (↓)
  - Red: Worsening trend (↑)
  - Grey: Stable trend (~)
- Tracks: Acne severity over 30 days

#### B. Lifestyle Factor Bar Chart
- **Horizontal bars** showing improvement percentage
- **Green bars**: Positive impact (symptom reduction)
- **Red bars**: Negative impact (symptom increase)
- Factors analyzed:
  - Sleep Quality (threshold: 7+)
  - Stress Management (threshold: <5)
  - Water Intake (threshold: 8+ glasses)
  - Exercise (threshold: 30+ minutes)

#### C. Radar Chart (Multi-Symptom Overview)
- **4 Axes**: Acne, Hirsutism, Hair Loss, Body Image
- **Current Period**: Solid teal polygon
- **Past Period**: Dotted grey polygon
- Provides holistic view of all hyperandrogenism symptoms

## 4. Design System

### Dark Glass Aesthetic
```css
- Background: gradient from slate-900/40 via slate-800/30 to slate-900/40
- Backdrop blur: backdrop-blur-xl
- Border: slate-700/50
- Shadow: 0 8px 32px rgba(0,0,0,0.4)
- Inner highlight: inset shadow with white/5% top, black/30% bottom
- Liquid gradient overlay: teal-500/5 to purple-500/5
```

### Color Palette
- **Current/Good**: `rgb(45, 212, 191)` (teal-400)
- **Past/Neutral**: `rgb(71, 85, 105)` (slate-600)
- **Positive Impact**: `rgb(34, 197, 94)` (green-500)
- **Negative Impact**: `rgb(239, 68, 68)` (red-500)
- **Text Primary**: `rgb(226, 232, 240)` (slate-100)
- **Text Secondary**: `rgb(148, 163, 184)` (slate-400)

### Chart Configuration
- **No heavy grid lines**: Minimal grid at 15% opacity
- **Subtle tooltips**: Dark glass tooltip with teal border
- **Smooth curves**: Bezier tension 0.4
- **Point-on-hover only**: No permanent data points
- **Legend**: Top position, using point styles

## 5. Integration

### InsightsScreen Navigation
Added new tab between "Weekly" and "Calendar":
```tsx
<button>
  <Activity className="w-4 h-4" />
  Hyperandrogenism
</button>
```

## 6. Data Requirements

### Minimum Data Thresholds
- **7 days**: Minimum to display component
- **14 days**: Required for factor impact analysis
- **30 days**: Full trend comparison
- **60 days**: Past period comparison

### Empty States
- Shows info card when < 7 days logged
- Gracefully handles missing past data
- Filters factors with insufficient sample size (< 3 logs per group)

## 7. Key Features

### Intelligence
- Linear regression for trend detection
- Statistical comparison across time periods
- Multi-factor correlation analysis
- Automatic threshold-based segmentation

### User Experience
- Real-time data updates from Dexie DB
- Responsive chart sizing
- Accessible tooltips with formatted values
- Color-coded trend indicators
- Professional medical aesthetic

### Performance
- Memoized calculations with useMemo
- Efficient array operations
- Optimized re-renders
- Lazy loading via tab navigation

## 8. Future Enhancements (Optional)

### Potential Additions
1. **Symptom Selection**: Allow users to choose which symptom to analyze (acne/hirsutism/hairLoss)
2. **Custom Factors**: Let users define their own lifestyle factors to correlate
3. **Time Period Selector**: Toggle between 7-day, 30-day, 90-day views
4. **Export Insights**: Generate PDF reports with charts
5. **Predictive Modeling**: ML-based symptom forecasting
6. **Goal Setting**: Set target levels and track progress
7. **Medication Tracking**: Correlate symptoms with medication adherence
8. **Trigger Identification**: Automatic detection of symptom spike causes

## 9. File Structure

```
src/
├── lib/
│   ├── db.ts                      # Enhanced with lifestyle & customValues
│   └── velocityAnalysis.ts        # NEW: Velocity & factor calculations
├── screens/
│   ├── HyperandrogenismInsights.tsx  # NEW: Main insights component
│   └── InsightsScreen.tsx         # Updated with new tab
```

## 10. Technical Stack

- **Database**: Dexie (IndexedDB wrapper)
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: Tailwind CSS with custom glass morphism
- **Icons**: Lucide React
- **State**: React hooks (useState, useEffect, useMemo)
- **TypeScript**: Full type safety

---

## Usage Example

1. Navigate to **Insights** tab
2. Click **Hyperandrogenism** button
3. View three synchronized charts:
   - Trend analysis with velocity badge
   - Lifestyle factor impact rankings
   - Multi-symptom radar comparison
4. Hover over charts for detailed tooltips
5. Interpret insights to optimize lifestyle factors
