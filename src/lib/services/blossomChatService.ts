import { supabase } from '../supabase';
import { safeStorage } from '../storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function buildAnonymisedContext(blossomScore: number, season: string): string {
  const seasonLabel: Record<string, string> = {
    resting: 'in a Resting season (lower energy period)',
    growing: 'in a Growing season (building consistency)',
    blooming: 'in a Blooming season (thriving)',
  };

  const label = seasonLabel[season] ?? 'on their wellness journey';

  const scoreLabel =
    blossomScore >= 80
      ? 'doing well overall'
      : blossomScore >= 50
      ? 'managing day to day'
      : 'having a more challenging time';

  return `The user is ${label} and ${scoreLabel}.`;
}

const RATE_LIMIT_KEY = 'blossom_chat_count';
const RATE_LIMIT_MAX = 20;

function checkRateLimit(): boolean {
  const count = parseInt(safeStorage.sessionGet(RATE_LIMIT_KEY) || '0');
  if (count >= RATE_LIMIT_MAX) return false;
  safeStorage.sessionSet(RATE_LIMIT_KEY, String(count + 1));
  return true;
}

export async function sendMessage(
  userMessage: string,
  blossomScore: number,
  season: string
): Promise<string> {
  if (!checkRateLimit()) {
    return "You've been chatting a lot today 🌸 Take a moment to rest, and I'll be here when you're ready.";
  }

  const anonymisedContext = buildAnonymisedContext(blossomScore, season);

  try {
    const result = await Promise.race([
      supabase.functions.invoke('blossom-chat', {
        body: {
          message: userMessage.slice(0, 500),
          anonymisedContext,
        },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
    ]);

    if (result === null) {
      return "I'm here for you 🌸 It's taking a moment — please try again shortly.";
    }

    const { data, error } = result;
    if (error) {
      console.error('Chat error:', error);
      return "I'm here for you 🌸 There was a small hiccup — please try again in a moment.";
    }

    return data?.reply || "I'm here for you 🌸 Could you tell me a little more?";
  } catch (error) {
    console.error('Chat error:', error);
    return "I'm here for you 🌸 There was a small hiccup — please try again in a moment.";
  }
}

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

export function isDataQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return DATA_KEYWORDS.some((kw) => lower.includes(kw));
}
