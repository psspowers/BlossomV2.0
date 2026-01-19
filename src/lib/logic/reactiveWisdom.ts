import { LogEntry } from '../db';
import { WISDOM_LIBRARY, WisdomCard } from '../data/wisdom';

export function getReactiveWisdom(todayLog: LogEntry | undefined): WisdomCard {
  const activeTriggers: string[] = ['general'];

  if (todayLog) {
    const sleep = todayLog.lifestyle?.sleep;
    if (sleep === '<6h' || sleep === '6-7h') {
      activeTriggers.push('low_sleep');
    }

    const stress = todayLog.psych?.stress;
    if (stress === 'high' || stress === 'medium') {
      activeTriggers.push('high_stress');
    }

    if (todayLog.cyclePhase === 'luteal') {
      activeTriggers.push('luteal_phase');
    }

    const cramps = todayLog.symptoms?.cramps;
    if (cramps && cramps > 5) {
      activeTriggers.push('high_pain');
    }
  }

  const matches = WISDOM_LIBRARY.filter(card =>
    card.triggers.some(t => activeTriggers.includes(t))
  );

  const specificMatches = matches.filter(m => !m.triggers.includes('general'));

  if (specificMatches.length > 0) {
    return specificMatches[Math.floor(Math.random() * specificMatches.length)];
  }

  return matches[Math.floor(Math.random() * matches.length)];
}
