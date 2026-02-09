import { LogEntry, getLastNDays, db } from '../db';
import { analyzeCycleState } from './cycle';
import { supabase } from '../supabase';

interface UserPriority {
  priority_id: string;
  happiness_impact: number;
}

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
  return calculateAverage(symptoms);
}

export interface BlossomScoreResult {
  score: number;
  symptomFactor: number;
  selfCareFactor: number;
  emotionalFactor: number;
  stabilityFactor: number;
}

const PRIORITY_MAP: Record<string, keyof BlossomScoreResult> = {
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

async function fetchUserPriorities(): Promise<UserPriority[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_priorities')
    .select('priority_id, happiness_impact')
    .eq('user_id', user.id);

  if (error || !data) {
    return [];
  }

  return data;
}

function calculatePersonalizedWeights(priorities: UserPriority[]): Record<keyof BlossomScoreResult, number> {
  const baseWeights = {
    symptomFactor: 0.25,
    selfCareFactor: 0.25,
    emotionalFactor: 0.25,
    stabilityFactor: 0.25
  };

  if (priorities.length === 0) {
    return baseWeights;
  }

  const BOOST_PER_PRIORITY = 0.10;
  const MAX_WEIGHT = 0.60;

  priorities.forEach(priority => {
    const factor = PRIORITY_MAP[priority.priority_id];
    if (factor && baseWeights[factor]) {
      baseWeights[factor] = Math.min(
        baseWeights[factor] + BOOST_PER_PRIORITY,
        MAX_WEIGHT
      );
    }
  });

  const currentSum = Object.values(baseWeights).reduce((a, b) => a + b, 0);

  if (currentSum !== 1.0) {
    const keys = Object.keys(baseWeights) as (keyof typeof baseWeights)[];
    keys.forEach(k => {
      baseWeights[k] = baseWeights[k] / currentSum;
    });
  }

  return baseWeights;
}

export async function calculateBlossomScore(): Promise<BlossomScoreResult> {
  const priorities = await fetchUserPriorities();
  const weights = calculatePersonalizedWeights(priorities);

  const allLogs = await getLastNDays(14);

  if (allLogs.length < 3) {
    return {
      score: 50,
      symptomFactor: 50,
      selfCareFactor: 0,
      emotionalFactor: 50,
      stabilityFactor: 50
    };
  }

  const sortedLogs = allLogs.sort((a, b) => a.date.localeCompare(b.date));

  const last7Days = sortedLogs.slice(-7);
  const previous7Days = sortedLogs.slice(-14, -7);

  let symptomFactor = 75;

  if (previous7Days.length >= 3 && last7Days.length >= 3) {
    const prevSymptomAvg = calculateAverage(previous7Days.map(getSymptomScore));
    const currSymptomAvg = calculateAverage(last7Days.map(getSymptomScore));

    if (prevSymptomAvg > 0) {
      const percentChange = ((prevSymptomAvg - currSymptomAvg) / prevSymptomAvg) * 100;

      if (percentChange > 10) {
        symptomFactor = 100;
      } else if (percentChange < -10) {
        symptomFactor = 50;
      } else {
        symptomFactor = 75;
      }
    } else {
      symptomFactor = currSymptomAvg < 3 ? 100 : 75;
    }
  }

  const nourishingDays = last7Days.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    const hasGoodSleep = sleepHours >= 7;

    const hasMovement = log.lifestyle.exercise && log.lifestyle.exercise !== 'rest';

    const hasHydration = log.lifestyle.waterIntake && log.lifestyle.waterIntake >= 6;

    return hasGoodSleep || hasMovement || hasHydration;
  });

  const selfCareFactor = last7Days.length > 0
    ? (nourishingDays.length / last7Days.length) * 100
    : 0;

  const moodScores = last7Days
    .map(log => {
      const mood = log.psych.mood;
      if (typeof mood === 'number') return mood;
      return 50;
    });

  const emotionalFactor = moodScores.length > 0
    ? calculateAverage(moodScores)
    : 50;

  const allLogsForCycle = await db.logs.toArray();
  const cycleState = analyzeCycleState(allLogsForCycle);
  const stabilityFactor = cycleState.stabilityScore > 0 ? cycleState.stabilityScore : 50;

  const score = Math.round(
    (symptomFactor * weights.symptomFactor) +
    (selfCareFactor * weights.selfCareFactor) +
    (emotionalFactor * weights.emotionalFactor) +
    (stabilityFactor * weights.stabilityFactor)
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    symptomFactor,
    selfCareFactor,
    emotionalFactor,
    stabilityFactor
  };
}
