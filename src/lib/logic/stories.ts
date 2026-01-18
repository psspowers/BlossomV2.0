import { LogEntry, getLastNDays } from '../db';

function convertLifestyleToNumber(value: string | undefined, field: string): number {
  if (!value) return 0;

  if (field === 'sleep') {
    if (value === '<6h') return 5;
    if (value === '6-7h') return 6.5;
    if (value === '7-8h') return 7.5;
    if (value === '>8h') return 8.5;
  }
  if (field === 'exercise') {
    if (value === 'rest') return 1;
    if (value === 'light') return 3;
    if (value === 'moderate') return 6;
    if (value === 'intense') return 9;
  }
  return 0;
}

function convertAnxietyToNumber(value: string | undefined): number {
  if (!value) return 5;
  if (value === 'none') return 0;
  if (value === 'low') return 3;
  if (value === 'high') return 8;
  return 5;
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getEnergyScore(log: LogEntry): number {
  if (log.customValues?.energy !== undefined) {
    return log.customValues.energy;
  }
  const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
  return Math.min(10, sleepHours);
}

const MONASH_TIPS = [
  "Did you know? Consistent sleep helps regulate insulin levels.",
  "Research shows that regular movement can improve insulin sensitivity by up to 25%.",
  "Balanced meals with low-GI foods help stabilize blood sugar throughout the day.",
  "Chronic stress can worsen PCOS symptoms by increasing cortisol levels.",
  "Staying hydrated supports metabolic function and reduces inflammation.",
  "Strength training builds muscle, which naturally improves insulin resistance.",
  "Mindful eating practices can help reduce inflammation and support hormone balance.",
  "Quality sleep (7-9 hours) is essential for reproductive hormone regulation.",
  "Anti-inflammatory foods like leafy greens and berries support ovarian health.",
  "Regular physical activity helps reduce androgen levels naturally."
];

export interface PatternStory {
  story: string;
  category: 'sleep' | 'movement' | 'diet' | 'stress' | 'education';
  confidence: 'high' | 'medium' | 'low';
}

export async function generatePatternStories(logs?: LogEntry[]): Promise<PatternStory[]> {
  const allLogs = logs || await getLastNDays(30);

  if (allLogs.length < 5) {
    return [{
      story: "Keep logging daily to discover personalized insights about your body's patterns.",
      category: 'education',
      confidence: 'low'
    }];
  }

  const stories: PatternStory[] = [];

  const goodSleepLogs = allLogs.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    return sleepHours >= 7;
  });

  const badSleepLogs = allLogs.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    return sleepHours < 6;
  });

  if (goodSleepLogs.length >= 3 && badSleepLogs.length >= 3) {
    const goodSleepAnxiety = calculateAverage(
      goodSleepLogs.map(log => convertAnxietyToNumber(log.psych.anxiety))
    );
    const badSleepAnxiety = calculateAverage(
      badSleepLogs.map(log => convertAnxietyToNumber(log.psych.anxiety))
    );

    const anxietyDifference = ((badSleepAnxiety - goodSleepAnxiety) / badSleepAnxiety) * 100;

    if (anxietyDifference > 15) {
      stories.push({
        story: `On nights you sleep 7h+, your anxiety is noticeably lower. Rest is your medicine.`,
        category: 'sleep',
        confidence: 'high'
      });
    } else if (anxietyDifference < -15) {
      stories.push({
        story: `Interestingly, your anxiety patterns don't seem strongly linked to sleep duration. Let's explore other factors.`,
        category: 'sleep',
        confidence: 'medium'
      });
    }
  }

  const movementLogs = allLogs.filter(log => {
    const exercise = convertLifestyleToNumber(log.lifestyle.exercise, 'exercise');
    return exercise >= 3;
  });

  const restLogs = allLogs.filter(log => {
    const exercise = convertLifestyleToNumber(log.lifestyle.exercise, 'exercise');
    return exercise < 3;
  });

  if (movementLogs.length >= 3 && restLogs.length >= 3) {
    const movementEnergy = calculateAverage(movementLogs.map(getEnergyScore));
    const restEnergy = calculateAverage(restLogs.map(getEnergyScore));

    const energyDifference = ((movementEnergy - restEnergy) / restEnergy) * 100;

    if (energyDifference > 15) {
      stories.push({
        story: `Movement fuels you. You reported ${Math.round(energyDifference)}% more energy on active days.`,
        category: 'movement',
        confidence: 'high'
      });
    } else if (energyDifference < -15) {
      stories.push({
        story: `Your body is telling you it needs more rest. Energy levels are higher on lighter activity days.`,
        category: 'movement',
        confidence: 'high'
      });
    }
  }

  const balancedDietLogs = allLogs.filter(log => log.lifestyle.diet === 'balanced');
  const cravingsDietLogs = allLogs.filter(log => log.lifestyle.diet === 'cravings');

  if (balancedDietLogs.length >= 3 && cravingsDietLogs.length >= 3) {
    const balancedMood = calculateAverage(
      balancedDietLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );
    const cravingsMood = calculateAverage(
      cravingsDietLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );

    const moodDifference = ((balancedMood - cravingsMood) / cravingsMood) * 100;

    if (moodDifference > 10) {
      stories.push({
        story: `Balanced nutrition stabilizes your mood. You feel ${Math.round(moodDifference)}% better on those days.`,
        category: 'diet',
        confidence: 'high'
      });
    }
  }

  const lowStressLogs = allLogs.filter(log => log.psych.stress === 'low');
  const highStressLogs = allLogs.filter(log => log.psych.stress === 'high' || log.psych.stress === 'medium');

  if (lowStressLogs.length >= 3 && highStressLogs.length >= 3) {
    const lowStressSymptoms = calculateAverage(
      lowStressLogs.map(log => {
        const symptoms = [
          log.symptoms.acne || 0,
          log.symptoms.bloat || 0,
          log.symptoms.cramps || 0
        ];
        return calculateAverage(symptoms);
      })
    );

    const highStressSymptoms = calculateAverage(
      highStressLogs.map(log => {
        const symptoms = [
          log.symptoms.acne || 0,
          log.symptoms.bloat || 0,
          log.symptoms.cramps || 0
        ];
        return calculateAverage(symptoms);
      })
    );

    const symptomDifference = ((highStressSymptoms - lowStressSymptoms) / highStressSymptoms) * 100;

    if (symptomDifference > 15) {
      stories.push({
        story: `Lower stress days correlate with fewer physical symptoms. Your mind-body connection is strong.`,
        category: 'stress',
        confidence: 'high'
      });
    }
  }

  if (stories.length === 0) {
    const randomTip = MONASH_TIPS[Math.floor(Math.random() * MONASH_TIPS.length)];
    stories.push({
      story: randomTip,
      category: 'education',
      confidence: 'low'
    });
  }

  return stories;
}

export async function generatePrimaryStory(logs?: LogEntry[]): Promise<string> {
  const stories = await generatePatternStories(logs);
  const highConfidenceStories = stories.filter(s => s.confidence === 'high');

  if (highConfidenceStories.length > 0) {
    return highConfidenceStories[0].story;
  }

  return stories[0].story;
}
