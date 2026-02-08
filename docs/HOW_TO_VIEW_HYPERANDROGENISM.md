# How to View Hyperandrogenism Insights

## Quick Start Guide

### Step 1: Navigate to Insights Tab
1. Open the Blossom app
2. Click the **"Insights"** tab in the navigation

### Step 2: Select Hyperandrogenism Tab
1. You'll see a horizontal tab menu with options: Weekly, **Hyperandrogenism**, Calendar, Badges, Patterns, Charts
2. Click the **"Hyperandrogenism"** button (has an Activity icon)

### Step 3: Generate Sample Data (First Time)
If you see "Not Enough Data":
1. Click the **"Generate Sample Data (60 days)"** button
2. Wait 1-2 seconds for data generation
3. The three charts will automatically appear

## What You'll See

### 📈 Chart 1: Acne Trend Line
- **Teal solid line**: Current 30-day period
- **Grey dotted line**: Previous 30-day period
- **Badge at top**: Shows velocity (↓ improving, ↑ worsening, ~ stable)
- Example: "↓0.8/week" means acne is improving by 0.8 points per week

### 📊 Chart 2: Lifestyle Factor Impact
- **Horizontal green bars**: Shows which lifestyle factors reduce acne most
- Factors analyzed:
  - Sleep Quality
  - Stress Management
  - Water Intake
  - Exercise
- Higher percentage = bigger positive impact

### 🎯 Chart 3: Symptom Radar Overview
- **Four axes**: Acne, Hirsutism, Hair Loss, Body Image
- **Teal polygon**: Current 30-day averages
- **Grey polygon**: Previous 30-day averages
- Compare multiple symptoms at once

## Sample Data Characteristics

The generated sample data shows:
- **Improving trend**: Symptoms gradually decrease over 30 days
- **Positive correlations**: Better sleep/exercise = lower symptoms
- **Realistic variation**: Natural day-to-day fluctuations
- **60 days total**: 30 days current + 30 days past for comparison

## Real Usage

Once you have real data:
1. Log daily using the Daily Log feature
2. Track acne, hirsutism, and hair loss scores (0-10)
3. Log lifestyle factors: water intake, exercise, sleep
4. After 7 days: Basic insights appear
5. After 30 days: Full trend comparison
6. After 60 days: Past vs current comparison

## Troubleshooting

**"I don't see the Hyperandrogenism tab"**
- Make sure you're on the Insights screen (not Home or Log)
- Scroll horizontally in the tab menu if needed

**"Charts are empty"**
- Click "Generate Sample Data" button
- Or log at least 7 days of real data

**"Factor Impact chart is missing"**
- Need at least 14 days of data
- Make sure lifestyle factors are logged (sleep, water, exercise)

**"Past period line is missing"**
- Need 60+ days of data to compare periods
- Current period will still show with velocity calculation

## Technical Details

**Data Source**: IndexedDB (Dexie) - all data is local
**Chart Library**: Chart.js with React wrappers
**Update Frequency**: Real-time on navigation
**Color Scheme**: Teal (current) vs Slate (past)
