import { supabase } from './supabase';
import { LogEntry, Settings, PriorityId } from './db';

export interface SupabaseLogEntry {
  id: string;
  user_id: string;
  date: string;
  cycle_phase: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'unknown';
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | null;
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
  custom_values?: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light' | 'auto';
  design_theme: 'default' | 'lotus';
  notifications: boolean;
  custom_symptom_definitions: Array<{
    name: string;
    category: 'symptom' | 'psych' | 'lifestyle';
  }>;
  priorities: PriorityId[];
  happiness_weights: Record<string, number>;
  created_at: string;
  updated_at: string;
}

function supabaseLogToLocal(log: SupabaseLogEntry): LogEntry {
  return {
    id: undefined,
    date: log.date,
    cyclePhase: log.cycle_phase,
    flow: log.flow || undefined,
    symptoms: log.symptoms,
    psych: log.psych,
    lifestyle: log.lifestyle,
    customValues: log.custom_values || undefined
  };
}

function localLogToSupabase(log: LogEntry, userId: string): Partial<SupabaseLogEntry> {
  return {
    user_id: userId,
    date: log.date,
    cycle_phase: log.cyclePhase,
    flow: log.flow || null,
    symptoms: log.symptoms,
    psych: log.psych,
    lifestyle: log.lifestyle,
    custom_values: log.customValues || null
  };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user;
}

export async function addLog(log: LogEntry): Promise<LogEntry> {
  const user = await getCurrentUser();

  const supabaseLog = localLogToSupabase(log, user.id);

  const { data, error } = await supabase
    .from('user_logs')
    .insert(supabaseLog)
    .select()
    .single();

  if (error) throw error;
  return supabaseLogToLocal(data);
}

export async function getAllLogs(): Promise<LogEntry[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data || []).map(supabaseLogToLocal);
}

export async function getLastNDays(days: number): Promise<LogEntry[]> {
  const user = await getCurrentUser();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return (data || []).map(supabaseLogToLocal);
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<LogEntry[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data || []).map(supabaseLogToLocal);
}

export async function getRecentLogs(limit: number): Promise<LogEntry[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(supabaseLogToLocal).reverse();
}

export async function getLogCount(): Promise<number> {
  const user = await getCurrentUser();

  const { count, error } = await supabase
    .from('user_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) throw error;
  return count || 0;
}

export async function deleteAllLogs(): Promise<void> {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('user_logs')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getOrCreateSettings(): Promise<Settings> {
  const user = await getCurrentUser();

  const { data: existing, error: fetchError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    return {
      id: undefined,
      theme: existing.theme,
      designTheme: existing.design_theme,
      notifications: existing.notifications,
      customSymptomDefinitions: existing.custom_symptom_definitions,
      priorities: existing.priorities,
      happinessWeights: existing.happiness_weights
    };
  }

  const defaultSettings = {
    user_id: user.id,
    theme: 'dark' as const,
    design_theme: 'default' as const,
    notifications: true,
    custom_symptom_definitions: [],
    priorities: [],
    happiness_weights: {}
  };

  const { data: created, error: insertError } = await supabase
    .from('user_settings')
    .insert(defaultSettings)
    .select()
    .single();

  if (insertError) throw insertError;

  return {
    id: undefined,
    theme: created.theme,
    designTheme: created.design_theme,
    notifications: created.notifications,
    customSymptomDefinitions: created.custom_symptom_definitions,
    priorities: created.priorities,
    happinessWeights: created.happiness_weights
  };
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const user = await getCurrentUser();

  const update: any = {};
  if (settings.theme !== undefined) update.theme = settings.theme;
  if (settings.designTheme !== undefined) update.design_theme = settings.designTheme;
  if (settings.notifications !== undefined) update.notifications = settings.notifications;
  if (settings.customSymptomDefinitions !== undefined) {
    update.custom_symptom_definitions = settings.customSymptomDefinitions;
  }
  if (settings.priorities !== undefined) update.priorities = settings.priorities;
  if (settings.happinessWeights !== undefined) {
    update.happiness_weights = settings.happinessWeights;
  }

  const { error } = await supabase
    .from('user_settings')
    .update(update)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function deleteSettings(): Promise<void> {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('user_settings')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function migrateLocalDataToSupabase(
  localLogs: LogEntry[],
  localSettings: Settings
): Promise<{ logsCount: number; settingsMigrated: boolean }> {
  const user = await getCurrentUser();

  let logsCount = 0;

  if (localLogs.length > 0) {
    const supabaseLogs = localLogs.map(log => localLogToSupabase(log, user.id));

    const { error } = await supabase
      .from('user_logs')
      .upsert(supabaseLogs, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (error) throw error;
    logsCount = localLogs.length;
  }

  let settingsMigrated = false;
  if (localSettings) {
    const supabaseSettings = {
      user_id: user.id,
      theme: localSettings.theme,
      design_theme: localSettings.designTheme,
      notifications: localSettings.notifications,
      custom_symptom_definitions: localSettings.customSymptomDefinitions,
      priorities: localSettings.priorities,
      happiness_weights: localSettings.happinessWeights
    };

    const { error } = await supabase
      .from('user_settings')
      .upsert(supabaseSettings, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
    settingsMigrated = true;
  }

  return { logsCount, settingsMigrated };
}
