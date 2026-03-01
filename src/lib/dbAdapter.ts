import { LogEntry, Settings, db as localDb } from './db';
import * as supabaseDb from './supabaseDb';
import { supabase } from './supabase';

async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export const dbAdapter = {
  logs: {
    async add(log: LogEntry): Promise<LogEntry> {
      if (await isAuthenticated()) {
        return supabaseDb.addLog(log);
      }
      const id = await localDb.logs.add(log);
      return { ...log, id };
    },

    async toArray(): Promise<LogEntry[]> {
      if (await isAuthenticated()) {
        return supabaseDb.getAllLogs();
      }
      return localDb.logs.toArray();
    },

    async count(): Promise<number> {
      if (await isAuthenticated()) {
        return supabaseDb.getLogCount();
      }
      return localDb.logs.count();
    },

    async clear(): Promise<void> {
      if (await isAuthenticated()) {
        return supabaseDb.deleteAllLogs();
      }
      return localDb.logs.clear();
    },

    orderBy(field: string) {
      return {
        reverse() {
          return {
            async limit(count: number): Promise<LogEntry[]> {
              if (await isAuthenticated()) {
                return supabaseDb.getRecentLogs(count);
              }
              return localDb.logs.orderBy(field).reverse().limit(count).toArray();
            },
            async toArray(): Promise<LogEntry[]> {
              if (await isAuthenticated()) {
                const logs = await supabaseDb.getAllLogs();
                return logs.reverse();
              }
              return localDb.logs.orderBy(field).reverse().toArray();
            }
          };
        },
        async toArray(): Promise<LogEntry[]> {
          if (await isAuthenticated()) {
            return supabaseDb.getAllLogs();
          }
          return localDb.logs.orderBy(field).toArray();
        }
      };
    }
  },

  settings: {
    toCollection() {
      return {
        async first(): Promise<Settings | undefined> {
          if (await isAuthenticated()) {
            try {
              return await supabaseDb.getOrCreateSettings();
            } catch (error) {
              console.error('Error fetching settings from Supabase:', error);
              return undefined;
            }
          }
          const settings = await localDb.settings.toArray();
          return settings[0];
        }
      };
    },

    async update(id: number | undefined, updates: Partial<Settings>): Promise<void> {
      if (await isAuthenticated()) {
        return supabaseDb.updateSettings(updates);
      }
      if (id !== undefined) {
        await localDb.settings.update(id, updates);
      }
    },

    async toArray(): Promise<Settings[]> {
      if (await isAuthenticated()) {
        const settings = await supabaseDb.getOrCreateSettings();
        return [settings];
      }
      return localDb.settings.toArray();
    },

    async clear(): Promise<void> {
      if (await isAuthenticated()) {
        return supabaseDb.deleteSettings();
      }
      return localDb.settings.clear();
    }
  }
};

export async function getLastNDays(days: number): Promise<LogEntry[]> {
  if (await isAuthenticated()) {
    return supabaseDb.getLastNDays(days);
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return localDb.logs
    .where('date')
    .between(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      true,
      true
    )
    .toArray();
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<LogEntry[]> {
  if (await isAuthenticated()) {
    return supabaseDb.getLogsInRange(startDate, endDate);
  }

  return localDb.logs
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getOrCreateSettings(): Promise<Settings> {
  if (await isAuthenticated()) {
    return supabaseDb.getOrCreateSettings();
  }

  const existing = await localDb.settings.toArray();
  if (existing.length > 0) {
    const settings = existing[0];
    if (!settings.priorities || !settings.happinessWeights) {
      await localDb.settings.update(settings.id!, {
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

  const id = await localDb.settings.add(defaultSettings);
  return { ...defaultSettings, id };
}

export async function migrateLocalToSupabase(): Promise<{ logsCount: number; settingsMigrated: boolean }> {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error('Must be authenticated to migrate data');
  }

  const localLogs = await localDb.logs.toArray();
  const localSettingsArray = await localDb.settings.toArray();
  const localSettings = localSettingsArray[0];

  return supabaseDb.migrateLocalDataToSupabase(localLogs, localSettings);
}
