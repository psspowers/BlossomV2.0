import { LogEntry, getLastNDays, getOrCreateSettings } from '../db';
import {
  normalizeSleep,
  normalizeMood,
  normalizeSymptom,
  normalizeExercise,
  normalizeStress,
  normalizeAnxiety,
  calculateChange
} from './conversions';

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getEnergyScore(log: LogEntry): number {
  if (log.customValues?.energy !== undefined) {
    return log.customValues.energy;
  }
  const sleepScore = normalizeSleep(log.lifestyle.sleep);
  return (sleepScore / 10) * 5;
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
  sampleSize?: number;
  badge?: string;
  priorityScore?: number;
  source?: 'personal' | 'guideline';
}

export async function generatePatternStories(logs?: LogEntry[]): Promise<PatternStory[]> {
  const allLogs = logs || await getLastNDays(30);

  if (allLogs.length < 5) {
    return [{
      story: "Keep logging daily to discover personalized insights about your body's patterns.",
      category: 'education',
      confidence: 'low',
      source: 'guideline'
    }];
  }

  const settings = await getOrCreateSettings();
  const priorities = settings.priorities || [];
  const happinessWeights = settings.happinessWeights || {};

  function calculatePriorityScore(relatedPriorities: string[]): number {
    let score = 0;
    for (const priority of relatedPriorities) {
      if (priorities.includes(priority as never)) {
        score += (happinessWeights[priority] || 5);
      }
    }
    return score;
  }

  const stories: PatternStory[] = [];

  const goodSleepLogs = allLogs.filter(log => normalizeSleep(log.lifestyle.sleep) >= 8);
  const badSleepLogs = allLogs.filter(log => normalizeSleep(log.lifestyle.sleep) <= 6);

  if (goodSleepLogs.length >= 3 && badSleepLogs.length >= 3) {
    const goodSleepAnxiety = calculateAverage(
      goodSleepLogs.map(log => normalizeAnxiety(log.psych.anxiety))
    );
    const badSleepAnxiety = calculateAverage(
      badSleepLogs.map(log => normalizeAnxiety(log.psych.anxiety))
    );

    const anxietyChange = calculateChange(goodSleepAnxiety, badSleepAnxiety);

    if (anxietyChange > 10) {
      const sampleSize = goodSleepLogs.length + badSleepLogs.length;
      stories.push({
        story: `On nights you sleep 7h+, your calm is ${Math.round(anxietyChange)}% stronger. Rest is your medicine.`,
        category: 'sleep',
        confidence: sampleSize >= 12 ? 'high' : 'medium',
        sampleSize,
        badge: sampleSize >= 12 ? `based on ${sampleSize} days` : 'early pattern',
        priorityScore: calculatePriorityScore(['sleep_fatigue', 'mood_energy', 'anxiety']),
        source: 'personal'
      });
    } else if (anxietyChange < -10) {
      const sampleSize = goodSleepLogs.length + badSleepLogs.length;
      stories.push({
        story: `Your anxiety doesn't seem tied to sleep length. Other rhythms may be shaping it, let's keep listening.`,
        category: 'sleep',
        confidence: 'medium',
        sampleSize,
        badge: `based on ${sampleSize} days`,
        priorityScore: calculatePriorityScore(['sleep_fatigue', 'mood_energy']),
        source: 'personal'
      });
    }
  }

  const movementLogs = allLogs.filter(log => normalizeExercise(log.lifestyle.exercise) >= 7);
  const restLogs = allLogs.filter(log => normalizeExercise(log.lifestyle.exercise) <= 5);

  if (movementLogs.length >= 3 && restLogs.length >= 3) {
    const movementEnergy = calculateAverage(movementLogs.map(getEnergyScore));
    const restEnergy = calculateAverage(restLogs.map(getEnergyScore));

    const energyChange = restEnergy > 0 ? ((movementEnergy - restEnergy) / 5) * 100 : 0;

    if (energyChange > 10) {
      const sampleSize = movementLogs.length + restLogs.length;
      stories.push({
        story: `Movement creates energy. You log ${Math.round(energyChange)}% more vitality on active days.`,
        category: 'movement',
        confidence: sampleSize >= 12 ? 'high' : 'medium',
        sampleSize,
        badge: sampleSize >= 12 ? `based on ${sampleSize} days` : 'early pattern',
        priorityScore: calculatePriorityScore(['mood_energy', 'weight_metabolic', 'sleep_fatigue']),
        source: 'personal'
      });
    } else if (energyChange < -10) {
      const sampleSize = movementLogs.length + restLogs.length;
      stories.push({
        story: `Your body is asking for rest, energy runs ${Math.abs(Math.round(energyChange))}% higher on gentler days.`,
        category: 'movement',
        confidence: sampleSize >= 12 ? 'high' : 'medium',
        sampleSize,
        badge: sampleSize >= 12 ? `based on ${sampleSize} days` : 'early pattern',
        priorityScore: calculatePriorityScore(['mood_energy', 'sleep_fatigue']),
        source: 'personal'
      });
    }
  }

  const balancedDietLogs = allLogs.filter(log => log.lifestyle.diet === 'balanced');
  const cravingsDietLogs = allLogs.filter(log => log.lifestyle.diet === 'cravings');

  if (balancedDietLogs.length >= 3 && cravingsDietLogs.length >= 3) {
    const balancedMood = calculateAverage(
      balancedDietLogs.map(log => normalizeMood(typeof log.psych.mood === 'number' ? log.psych.mood : undefined))
    );
    const cravingsMood = calculateAverage(
      cravingsDietLogs.map(log => normalizeMood(typeof log.psych.mood === 'number' ? log.psych.mood : undefined))
    );

    const moodChange = calculateChange(balancedMood, cravingsMood);

    if (moodChange > 10) {
      const sampleSize = balancedDietLogs.length + cravingsDietLogs.length;
      stories.push({
        story: `Balanced nutrition steadies your mood, you feel ${Math.round(moodChange)}% brighter on those days.`,
        category: 'diet',
        confidence: sampleSize >= 12 ? 'high' : 'medium',
        sampleSize,
        badge: sampleSize >= 12 ? `based on ${sampleSize} days` : 'early pattern',
        priorityScore: calculatePriorityScore(['mood_energy', 'weight_metabolic']),
        source: 'personal'
      });
    }
  }

  const lowStressLogs = allLogs.filter(log => normalizeStress(log.psych.stress) >= 8);
  const highStressLogs = allLogs.filter(log => normalizeStress(log.psych.stress) <= 5);

  if (lowStressLogs.length >= 3 && highStressLogs.length >= 3) {
    const lowStressSymptoms = calculateAverage(
      lowStressLogs.map(log => calculateAverage([
        normalizeSymptom(log.symptoms.acne),
        normalizeSymptom(log.symptoms.bloat),
        normalizeSymptom(log.symptoms.cramps)
      ]))
    );

    const highStressSymptoms = calculateAverage(
      highStressLogs.map(log => calculateAverage([
        normalizeSymptom(log.symptoms.acne),
        normalizeSymptom(log.symptoms.bloat),
        normalizeSymptom(log.symptoms.cramps)
      ]))
    );

    const symptomChange = calculateChange(lowStressSymptoms, highStressSymptoms);

    if (symptomChange > 10) {
      const sampleSize = lowStressLogs.length + highStressLogs.length;
      stories.push({
        story: `Calmer days ease your body, symptoms soften by ${Math.round(symptomChange)}% when stress is low.`,
        category: 'stress',
        confidence: sampleSize >= 12 ? 'high' : 'medium',
        sampleSize,
        badge: sampleSize >= 12 ? `based on ${sampleSize} days` : 'early pattern',
        priorityScore: calculatePriorityScore(['mood_energy', 'skin_hair', 'pain_cramps', 'anxiety']),
        source: 'personal'
      });
    }
  }

  if (stories.length === 0) {
    const dayIndex = new Date().getDate() % MONASH_TIPS.length;
    stories.push({
      story: MONASH_TIPS[dayIndex],
      category: 'education',
      confidence: 'low',
      priorityScore: 0,
      source: 'guideline'
    });
  }

  stories.sort((a, b) => {
    if (a.confidence === 'high' && b.confidence !== 'high') return -1;
    if (b.confidence === 'high' && a.confidence !== 'high') return 1;
    return (b.priorityScore || 0) - (a.priorityScore || 0);
  });

  return stories;
}

export async function generatePrimaryStory(logs?: LogEntry[]): Promise<PatternStory> {
  const stories = await generatePatternStories(logs);
  const highConfidenceStories = stories.filter(s => s.confidence === 'high');

  if (highConfidenceStories.length > 0) {
    return highConfidenceStories[0];
  }

  return stories[0];
}
