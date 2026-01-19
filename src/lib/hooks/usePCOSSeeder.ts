import { db, LogEntry } from '../db';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const mapSleep = (quality: number): string => {
  if (quality <= 2) return '<6h';
  if (quality === 3) return '6-7h';
  if (quality === 4) return '7-8h';
  return '>8h';
};

const mapStress = (level: number): string => {
  if (level <= 2) return 'low';
  if (level <= 3) return 'medium';
  return 'high';
};

const mapAnxiety = (level: number): string => {
  if (level <= 2) return 'none';
  if (level <= 3) return 'low';
  return 'high';
};

const mapExercise = (level: string): string => {
  return level;
};

const randomVariance = (base: number, variance: number) => {
  return Math.max(0, Math.min(10, base + (Math.random() - 0.5) * variance));
};

type PersonaName = 'Emma' | 'Sophia' | 'Olivia' | 'Ava' | 'Isabella';

interface PersonaConfig {
  name: string;
  type: string;
  cycleLength: number;
  cycleVariance: number;
  baseSymptoms: {
    cramps: number;
    acne: number;
    bloat: number;
    hirsutism?: number;
    hairLoss?: number;
  };
  basePsych: {
    stress: number;
    anxiety: number;
    mood: number;
  };
  baseLifestyle: {
    sleep: number;
    exercise: string;
    waterIntake: number;
  };
  spottingChance?: number;
  improvementRate?: number;
}

export function usePCOSSeeder() {
  const generateHistory = async (personaName: PersonaName) => {
    await db.logs.clear();

    const personas: Record<PersonaName, PersonaConfig> = {
      Emma: {
        name: 'Emma - Insulin Resistant',
        type: 'Insulin-Resistant PCOS',
        cycleLength: 50,
        cycleVariance: 10,
        baseSymptoms: {
          cramps: 4,
          acne: 3,
          bloat: 6,
          hairLoss: 2
        },
        basePsych: {
          stress: 3,
          anxiety: 2,
          mood: 50
        },
        baseLifestyle: {
          sleep: 3,
          exercise: 'light',
          waterIntake: 5
        },
        improvementRate: 0.005
      },
      Sophia: {
        name: 'Sophia - Adrenal PCOS',
        type: 'Adrenal PCOS',
        cycleLength: 29,
        cycleVariance: 3,
        baseSymptoms: {
          cramps: 3,
          acne: 3,
          bloat: 3,
          hairLoss: 2
        },
        basePsych: {
          stress: 5,
          anxiety: 4,
          mood: 40
        },
        baseLifestyle: {
          sleep: 2,
          exercise: 'rest',
          waterIntake: 4
        },
        spottingChance: 0.08
      },
      Olivia: {
        name: 'Olivia - Inflammatory',
        type: 'Inflammatory PCOS',
        cycleLength: 32,
        cycleVariance: 4,
        baseSymptoms: {
          cramps: 7,
          acne: 6,
          bloat: 7,
          hairLoss: 1
        },
        basePsych: {
          stress: 3,
          anxiety: 2,
          mood: 55
        },
        baseLifestyle: {
          sleep: 4,
          exercise: 'moderate',
          waterIntake: 6
        },
        spottingChance: 0.05
      },
      Ava: {
        name: 'Ava - Post-Pill',
        type: 'Post-Pill PCOS',
        cycleLength: 65,
        cycleVariance: 15,
        baseSymptoms: {
          cramps: 4,
          acne: 3,
          bloat: 4,
          hairLoss: 2
        },
        basePsych: {
          stress: 3,
          anxiety: 3,
          mood: 60
        },
        baseLifestyle: {
          sleep: 4,
          exercise: 'moderate',
          waterIntake: 6
        },
        spottingChance: 0.15
      },
      Isabella: {
        name: 'Isabella - Lean PCOS',
        type: 'Lean PCOS',
        cycleLength: 28,
        cycleVariance: 2,
        baseSymptoms: {
          cramps: 3,
          acne: 5,
          bloat: 2,
          hirsutism: 6,
          hairLoss: 1
        },
        basePsych: {
          stress: 2,
          anxiety: 2,
          mood: 75
        },
        baseLifestyle: {
          sleep: 5,
          exercise: 'intense',
          waterIntake: 8
        },
        spottingChance: 0.03
      }
    };

    const config = personas[personaName];
    const logs: LogEntry[] = [];
    const historyLength = 180;

    let daysSincePeriod = Math.floor(Math.random() * 10);
    let nextCycleLength = config.cycleLength;

    for (let i = historyLength; i >= 0; i--) {
      const isPeriod = daysSincePeriod <= 3 && daysSincePeriod >= 0;
      const isSpotting = !isPeriod && Math.random() < (config.spottingChance || 0.05);

      const improvementFactor = config.improvementRate
        ? Math.max(0, 1 - (historyLength - i) * config.improvementRate)
        : 0;

      const follicularPhase = daysSincePeriod > 3 && daysSincePeriod <= 14;
      const ovulatoryPhase = daysSincePeriod > 14 && daysSincePeriod <= 18;
      const lutealPhase = daysSincePeriod > 18;

      let cyclePhase: LogEntry['cyclePhase'] = 'unknown';
      if (isPeriod) cyclePhase = 'menstrual';
      else if (follicularPhase) cyclePhase = 'follicular';
      else if (ovulatoryPhase) cyclePhase = 'ovulatory';
      else if (lutealPhase) cyclePhase = 'luteal';

      let flow: LogEntry['flow'] = 'none';
      if (isPeriod) {
        if (daysSincePeriod === 0 || daysSincePeriod === 1) flow = 'heavy';
        else if (daysSincePeriod === 2) flow = 'medium';
        else flow = 'light';
      } else if (isSpotting) {
        flow = 'spotting';
      }

      const periodMultiplier = isPeriod ? 1.5 : 1.0;
      const lutealMultiplier = lutealPhase ? 1.2 : 1.0;

      const symptoms: LogEntry['symptoms'] = {
        cramps: isPeriod ? Math.round(config.baseSymptoms.cramps * periodMultiplier) : Math.round(randomVariance(config.baseSymptoms.cramps * 0.3, 2)),
        acne: Math.round(randomVariance(config.baseSymptoms.acne * (1 - improvementFactor * 0.4), 2)),
        bloat: Math.round(randomVariance(config.baseSymptoms.bloat * lutealMultiplier * (1 - improvementFactor * 0.2), 2)),
      };

      if (config.baseSymptoms.hirsutism) {
        symptoms.hirsutism = Math.round(config.baseSymptoms.hirsutism);
      }
      if (config.baseSymptoms.hairLoss) {
        symptoms.hairLoss = Math.round(config.baseSymptoms.hairLoss);
      }

      const stressLevel = config.basePsych.stress;
      const anxietyLevel = config.basePsych.anxiety;
      const moodBase = config.basePsych.mood + (1 - improvementFactor) * -10;

      const psych: LogEntry['psych'] = {
        stress: mapStress(stressLevel + (isPeriod ? 1 : 0)),
        anxiety: mapAnxiety(anxietyLevel + (isPeriod ? 1 : 0)),
        mood: Math.max(20, Math.min(100, moodBase + (Math.random() * 20 - 10))),
        bodyImage: moodBase > 60 ? 'positive' : moodBase > 40 ? 'neutral' : 'negative'
      };

      const sleepQuality = config.baseLifestyle.sleep + (improvementFactor > 0 ? 1 : 0);
      const waterIntake = config.baseLifestyle.waterIntake + Math.floor(improvementFactor * 2);

      const lifestyle: LogEntry['lifestyle'] = {
        sleep: mapSleep(sleepQuality),
        exercise: mapExercise(config.baseLifestyle.exercise),
        waterIntake: Math.min(10, waterIntake),
        diet: improvementFactor > 0.3 ? 'balanced' : Math.random() > 0.5 ? 'balanced' : 'cravings'
      };

      if (personaName === 'Emma') {
        lifestyle.diet = improvementFactor > 0.4 ? 'balanced' : 'cravings';
      }

      logs.push({
        date: daysAgo(i),
        cyclePhase,
        flow,
        symptoms,
        psych,
        lifestyle
      });

      daysSincePeriod++;

      if (daysSincePeriod >= nextCycleLength) {
        daysSincePeriod = 0;
        const variance = Math.floor(Math.random() * config.cycleVariance * 2) - config.cycleVariance;
        nextCycleLength = config.cycleLength + variance;
      }
    }

    await db.logs.bulkAdd(logs);

    return {
      name: config.name,
      type: config.type,
      logsCreated: logs.length,
      cycleInfo: `Average cycle: ${config.cycleLength} days (±${config.cycleVariance} days)`
    };
  };

  const loadEmma = async () => {
    const result = await generateHistory('Emma');
    return {
      ...result,
      description: '180 days of insulin-resistant PCOS data. Long cycles (50±10 days), sugar cravings, gradual lifestyle improvement over time.',
      expectedPattern: 'Shows metabolic healing trajectory with improving diet and symptoms'
    };
  };

  const loadSophia = async () => {
    const result = await generateHistory('Sophia');
    return {
      ...result,
      description: '180 days of adrenal PCOS data. Regular cycles (29±3 days) but driven by chronic stress and poor sleep patterns.',
      expectedPattern: 'High stress/anxiety levels, sleep deprivation, occasional spotting'
    };
  };

  const loadOlivia = async () => {
    const result = await generateHistory('Olivia');
    return {
      ...result,
      description: '180 days of inflammatory PCOS data. Moderate cycles (32±4 days) with severe cramps, acne, and bloating.',
      expectedPattern: 'Elevated inflammatory symptoms, high pain levels during menstruation'
    };
  };

  const loadAva = async () => {
    const result = await generateHistory('Ava');
    return {
      ...result,
      description: '180 days of post-pill PCOS data. Very long cycles (65±15 days) with frequent spotting events.',
      expectedPattern: 'Extended follicular phase, irregular spotting, hormonal rebalancing'
    };
  };

  const loadIsabella = async () => {
    const result = await generateHistory('Isabella');
    return {
      ...result,
      description: '180 days of lean PCOS data. Regular cycles (28±2 days), high exercise, prominent hirsutism.',
      expectedPattern: 'Athletic lifestyle, androgenic symptoms, excellent self-care metrics'
    };
  };

  return {
    loadEmma,
    loadSophia,
    loadOlivia,
    loadAva,
    loadIsabella
  };
}
