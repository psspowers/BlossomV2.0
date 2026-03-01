import { LogEntry } from '../db';
import { getLastNDays, dbAdapter as db } from '../dbAdapter';
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

  if (allLogs.length === 0) {
    return {
      score: 50,
      symptomFactor: 50,
      selfCareFactor: 50,
      emotionalFactor: 50,
      stabilityFactor: 50,
      activeWeights: { symptom: 0.25, selfCare: 0.25, emotional: 0.25, stability: 0.25 }
    };
  }

  if (allLogs.length < 3) {
    const recentLog = allLogs[allLogs.length - 1];
    const symptomFactor = getSymptomWellness(recentLog);
    const selfCareFactor = isSelfCareDay(recentLog) ? 100 : 0;
    const emotionalFactor = getEmotionalWellness(recentLog);
    const stabilityFactor = 50;

    const quickScore = Math.round((symptomFactor + selfCareFactor + emotionalFactor + stabilityFactor) / 4);

    return {
      score: Math.max(0, Math.min(100, quickScore)),
      symptomFactor,
      selfCareFactor,
      emotionalFactor,
      stabilityFactor,
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

