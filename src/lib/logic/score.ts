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
  if (field === 'diet') {
    if (value === 'balanced') return 8;
    if (value === 'cravings') return 4;
    if (value === 'restrictive') return 3;
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

export async function calculateBlossomScore(logs?: LogEntry[]): Promise<number> {
  const allLogs = logs || await getLastNDays(14);

  if (allLogs.length < 7) {
    return 50;
  }

  const sortedLogs = allLogs.sort((a, b) => a.date.localeCompare(b.date));
  const midpoint = Math.ceil(sortedLogs.length / 2);

  const previousPeriod = sortedLogs.slice(0, midpoint);
  const currentPeriod = sortedLogs.slice(midpoint);

  const prevSymptomAvg = calculateAverage(previousPeriod.map(getSymptomScore));
  const currSymptomAvg = calculateAverage(currentPeriod.map(getSymptomScore));

  let componentA = 0;
  if (prevSymptomAvg > 0) {
    const improvement = ((prevSymptomAvg - currSymptomAvg) / prevSymptomAvg) * 100;
    componentA = Math.max(0, Math.min(100, 50 + improvement));
  } else {
    componentA = currSymptomAvg === 0 ? 100 : 50;
  }

  const selfCareDays = currentPeriod.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    const hasGoodSleep = sleepHours >= 7;
    const hasHealthyDiet = log.lifestyle.diet === 'balanced';
    const hasMovement = log.lifestyle.exercise && log.lifestyle.exercise !== 'rest';

    return hasGoodSleep || hasHealthyDiet || hasMovement;
  });

  const componentB = (selfCareDays.length / currentPeriod.length) * 100;

  const moodScores = currentPeriod
    .map(log => {
      const mood = log.psych.mood;
      if (typeof mood === 'number') return mood;
      return 50;
    })
    .filter(m => m !== undefined);

  const componentC = moodScores.length > 0 ? calculateAverage(moodScores) : 50;

  const blossomScore = Math.round(
    (componentA * 0.4) + (componentB * 0.3) + (componentC * 0.3)
  );

  return Math.max(0, Math.min(100, blossomScore));
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

  const prevSymptomAvg = calculateAverage(previousPeriod.map(getSymptomScore));
  const currSymptomAvg = calculateAverage(currentPeriod.map(getSymptomScore));

  let componentA = 0;
  let symptomDetail = '';

  if (prevSymptomAvg > 0) {
    const improvement = ((prevSymptomAvg - currSymptomAvg) / prevSymptomAvg) * 100;
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

  const selfCareDays = currentPeriod.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    const hasGoodSleep = sleepHours >= 7;
    const hasHealthyDiet = log.lifestyle.diet === 'balanced';
    const hasMovement = log.lifestyle.exercise && log.lifestyle.exercise !== 'rest';

    return hasGoodSleep || hasHealthyDiet || hasMovement;
  });

  const componentB = (selfCareDays.length / currentPeriod.length) * 100;
  const selfCareDetail = `${selfCareDays.length} of ${currentPeriod.length} days with self-care`;

  const moodScores = currentPeriod
    .map(log => {
      const mood = log.psych.mood;
      if (typeof mood === 'number') return mood;
      return 50;
    })
    .filter(m => m !== undefined);

  const componentC = moodScores.length > 0 ? calculateAverage(moodScores) : 50;
  const emotionalDetail = `Average mood: ${Math.round(componentC)}/100`;

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
