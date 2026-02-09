import { useState, useEffect } from 'react';
import { calculatePlantHealth, PlantState } from '../logic/plant';
import { determineInterfaceMode, ThemeState } from '../logic/mode';
import { getAllVelocities, VelocityResult } from '../logic/velocity';
import { getLastNDays, LogEntry } from '../db';
import {
  getRawSleep,
  getRawExercise,
  getRawDiet,
  getRawStress,
  getRawAnxiety,
  getRawBodyImage,
  calculateChange
} from '../logic/conversions';

export function usePlantState() {
  const [plantState, setPlantState] = useState<PlantState>({
    phase: 'seed',
    health: 0,
    pulseSpeed: 2.5,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlantState = async () => {
      const state = await calculatePlantHealth();
      setPlantState(state);
      setLoading(false);
    };

    loadPlantState();
  }, []);

  const refresh = async () => {
    const state = await calculatePlantHealth();
    setPlantState(state);
  };

  return { plantState, loading, refresh };
}

export function useInterfaceMode() {
  const [themeState, setThemeState] = useState<ThemeState>({
    mode: 'steady',
    primaryColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    message: 'Begin your wellness journey'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMode = async () => {
      const state = await determineInterfaceMode();
      setThemeState(state);
      setLoading(false);
    };

    loadMode();
  }, []);

  const refresh = async () => {
    const state = await determineInterfaceMode();
    setThemeState(state);
  };

  return { themeState, loading, refresh };
}

export function useVelocities() {
  const [velocities, setVelocities] = useState<Record<string, VelocityResult | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVelocities = async () => {
      const results = await getAllVelocities();
      setVelocities(results);
      setLoading(false);
    };

    loadVelocities();
  }, []);

  const refresh = async () => {
    const results = await getAllVelocities();
    setVelocities(results);
  };

  return { velocities, loading, refresh };
}

export type InsightCategory = 'hyperandrogenism' | 'metabolic' | 'psych' | 'all';

type MetricPolarity = 'direct' | 'inverse';

const METRIC_POLARITY: Record<string, MetricPolarity> = {
  sleep: 'direct',
  exercise: 'direct',
  diet: 'direct',
  waterIntake: 'direct',
  mood: 'direct',
  bodyImage: 'direct',
  energy: 'direct',
  cycleRegularity: 'direct',
  acne: 'inverse',
  hirsutism: 'inverse',
  hairLoss: 'inverse',
  bloat: 'inverse',
  cramps: 'inverse',
  stress: 'inverse',
  anxiety: 'inverse',
  fatigue: 'inverse'
};

function getMetricPolarity(metric: string): MetricPolarity {
  return METRIC_POLARITY[metric] || 'inverse';
}

function getTargetSymptomForCategory(category: InsightCategory): { metric: string; label: string } {
  switch (category) {
    case 'hyperandrogenism':
      return { metric: 'acne', label: 'Acne' };
    case 'psych':
      return { metric: 'anxiety', label: 'Anxiety' };
    case 'metabolic':
      return { metric: 'energy', label: 'Energy' };
    case 'all':
      return { metric: 'acne', label: 'Acne' };
    default:
      return { metric: 'acne', label: 'Acne' };
  }
}

export interface VelocityInsight {
  value: number;
  direction: 'improving' | 'worsening' | 'stable';
  symptomName: string;
  percentChange: number;
  polarity: MetricPolarity;
}

export interface RadarDataset {
  label: string;
  data: number[];
}

export interface SpokeVelocity {
  label: string;
  percentChange: number;
  direction: 'improving' | 'worsening' | 'stable';
}

export interface FactorImpact {
  factor: string;
  impact: number;
  description: string;
  targetSymptom: string;
  targetSymptomLabel: string;
  targetMetric?: string;
}

export interface InsightsData {
  velocity: VelocityInsight | null;
  radarCurrent: RadarDataset;
  radarBaseline: RadarDataset;
  radarLabels: string[];
  radarMetrics: string[];
  spokeVelocities: SpokeVelocity[];
  factorImpacts: FactorImpact[];
  trendData: { date: string; value: number }[];
  baselineTrendData: { date: string; value: number }[];
  targetSymptom: string;
  targetSymptomLabel: string;
  fastestPositiveFactor: { factor: string; impact: number } | null;
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getSymptomValue(log: LogEntry, field: string): number | undefined {
  const symptomValue = log.symptoms[field as keyof typeof log.symptoms];
  if (symptomValue !== undefined) return symptomValue;
  if (log.customValues && log.customValues[field] !== undefined) {
    return log.customValues[field];
  }
  return undefined;
}

function getMetricValue(log: LogEntry, metric: string): number | undefined {
  if (['acne', 'hirsutism', 'hairLoss', 'bloat', 'cramps'].includes(metric)) {
    return getSymptomValue(log, metric);
  }
  if (metric === 'energy') {
    const energyVal = log.customValues?.['energy'];
    if (energyVal !== undefined) return energyVal;
    return getRawSleep(log.lifestyle.sleep);
  }
  if (metric === 'fatigue') {
    const energyVal = getMetricValue(log, 'energy');
    return energyVal !== undefined ? 10 - energyVal : 5;
  }
  if (metric === 'cycleRegularity') {
    const phase = log.cyclePhase;
    const isRegular = phase && phase !== 'unknown';
    return isRegular ? 8 : 4;
  }
  if (metric === 'sleep') {
    return getRawSleep(log.lifestyle.sleep);
  }
  if (metric === 'exercise') {
    return getRawExercise(log.lifestyle.exercise);
  }
  if (metric === 'diet') {
    return getRawDiet(log.lifestyle.diet);
  }
  if (metric === 'mood') {
    return log.psych.mood;
  }
  if (metric === 'stress') {
    return getRawStress(log.psych.stress);
  }
  if (metric === 'anxiety') {
    return getRawAnxiety(log.psych.anxiety);
  }
  if (metric === 'bodyImage') {
    return getRawBodyImage(log.psych.bodyImage);
  }
  if (metric === 'waterIntake') {
    return log.lifestyle.waterIntake;
  }
  if (log.customValues && log.customValues[metric] !== undefined) {
    return log.customValues[metric];
  }
  return undefined;
}

function computeFactorImpact(
  goodLogs: LogEntry[],
  poorLogs: LogEntry[],
  compositeMetrics: string[],
  compositePolarity: MetricPolarity,
  factorName: string,
  categoryLabel: string
): FactorImpact | null {
  if (goodLogs.length === 0 || poorLogs.length === 0) return null;

  const scoreForLogs = (logs: LogEntry[]): number => {
    const scores = logs.map(log => {
      const values = compositeMetrics
        .map(m => getMetricValue(log, m))
        .filter((v): v is number => v !== undefined);
      return calculateAverage(values);
    });
    return calculateAverage(scores);
  };

  const goodComposite = scoreForLogs(goodLogs);
  const poorComposite = scoreForLogs(poorLogs);
  const impact = calculateChange(poorComposite, goodComposite);

  if (Math.abs(impact) <= 5) return null;

  const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
  return {
    factor: factorName,
    impact: Math.round(effectiveImpact),
    description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
    targetSymptom: 'composite',
    targetSymptomLabel: categoryLabel
  };
}

function computeMetricFactorImpact(
  goodLogs: LogEntry[],
  poorLogs: LogEntry[],
  metric: string,
  metricLabel: string,
  metricPolarity: MetricPolarity,
  factorName: string
): FactorImpact | null {
  if (goodLogs.length === 0 || poorLogs.length === 0) return null;

  const scoreForLogs = (logs: LogEntry[]): number => {
    const values = logs
      .map(log => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return calculateAverage(values);
  };

  const goodValue = scoreForLogs(goodLogs);
  const poorValue = scoreForLogs(poorLogs);
  const impact = calculateChange(poorValue, goodValue);

  if (Math.abs(impact) <= 5) return null;

  const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
  return {
    factor: factorName,
    impact: Math.round(effectiveImpact),
    description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
    targetSymptom: metric,
    targetSymptomLabel: metricLabel,
    targetMetric: metric
  };
}

function collectFactorGroups(logs: LogEntry[]) {
  return {
    goodSleep: logs.filter(log => log.lifestyle.sleep === '7-8h' || log.lifestyle.sleep === '>8h'),
    poorSleep: logs.filter(log => log.lifestyle.sleep === '<6h' || log.lifestyle.sleep === '6-7h'),
    exercise: logs.filter(log => log.lifestyle.exercise === 'moderate' || log.lifestyle.exercise === 'intense'),
    rest: logs.filter(log => log.lifestyle.exercise === 'rest'),
    balanced: logs.filter(log => log.lifestyle.diet === 'balanced'),
    cravings: logs.filter(log => log.lifestyle.diet === 'cravings'),
    lowStress: logs.filter(log => log.psych.stress === 'low'),
    highStress: logs.filter(log => log.psych.stress === 'high' || log.psych.stress === 'medium'),
    goodHydration: logs.filter(log => log.lifestyle.waterIntake !== undefined && log.lifestyle.waterIntake >= 6),
    poorHydration: logs.filter(log => log.lifestyle.waterIntake !== undefined && log.lifestyle.waterIntake < 6)
  };
}

async function calculateInsights(category: InsightCategory, days: number): Promise<InsightsData> {
  const logs = await getLastNDays(days * 2);
  const targetSymptomInfo = getTargetSymptomForCategory(category);

  if (logs.length < 3) {
    return {
      velocity: null,
      radarCurrent: { label: 'Current', data: [] },
      radarBaseline: { label: 'Baseline', data: [] },
      radarLabels: [],
      radarMetrics: [],
      spokeVelocities: [],
      factorImpacts: [],
      trendData: [],
      baselineTrendData: [],
      targetSymptom: targetSymptomInfo.metric,
      targetSymptomLabel: targetSymptomInfo.label,
      fastestPositiveFactor: null
    };
  }

  const sortedLogs = logs.sort((a, b) => a.date.localeCompare(b.date));
  const midpoint = Math.floor(sortedLogs.length / 2);
  const baselineLogs = sortedLogs.slice(0, midpoint);
  const currentLogs = sortedLogs.slice(midpoint);

  let compositeMetrics: string[];
  let radarMetrics: string[];
  let radarLabels: string[];

  if (category === 'hyperandrogenism') {
    compositeMetrics = ['acne', 'hirsutism', 'hairLoss', 'bloat', 'cramps'];
    radarMetrics = ['cramps', 'acne', 'bloat', 'hirsutism', 'hairLoss'];
    radarLabels = ['Cramps', 'Acne', 'Bloat', 'Hirsutism', 'Hair Loss'];
  } else if (category === 'metabolic') {
    compositeMetrics = ['energy', 'sleep', 'diet'];
    radarMetrics = ['sleep', 'exercise', 'diet'];
    radarLabels = ['Sleep', 'Exercise', 'Diet'];
  } else if (category === 'psych') {
    compositeMetrics = ['stress', 'bodyImage', 'anxiety'];
    radarMetrics = ['stress', 'bodyImage', 'anxiety'];
    radarLabels = ['Stress', 'Body Image', 'Anxiety'];
  } else {
    compositeMetrics = ['acne', 'mood', 'sleep'];
    radarMetrics = ['acne', 'mood', 'sleep', 'exercise'];
    radarLabels = ['Physical', 'Mood', 'Sleep', 'Exercise'];
  }

  const calculateCompositeScore = (logsArr: LogEntry[]): number => {
    const compositeScores = logsArr.map(log => {
      const values = compositeMetrics
        .map(metric => getMetricValue(log, metric))
        .filter((v): v is number => v !== undefined);
      return calculateAverage(values);
    });
    return calculateAverage(compositeScores);
  };

  const baselineComposite = calculateCompositeScore(baselineLogs);
  const currentComposite = calculateCompositeScore(currentLogs);

  const percentChange = calculateChange(currentComposite, baselineComposite);

  const compositePolarity = category === 'psych' ? 'inverse' : (category === 'metabolic' ? 'direct' : 'inverse');

  let direction: 'improving' | 'worsening' | 'stable';
  if (Math.abs(percentChange) < 5) {
    direction = 'stable';
  } else if (compositePolarity === 'direct') {
    direction = percentChange > 0 ? 'improving' : 'worsening';
  } else {
    direction = percentChange < 0 ? 'improving' : 'worsening';
  }

  const categoryLabels = {
    hyperandrogenism: 'Physical Symptoms',
    metabolic: 'Metabolic Health',
    psych: 'Emotional Wellness',
    all: 'Overall Health'
  };

  const velocity: VelocityInsight = {
    value: Math.abs(Math.round(percentChange)),
    direction,
    symptomName: categoryLabels[category],
    percentChange: Math.round(percentChange),
    polarity: compositePolarity
  };

  const computeRadarData = (logsArr: LogEntry[]) =>
    radarMetrics.map(metric => {
      const values = logsArr
        .map(log => getMetricValue(log, metric))
        .filter((v): v is number => v !== undefined);
      const avg = calculateAverage(values);

      if (['acne', 'hirsutism', 'hairLoss', 'bloat', 'cramps'].includes(metric)) {
        return 10 - avg;
      }
      if (['stress', 'anxiety'].includes(metric)) {
        return 10 - avg;
      }
      return avg;
    });

  const radarCurrentData = computeRadarData(currentLogs);
  const radarBaselineData = computeRadarData(baselineLogs);

  const spokeVelocities: SpokeVelocity[] = radarMetrics.map((metric, index) => {
    const baseline = radarBaselineData[index];
    const current = radarCurrentData[index];
    const change = calculateChange(current, baseline);

    let spokeDirection: 'improving' | 'worsening' | 'stable';
    if (Math.abs(change) < 5) {
      spokeDirection = 'stable';
    } else {
      spokeDirection = change > 0 ? 'improving' : 'worsening';
    }

    return {
      label: radarLabels[index],
      percentChange: Math.round(change),
      direction: spokeDirection
    };
  });

  const groups = collectFactorGroups(currentLogs);
  const factorImpacts: FactorImpact[] = [];

  const maybeAdd = (result: FactorImpact | null) => { if (result) factorImpacts.push(result); };

  maybeAdd(computeFactorImpact(groups.goodSleep, groups.poorSleep, compositeMetrics, compositePolarity, 'Good Sleep', categoryLabels[category]));
  maybeAdd(computeFactorImpact(groups.exercise, groups.rest, compositeMetrics, compositePolarity, 'Regular Exercise', categoryLabels[category]));
  maybeAdd(computeFactorImpact(groups.balanced, groups.cravings, compositeMetrics, compositePolarity, 'Balanced Diet', categoryLabels[category]));
  maybeAdd(computeFactorImpact(groups.lowStress, groups.highStress, compositeMetrics, compositePolarity, 'Low Stress', categoryLabels[category]));
  maybeAdd(computeFactorImpact(groups.goodHydration, groups.poorHydration, compositeMetrics, compositePolarity, 'Good Hydration', categoryLabels[category]));

  factorImpacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const positiveFactors = factorImpacts.filter(f => f.impact > 0);
  const fastestPositiveFactor = positiveFactors.length > 0
    ? { factor: positiveFactors[0].factor, impact: positiveFactors[0].impact }
    : null;

  const computeTrend = (logsArr: LogEntry[]) =>
    logsArr.map(log => {
      const values = compositeMetrics
        .map(metric => getMetricValue(log, metric))
        .filter((v): v is number => v !== undefined);
      return { date: log.date, value: calculateAverage(values) };
    });

  return {
    velocity,
    radarCurrent: { label: 'Current', data: radarCurrentData },
    radarBaseline: { label: 'Baseline', data: radarBaselineData },
    radarLabels,
    radarMetrics,
    spokeVelocities,
    factorImpacts: factorImpacts.slice(0, 5),
    trendData: computeTrend(currentLogs),
    baselineTrendData: computeTrend(baselineLogs),
    targetSymptom: 'composite',
    targetSymptomLabel: categoryLabels[category],
    fastestPositiveFactor
  };
}

async function calculateFactorImpactsForMetric(
  metric: string,
  metricLabel: string,
  currentLogs: LogEntry[],
  _days: number
): Promise<FactorImpact[]> {
  const metricPolarity = getMetricPolarity(metric);
  const groups = collectFactorGroups(currentLogs);
  const factorImpacts: FactorImpact[] = [];

  const maybeAdd = (result: FactorImpact | null) => { if (result) factorImpacts.push(result); };

  maybeAdd(computeMetricFactorImpact(groups.goodSleep, groups.poorSleep, metric, metricLabel, metricPolarity, 'Good Sleep'));
  maybeAdd(computeMetricFactorImpact(groups.exercise, groups.rest, metric, metricLabel, metricPolarity, 'Regular Exercise'));
  maybeAdd(computeMetricFactorImpact(groups.balanced, groups.cravings, metric, metricLabel, metricPolarity, 'Balanced Diet'));
  maybeAdd(computeMetricFactorImpact(groups.lowStress, groups.highStress, metric, metricLabel, metricPolarity, 'Low Stress'));
  maybeAdd(computeMetricFactorImpact(groups.goodHydration, groups.poorHydration, metric, metricLabel, metricPolarity, 'Good Hydration'));

  factorImpacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return factorImpacts.slice(0, 5);
}

export function useCategoryInsights(category: InsightCategory, days: number) {
  const [insights, setInsights] = useState<InsightsData>({
    velocity: null,
    radarCurrent: { label: 'Current', data: [] },
    radarBaseline: { label: 'Baseline', data: [] },
    radarLabels: [],
    radarMetrics: [],
    spokeVelocities: [],
    factorImpacts: [],
    trendData: [],
    baselineTrendData: [],
    targetSymptom: '',
    targetSymptomLabel: '',
    fastestPositiveFactor: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      const data = await calculateInsights(category, days);
      setInsights(data);
      setLoading(false);
    };

    loadInsights();
  }, [category, days]);

  const filterByMetric = async (metric: string, metricLabel: string) => {
    const logs = await getLastNDays(days);
    const factorImpacts = await calculateFactorImpactsForMetric(metric, metricLabel, logs, days);

    const positiveFactors = factorImpacts.filter(f => f.impact > 0);
    const fastestPositiveFactor = positiveFactors.length > 0
      ? { factor: positiveFactors[0].factor, impact: positiveFactors[0].impact }
      : null;

    setInsights(prev => ({
      ...prev,
      factorImpacts,
      targetSymptom: metric,
      targetSymptomLabel: metricLabel,
      fastestPositiveFactor
    }));
  };

  const resetToComposite = async () => {
    const data = await calculateInsights(category, days);
    setInsights(data);
  };

  return { insights, loading, filterByMetric, resetToComposite };
}
