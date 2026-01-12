import { useState, useEffect } from 'react';
import { calculatePlantHealth, PlantState } from '../logic/plant';
import { determineInterfaceMode, ThemeState } from '../logic/mode';
import { getAllVelocities, VelocityResult } from '../logic/velocity';
import { calculateAchievements, AchievementData } from '../logic/achievements';
import { getLastNDays, LogEntry } from '../db';

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

function convertLifestyleToNumber(value: string, field: string): number {
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
  return 5;
}

function convertPsychToNumber(value: string | number, field: string): number {
  if (typeof value === 'number') return value;
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
  return 5;
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
    compositeMetrics = ['acne', 'hirsutism', 'hairLoss'];
    radarMetrics = ['acne', 'hirsutism', 'hairLoss', 'bodyImage'];
    radarLabels = ['Acne', 'Hirsutism', 'Hair Loss', 'Body Image'];
  } else if (category === 'metabolic') {
    compositeMetrics = ['energy', 'sleep'];
    radarMetrics = ['energy', 'sleep', 'fatigue', 'cycleRegularity'];
    radarLabels = ['Energy', 'Sleep Quality', 'Fatigue', 'Cycle Regularity'];
  } else if (category === 'psych') {
    compositeMetrics = ['stress', 'bodyImage', 'mood'];
    radarMetrics = ['stress', 'bodyImage', 'anxiety', 'mood'];
    radarLabels = ['Stress', 'Body Image', 'Anxiety', 'Mood'];
  } else {
    compositeMetrics = ['acne', 'mood', 'sleep'];
    radarMetrics = ['acne', 'mood', 'sleep', 'exercise'];
    radarLabels = ['Physical', 'Mood', 'Sleep', 'Exercise'];
  }

  const getMetricValue = (log: LogEntry, metric: string): number | undefined => {
    if (['acne', 'hirsutism', 'hairLoss', 'bloat', 'cramps'].includes(metric)) {
      return getSymptomValue(log, metric);
    }
    if (metric === 'energy') {
      const energyVal = log.customValues?.['energy'];
      if (energyVal !== undefined) return energyVal;
      const sleepVal = log.lifestyle.sleep;
      if (typeof sleepVal === 'string') return convertLifestyleToNumber(sleepVal, 'sleep');
      return 5;
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
    if (['sleep', 'exercise', 'diet'].includes(metric)) {
      const val = log.lifestyle[metric as keyof typeof log.lifestyle];
      if (typeof val === 'string') return convertLifestyleToNumber(val, metric);
      return val as number;
    }
    if (['mood', 'stress', 'anxiety', 'bodyImage'].includes(metric)) {
      const val = log.psych[metric as keyof typeof log.psych];
      if (val !== undefined) return convertPsychToNumber(val, metric);
    }
    if (log.customValues && log.customValues[metric] !== undefined) {
      return log.customValues[metric];
    }
    return undefined;
  };

  const calculateCompositeScore = (logs: LogEntry[]): number => {
    const compositeScores = logs.map(log => {
      const values = compositeMetrics
        .map(metric => getMetricValue(log, metric))
        .filter((v): v is number => v !== undefined);
      return calculateAverage(values);
    });
    return calculateAverage(compositeScores);
  };

  const baselineComposite = calculateCompositeScore(baselineLogs);
  const currentComposite = calculateCompositeScore(currentLogs);

  const percentChange = baselineComposite === 0 ? 0 : ((currentComposite - baselineComposite) / baselineComposite) * 100;

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

  const radarCurrentData = radarMetrics.map(metric => {
    const values = currentLogs
      .map(log => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return calculateAverage(values);
  });

  const radarBaselineData = radarMetrics.map(metric => {
    const values = baselineLogs
      .map(log => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return calculateAverage(values);
  });

  const spokeVelocities: SpokeVelocity[] = radarMetrics.map((metric, index) => {
    const baseline = radarBaselineData[index];
    const current = radarCurrentData[index];
    const change = baseline === 0 ? 0 : ((current - baseline) / baseline) * 100;
    const metricPolarity = getMetricPolarity(metric);

    let spokeDirection: 'improving' | 'worsening' | 'stable';
    if (Math.abs(change) < 5) {
      spokeDirection = 'stable';
    } else if (metricPolarity === 'direct') {
      spokeDirection = change > 0 ? 'improving' : 'worsening';
    } else {
      spokeDirection = change < 0 ? 'improving' : 'worsening';
    }

    return {
      label: radarLabels[index],
      percentChange: Math.round(change),
      direction: spokeDirection
    };
  });

  const factorImpacts: FactorImpact[] = [];

  const calculateCompositeForLogs = (logs: LogEntry[]): number => {
    const scores = logs.map(log => {
      const values = compositeMetrics
        .map(metric => getMetricValue(log, metric))
        .filter((v): v is number => v !== undefined);
      return calculateAverage(values);
    });
    return calculateAverage(scores);
  };

  const goodSleepLogs = currentLogs.filter(log => {
    const sleep = log.lifestyle.sleep;
    return sleep === '7-8h' || sleep === '>8h';
  });
  const poorSleepLogs = currentLogs.filter(log => {
    const sleep = log.lifestyle.sleep;
    return sleep === '<6h' || sleep === '6-7h';
  });

  if (goodSleepLogs.length > 0 && poorSleepLogs.length > 0) {
    const goodSleepComposite = calculateCompositeForLogs(goodSleepLogs);
    const poorSleepComposite = calculateCompositeForLogs(poorSleepLogs);
    const impact = poorSleepComposite === 0 ? 0 : ((poorSleepComposite - goodSleepComposite) / poorSleepComposite) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Good Sleep',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
        targetSymptom: 'composite',
        targetSymptomLabel: categoryLabels[category]
      });
    }
  }

  const exerciseLogs = currentLogs.filter(log => {
    const ex = log.lifestyle.exercise;
    return ex === 'moderate' || ex === 'intense';
  });
  const restLogs = currentLogs.filter(log => log.lifestyle.exercise === 'rest');

  if (exerciseLogs.length > 0 && restLogs.length > 0) {
    const exerciseComposite = calculateCompositeForLogs(exerciseLogs);
    const restComposite = calculateCompositeForLogs(restLogs);
    const impact = restComposite === 0 ? 0 : ((restComposite - exerciseComposite) / restComposite) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Regular Exercise',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
        targetSymptom: 'composite',
        targetSymptomLabel: categoryLabels[category]
      });
    }
  }

  const balancedDietLogs = currentLogs.filter(log => log.lifestyle.diet === 'balanced');
  const cravingsDietLogs = currentLogs.filter(log => log.lifestyle.diet === 'cravings');

  if (balancedDietLogs.length > 0 && cravingsDietLogs.length > 0) {
    const balancedComposite = calculateCompositeForLogs(balancedDietLogs);
    const cravingsComposite = calculateCompositeForLogs(cravingsDietLogs);
    const impact = cravingsComposite === 0 ? 0 : ((cravingsComposite - balancedComposite) / cravingsComposite) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Balanced Diet',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
        targetSymptom: 'composite',
        targetSymptomLabel: categoryLabels[category]
      });
    }
  }

  const lowStressLogs = currentLogs.filter(log => {
    const stress = log.psych.stress;
    return stress === 'low';
  });
  const highStressLogs = currentLogs.filter(log => {
    const stress = log.psych.stress;
    return stress === 'high' || stress === 'medium';
  });

  if (lowStressLogs.length > 0 && highStressLogs.length > 0) {
    const lowStressComposite = calculateCompositeForLogs(lowStressLogs);
    const highStressComposite = calculateCompositeForLogs(highStressLogs);
    const impact = highStressComposite === 0 ? 0 : ((highStressComposite - lowStressComposite) / highStressComposite) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Low Stress',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
        targetSymptom: 'composite',
        targetSymptomLabel: categoryLabels[category]
      });
    }
  }

  const goodHydrationLogs = currentLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water >= 6;
  });
  const poorHydrationLogs = currentLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water < 6;
  });

  if (goodHydrationLogs.length > 0 && poorHydrationLogs.length > 0) {
    const goodHydrationComposite = calculateCompositeForLogs(goodHydrationLogs);
    const poorHydrationComposite = calculateCompositeForLogs(poorHydrationLogs);
    const impact = poorHydrationComposite === 0 ? 0 : ((poorHydrationComposite - goodHydrationComposite) / poorHydrationComposite) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = compositePolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Good Hydration',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? 'Improves overall wellness' : 'Worsens overall wellness',
        targetSymptom: 'composite',
        targetSymptomLabel: categoryLabels[category]
      });
    }
  }

  factorImpacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const positiveFactors = factorImpacts.filter(f => f.impact > 0);
  const fastestPositiveFactor = positiveFactors.length > 0
    ? { factor: positiveFactors[0].factor, impact: positiveFactors[0].impact }
    : null;

  const trendData = currentLogs.map(log => {
    const values = compositeMetrics
      .map(metric => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return {
      date: log.date,
      value: calculateAverage(values)
    };
  });

  const baselineTrendData = baselineLogs.map(log => {
    const values = compositeMetrics
      .map(metric => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return {
      date: log.date,
      value: calculateAverage(values)
    };
  });

  return {
    velocity,
    radarCurrent: { label: 'Current', data: radarCurrentData },
    radarBaseline: { label: 'Baseline', data: radarBaselineData },
    radarLabels,
    radarMetrics,
    spokeVelocities,
    factorImpacts: factorImpacts.slice(0, 5),
    trendData,
    baselineTrendData,
    targetSymptom: 'composite',
    targetSymptomLabel: categoryLabels[category],
    fastestPositiveFactor
  };
}

async function calculateFactorImpactsForMetric(
  metric: string,
  metricLabel: string,
  currentLogs: LogEntry[],
  days: number
): Promise<FactorImpact[]> {
  const metricPolarity = getMetricPolarity(metric);
  const factorImpacts: FactorImpact[] = [];

  const calculateMetricForLogs = (logs: LogEntry[]): number => {
    const values = logs
      .map(log => getMetricValue(log, metric))
      .filter((v): v is number => v !== undefined);
    return calculateAverage(values);
  };

  const goodSleepLogs = currentLogs.filter(log => {
    const sleep = log.lifestyle.sleep;
    return sleep === '7-8h' || sleep === '>8h';
  });
  const poorSleepLogs = currentLogs.filter(log => {
    const sleep = log.lifestyle.sleep;
    return sleep === '<6h' || sleep === '6-7h';
  });

  if (goodSleepLogs.length > 0 && poorSleepLogs.length > 0) {
    const goodValue = calculateMetricForLogs(goodSleepLogs);
    const poorValue = calculateMetricForLogs(poorSleepLogs);
    const impact = poorValue === 0 ? 0 : ((poorValue - goodValue) / poorValue) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Good Sleep',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
        targetSymptom: metric,
        targetSymptomLabel: metricLabel,
        targetMetric: metric
      });
    }
  }

  const exerciseLogs = currentLogs.filter(log => {
    const ex = log.lifestyle.exercise;
    return ex === 'moderate' || ex === 'intense';
  });
  const restLogs = currentLogs.filter(log => log.lifestyle.exercise === 'rest');

  if (exerciseLogs.length > 0 && restLogs.length > 0) {
    const exerciseValue = calculateMetricForLogs(exerciseLogs);
    const restValue = calculateMetricForLogs(restLogs);
    const impact = restValue === 0 ? 0 : ((restValue - exerciseValue) / restValue) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Regular Exercise',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
        targetSymptom: metric,
        targetSymptomLabel: metricLabel,
        targetMetric: metric
      });
    }
  }

  const balancedDietLogs = currentLogs.filter(log => log.lifestyle.diet === 'balanced');
  const cravingsDietLogs = currentLogs.filter(log => log.lifestyle.diet === 'cravings');

  if (balancedDietLogs.length > 0 && cravingsDietLogs.length > 0) {
    const balancedValue = calculateMetricForLogs(balancedDietLogs);
    const cravingsValue = calculateMetricForLogs(cravingsDietLogs);
    const impact = cravingsValue === 0 ? 0 : ((cravingsValue - balancedValue) / cravingsValue) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Balanced Diet',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
        targetSymptom: metric,
        targetSymptomLabel: metricLabel,
        targetMetric: metric
      });
    }
  }

  const lowStressLogs = currentLogs.filter(log => log.psych.stress === 'low');
  const highStressLogs = currentLogs.filter(log => {
    const stress = log.psych.stress;
    return stress === 'high' || stress === 'medium';
  });

  if (lowStressLogs.length > 0 && highStressLogs.length > 0) {
    const lowValue = calculateMetricForLogs(lowStressLogs);
    const highValue = calculateMetricForLogs(highStressLogs);
    const impact = highValue === 0 ? 0 : ((highValue - lowValue) / highValue) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Low Stress',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
        targetSymptom: metric,
        targetSymptomLabel: metricLabel,
        targetMetric: metric
      });
    }
  }

  const goodHydrationLogs = currentLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water >= 6;
  });
  const poorHydrationLogs = currentLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water < 6;
  });

  if (goodHydrationLogs.length > 0 && poorHydrationLogs.length > 0) {
    const goodValue = calculateMetricForLogs(goodHydrationLogs);
    const poorValue = calculateMetricForLogs(poorHydrationLogs);
    const impact = poorValue === 0 ? 0 : ((poorValue - goodValue) / poorValue) * 100;
    if (Math.abs(impact) > 5) {
      const effectiveImpact = metricPolarity === 'direct' ? -impact : impact;
      factorImpacts.push({
        factor: 'Good Hydration',
        impact: Math.round(effectiveImpact),
        description: effectiveImpact > 0 ? `Improves ${metricLabel}` : `Worsens ${metricLabel}`,
        targetSymptom: metric,
        targetSymptomLabel: metricLabel,
        targetMetric: metric
      });
    }
  }

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

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementData>({
    totalStreak: 0,
    totalLogs: 0,
    badges: [],
    nextBadge: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true);
      const data = await calculateAchievements();
      setAchievements(data);
      setLoading(false);
    };

    loadAchievements();
  }, []);

  const refresh = async () => {
    const data = await calculateAchievements();
    setAchievements(data);
  };

  return { achievements, loading, refresh };
}
