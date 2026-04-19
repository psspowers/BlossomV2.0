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
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_dashboard_preferences')
        .select('dock_collapsed, density, disclaimer_acknowledged, last_action, haptics_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setPrefs({
          dockCollapsed: data.dock_collapsed,
          density: (data.density as 'comfortable' | 'compact') ?? 'comfortable',
          disclaimerAcknowledged: data.disclaimer_acknowledged,
          lastAction: (data.last_action as 'log' | 'ask') ?? 'log',
          hapticsEnabled: data.haptics_enabled ?? true,
        });
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (patch: Partial<DashboardPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const next = { ...prefs, ...patch };
    await supabase.from('user_dashboard_preferences').upsert(
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
  }, [prefs]);

  return { prefs, loading, update };
}
