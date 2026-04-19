import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

export interface DashboardPreferences {
  dockCollapsed: boolean;
  density: 'comfortable' | 'compact';
  disclaimerAcknowledged: boolean;
  lastAction: 'log' | 'ask';
  hapticsEnabled: boolean;
}

const DEFAULTS: DashboardPreferences = {
  dockCollapsed: false,
  density: 'comfortable',
  disclaimerAcknowledged: false,
  lastAction: 'log',
  hapticsEnabled: true,
};

export function useDashboardPreferences() {
  const [prefs, setPrefs] = useState<DashboardPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (!cancelled) setLoading(false);
          return;
        }
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_dashboard_preferences')
          .select('dock_collapsed, density, disclaimer_acknowledged, last_action, haptics_enabled')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.warn('[DashboardPrefs] Failed to load preferences, using defaults:', error.message);
          setLoading(false);
          return;
        }

        if (data) {
          setPrefs({
            dockCollapsed: data.dock_collapsed,
            density: (data.density as 'comfortable' | 'compact') ?? 'comfortable',
            disclaimerAcknowledged: data.disclaimer_acknowledged,
            lastAction: (data.last_action as 'log' | 'ask') ?? 'log',
            hapticsEnabled: data.haptics_enabled ?? true,
          });
        }
      } catch {
        if (!cancelled) console.warn('[DashboardPrefs] Network error loading preferences, using defaults');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (patch: Partial<DashboardPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.user?.id) return;
      const userId = sessionData.session.user.id;

      const next = { ...prefs, ...patch };
      const { error } = await supabase.from('user_dashboard_preferences').upsert(
        {
          user_id: userId,
          dock_collapsed: next.dockCollapsed,
          density: next.density,
          disclaimer_acknowledged: next.disclaimerAcknowledged,
          last_action: next.lastAction,
          haptics_enabled: next.hapticsEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) {
        console.warn('[DashboardPrefs] Failed to persist preferences:', error.message);
      }
    } catch {
      console.warn('[DashboardPrefs] Network error persisting preferences');
    }
  }, [prefs]);

  return { prefs, loading, update };
}
