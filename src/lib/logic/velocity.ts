import { getLastNDays, LogEntry } from '../db';

export type VelocityDirection = 'improving' | 'worsening' | 'stable';

export interface VelocityResult {
  percentChange: number;
  direction: VelocityDirection;
  currentAvg: number;
  previousAvg: number;
}

type MetricPath = {
  category: 'symptoms' | 'psych' | 'lifestyle';
  field: string;
};

const METRIC_PATHS: Record<string, MetricPath> = {
  stress: { category: 'psych', field: 'stress' },
  anxiety: { category: 'psych', field: 'anxiety' },
  mood: { category: 'psych', field: 'mood' },
  bodyImage: { category: 'psych', field: 'bodyImage' },
  acne: { category: 'symptoms', field: 'acne' },
  hirsutism: { category: 'symptoms', field: 'hirsutism' },
  hairLoss: { category: 'symptoms', field: 'hairLoss' },
  bloat: { category: 'symptoms', field: 'bloat' },
  cramps: { category: 'symptoms', field: 'cramps' },
  sleep: { category: 'lifestyle', field: 'sleep' },
  waterIntake: { category: 'lifestyle', field: 'waterIntake' },
  exercise: { category: 'lifestyle', field: 'exercise' },
  diet: { category: 'lifestyle', field: 'diet' }
};

function convertStringToNumber(value: string | number | undefined, field: string): number | undefined {
  if (typeof value === 'number') return value;
  if (value === undefined) return undefined;

  if (field === 'stress') {
    if (value === 'low') return 3;
    if (value === 'medium') return 5;
    if (value === 'high') return 8;
  }

  if (field === 'anxiety') {
    if (value === 'none') return 0;
    if (value === 'low') return 3;
    if (value === 'high') return 8;
  }

  if (field === 'bodyImage') {
    if (value === 'positive') return 8;
    if (value === 'neutral') return 5;
    if (value === 'negative') return 2;
  }

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

  return undefined;
}

function extractMetricValue(log: LogEntry, path: MetricPath): number | undefined {
  const categoryData = log[path.category];
  const rawValue = categoryData?.[path.field as keyof typeof categoryData] as string | number | undefined;
  return convertStringToNumber(rawValue, path.field);
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export async function getVelocity(metric: string): Promise<VelocityResult | null> {
  const path = METRIC_PATHS[metric];
  if (!path) {
    console.warn(`Unknown metric: ${metric}`);
    return null;
  }

  const logs = await getLastNDays(14);

  if (logs.length < 7) {
    return null;
  }

  const sortedLogs = logs.sort((a, b) => a.date.localeCompare(b.date));

  const midpoint = Math.floor(sortedLogs.length / 2);
  const previousPeriod = sortedLogs.slice(0, midpoint);
  const currentPeriod = sortedLogs.slice(midpoint);

  const previousValues = previousPeriod
    .map(log => extractMetricValue(log, path))
    .filter((val): val is number => val !== undefined);

  const currentValues = currentPeriod
    .map(log => extractMetricValue(log, path))
    .filter((val): val is number => val !== undefined);

  if (previousValues.length === 0 || currentValues.length === 0) {
    return null;
  }

  const previousAvg = calculateAverage(previousValues);
  const currentAvg = calculateAverage(currentValues);

  if (previousAvg === 0) {
    return {
      percentChange: 0,
      direction: 'stable',
      currentAvg,
      previousAvg
    };
  }

  const percentChange = ((currentAvg - previousAvg) / previousAvg) * 100;

  const isPositiveMetric = ['mood', 'bodyImage', 'sleep', 'waterIntake', 'diet', 'exercise'].includes(metric);

  let direction: VelocityDirection;
  if (Math.abs(percentChange) < 5) {
    direction = 'stable';
  } else if (isPositiveMetric) {
    direction = percentChange > 0 ? 'improving' : 'worsening';
  } else {
    direction = percentChange < 0 ? 'improving' : 'worsening';
  }

  return {
    percentChange: Math.round(percentChange),
    direction,
    currentAvg: Math.round(currentAvg * 10) / 10,
    previousAvg: Math.round(previousAvg * 10) / 10
  };
}

export async function getAllVelocities(): Promise<Record<string, VelocityResult | null>> {
  const metrics = Object.keys(METRIC_PATHS);
  const results: Record<string, VelocityResult | null> = {};

  for (const metric of metrics) {
    results[metric] = await getVelocity(metric);
  }

  return results;
}
