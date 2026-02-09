const NEUTRAL = 5;
const SCALE_MAX = 10;

export function getRawSleep(sleep?: string): number {
  if (!sleep) return NEUTRAL;
  if (sleep === '<6h') return 5;
  if (sleep === '6-7h') return 6.5;
  if (sleep === '7-8h') return 7.5;
  if (sleep === '>8h') return 8.5;
  return NEUTRAL;
}

export function getRawExercise(exercise?: string): number {
  if (!exercise) return 1;
  if (exercise === 'rest') return 1;
  if (exercise === 'light') return 3;
  if (exercise === 'moderate') return 6;
  if (exercise === 'intense') return 9;
  return 1;
}

export function getRawDiet(diet?: string): number {
  if (!diet) return NEUTRAL;
  if (diet === 'balanced') return 8;
  if (diet === 'cravings') return 4;
  if (diet === 'restrictive') return 3;
  return NEUTRAL;
}

export function getRawStress(stress?: string): number {
  if (!stress) return 3;
  if (stress === 'low') return 3;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 8;
  return 3;
}

export function getRawAnxiety(anxiety?: string): number {
  if (!anxiety) return 0;
  if (anxiety === 'none') return 0;
  if (anxiety === 'low') return 3;
  if (anxiety === 'high') return 8;
  return 0;
}

export function getRawBodyImage(bodyImage?: string): number {
  if (!bodyImage) return NEUTRAL;
  if (bodyImage === 'positive') return 8;
  if (bodyImage === 'neutral') return 5;
  if (bodyImage === 'negative') return 2;
  return NEUTRAL;
}

export function normalizeSleep(sleep?: string): number {
  if (!sleep) return NEUTRAL;
  if (sleep === '<6h') return 3;
  if (sleep === '6-7h') return 6;
  if (sleep === '7-8h') return 9;
  if (sleep === '>8h') return 9;
  return NEUTRAL;
}

export function normalizeExercise(exercise?: string): number {
  if (!exercise) return NEUTRAL;
  if (exercise === 'rest') return 5;
  if (exercise === 'light') return 7;
  if (exercise === 'moderate') return 9;
  if (exercise === 'intense') return SCALE_MAX;
  return NEUTRAL;
}

export function normalizeDiet(diet?: string): number {
  if (!diet) return NEUTRAL;
  if (diet === 'balanced') return 9;
  if (diet === 'cravings') return 4;
  if (diet === 'restrictive') return 4;
  return NEUTRAL;
}

export function normalizeStress(stress?: string): number {
  if (!stress) return NEUTRAL;
  if (stress === 'low') return 8;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 2;
  return NEUTRAL;
}

export function normalizeAnxiety(anxiety?: string): number {
  if (!anxiety) return NEUTRAL;
  if (anxiety === 'none') return 9;
  if (anxiety === 'low') return 7;
  if (anxiety === 'high') return 2;
  return NEUTRAL;
}

export function normalizeMood(mood?: number): number {
  if (mood === undefined || mood === null) return NEUTRAL;
  return Math.max(0, Math.min(SCALE_MAX, mood));
}

export function normalizeSymptom(severity?: number): number {
  if (severity === undefined || severity === null) return SCALE_MAX;
  return Math.max(0, SCALE_MAX - severity);
}

export function normalizeWater(glasses?: number): number {
  if (glasses === undefined || glasses === null) return NEUTRAL;
  if (glasses < 3) return 3;
  if (glasses < 6) return 6;
  if (glasses < 8) return 8;
  return SCALE_MAX;
}

export function normalizeBodyImage(bodyImage?: string): number {
  if (!bodyImage) return NEUTRAL;
  if (bodyImage === 'positive') return 9;
  if (bodyImage === 'neutral') return 5;
  if (bodyImage === 'negative') return 2;
  return NEUTRAL;
}

export function calculateChange(current: number, previous: number): number {
  return ((current - previous) / SCALE_MAX) * 100;
}

export function getNormalizedValue(field: string, value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') {
    if (['acne', 'hirsutism', 'hairLoss', 'bloat', 'cramps'].includes(field)) {
      return normalizeSymptom(value);
    }
    if (field === 'mood') return normalizeMood(value);
    if (field === 'waterIntake') return normalizeWater(value);
    return value;
  }

  switch (field) {
    case 'stress': return normalizeStress(value);
    case 'anxiety': return normalizeAnxiety(value);
    case 'bodyImage': return normalizeBodyImage(value);
    case 'sleep': return normalizeSleep(value);
    case 'exercise': return normalizeExercise(value);
    case 'diet': return normalizeDiet(value);
    default: return undefined;
  }
}

export function getRawValue(field: string, value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;

  switch (field) {
    case 'stress': return getRawStress(value);
    case 'anxiety': return getRawAnxiety(value);
    case 'bodyImage': return getRawBodyImage(value);
    case 'sleep': return getRawSleep(value);
    case 'exercise': return getRawExercise(value);
    case 'diet': return getRawDiet(value);
    default: return undefined;
  }
}
