import { LogEntry } from '../db';

export interface CycleEvent {
  startDate: string;
  endDate: string;
  daysFromPrevious?: number;
}

export interface CycleAnalysis {
  currentDay: number;
  isLongCycle: boolean;
  variability: number;
  lastTruePeriod?: CycleEvent;
  cycleHistory: CycleEvent[];
  isUntracked: boolean;
}

export function isTruePeriod(logs: LogEntry[]): boolean {
  if (logs.length < 2) return false;

  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const current = sortedLogs[i];
    const next = sortedLogs[i + 1];

    const currentIsSignificant = current.flow === 'medium' || current.flow === 'heavy';
    const nextIsSignificant = next.flow === 'medium' || next.flow === 'heavy';

    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const daysDiff = Math.abs((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (currentIsSignificant && nextIsSignificant && daysDiff <= 1) {
      return true;
    }
  }

  return false;
}

export function analyzeHistory(logs: LogEntry[]): CycleAnalysis {
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  const cycleEvents: CycleEvent[] = [];
  let currentPeriodLogs: LogEntry[] = [];
  let lastProcessedDate: string | null = null;

  for (const log of sortedLogs) {
    if (log.flow && log.flow !== 'none') {
      currentPeriodLogs.push(log);
      lastProcessedDate = log.date;
    } else {
      if (currentPeriodLogs.length > 0) {
        if (isTruePeriod(currentPeriodLogs)) {
          const startDate = currentPeriodLogs[0].date;
          const endDate = currentPeriodLogs[currentPeriodLogs.length - 1].date;

          let daysFromPrevious: number | undefined;
          if (cycleEvents.length > 0) {
            const prevEvent = cycleEvents[cycleEvents.length - 1];
            const prevDate = new Date(prevEvent.startDate);
            const currDate = new Date(startDate);
            daysFromPrevious = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          }

          cycleEvents.push({
            startDate,
            endDate,
            daysFromPrevious
          });
        }
        currentPeriodLogs = [];
      }
    }
  }

  if (currentPeriodLogs.length > 0 && isTruePeriod(currentPeriodLogs)) {
    const startDate = currentPeriodLogs[0].date;
    const endDate = currentPeriodLogs[currentPeriodLogs.length - 1].date;

    let daysFromPrevious: number | undefined;
    if (cycleEvents.length > 0) {
      const prevEvent = cycleEvents[cycleEvents.length - 1];
      const prevDate = new Date(prevEvent.startDate);
      const currDate = new Date(startDate);
      daysFromPrevious = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    cycleEvents.push({
      startDate,
      endDate,
      daysFromPrevious
    });
  }

  if (cycleEvents.length === 0) {
    return {
      currentDay: 0,
      isLongCycle: false,
      variability: 0,
      cycleHistory: [],
      isUntracked: true
    };
  }

  const lastTruePeriod = cycleEvents[cycleEvents.length - 1];
  const today = new Date();
  const lastPeriodDate = new Date(lastTruePeriod.startDate);
  const currentDay = Math.round((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));

  const isLongCycle = currentDay > 35;

  const recentCycleLengths = cycleEvents
    .slice(-3)
    .map(e => e.daysFromPrevious)
    .filter((d): d is number => d !== undefined);

  let variability = 0;
  if (recentCycleLengths.length >= 2) {
    const mean = recentCycleLengths.reduce((a, b) => a + b, 0) / recentCycleLengths.length;
    const squaredDiffs = recentCycleLengths.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / recentCycleLengths.length;
    variability = Math.sqrt(variance);
  }

  return {
    currentDay,
    isLongCycle,
    variability,
    lastTruePeriod,
    cycleHistory: cycleEvents,
    isUntracked: false
  };
}

export function getCycleInsight(analysis: CycleAnalysis): string {
  if (analysis.isUntracked) {
    return 'Start tracking your cycle to see insights';
  }

  if (analysis.isLongCycle) {
    return `Day ${analysis.currentDay} - Long cycle detected. Consider metabolic support.`;
  }

  if (analysis.variability > 7) {
    return `Day ${analysis.currentDay} - High variability (${Math.round(analysis.variability)} days). Focus on cycle regulation.`;
  }

  if (analysis.currentDay <= 5) {
    return `Day ${analysis.currentDay} - Menstrual phase. Rest and replenish.`;
  }

  if (analysis.currentDay <= 14) {
    return `Day ${analysis.currentDay} - Follicular phase. Energy building.`;
  }

  if (analysis.currentDay <= 21) {
    return `Day ${analysis.currentDay} - Luteal phase. Nurture and balance.`;
  }

  return `Day ${analysis.currentDay} - Listen to your body's rhythm.`;
}

export interface CycleState {
  currentDay: number;
  isLongCycle: boolean;
  stabilityScore: number;
  varianceDays: number;
  phase: 'Follicular' | 'Luteal' | 'Maintenance' | 'Menstrual';
  message: string;
}

export function analyzeCycleState(logs: LogEntry[]): CycleState {
  const analysis = analyzeHistory(logs);

  if (analysis.isUntracked || analysis.currentDay === 0) {
    return {
      currentDay: 0,
      isLongCycle: false,
      stabilityScore: 0,
      varianceDays: 0,
      phase: 'Maintenance',
      message: 'Start tracking to see your unique cycle pattern'
    };
  }

  const varianceDays = Math.round(analysis.variability);

  const stabilityScore = Math.round(Math.max(0, Math.min(100, 100 - (analysis.variability * 5))));

  let phase: 'Follicular' | 'Luteal' | 'Maintenance' | 'Menstrual';
  let message: string;

  if (analysis.currentDay <= 5) {
    phase = 'Menstrual';
    message = 'Rest is productive. Your body is renewing.';
  } else if (analysis.currentDay <= 14) {
    phase = 'Follicular';
    message = 'Energy rising. A good time for new beginnings.';
  } else if (analysis.currentDay <= 28) {
    phase = 'Luteal';
    message = 'Your body is working hard. Gentleness matters now.';
  } else {
    phase = 'Maintenance';
    if (analysis.isLongCycle && analysis.currentDay > 60) {
      message = `Day ${analysis.currentDay}. Your cycle is real and valid. Consider checking in with your care team.`;
    } else if (analysis.isLongCycle) {
      message = `Day ${analysis.currentDay}. Long cycles are common with PCOS. You're not broken.`;
    } else {
      message = `Day ${analysis.currentDay}. Your body follows its own rhythm.`;
    }
  }

  return {
    currentDay: analysis.currentDay,
    isLongCycle: analysis.isLongCycle,
    stabilityScore,
    varianceDays,
    phase,
    message
  };
}
