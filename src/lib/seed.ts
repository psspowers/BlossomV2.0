import { db, LogEntry } from './db';
import { format, subDays } from 'date-fns';

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRecoveryDay(daysAgo: number): LogEntry {
  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'follicular',
    flow: 'none',
    symptoms: {
      acne: randomInRange(1, 3),
      hirsutism: randomInRange(2, 4),
      hairLoss: randomInRange(1, 3),
      bloat: randomInRange(1, 2),
      cramps: randomInRange(0, 2)
    },
    psych: {
      stress: 'low',
      bodyImage: 'positive',
      mood: randomInRange(7, 9),
      anxiety: 'none'
    },
    lifestyle: {
      sleep: '7-8h',
      waterIntake: randomInRange(8, 10),
      exercise: 'moderate',
      diet: 'balanced'
    },
    customValues: {
      energy: randomInRange(7, 9)
    }
  };
}

function generateCrashDay(daysAgo: number): LogEntry {
  const flows: Array<'light' | 'medium' | 'heavy'> = ['light', 'medium', 'heavy'];
  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'menstrual',
    flow: flows[Math.floor(Math.random() * flows.length)],
    symptoms: {
      acne: randomInRange(6, 8),
      hirsutism: randomInRange(5, 7),
      hairLoss: randomInRange(5, 7),
      bloat: randomInRange(7, 9),
      cramps: randomInRange(6, 9)
    },
    psych: {
      stress: 'high',
      bodyImage: 'negative',
      mood: randomInRange(2, 4),
      anxiety: 'high'
    },
    lifestyle: {
      sleep: '<6h',
      waterIntake: randomInRange(3, 5),
      exercise: 'rest',
      diet: 'cravings'
    },
    customValues: {
      energy: randomInRange(2, 4)
    }
  };
}

function generateBaselineDay(daysAgo: number): LogEntry {
  const phases: Array<'follicular' | 'ovulatory' | 'luteal'> = ['follicular', 'ovulatory', 'luteal'];
  const phase = phases[Math.floor(Math.random() * phases.length)];
  const stressLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const bodyImageLevels: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];
  const anxietyLevels: Array<'none' | 'low' | 'high'> = ['none', 'low', 'high'];
  const sleepOptions = ['6-7h', '7-8h'];
  const exerciseOptions = ['light', 'moderate'];
  const dietOptions = ['balanced', 'cravings'];

  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: phase,
    flow: 'spotting',
    symptoms: {
      acne: randomInRange(3, 6),
      hirsutism: randomInRange(3, 6),
      hairLoss: randomInRange(3, 5),
      bloat: randomInRange(3, 6),
      cramps: randomInRange(2, 6)
    },
    psych: {
      stress: stressLevels[Math.floor(Math.random() * stressLevels.length)],
      bodyImage: bodyImageLevels[Math.floor(Math.random() * bodyImageLevels.length)],
      mood: randomInRange(4, 6),
      anxiety: anxietyLevels[Math.floor(Math.random() * anxietyLevels.length)]
    },
    lifestyle: {
      sleep: sleepOptions[Math.floor(Math.random() * sleepOptions.length)],
      waterIntake: randomInRange(5, 8),
      exercise: exerciseOptions[Math.floor(Math.random() * exerciseOptions.length)],
      diet: dietOptions[Math.floor(Math.random() * dietOptions.length)]
    },
    customValues: {
      energy: randomInRange(4, 7)
    }
  };
}

function generateMenstrualDay(daysAgo: number, dayOfPeriod: number): LogEntry {
  const flows: Array<'light' | 'medium' | 'heavy'> =
    dayOfPeriod === 1 ? ['medium', 'heavy'] :
    dayOfPeriod <= 3 ? ['medium', 'heavy'] :
    ['light', 'medium'];

  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'menstrual',
    flow: flows[Math.floor(Math.random() * flows.length)],
    symptoms: {
      acne: randomInRange(5, 7),
      hirsutism: randomInRange(4, 6),
      hairLoss: randomInRange(4, 6),
      bloat: randomInRange(6, 8),
      cramps: dayOfPeriod <= 2 ? randomInRange(7, 9) : randomInRange(4, 6)
    },
    psych: {
      stress: dayOfPeriod <= 2 ? 'high' : 'medium',
      bodyImage: 'negative',
      mood: randomInRange(3, 5),
      anxiety: dayOfPeriod <= 2 ? 'high' : 'low'
    },
    lifestyle: {
      sleep: dayOfPeriod <= 2 ? '<6h' : '6-7h',
      waterIntake: randomInRange(4, 6),
      exercise: 'rest',
      diet: 'cravings'
    },
    customValues: {
      energy: randomInRange(3, 5)
    }
  };
}

function generateFollicularDay(daysAgo: number): LogEntry {
  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'follicular',
    flow: 'none',
    symptoms: {
      acne: randomInRange(2, 4),
      hirsutism: randomInRange(3, 5),
      hairLoss: randomInRange(2, 4),
      bloat: randomInRange(2, 4),
      cramps: randomInRange(0, 2)
    },
    psych: {
      stress: 'low',
      bodyImage: 'positive',
      mood: randomInRange(6, 8),
      anxiety: 'none'
    },
    lifestyle: {
      sleep: '7-8h',
      waterIntake: randomInRange(7, 9),
      exercise: 'moderate',
      diet: 'balanced'
    },
    customValues: {
      energy: randomInRange(7, 9)
    }
  };
}

function generateOvulatoryDay(daysAgo: number): LogEntry {
  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'ovulatory',
    flow: 'none',
    symptoms: {
      acne: randomInRange(1, 3),
      hirsutism: randomInRange(3, 5),
      hairLoss: randomInRange(2, 4),
      bloat: randomInRange(3, 5),
      cramps: randomInRange(1, 3)
    },
    psych: {
      stress: 'low',
      bodyImage: 'positive',
      mood: randomInRange(7, 9),
      anxiety: 'none'
    },
    lifestyle: {
      sleep: '7-8h',
      waterIntake: randomInRange(8, 10),
      exercise: 'intense',
      diet: 'balanced'
    },
    customValues: {
      energy: randomInRange(8, 10)
    }
  };
}

function generateLutealDay(daysAgo: number, isLate: boolean): LogEntry {
  return {
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    cyclePhase: 'luteal',
    flow: 'spotting',
    symptoms: {
      acne: isLate ? randomInRange(5, 7) : randomInRange(3, 5),
      hirsutism: randomInRange(4, 6),
      hairLoss: randomInRange(3, 5),
      bloat: isLate ? randomInRange(6, 8) : randomInRange(4, 6),
      cramps: isLate ? randomInRange(4, 6) : randomInRange(2, 4)
    },
    psych: {
      stress: isLate ? 'high' : 'medium',
      bodyImage: isLate ? 'negative' : 'neutral',
      mood: isLate ? randomInRange(3, 5) : randomInRange(5, 7),
      anxiety: isLate ? 'high' : 'low'
    },
    lifestyle: {
      sleep: isLate ? '6-7h' : '7-8h',
      waterIntake: randomInRange(5, 7),
      exercise: 'light',
      diet: isLate ? 'cravings' : 'balanced'
    },
    customValues: {
      energy: isLate ? randomInRange(4, 6) : randomInRange(5, 7)
    }
  };
}

export async function seedDatabase(): Promise<void> {
  const existingLogs = await db.logs.count();

  if (existingLogs > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  const syntheticData: LogEntry[] = [];

  const cycle1Start = 65;
  const cycle2Start = 36;
  const cycle3Start = 9;

  for (let daysAgo = 70; daysAgo >= 1; daysAgo--) {
    let cycleDay: number;

    if (daysAgo >= cycle1Start) {
      cycleDay = cycle1Start - daysAgo + 1;
    } else if (daysAgo >= cycle2Start) {
      cycleDay = daysAgo - cycle2Start + 1;
    } else if (daysAgo >= cycle3Start) {
      cycleDay = daysAgo - cycle3Start + 1;
    } else {
      cycleDay = daysAgo + (cycle3Start - 1) + 1;
    }

    if (daysAgo <= cycle3Start && daysAgo > cycle3Start - 5) {
      const dayOfPeriod = cycle3Start - daysAgo + 1;
      syntheticData.push(generateMenstrualDay(daysAgo, dayOfPeriod));
    } else if (daysAgo <= cycle2Start && daysAgo > cycle2Start - 5) {
      const dayOfPeriod = cycle2Start - daysAgo + 1;
      syntheticData.push(generateMenstrualDay(daysAgo, dayOfPeriod));
    } else if (daysAgo <= cycle1Start && daysAgo > cycle1Start - 5) {
      const dayOfPeriod = cycle1Start - daysAgo + 1;
      syntheticData.push(generateMenstrualDay(daysAgo, dayOfPeriod));
    } else if (daysAgo > cycle3Start && daysAgo <= cycle2Start - 5) {
      const daysSincePeriod = cycle3Start - daysAgo + 6;
      if (daysSincePeriod >= 6 && daysSincePeriod <= 13) {
        syntheticData.push(generateFollicularDay(daysAgo));
      } else if (daysSincePeriod >= 14 && daysSincePeriod <= 17) {
        syntheticData.push(generateOvulatoryDay(daysAgo));
      } else {
        const isLateLuteal = daysSincePeriod > 24;
        syntheticData.push(generateLutealDay(daysAgo, isLateLuteal));
      }
    } else if (daysAgo > cycle2Start && daysAgo <= cycle1Start - 5) {
      const daysSincePeriod = cycle2Start - daysAgo + 6;
      if (daysSincePeriod >= 6 && daysSincePeriod <= 13) {
        syntheticData.push(generateFollicularDay(daysAgo));
      } else if (daysSincePeriod >= 14 && daysSincePeriod <= 17) {
        syntheticData.push(generateOvulatoryDay(daysAgo));
      } else {
        const isLateLuteal = daysSincePeriod > 24;
        syntheticData.push(generateLutealDay(daysAgo, isLateLuteal));
      }
    } else if (daysAgo > cycle1Start) {
      const daysSincePeriod = cycle1Start - daysAgo + 6;
      if (daysSincePeriod >= 6 && daysSincePeriod <= 13) {
        syntheticData.push(generateFollicularDay(daysAgo));
      } else if (daysSincePeriod >= 14 && daysSincePeriod <= 17) {
        syntheticData.push(generateOvulatoryDay(daysAgo));
      } else {
        const isLateLuteal = daysSincePeriod > 24;
        syntheticData.push(generateLutealDay(daysAgo, isLateLuteal));
      }
    } else {
      syntheticData.push(generateFollicularDay(daysAgo));
    }
  }

  await db.logs.bulkAdd(syntheticData);

  console.log(`✅ Seeded ${syntheticData.length} days of synthetic cycle data`);
  console.log('📊 Data Narrative:');
  console.log('  - 3 complete menstrual cycles');
  console.log('  - Cycle 1: 29 days (65-36 days ago)');
  console.log('  - Cycle 2: 27 days (36-9 days ago)');
  console.log('  - Cycle 3: In progress (started 9 days ago)');
  console.log('  - Realistic symptom patterns across cycle phases');
}
