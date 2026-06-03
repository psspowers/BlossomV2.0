import { useState, useEffect } from 'react';
import { db, WhisperEntry } from '../db';
import { WisdomCard } from '../data/wisdom';
import { getReactiveWisdom } from '../logic/reactiveWisdom';

export interface WisdomContext {
  todayLog: boolean;
  matchedCard: WisdomCard;
}

interface CachedWisdom {
  date: string;
  data: {
    card: WisdomCard;
    context: WisdomContext;
  };
}

const STORAGE_KEY = 'blossom_daily_wisdom';
const SEED_KEY = 'blossom_whispers_seeded';

const SEED_WHISPERS: Omit<WhisperEntry, 'id'>[] = [
  {
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    text: 'Your cycle is wisdom. Each phase holds its own gifts.',
    category: 'cycle',
    savedAt: Date.now() - 86400000 * 3,
  },
  {
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    text: 'Movement creates energy. Notice how your body responds.',
    category: 'lifestyle',
    savedAt: Date.now() - 86400000 * 2,
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    text: 'Rest is your superpower. Your mood lifts when you sleep 7h+.',
    category: 'sleep',
    savedAt: Date.now() - 86400000,
  },
];

async function seedWhispersIfNeeded() {
  if (localStorage.getItem(SEED_KEY)) return;
  const count = await db.whispers.count();
  if (count === 0) {
    for (const seed of SEED_WHISPERS) {
      const exists = await db.whispers.where('date').equals(seed.date).first();
      if (!exists) {
        await db.whispers.add(seed);
      }
    }
  }
  localStorage.setItem(SEED_KEY, '1');
}

async function persistWhisperForDay(date: string, card: WisdomCard) {
  const existing = await db.whispers.where('date').equals(date).first();
  if (!existing) {
    await db.whispers.add({
      date,
      text: card.text,
      category: card.category,
      savedAt: Date.now(),
    });
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    await db.whispers.where('date').below(cutoff.toISOString().split('T')[0]).delete();
  }
}

export function useWisdomEngine() {
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<WisdomContext | null>(null);

  const loadWisdom = async (forceRefresh = false) => {
    const today = new Date().toISOString().split('T')[0];

    await seedWhispersIfNeeded();

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedWisdom = JSON.parse(cached);
          if (parsed.date === today) {
            setWisdomCard(parsed.data.card);
            setContext(parsed.data.context);
            setLoading(false);
            // Still persist to Dexie — cache hit doesn't mean it was stored
            persistWhisperForDay(today, parsed.data.card).catch(() => {});
            return;
          }
        }
      } catch (err) {
        console.error('Error reading cached wisdom:', err);
      }
    }

    try {
      setLoading(true);

      const todayLog = await db.logs
        .where('date')
        .equals(today)
        .first();

      const selectedCard = getReactiveWisdom(todayLog);

      const newContext = {
        todayLog: !!todayLog,
        matchedCard: selectedCard
      };

      setContext(newContext);
      setWisdomCard(selectedCard);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          date: today,
          data: {
            card: selectedCard,
            context: newContext
          }
        }));
      } catch (err) {
        console.error('Error caching wisdom:', err);
      }

      await persistWhisperForDay(today, selectedCard);

      setLoading(false);
    } catch (err) {
      console.error('Error analyzing wisdom:', err);
      const fallbackCard = getReactiveWisdom(undefined);
      setWisdomCard(fallbackCard);
      setContext({
        todayLog: false,
        matchedCard: fallbackCard
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWisdom();
  }, []);

  const refreshCard = async () => {
    await loadWisdom(true);
  };

  return {
    wisdomCard,
    loading,
    error: null,
    context,
    refreshCard
  };
}

