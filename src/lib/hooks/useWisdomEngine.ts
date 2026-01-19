import { useState, useEffect } from 'react';
import { db } from '../db';
import { WisdomCard } from '../data/wisdom';
import { getReactiveWisdom } from '../logic/reactiveWisdom';

export interface WisdomContext {
  todayLog: boolean;
  matchedCard: WisdomCard;
}

export function useWisdomEngine() {
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<WisdomContext | null>(null);

  useEffect(() => {
    async function analyzeAndSelectCard() {
      try {
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];
        const todayLog = await db.logs
          .where('date')
          .equals(today)
          .first();

        const selectedCard = getReactiveWisdom(todayLog);

        setContext({
          todayLog: !!todayLog,
          matchedCard: selectedCard
        });
        setWisdomCard(selectedCard);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing wisdom:', err);
        const fallbackCard = getReactiveWisdom(undefined);
        setWisdomCard(fallbackCard);
        setLoading(false);
      }
    }

    analyzeAndSelectCard();

    const interval = setInterval(analyzeAndSelectCard, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshCard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = await db.logs
        .where('date')
        .equals(today)
        .first();

      const selectedCard = getReactiveWisdom(todayLog);

      setContext({
        todayLog: !!todayLog,
        matchedCard: selectedCard
      });
      setWisdomCard(selectedCard);
    } catch (err) {
      console.error('Error refreshing wisdom card:', err);
    }
  };

  return {
    wisdomCard,
    loading,
    error: null,
    context,
    refreshCard
  };
}
