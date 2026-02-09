import { db, LogEntry } from '../db';
import {
  normalizeSymptom,
  normalizeStress,
  normalizeAnxiety,
  normalizeSleep,
  normalizeMood
} from './conversions';

export type InterfaceMode = 'nurture' | 'steady' | 'thrive';

export interface ThemeState {
  mode: InterfaceMode;
  primaryColor: string;
  glowColor: string;
  message: string;
}

function getSymptomWellness(log: LogEntry): number {
  const symptoms = [
    log.symptoms.acne,
    log.symptoms.hirsutism,
    log.symptoms.hairLoss,
    log.symptoms.bloat,
    log.symptoms.cramps
  ].filter((val): val is number => val !== undefined);

  if (symptoms.length === 0) return 10;

  return symptoms.reduce((sum, val) => sum + normalizeSymptom(val), 0) / symptoms.length;
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
  const avgSymptomWellness = getSymptomWellness(latestLog);
  const sleepWellness = normalizeSleep(latestLog.lifestyle.sleep);
  const moodWellness = normalizeMood(latestLog.psych.mood);
  const stressWellness = normalizeStress(latestLog.psych.stress);
  const anxietyWellness = normalizeAnxiety(latestLog.psych.anxiety);

  const avgPsychWellness = (stressWellness + anxietyWellness) / 2;
  const needsSupport = avgSymptomWellness < 4 || avgPsychWellness < 4 || sleepWellness < 4 || moodWellness < 4;
  const thriving = avgSymptomWellness > 7 && avgPsychWellness > 7 && sleepWellness > 7 && moodWellness > 7;

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
