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
  category: 'sleep' | 'movement' | 'affirmation';
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

  const randomAffirmation = MONASH_AFFIRMATIONS[Math.floor(Math.random() * MONASH_AFFIRMATIONS.length)];
  return {
    message: randomAffirmation,
    category: 'affirmation',
    hasData: false
  };
}
