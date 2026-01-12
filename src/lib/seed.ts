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

export async function seedDatabase(): Promise<void> {
  const existingLogs = await db.logs.count();

  if (existingLogs > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  const syntheticData: LogEntry[] = [];

  const pattern = [
    { type: 'recovery', label: 'Good Day' },
    { type: 'recovery', label: 'Good Day' },
    { type: 'baseline', label: 'Mixed Day' },
    { type: 'crash', label: 'Bad Day' },
    { type: 'recovery', label: 'Good Day' },
    { type: 'baseline', label: 'Mixed Day' },
    { type: 'crash', label: 'Bad Day' },
    { type: 'crash', label: 'Bad Day' },
    { type: 'recovery', label: 'Good Day' },
    { type: 'baseline', label: 'Mixed Day' },
    { type: 'recovery', label: 'Good Day' },
    { type: 'crash', label: 'Bad Day' },
    { type: 'baseline', label: 'Mixed Day' },
    { type: 'recovery', label: 'Good Day' },
  ];

  for (let daysAgo = 1; daysAgo <= 30; daysAgo++) {
    const patternIndex = (daysAgo - 1) % pattern.length;
    const dayType = pattern[patternIndex].type;

    if (dayType === 'recovery') {
      syntheticData.push(generateRecoveryDay(daysAgo));
    } else if (dayType === 'crash') {
      syntheticData.push(generateCrashDay(daysAgo));
    } else {
      syntheticData.push(generateBaselineDay(daysAgo));
    }
  }

  await db.logs.bulkAdd(syntheticData);

  console.log(`✅ Seeded ${syntheticData.length} days of synthetic data`);
  console.log('📊 Data Narrative:');
  console.log('  Mixed pattern with recovery, crash, and baseline days');
  console.log('  Enables meaningful lifestyle factor correlations');
}
