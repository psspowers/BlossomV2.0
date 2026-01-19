import { LogEntry, getLastNDays } from '../db';

export interface PatternStory {
  id: string;
  message: string;
  category: 'sleep' | 'movement' | 'nutrition' | 'stress' | 'cycle' | 'general';
  hasData: boolean;
  source: string;
  impact?: number;
}

interface ScenarioConfig {
  id: string;
  category: PatternStory['category'];
  causeLabel: string;
  effectLabel: string;
  checkCause: (log: LogEntry) => boolean;
  getEffectValue: (log: LogEntry) => number | undefined;
  filterPhase?: string;
  delayDays: number;
  minDiffPercent: number;
  positiveTemplate: (pct: number) => string;
  negativeTemplate: (pct: number) => string;
  source: string;
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

function normalizeValue(value: any, type: 'lifestyle' | 'symptom' | 'psych'): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  if (value === '<6h' || value === 'poor' || value === 'rest' || value === 'none') return 2;
  if (value === '6-7h' || value === 'fair' || value === 'light') return 5;
  if (value === '7-8h' || value === 'good' || value === 'moderate' || value === 'balanced') return 8;
  if (value === '>8h' || value === 'excellent' || value === 'intense') return 10;

  if (value === 'high' || value === 'cravings') return 8;
  if (value === 'medium') return 5;
  if (value === 'low') return 2;

  return 0;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'sleep_mood',
    category: 'sleep',
    causeLabel: 'Good Sleep',
    effectLabel: 'Mood',
    checkCause: (l) => normalizeValue(l.lifestyle.sleep, 'lifestyle') >= 8,
    getEffectValue: (l) => typeof l.psych.mood === 'number' ? l.psych.mood : undefined,
    delayDays: 0,
    minDiffPercent: 10,
    positiveTemplate: (p) => `Your mood lifts +${p}% on days with 7h+ sleep. Rest is your medicine.`,
    negativeTemplate: (p) => `Mood dips -${p}% when sleep is short. Be gentle with yourself today.`,
    source: "Monash 2023"
  },
  {
    id: 'sugar_bloat_delay',
    category: 'nutrition',
    causeLabel: 'High Sugar',
    effectLabel: 'Bloating',
    checkCause: (l) => l.lifestyle.diet === 'cravings' || l.lifestyle.diet === 'restrictive',
    getEffectValue: (l) => l.symptoms.bloat,
    delayDays: 2,
    minDiffPercent: 15,
    positiveTemplate: (p) => `Low sugar choices ease bloating by ${p}% after 2 days. Gentle choices ripple forward.`,
    negativeTemplate: (p) => `High sugar leads to bloating +${p}% after 2 days.`,
    source: "ACOG Guidelines"
  },
  {
    id: 'exercise_energy_luteal',
    category: 'movement',
    causeLabel: 'Movement',
    effectLabel: 'Energy',
    checkCause: (l) => normalizeValue(l.lifestyle.exercise, 'lifestyle') >= 5,
    getEffectValue: (l) => l.customValues?.energy || (typeof l.psych.mood === 'number' ? l.psych.mood / 10 : undefined),
    filterPhase: 'luteal',
    delayDays: 0,
    minDiffPercent: 10,
    positiveTemplate: (p) => `Movement creates energy +${p}%, even in your Luteal phase.`,
    negativeTemplate: (p) => ``,
    source: "NIH Research"
  },
  {
    id: 'stress_anxiety_lag',
    category: 'stress',
    causeLabel: 'High Stress',
    effectLabel: 'Anxiety',
    checkCause: (l) => normalizeValue(l.psych.stress, 'psych') >= 8,
    getEffectValue: (l) => normalizeValue(l.psych.anxiety, 'psych'),
    delayDays: 1,
    minDiffPercent: 15,
    positiveTemplate: (p) => `Calm days reduce tomorrow's anxiety by ${p}%.`,
    negativeTemplate: (p) => `Stress amplifies anxiety +${p}% with a 1-day delay.`,
    source: "Monash"
  },
  {
    id: 'sugar_cravings_velocity',
    category: 'nutrition',
    causeLabel: 'Balanced Diet',
    effectLabel: 'Cravings',
    checkCause: (l) => l.lifestyle.diet === 'balanced',
    getEffectValue: (l) => l.symptoms.cravings,
    delayDays: 0,
    minDiffPercent: 20,
    positiveTemplate: (p) => `Balanced eating reduces cravings -${p}%. You are breaking the cycle.`,
    negativeTemplate: (p) => ``,
    source: "ACOG"
  },
  {
    id: 'sleep_bloat_luteal',
    category: 'sleep',
    causeLabel: 'Rest',
    effectLabel: 'Bloating',
    checkCause: (l) => normalizeValue(l.lifestyle.sleep, 'lifestyle') >= 8,
    getEffectValue: (l) => l.symptoms.bloat,
    filterPhase: 'luteal',
    delayDays: 0,
    minDiffPercent: 15,
    positiveTemplate: (p) => `Better sleep eases Luteal bloating by ${p}%. Your body loves rest right now.`,
    negativeTemplate: (p) => ``,
    source: "Blossom Insights"
  },
  {
    id: 'exercise_hair',
    category: 'movement',
    causeLabel: 'Activity',
    effectLabel: 'Hair Loss',
    checkCause: (l) => normalizeValue(l.lifestyle.exercise, 'lifestyle') >= 5,
    getEffectValue: (l) => l.symptoms.hairLoss,
    delayDays: 0,
    minDiffPercent: 10,
    positiveTemplate: (p) => `Consistent movement links to -${p}% hair loss severity. Circulation heals.`,
    negativeTemplate: (p) => ``,
    source: "Dr. Felice Gersh"
  },
  {
    id: 'stress_acne_lag',
    category: 'stress',
    causeLabel: 'Stress',
    effectLabel: 'Acne',
    checkCause: (l) => normalizeValue(l.psych.stress, 'psych') >= 8,
    getEffectValue: (l) => l.symptoms.acne,
    delayDays: 2,
    minDiffPercent: 15,
    positiveTemplate: (p) => ``,
    negativeTemplate: (p) => `Stress links to acne flares +${p}% after 2 days. Self-compassion helps.`,
    source: "Mayo Clinic"
  },
  {
    id: 'sleep_cramps',
    category: 'sleep',
    causeLabel: 'Sleep',
    effectLabel: 'Cramps',
    checkCause: (l) => normalizeValue(l.lifestyle.sleep, 'lifestyle') >= 8,
    getEffectValue: (l) => l.symptoms.cramps,
    delayDays: 0,
    minDiffPercent: 20,
    positiveTemplate: (p) => `Rest reduces pain. Cramps are ${p}% lower on days you sleep well.`,
    negativeTemplate: (p) => ``,
    source: "NIH"
  },
  {
    id: 'activity_bodyimage',
    category: 'movement',
    causeLabel: 'Movement',
    effectLabel: 'Body Image',
    checkCause: (l) => normalizeValue(l.lifestyle.exercise, 'lifestyle') >= 5,
    getEffectValue: (l) => normalizeValue(l.psych.bodyImage, 'psych'),
    delayDays: 0,
    minDiffPercent: 15,
    positiveTemplate: (p) => `Activity boosts body image +${p}%. Celebrate your strength.`,
    negativeTemplate: (p) => ``,
    source: "Monash"
  },
  {
    id: 'diet_anxiety_luteal',
    category: 'nutrition',
    causeLabel: 'Balanced Diet',
    effectLabel: 'Anxiety',
    checkCause: (l) => l.lifestyle.diet === 'balanced',
    getEffectValue: (l) => normalizeValue(l.psych.anxiety, 'psych'),
    filterPhase: 'luteal',
    delayDays: 0,
    minDiffPercent: 20,
    positiveTemplate: (p) => `Nourishing food eases Luteal anxiety by ${p}%.`,
    negativeTemplate: (p) => ``,
    source: "Mayo Clinic"
  },
  {
    id: 'exercise_hirsutism',
    category: 'movement',
    causeLabel: 'Activity',
    effectLabel: 'Facial Hair',
    checkCause: (l) => normalizeValue(l.lifestyle.exercise, 'lifestyle') >= 5,
    getEffectValue: (l) => l.symptoms.hirsutism,
    delayDays: 0,
    minDiffPercent: 12,
    positiveTemplate: (p) => `Active days correlate with -${p}% hirsutism concern.`,
    negativeTemplate: (p) => ``,
    source: "NIH"
  }
];

export async function generatePatternStories(): Promise<PatternStory[]> {
  const logs = await getLastNDays(30);

  if (logs.length < 5) {
    return [{
      id: 'welcome_gathering',
      message: "We are learning your unique rhythm. Keep logging to reveal how your lifestyle choices affect your symptoms.",
      category: 'general',
      hasData: false,
      source: "Blossom Pattern Engine"
    }];
  }

  const stories: PatternStory[] = [];

  const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const scenario of SCENARIOS) {
    const causeValues: number[] = [];
    const controlValues: number[] = [];

    for (let i = 0; i < sortedLogs.length - scenario.delayDays; i++) {
      const causeLog = sortedLogs[i + scenario.delayDays];
      const effectLog = sortedLogs[i];

      if (!causeLog || !effectLog) continue;

      if (scenario.filterPhase && causeLog.cyclePhase !== scenario.filterPhase) continue;

      const effectValue = scenario.getEffectValue(effectLog);
      if (effectValue === undefined) continue;

      if (scenario.checkCause(causeLog)) {
        causeValues.push(effectValue);
      } else {
        controlValues.push(effectValue);
      }
    }

    if (causeValues.length >= 3 && controlValues.length >= 3) {
      const avgCause = causeValues.reduce((a,b)=>a+b,0) / causeValues.length;
      const avgControl = controlValues.reduce((a,b)=>a+b,0) / controlValues.length;

      const isInverseMetric = ['acne', 'bloat', 'cramps', 'hirsutism', 'hairloss', 'stress', 'anxiety'].some(s => scenario.effectLabel.toLowerCase().includes(s));

      let diff = 0;
      let isImprovement = false;

      if (isInverseMetric) {
        diff = ((avgControl - avgCause) / avgControl) * 100;
        isImprovement = diff > 0;
      } else {
        diff = ((avgCause - avgControl) / avgControl) * 100;
        isImprovement = diff > 0;
      }

      if (Math.abs(diff) >= scenario.minDiffPercent) {
        const template = isImprovement ? scenario.positiveTemplate : scenario.negativeTemplate;
        const text = template(Math.round(Math.abs(diff)));

        if (text) {
          stories.push({
            id: scenario.id,
            message: text,
            category: scenario.category,
            hasData: true,
            source: "Your Unique Pattern",
            impact: Math.round(diff)
          });
        }
      }
    }
  }

  if (stories.length === 0) {
    const randomAffirmation = MONASH_AFFIRMATIONS[Math.floor(Math.random() * MONASH_AFFIRMATIONS.length)];
    return [{
      id: 'affirmation_fallback',
      message: randomAffirmation,
      category: 'general',
      hasData: false,
      source: "Blossom Compassion"
    }];
  }

  return stories.sort((a, b) => (b.impact || 0) - (a.impact || 0));
}

export interface DailyWisdom {
  message: string;
  category: 'sleep' | 'movement' | 'affirmation' | 'hydration' | 'diet' | 'stress' | 'cycle' | 'insight';
  hasData: boolean;
  source?: string;
}

export async function generateDailyWisdom(): Promise<DailyWisdom> {
  const stories = await generatePatternStories();

  if (stories.length === 0 || !stories[0].hasData) {
    return {
      message: stories[0].message,
      category: 'insight',
      hasData: false,
      source: stories[0].source
    };
  }

  const topStory = stories[0];

  const categoryMap: Record<string, DailyWisdom['category']> = {
    'sleep': 'sleep',
    'movement': 'movement',
    'nutrition': 'diet',
    'stress': 'stress',
    'cycle': 'cycle',
    'general': 'insight'
  };

  return {
    message: topStory.message,
    category: categoryMap[topStory.category] || 'insight',
    hasData: topStory.hasData,
    source: topStory.source
  };
}
