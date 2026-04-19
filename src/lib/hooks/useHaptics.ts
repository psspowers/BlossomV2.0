import { useCallback } from 'react';
import { useDashboardPreferences } from './useDashboardPreferences';

export type HapticIntensity = 'light' | 'medium' | 'heavy';

const VIBRATION_PATTERNS: Record<HapticIntensity, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
};

export function useHaptics() {
  const { prefs } = useDashboardPreferences();

  const trigger = useCallback(
    (intensity: HapticIntensity = 'light') => {
      if (!prefs.hapticsEnabled) return;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(VIBRATION_PATTERNS[intensity]);
      }
    },
    [prefs.hapticsEnabled]
  );

  return { trigger };
}
