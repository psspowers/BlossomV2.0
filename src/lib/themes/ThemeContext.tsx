import { createContext, useContext, useEffect, ReactNode } from 'react';
import { ThemeConfig, themeConfigs } from './types';

interface ThemeContextValue {
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeConfig = themeConfigs['default'];

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-theme', 'default');

    root.style.setProperty('--theme-primary', themeConfig.colors.primary);
    root.style.setProperty('--theme-primary-hover', themeConfig.colors.primaryHover);
    root.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
    root.style.setProperty('--theme-secondary-hover', themeConfig.colors.secondaryHover);
    root.style.setProperty('--theme-accent', themeConfig.colors.accent);
    root.style.setProperty('--theme-accent-hover', themeConfig.colors.accentHover);
    root.style.setProperty('--theme-background', themeConfig.colors.background);
    root.style.setProperty('--theme-surface', themeConfig.colors.surface);
    root.style.setProperty('--theme-text', themeConfig.colors.text);
    root.style.setProperty('--theme-text-secondary', themeConfig.colors.textSecondary);
    root.style.setProperty('--theme-border', themeConfig.colors.border);
    root.style.setProperty('--theme-glow', themeConfig.colors.glow);
    root.style.setProperty('--theme-font-heading', themeConfig.fonts.heading);
    root.style.setProperty('--theme-font-body', themeConfig.fonts.body);
    root.style.setProperty(
      '--theme-animation-duration',
      themeConfig.animation.speed === 'fast' ? '200ms' : themeConfig.animation.speed === 'medium' ? '300ms' : '500ms'
    );
  }, [themeConfig]);

  const value: ThemeContextValue = {
    themeConfig,
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
