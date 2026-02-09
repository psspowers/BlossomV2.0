import { LogEntry, getLastNDays, db, Settings } from '../db';
import { analyzeCycleState } from './cycle';

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

function convertLifestyleToNumber(value: string | undefined, field: string): number {
  if (!value) return 0;
  if (field === 'sleep') {
    if (value === '<6h') return 4;
    if (value === '6-7h') return 6;
    if (value === '7-8h') return 8;
    if (value === '>8h') return 10;
  }
  if (field === 'exercise') {
    if (value === 'rest') return 5;
    if (value === 'light') return 7;
    if (value === 'moderate') return 9;
    if (value === 'intense') return 10;
  }
  return 0;
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getSymptomScore(log: LogEntry): number {
  const symptoms = [
    log.symptoms.acne || 0,
    log.symptoms.hirsutism || 0,
    log.symptoms.hairLoss || 0,
    log.symptoms.bloat || 0,
    log.symptoms.cramps || 0
  ];
  const avgSeverity = calculateAverage(symptoms);
  return Math.max(0, 100 - (avgSeverity * 20));
}

export async function calculateBlossomScore(): Promise<BlossomScoreResult> {
  const profile = await db.settings.toCollection().first();
  const allLogs = await getLastNDays(14);
  const cycleLogs = await db.logs.toArray();

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
  const recent = sortedLogs.slice(-3);
  const symptomFactor = calculateAverage(recent.map(getSymptomScore));

  const nourishingDays = sortedLogs.filter(log => {
    const sleepScore = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    const hasMovement = log.lifestyle.exercise && log.lifestyle.exercise !== 'none';
    return sleepScore >= 6 || hasMovement;
  });
  const selfCareFactor = (nourishingDays.length / sortedLogs.length) * 100;

  const moodScores = sortedLogs.map(l => (l.psych.mood || 3) * 20);
  const emotionalFactor = calculateAverage(moodScores);

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
