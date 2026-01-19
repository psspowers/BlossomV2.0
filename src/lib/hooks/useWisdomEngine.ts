import { useState, useEffect } from 'react';
import { supabase, WisdomCard } from '../supabase';
import { LogEntry, db } from '../db';

export interface WisdomContext {
  triggers: Set<string>;
  cyclePhase?: string;
  dominantIssues: string[];
}

function analyzeUserContext(recentLogs: LogEntry[]): WisdomContext {
  const triggers = new Set<string>();
  const issueScores: Record<string, number> = {};

  if (recentLogs.length === 0) {
    triggers.add('general');
    return { triggers, dominantIssues: ['general'] };
  }

  const latestLog = recentLogs[0];

  if (latestLog.cyclePhase) {
    triggers.add(latestLog.cyclePhase);
    if (latestLog.cyclePhase === 'luteal') {
      triggers.add('luteal_phase');
    }
  }

  const last3Days = recentLogs.slice(0, 3);

  let lowSleepCount = 0;
  let highStressCount = 0;
  let highPainCount = 0;
  let sugarCravingsCount = 0;

  last3Days.forEach(log => {
    if (log.lifestyle?.sleep === 'poor' || log.lifestyle?.sleep === '<6h') {
      lowSleepCount++;
      issueScores['sleep'] = (issueScores['sleep'] || 0) + 3;
    }

    if (log.psych?.stress === 'high' || log.psych?.stress === 'very high') {
      highStressCount++;
      issueScores['stress'] = (issueScores['stress'] || 0) + 3;
    }

    if (log.psych?.anxiety === 'high' || log.psych?.anxiety === 'very high') {
      highStressCount++;
      issueScores['stress'] = (issueScores['stress'] || 0) + 2;
    }

    const painLevel = (log.symptoms?.cramps || 0);
    if (painLevel >= 7) {
      highPainCount++;
      issueScores['pain'] = (issueScores['pain'] || 0) + painLevel;
    }

    if (log.lifestyle?.diet?.includes('craving') || log.lifestyle?.diet?.includes('sugar')) {
      sugarCravingsCount++;
      issueScores['diet'] = (issueScores['diet'] || 0) + 2;
    }

    const moodScore = log.psych?.mood || 5;
    if (moodScore <= 3) {
      issueScores['emotional'] = (issueScores['emotional'] || 0) + (5 - moodScore);
    }

    if (log.psych?.bodyImage === 'negative' || log.psych?.bodyImage === 'very negative') {
      issueScores['emotional'] = (issueScores['emotional'] || 0) + 2;
    }
  });

  if (lowSleepCount >= 2) {
    triggers.add('low_sleep');
    triggers.add('metabolic');
  }

  if (highStressCount >= 2) {
    triggers.add('high_stress');
    triggers.add('emotional');
  }

  if (highPainCount >= 1) {
    triggers.add('high_pain');
    triggers.add('physical');
  }

  if (sugarCravingsCount >= 2) {
    triggers.add('sugar_cravings');
    triggers.add('metabolic');
  }

  if (latestLog.lifestyle?.sleep) {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour <= 10) {
      triggers.add('morning');
    }
  }

  if (latestLog.psych?.mood && latestLog.psych.mood <= 4) {
    triggers.add('emotional');
  }

  if (issueScores['emotional'] && issueScores['emotional'] >= 5) {
    triggers.add('emotional');
  }

  const dominantIssues = Object.entries(issueScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([issue]) => issue);

  if (triggers.size === 0 || dominantIssues.length === 0) {
    triggers.add('general');
    dominantIssues.push('general');
  }

  return {
    triggers,
    cyclePhase: latestLog.cyclePhase,
    dominantIssues
  };
}

function selectBestCard(cards: WisdomCard[], context: WisdomContext): WisdomCard | null {
  if (cards.length === 0) return null;

  const scoredCards = cards.map(card => {
    let score = card.priority;

    const matchingTriggers = card.triggers.filter(t => context.triggers.has(t));
    score += matchingTriggers.length * 20;

    if (context.dominantIssues.some(issue =>
      card.triggers.some(t => t.includes(issue))
    )) {
      score += 15;
    }

    return { card, score };
  });

  scoredCards.sort((a, b) => b.score - a.score);

  const topScore = scoredCards[0].score;
  const topCards = scoredCards.filter(c => c.score === topScore);

  const randomIndex = Math.floor(Math.random() * topCards.length);
  return topCards[randomIndex].card;
}

export function useWisdomEngine() {
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [allCards, setAllCards] = useState<WisdomCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<WisdomContext | null>(null);

  useEffect(() => {
    async function fetchWisdomCards() {
      try {
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('wisdom_cards')
          .select('*')
          .eq('active', true)
          .order('priority', { ascending: false });

        if (fetchError) throw fetchError;

        setAllCards(data || []);

        const recentLogs = await db.logs
          .orderBy('date')
          .reverse()
          .limit(7)
          .toArray();

        const userContext = analyzeUserContext(recentLogs);
        setContext(userContext);

        const selectedCard = selectBestCard(data || [], userContext);
        setWisdomCard(selectedCard);

        setError(null);
      } catch (err) {
        console.error('Error fetching wisdom cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wisdom cards');
      } finally {
        setLoading(false);
      }
    }

    fetchWisdomCards();
  }, []);

  const refreshCard = async () => {
    if (allCards.length === 0) return;

    try {
      const recentLogs = await db.logs
        .orderBy('date')
        .reverse()
        .limit(7)
        .toArray();

      const userContext = analyzeUserContext(recentLogs);
      setContext(userContext);

      const selectedCard = selectBestCard(allCards, userContext);
      setWisdomCard(selectedCard);
    } catch (err) {
      console.error('Error refreshing wisdom card:', err);
    }
  };

  return {
    wisdomCard,
    allCards,
    loading,
    error,
    context,
    refreshCard
  };
}
