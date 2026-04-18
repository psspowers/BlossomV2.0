import Dexie, { Table } from 'dexie';

export type PriorityId =
  | 'cycle_regularity'
  | 'fertility'
  | 'weight_metabolic'
  | 'mood_energy'
  | 'skin_hair'
  | 'pain_cramps'
  | 'sleep_fatigue'
  | 'anxiety'
  | 'body_image'
  | 'acne'
  | 'hirsutism'
  | 'hair_loss'
  | 'bloating'
  | 'cramps'
  | 'custom';

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
  intention?: string;
  note?: string;
}

export interface CustomSymptom {
  name: string;
  category: 'symptom' | 'psych' | 'lifestyle';
}

export interface Settings {
  id?: number;
  theme: 'dark' | 'light' | 'auto';
  designTheme: 'default' | 'lotus';
  notifications: boolean;
  customSymptomDefinitions: CustomSymptom[];
  priorities: PriorityId[];
  happinessWeights: Record<string, number>;
  botToken?: string;
}

export class BlossomDB extends Dexie {
  logs!: Table<LogEntry>;
  settings!: Table<Settings>;
  backupLogs!: Table<LogEntry>;

  constructor() {
    super('BlossomDB');
    this.version(1).stores({
      logs: '++id, date',
      settings: '++id'
    });
    this.version(2).stores({
      logs: '++id, date',
      settings: '++id',
      backupLogs: '++id, date'
    });
  }
}

export const db = new BlossomDB();

export const DEMO_PREVIEW_KEY = 'demoPreviewActive';
export const USER_DELETED_KEY = 'userDeletedData';

export async function backupUserLogs(): Promise<void> {
  const allLogs = await db.logs.toArray();
  await db.backupLogs.clear();
  if (allLogs.length > 0) {
    const cleaned = allLogs.map(({ id, ...rest }) => rest);
    await db.backupLogs.bulkAdd(cleaned);
  }
}

export async function restoreUserLogs(): Promise<void> {
  const backup = await db.backupLogs.toArray();
  await db.logs.clear();
  if (backup.length > 0) {
    const cleaned = backup.map(({ id, ...rest }) => rest);
    await db.logs.bulkAdd(cleaned);
  }
  await db.backupLogs.clear();
  localStorage.removeItem(DEMO_PREVIEW_KEY);
}

export async function getOrCreateSettings(): Promise<Settings> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    const settings = existing[0];
    if (!settings.priorities || !settings.happinessWeights) {
      await db.settings.update(settings.id!, {
        priorities: settings.priorities || [],
        happinessWeights: settings.happinessWeights || {}
      });
      settings.priorities = settings.priorities || [];
      settings.happinessWeights = settings.happinessWeights || {};
    }
    return settings;
  }

  const defaultSettings: Settings = {
    theme: 'dark',
    designTheme: 'default',
    notifications: true,
    customSymptomDefinitions: [],
    priorities: [],
    happinessWeights: {}
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
