import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, getOrCreateSettings } from '../db';
import { DesignTheme, ThemeConfig, themeConfigs } from './types';

interface ThemeContextValue {
  designTheme: DesignTheme;
  themeConfig: ThemeConfig;
  setDesignTheme: (theme: DesignTheme) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [designTheme, setDesignThemeState] = useState<DesignTheme>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await getOrCreateSettings();
        setDesignThemeState(settings.designTheme || 'default');
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const config = themeConfigs[designTheme];
    const root = document.documentElement;

    root.setAttribute('data-theme', designTheme);

    root.style.setProperty('--theme-primary', config.colors.primary);
    root.style.setProperty('--theme-primary-hover', config.colors.primaryHover);
    root.style.setProperty('--theme-secondary', config.colors.secondary);
    root.style.setProperty('--theme-secondary-hover', config.colors.secondaryHover);
    root.style.setProperty('--theme-accent', config.colors.accent);
    root.style.setProperty('--theme-accent-hover', config.colors.accentHover);
    root.style.setProperty('--theme-background', config.colors.background);
    root.style.setProperty('--theme-surface', config.colors.surface);
    root.style.setProperty('--theme-text', config.colors.text);
    root.style.setProperty('--theme-text-secondary', config.colors.textSecondary);
    root.style.setProperty('--theme-border', config.colors.border);
    root.style.setProperty('--theme-glow', config.colors.glow);
    root.style.setProperty('--theme-font-heading', config.fonts.heading);
    root.style.setProperty('--theme-font-body', config.fonts.body);
    root.style.setProperty(
      '--theme-animation-duration',
      config.animation.speed === 'fast' ? '200ms' : config.animation.speed === 'medium' ? '300ms' : '500ms'
    );
  }, [designTheme]);

  const setDesignTheme = async (theme: DesignTheme) => {
    try {
      const settings = await getOrCreateSettings();
      if (settings.id) {
        await db.settings.update(settings.id, { designTheme: theme });
        setDesignThemeState(theme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value: ThemeContextValue = {
    designTheme,
    themeConfig: themeConfigs[designTheme],
    setDesignTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
