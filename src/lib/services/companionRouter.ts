export type MessageMode = 'support' | 'crisis' | 'inapp';

const CRISIS_KEYWORDS = [
  'kill myself',
  'end my life',
  'want to die',
  'suicide',
  'not worth living',
  'hurt myself',
  'self harm',
  'self-harm',
  'cutting',
  'no reason to live',
  'give up on life',
  'i cant go on',
  "i can't go on",
  'rather be dead',
];

const DATA_KEYWORDS = [
  'my score',
  'blossom score',
  'my history',
  'my logs',
  'my streak',
  'my period',
  'my cycle',
  'last week',
  'this week',
  'how many days',
  'show me my',
  'my data',
];

export function classifyMessage(text: string): MessageMode {
  const lower = text.toLowerCase();
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) return 'crisis';
  if (DATA_KEYWORDS.some((kw) => lower.includes(kw))) return 'inapp';
  return 'support';
}
