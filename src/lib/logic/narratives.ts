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

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

interface LagCorrelation {
  triggerCondition: (log: LogEntry) => boolean;
  effectMetric: (log: LogEntry) => number | undefined;
  threshold: number;
  message: string;
  category: DailyWisdom['category'];
}

function checkLagCorrelation(
  logs: LogEntry[],
  lagDays: number,
  correlation: LagCorrelation
): DailyWisdom | null {
  if (logs.length < lagDays + 3) return null;

  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  const pairs: Array<{ trigger: boolean; effect: number }> = [];

  for (let i = 0; i < sortedLogs.length - lagDays; i++) {
    const triggerLog = sortedLogs[i];
    const effectLog = sortedLogs[i + lagDays];

    const trigger = correlation.triggerCondition(triggerLog);
    const effect = correlation.effectMetric(effectLog);

    if (effect !== undefined) {
      pairs.push({ trigger, effect });
    }
  }

  if (pairs.length < 3) return null;

  const triggeredPairs = pairs.filter(p => p.trigger);
  const nonTriggeredPairs = pairs.filter(p => !p.trigger);

  if (triggeredPairs.length < 2 || nonTriggeredPairs.length < 2) return null;

  const triggeredAvg = calculateAverage(triggeredPairs.map(p => p.effect));
  const nonTriggeredAvg = calculateAverage(nonTriggeredPairs.map(p => p.effect));

  const difference = triggeredAvg - nonTriggeredAvg;

  if (Math.abs(difference) >= correlation.threshold) {
    return {
      message: correlation.message,
      category: correlation.category,
      hasData: true,
      source: "Blossom Causal Engine"
    };
  }

  return null;
}

export interface DailyWisdom {
  message: string;
  category: 'sleep' | 'movement' | 'affirmation' | 'hydration' | 'diet' | 'stress' | 'cycle' | 'insight';
  hasData: boolean;
  source?: string;
}

export async function generateDailyWisdom(): Promise<DailyWisdom> {
  const allLogs = await getLastNDays(14);

  if (allLogs.length < 5) {
    return {
      message: "We are observing your rhythm. Continue logging to reveal your unique physiological patterns.",
      category: 'insight',
      hasData: false,
      source: "Blossom Pattern Engine"
    };
  }

  // Check time-lagged correlations first (Causal Logic)

  // 1. Diet -> Acne (2 days lag): High Sugar leads to Acne spike 2 days later
  const dietAcneCorrelation = checkLagCorrelation(allLogs, 2, {
    triggerCondition: (log) => log.lifestyle.diet === 'cravings',
    effectMetric: (log) => log.symptoms.acne,
    threshold: 1.5,
    message: "Whisper: Your data shows that high sugar intake tends to trigger acne flares ~2 days later.",
    category: 'diet'
  });
  if (dietAcneCorrelation) return dietAcneCorrelation;

  // 2. Sleep -> Anxiety (1 day lag): Poor Sleep leads to High Anxiety next day
  const sleepAnxietyCorrelation = checkLagCorrelation(allLogs, 1, {
    triggerCondition: (log) => log.lifestyle.sleep === '<6h',
    effectMetric: (log) => {
      const anxiety = log.psych.anxiety;
      if (anxiety === 'none') return 0;
      if (anxiety === 'low') return 3;
      if (anxiety === 'high') return 8;
      return typeof anxiety === 'number' ? anxiety : 5;
    },
    threshold: 2,
    message: "Whisper: Poor sleep (<6h) leads to heightened anxiety the next day in your pattern.",
    category: 'sleep'
  });
  if (sleepAnxietyCorrelation) return sleepAnxietyCorrelation;

  // 3. Cycle Phase -> Bloat (0 days lag): Luteal Phase correlates with higher Bloat
  const cyclePhases = allLogs.filter(log => log.cyclePhase && log.cyclePhase !== 'unknown');
  if (cyclePhases.length >= 5) {
    const lutealLogs = cyclePhases.filter(log => log.cyclePhase === 'luteal');
    const follicularLogs = cyclePhases.filter(log => log.cyclePhase === 'follicular');

    if (lutealLogs.length >= 2 && follicularLogs.length >= 2) {
      const lutealBloat = calculateAverage(lutealLogs.map(log => log.symptoms.bloat || 0));
      const follicularBloat = calculateAverage(follicularLogs.map(log => log.symptoms.bloat || 0));

      if (lutealBloat - follicularBloat > 1.5) {
        return {
          message: "Whisper: Your luteal phase consistently shows higher bloating. This is a common PCOS pattern.",
          category: 'cycle',
          hasData: true,
          source: "Blossom Causal Engine"
        };
      }
    }
  }

  const goodSleepLogs = allLogs.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    return sleepHours >= 7;
  });

  const badSleepLogs = allLogs.filter(log => {
    const sleepHours = convertLifestyleToNumber(log.lifestyle.sleep, 'sleep');
    return sleepHours < 7;
  });

  if (goodSleepLogs.length >= 3 && badSleepLogs.length >= 2) {
    const goodSleepMood = calculateAverage(
      goodSleepLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );
    const badSleepMood = calculateAverage(
      badSleepLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );

    const moodDifference = goodSleepMood - badSleepMood;

    if (moodDifference > 10) {
      return {
        message: `Whisper: Your body loves rest. Mood lifts when you sleep 7h+.`,
        category: 'sleep',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
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

  if (movementLogs.length >= 3 && restLogs.length >= 2) {
    const movementEnergy = calculateAverage(
      movementLogs.map(log => {
        if (log.customValues?.energy !== undefined) {
          return log.customValues.energy;
        }
        const mood = log.psych.mood;
        return typeof mood === 'number' ? mood : 50;
      })
    );

    const restEnergy = calculateAverage(
      restLogs.map(log => {
        if (log.customValues?.energy !== undefined) {
          return log.customValues.energy;
        }
        const mood = log.psych.mood;
        return typeof mood === 'number' ? mood : 50;
      })
    );

    const energyDifference = movementEnergy - restEnergy;

    if (energyDifference > 10) {
      return {
        message: `Whisper: Movement creates energy for you.`,
        category: 'movement',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  if (goodSleepLogs.length >= 3) {
    const goodSleepAcne = calculateAverage(
      goodSleepLogs.map(log => log.symptoms.acne || 0)
    );
    const badSleepAcne = calculateAverage(
      badSleepLogs.map(log => log.symptoms.acne || 0)
    );

    const acneDifference = badSleepAcne - goodSleepAcne;

    if (acneDifference > 1) {
      return {
        message: `Whisper: Nights you slept 7h+, your acne was clearer.`,
        category: 'sleep',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  const goodHydrationLogs = allLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water >= 6;
  });

  const poorHydrationLogs = allLogs.filter(log => {
    const water = log.lifestyle.waterIntake;
    return water !== undefined && water < 6;
  });

  if (goodHydrationLogs.length >= 3 && poorHydrationLogs.length >= 2) {
    const goodHydrationEnergy = calculateAverage(
      goodHydrationLogs.map(log => {
        if (log.customValues?.energy !== undefined) {
          return log.customValues.energy;
        }
        const mood = log.psych.mood;
        return typeof mood === 'number' ? mood : 50;
      })
    );

    const poorHydrationEnergy = calculateAverage(
      poorHydrationLogs.map(log => {
        if (log.customValues?.energy !== undefined) {
          return log.customValues.energy;
        }
        const mood = log.psych.mood;
        return typeof mood === 'number' ? mood : 50;
      })
    );

    const hydrationEnergyDifference = goodHydrationEnergy - poorHydrationEnergy;

    if (hydrationEnergyDifference > 10) {
      return {
        message: `Whisper: Days you drank 6+ glasses, your energy held steady.`,
        category: 'hydration',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  const balancedDietLogs = allLogs.filter(log => log.lifestyle.diet === 'balanced');
  const cravingsDietLogs = allLogs.filter(log => log.lifestyle.diet === 'cravings');

  if (balancedDietLogs.length >= 3 && cravingsDietLogs.length >= 2) {
    const balancedMood = calculateAverage(
      balancedDietLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );
    const cravingsMood = calculateAverage(
      cravingsDietLogs.map(log => (typeof log.psych.mood === 'number' ? log.psych.mood : 50))
    );

    const moodDifference = balancedMood - cravingsMood;

    if (moodDifference > 10) {
      return {
        message: `Whisper: Balanced meals aligned with brighter moods.`,
        category: 'diet',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  const lowStressLogs = allLogs.filter(log => log.psych.stress === 'low');
  const highStressLogs = allLogs.filter(log => {
    const stress = log.psych.stress;
    return stress === 'high' || stress === 'medium';
  });

  if (lowStressLogs.length >= 3 && highStressLogs.length >= 2) {
    const lowStressSymptoms = calculateAverage(
      lowStressLogs.map(log => {
        const acne = log.symptoms.acne || 0;
        const hirsutism = log.symptoms.hirsutism || 0;
        const hairLoss = log.symptoms.hairLoss || 0;
        return (acne + hirsutism + hairLoss) / 3;
      })
    );

    const highStressSymptoms = calculateAverage(
      highStressLogs.map(log => {
        const acne = log.symptoms.acne || 0;
        const hirsutism = log.symptoms.hirsutism || 0;
        const hairLoss = log.symptoms.hairLoss || 0;
        return (acne + hirsutism + hairLoss) / 3;
      })
    );

    const symptomDifference = highStressSymptoms - lowStressSymptoms;

    if (symptomDifference > 1) {
      return {
        message: `Whisper: Low-stress days showed fewer physical symptoms.`,
        category: 'stress',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  if (movementLogs.length >= 3 && restLogs.length >= 2) {
    const movementAnxiety = calculateAverage(
      movementLogs.map(log => {
        const anxiety = log.psych.anxiety;
        if (anxiety === 'none') return 0;
        if (anxiety === 'low') return 3;
        if (anxiety === 'high') return 8;
        return typeof anxiety === 'number' ? anxiety : 5;
      })
    );

    const restAnxiety = calculateAverage(
      restLogs.map(log => {
        const anxiety = log.psych.anxiety;
        if (anxiety === 'none') return 0;
        if (anxiety === 'low') return 3;
        if (anxiety === 'high') return 8;
        return typeof anxiety === 'number' ? anxiety : 5;
      })
    );

    const anxietyDifference = restAnxiety - movementAnxiety;

    if (anxietyDifference > 1.5) {
      return {
        message: `Whisper: Movement days brought calmer thoughts.`,
        category: 'movement',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  if (goodSleepLogs.length >= 5) {
    const goodSleepCycleRegularity = goodSleepLogs.filter(log => {
      const phase = log.cyclePhase;
      return phase && phase !== 'unknown';
    }).length / goodSleepLogs.length;

    const badSleepCycleRegularity = badSleepLogs.length > 0
      ? badSleepLogs.filter(log => {
          const phase = log.cyclePhase;
          return phase && phase !== 'unknown';
        }).length / badSleepLogs.length
      : 0;

    if (goodSleepCycleRegularity > badSleepCycleRegularity + 0.2) {
      return {
        message: `Whisper: Consistent sleep supported more predictable cycles.`,
        category: 'cycle',
        hasData: true,
        source: "Blossom Pattern Engine"
      };
    }
  }

  return {
    message: "Your baseline is stabilizing. We are looking for deeper correlations between your cycle and your lifestyle.",
    category: 'insight',
    hasData: true,
    source: "Blossom Pattern Engine"
  };
}
