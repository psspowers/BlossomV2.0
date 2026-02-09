export function getRawSleep(sleep?: string): number {
  if (!sleep) return 7;
  if (sleep === '<6h') return 5;
  if (sleep === '6-7h') return 6.5;
  if (sleep === '7-8h') return 7.5;
  if (sleep === '>8h') return 8.5;
  return 7;
}

export function getRawExercise(exercise?: string): number {
  if (!exercise) return 5;
  if (exercise === 'rest') return 1;
  if (exercise === 'light') return 3;
  if (exercise === 'moderate') return 6;
  if (exercise === 'intense') return 9;
  return 5;
}

export function getRawDiet(diet?: string): number {
  if (!diet) return 5;
  if (diet === 'balanced') return 8;
  if (diet === 'cravings') return 4;
  if (diet === 'restrictive') return 3;
  return 5;
}

export function getRawStress(stress?: string): number {
  if (!stress) return 5;
  if (stress === 'low') return 3;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 8;
  return 5;
}

export function getRawAnxiety(anxiety?: string): number {
  if (!anxiety) return 5;
  if (anxiety === 'none') return 0;
  if (anxiety === 'low') return 3;
  if (anxiety === 'high') return 8;
  return 5;
}

export function getRawBodyImage(bodyImage?: string): number {
  if (!bodyImage) return 5;
  if (bodyImage === 'positive') return 8;
  if (bodyImage === 'neutral') return 5;
  if (bodyImage === 'negative') return 2;
  return 5;
}

export function normalizeSleep(sleep?: string): number {
  if (!sleep) return 6;
  if (sleep === '<6h') return 3;
  if (sleep === '6-7h') return 6;
  if (sleep === '7-8h') return 9;
  if (sleep === '>8h') return 9;
  return 6;
}

export function normalizeExercise(exercise?: string): number {
  if (!exercise) return 5;
  if (exercise === 'rest') return 5;
  if (exercise === 'light') return 7;
  if (exercise === 'moderate') return 9;
  if (exercise === 'intense') return 10;
  return 5;
}

export function normalizeDiet(diet?: string): number {
  if (!diet) return 5;
  if (diet === 'balanced') return 9;
  if (diet === 'cravings') return 4;
  if (diet === 'restrictive') return 4;
  return 5;
}

export function normalizeStress(stress?: string): number {
  if (!stress) return 5;
  if (stress === 'low') return 8;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 2;
  return 5;
}

export function normalizeAnxiety(anxiety?: string): number {
  if (!anxiety) return 5;
  if (anxiety === 'none') return 9;
  if (anxiety === 'low') return 7;
  if (anxiety === 'high') return 2;
  return 5;
}

export function normalizeMood(mood?: number): number {
  if (mood === undefined || mood === null) return 5;
  return Math.max(0, Math.min(10, mood));
}

export function normalizeSymptom(severity?: number): number {
  if (severity === undefined || severity === null) return 10;
  return Math.max(0, 10 - severity);
}

export function normalizeWater(glasses?: number): number {
  if (glasses === undefined || glasses === null) return 5;
  if (glasses < 3) return 3;
  if (glasses < 6) return 6;
  if (glasses < 8) return 8;
  return 10;
}

export function normalizeBodyImage(bodyImage?: string): number {
  if (!bodyImage) return 5;
  if (bodyImage === 'positive') return 9;
  if (bodyImage === 'neutral') return 5;
  if (bodyImage === 'negative') return 2;
  return 5;
}

export function calculateChange(current: number, previous: number): number {
  return ((current - previous) / 10) * 100;
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
