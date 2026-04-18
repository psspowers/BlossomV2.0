export type RouteDestination = 'inapp' | 'telegram' | 'crisis';
export type Season = 'resting' | 'growing' | 'blooming';

export interface RouteContext {
  blossomScore: number;
  season: Season;
  streak: number;
}

export interface RouteDecision {
  destination: RouteDestination;
  telegramUrl?: string;
  crisisLevel?: 'moderate' | 'severe';
}

const CRISIS_KEYWORDS = [
  'hurt myself', 'want to die', 'end it all', 'give up',
  'worthless', "can't cope", 'hate myself', 'no point',
  'disappear', 'harm myself', 'suicide', 'kill myself',
  'too much to bear', "can't go on", 'not worth living'
];

const DATA_KEYWORDS = [
  'my score', 'blossom score', 'my history', 'my logs', 'streak',
  'my period', 'my cycle', 'my chart', 'my trend', 'last week',
  'this week', 'how many', 'show me my', 'my data', 'tracking'
];

function buildTelegramUrl(context: RouteContext): string {
  const seasonInitial = context.season[0];
  const score = Math.round(context.blossomScore);
  const payload = `s${score}_${seasonInitial}`;
  const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'LotusBlossomBot';
  return `https://t.me/${BOT_USERNAME}?start=${payload}`;
}

export function classifyMessage(text: string, context: RouteContext): RouteDecision {
  const lower = text.toLowerCase().trim();
  if (!lower) return { destination: 'inapp' };

  if (CRISIS_KEYWORDS.some(kw => lower.includes(kw))) {
    return { destination: 'crisis', crisisLevel: 'severe' };
  }

  if (DATA_KEYWORDS.some(kw => lower.includes(kw))) {
    return { destination: 'inapp' };
  }

  return {
    destination: 'telegram',
    telegramUrl: buildTelegramUrl(context)
  };
}
