import { LogEntry, getLastNDays, db } from '../db';
import { analyzeCycleState } from './cycle';
import {
  normalizeSymptom,
  normalizeSleep,
  normalizeExercise,
  normalizeDiet,
  normalizeMood,
  normalizeStress,
  normalizeAnxiety
} from './conversions';

export interface BlossomScoreResult {
  score: number;
  symptomFactor: number;
  selfCareFactor: number;
  emotionalFactor: number;
  stabilityFactor: number;
  activeWeights: {
    symptom: number;
    selfCare: number;
    emotional: number;
    stability: number;
  };
}

export interface BlossomScoreBreakdown {
  total: number;
  componentA: number;
  componentB: number;
  componentC: number;
  details: {
    symptomImprovement: string;
    selfCareConsistency: string;
    emotionalWellbeing: string;
  };
}

const PRIORITY_MAP: Record<string, keyof Omit<BlossomScoreResult, 'score' | 'activeWeights'>> = {
  'mood_energy': 'emotionalFactor',
  'anxiety': 'emotionalFactor',
  'body_image': 'emotionalFactor',
  'weight_metabolic': 'selfCareFactor',
  'sleep_fatigue': 'selfCareFactor',
  'acne': 'symptomFactor',
  'hirsutism': 'symptomFactor',
  'hair_loss': 'symptomFactor',
  'bloating': 'symptomFactor',
  'cramps': 'symptomFactor',
  'pain_cramps': 'symptomFactor',
  'skin_hair': 'symptomFactor',
  'cycle_regularity': 'stabilityFactor',
  'fertility': 'stabilityFactor'
};

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Symptom wellness: higher = fewer symptoms = better (0-100 scale)
function getSymptomWellness(log: LogEntry): number {
  const symptoms = [
    normalizeSymptom(log.symptoms.acne),
    normalizeSymptom(log.symptoms.hirsutism),
    normalizeSymptom(log.symptoms.hairLoss),
    normalizeSymptom(log.symptoms.bloat),
    normalizeSymptom(log.symptoms.cramps)
  ];
  return calculateAverage(symptoms) * 10;
}

// Composite emotional wellness using mood + stress + anxiety (Monash mental health emphasis)
function getEmotionalWellness(log: LogEntry): number {
  const mood = normalizeMood(log.psych.mood);
  const stress = normalizeStress(log.psych.stress);
  const anxiety = normalizeAnxiety(log.psych.anxiety);
  return calculateAverage([mood, stress, anxiety]) * 10;
}

function isSelfCareDay(log: LogEntry): boolean {
  const sleepWellness = normalizeSleep(log.lifestyle.sleep);
  const exerciseWellness = normalizeExercise(log.lifestyle.exercise);
  const dietWellness = normalizeDiet(log.lifestyle.diet);
  if (sleepWellness <= 3) return false;
  return sleepWellness >= 9 || exerciseWellness >= 7 || dietWellness >= 9;
}

export async function calculateBlossomScore(providedLogs?: LogEntry[]): Promise<BlossomScoreResult> {
  const profile = await db.settings.toCollection().first();
  const allLogs = providedLogs || await getLastNDays(14);
  const cycleLogs = providedLogs || await db.logs.toArray();

  if (allLogs.length < 3) {
    return {
      score: 50,
      symptomFactor: 50,
      selfCareFactor: 50,
      emotionalFactor: 50,
      stabilityFactor: 50,
      activeWeights: { symptom: 0.25, selfCare: 0.25, emotional: 0.25, stability: 0.25 }
    };
  }

  const sortedLogs = allLogs.sort((a, b) => a.date.localeCompare(b.date));

  // 7-log window: more recent, less noise from old data
  const recent = sortedLogs.slice(-7);
  const symptomFactor = calculateAverage(recent.map(getSymptomWellness));

  const nourishingDays = recent.filter(isSelfCareDay);
  const selfCareFactor = (nourishingDays.length / recent.length) * 100;

  const emotionalFactor = calculateAverage(recent.map(getEmotionalWellness));

  let stabilityFactor = 50;
  if (analyzeCycleState) {
    const cycleState = analyzeCycleState(cycleLogs);
    stabilityFactor = cycleState.stabilityScore || 50;
  }

  let weights = {
    symptomFactor: 0.25,
    selfCareFactor: 0.25,
    emotionalFactor: 0.25,
    stabilityFactor: 0.25
  };

  if (profile && profile.priorities) {
    const BOOST = 0.15;

    profile.priorities.forEach(pId => {
      const target = PRIORITY_MAP[pId];
      if (target && target in weights) {
        weights[target] += BOOST;
      }
    });

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    if (totalWeight > 0) {
      weights.symptomFactor /= totalWeight;
      weights.selfCareFactor /= totalWeight;
      weights.emotionalFactor /= totalWeight;
      weights.stabilityFactor /= totalWeight;
    }
  }

  const finalScore = Math.round(
    (symptomFactor * weights.symptomFactor) +
    (selfCareFactor * weights.selfCareFactor) +
    (emotionalFactor * weights.emotionalFactor) +
    (stabilityFactor * weights.stabilityFactor)
  );

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    symptomFactor,
    selfCareFactor,
    emotionalFactor,
    stabilityFactor,
    activeWeights: {
      symptom: weights.symptomFactor,
      selfCare: weights.selfCareFactor,
      emotional: weights.emotionalFactor,
      stability: weights.stabilityFactor
    }
  };
}

export async function calculateBlossomScoreWithBreakdown(): Promise<BlossomScoreBreakdown> {
  const allLogs = await getLastNDays(14);

  if (allLogs.length < 7) {
    return {
      total: 50,
      componentA: 50,
      componentB: 0,
      componentC: 50,
      details: {
        symptomImprovement: 'Not enough data yet',
        selfCareConsistency: 'Keep logging to see your consistency',
        emotionalWellbeing: 'Your emotional journey is just beginning'
      }
    };
  }

  const sortedLogs = allLogs.sort((a, b) => a.date.localeCompare(b.date));
  const midpoint = Math.ceil(sortedLogs.length / 2);

  const previousPeriod = sortedLogs.slice(0, midpoint);
  const currentPeriod = sortedLogs.slice(midpoint);

  const prevSymptomAvg = calculateAverage(previousPeriod.map(getSymptomWellness));
  const currSymptomAvg = calculateAverage(currentPeriod.map(getSymptomWellness));

  let componentA = 0;
  let symptomDetail = '';

  if (prevSymptomAvg > 0) {
    const improvement = ((currSymptomAvg - prevSymptomAvg) / prevSymptomAvg) * 100;
    componentA = Math.max(0, Math.min(100, 50 + improvement));

    if (improvement > 10) {
      symptomDetail = `Your symptoms improved by ${Math.round(improvement)}%`;
    } else if (improvement < -10) {
      symptomDetail = `Symptoms increased by ${Math.round(Math.abs(improvement))}%`;
    } else {
      symptomDetail = 'Symptoms remain stable';
    }
  } else {
    componentA = currSymptomAvg === 0 ? 100 : 50;
    symptomDetail = 'Baseline established';
  }

  const selfCareDays = currentPeriod.filter(isSelfCareDay);
  const componentB = (selfCareDays.length / currentPeriod.length) * 100;
  const selfCareDetail = `${selfCareDays.length} of ${currentPeriod.length} days with self-care`;

  const componentC = calculateAverage(currentPeriod.map(getEmotionalWellness));
  const emotionalDetail = `Average emotional wellness: ${Math.round(componentC)}/100`;

  const total = Math.round(
    (componentA * 0.4) + (componentB * 0.3) + (componentC * 0.3)
  );

  return {
    total: Math.max(0, Math.min(100, total)),
    componentA: Math.round(componentA),
    componentB: Math.round(componentB),
    componentC: Math.round(componentC),
    details: {
      symptomImprovement: symptomDetail,
      selfCareConsistency: selfCareDetail,
      emotionalWellbeing: emotionalDetail
    }
  };
}
