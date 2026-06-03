import { useState, useEffect } from 'react';
import { db } from '../db';
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

export function useWisdomEngine() {
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<WisdomContext | null>(null);

  const loadWisdom = async (forceRefresh = false) => {
    const today = new Date().toISOString().split('T')[0];

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedWisdom = JSON.parse(cached);
          if (parsed.date === today) {
            setWisdomCard(parsed.data.card);
            setContext(parsed.data.context);
            setLoading(false);
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

      // Persist to Dexie whisper history (one entry per day, upsert by date)
      try {
        const existing = await db.whispers.where('date').equals(today).first();
        if (!existing) {
          await db.whispers.add({
            date: today,
            text: selectedCard.text,
            category: selectedCard.category,
            savedAt: Date.now(),
          });
          // Keep only last 90 days
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 90);
          const cutoffStr = cutoff.toISOString().split('T')[0];
          await db.whispers.where('date').below(cutoffStr).delete();
        }
      } catch (err) {
        console.error('Error persisting whisper:', err);
      }

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
