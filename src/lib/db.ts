import Dexie, { Table } from 'dexie';

export interface LogEntry {
  id?: number;
  date: string;
  cyclePhase: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'unknown';
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: {
    acne?: number;
    hirsutism?: number;
    hairLoss?: number;
    bloat?: number;
    cramps?: number;
  };
  psych: {
    stress?: string;
    bodyImage?: string;
    mood?: number;
    anxiety?: string;
  };
  lifestyle: {
    sleep?: string;
    waterIntake?: number;
    exercise?: string;
    diet?: string;
  };
  customValues?: Record<string, number>;
}

export interface CustomSymptom {
  name: string;
  category: 'symptom' | 'psych' | 'lifestyle';
}

export interface Settings {
  id?: number;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  customSymptomDefinitions: CustomSymptom[];
}

export class BlossomDB extends Dexie {
  logs!: Table<LogEntry>;
  settings!: Table<Settings>;

  constructor() {
    super('BlossomDB');
    this.version(1).stores({
      logs: '++id, date',
      settings: '++id'
    });
  }
}

export const db = new BlossomDB();

export async function getOrCreateSettings(): Promise<Settings> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    return existing[0];
  }

  const defaultSettings: Settings = {
    theme: 'dark',
    notifications: true,
    customSymptomDefinitions: []
  };

  const id = await db.settings.add(defaultSettings);
  return { ...defaultSettings, id };
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<LogEntry[]> {
  return db.logs
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getLastNDays(days: number): Promise<LogEntry[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getLogsInRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
}
