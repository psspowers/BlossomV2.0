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

const MONASH_AFFIRMATIONS = [
  "You are not broken. You are navigating a complex path with grace.",
  "Your body is doing its best. Every small choice matters.",
  "PCOS is a constellation of symptoms, not a character flaw.",
  "Healing is not linear. Rest is part of progress.",
  "You deserve compassion, especially from yourself.",
  "Your worth is not measured by your symptoms.",
  "Small, consistent actions create lasting change.",
  "You are learning to listen to your body's wisdom."
];

export interface DailyWisdom {
  message: string;
  category: 'sleep' | 'movement' | 'affirmation' | 'hydration' | 'diet' | 'stress' | 'cycle';
  hasData: boolean;
}

export async function generateDailyWisdom(): Promise<DailyWisdom> {
  const allLogs = await getLastNDays(14);

  if (allLogs.length < 5) {
    const randomAffirmation = MONASH_AFFIRMATIONS[Math.floor(Math.random() * MONASH_AFFIRMATIONS.length)];
    return {
      message: randomAffirmation,
      category: 'affirmation',
      hasData: false
    };
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
        hasData: true
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
        hasData: true
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
        hasData: true
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
        hasData: true
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
        hasData: true
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
        hasData: true
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
        hasData: true
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
        hasData: true
      };
    }
  }

  const randomAffirmation = MONASH_AFFIRMATIONS[Math.floor(Math.random() * MONASH_AFFIRMATIONS.length)];
  return {
    message: randomAffirmation,
    category: 'affirmation',
    hasData: false
  };
}
