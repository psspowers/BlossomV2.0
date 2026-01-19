import { useState, useEffect } from 'react';
import { LogEntry, db } from '../db';
import { WISDOM_LIBRARY, WisdomCard } from '../data/wisdom';

export interface WisdomContext {
  triggers: Set<string>;
  matchedCard: WisdomCard | null;
}

function detectTriggersFromLog(log: LogEntry | null): Set<string> {
  const triggers = new Set<string>();

  if (!log) {
    triggers.add('general');
    return triggers;
  }

  if (log.lifestyle?.sleep === '<6h' || log.lifestyle?.sleep === 'poor') {
    triggers.add('low_sleep');
  }

  if (log.psych?.stress === 'high' || log.psych?.stress === 'very high') {
    triggers.add('high_stress');
  }

  const painLevel = log.symptoms?.cramps || 0;
  if (painLevel >= 7) {
    triggers.add('high_pain');
  }

  if (log.cyclePhase === 'luteal') {
    triggers.add('luteal_phase');
  }

  if (triggers.size === 0) {
    triggers.add('general');
  }

  return triggers;
}

function selectCardForTriggers(triggers: Set<string>): WisdomCard {
  for (const card of WISDOM_LIBRARY) {
    const hasMatch = card.triggers.some(trigger => triggers.has(trigger));
    if (hasMatch && card.id !== 'general_resilience') {
      return card;
    }
  }

  return WISDOM_LIBRARY.find(card => card.id === 'general_resilience') || WISDOM_LIBRARY[0];
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

        if (!todayLog) {
          const recentLog = await db.logs
            .orderBy('date')
            .reverse()
            .first();

          const triggers = detectTriggersFromLog(recentLog || null);
          const selectedCard = selectCardForTriggers(triggers);

          setContext({ triggers, matchedCard: selectedCard });
          setWisdomCard(selectedCard);
        } else {
          const triggers = detectTriggersFromLog(todayLog);
          const selectedCard = selectCardForTriggers(triggers);

          setContext({ triggers, matchedCard: selectedCard });
          setWisdomCard(selectedCard);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error analyzing wisdom:', err);
        const fallbackCard = WISDOM_LIBRARY.find(card => card.id === 'general_resilience') || WISDOM_LIBRARY[0];
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

      const triggers = detectTriggersFromLog(todayLog || null);
      const selectedCard = selectCardForTriggers(triggers);

      setContext({ triggers, matchedCard: selectedCard });
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
