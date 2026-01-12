import { db, LogEntry } from '../db';

export type InterfaceMode = 'nurture' | 'steady' | 'thrive';

export interface ThemeState {
  mode: InterfaceMode;
  primaryColor: string;
  glowColor: string;
  message: string;
}

function calculateAverageSymptomSeverity(log: LogEntry): number {
  const symptoms = [
    log.symptoms.acne,
    log.symptoms.hirsutism,
    log.symptoms.hairLoss,
    log.symptoms.bloat,
    log.symptoms.cramps
  ].filter((val): val is number => val !== undefined);

  if (symptoms.length === 0) return 0;

  return symptoms.reduce((sum, val) => sum + val, 0) / symptoms.length;
}

function sleepToHours(sleep?: string): number {
  if (!sleep) return 7;
  if (sleep === '<6h') return 5;
  if (sleep === '6-7h') return 6.5;
  if (sleep === '7-8h') return 7.5;
  if (sleep === '>8h') return 8.5;
  return 7;
}

function stressToNumber(stress?: string): number {
  if (!stress) return 5;
  if (stress === 'low') return 3;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 8;
  return 5;
}

function anxietyToNumber(anxiety?: string): number {
  if (!anxiety) return 5;
  if (anxiety === 'none') return 0;
  if (anxiety === 'low') return 3;
  if (anxiety === 'high') return 8;
  return 5;
}

export async function determineInterfaceMode(): Promise<ThemeState> {
  const recentLogs = await db.logs
    .orderBy('date')
    .reverse()
    .limit(7)
    .toArray();

  if (recentLogs.length === 0) {
    return {
      mode: 'steady',
      primaryColor: '#2dd4bf',
      glowColor: 'rgba(45, 212, 191, 0.4)',
      message: 'Begin your wellness journey'
    };
  }

  const latestLog = recentLogs[0];
  const avgSymptomSeverity = calculateAverageSymptomSeverity(latestLog);
  const sleepHours = sleepToHours(latestLog.lifestyle.sleep);
  const mood = latestLog.psych.mood || 5;
  const stress = stressToNumber(latestLog.psych.stress);
  const anxiety = anxietyToNumber(latestLog.psych.anxiety);

  const avgPsych = (stress + anxiety) / 2;
  const needsSupport = avgSymptomSeverity > 6 || avgPsych > 6 || sleepHours < 6 || mood < 4;
  const thriving = avgSymptomSeverity < 3 && avgPsych < 3 && sleepHours >= 7 && mood > 7;

  if (needsSupport) {
    return {
      mode: 'nurture',
      primaryColor: '#c084fc',
      glowColor: 'rgba(192, 132, 252, 0.4)',
      message: 'Be gentle with yourself today'
    };
  } else if (thriving) {
    return {
      mode: 'thrive',
      primaryColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.4)',
      message: 'You\'re radiating wellness'
    };
  } else {
    return {
      mode: 'steady',
      primaryColor: '#2dd4bf',
      glowColor: 'rgba(45, 212, 191, 0.4)',
      message: 'Finding your balance'
    };
  }
}
