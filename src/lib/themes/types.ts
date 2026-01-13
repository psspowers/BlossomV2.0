export type DesignTheme = 'default' | 'lotus';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  glow: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  animation: {
    speed: 'fast' | 'medium' | 'slow';
    organic: boolean;
  };
  cssVarPrefix: string;
}

export const themeConfigs: Record<DesignTheme, ThemeConfig> = {
  default: {
    name: 'Tesla-Apple',
    colors: {
      primary: 'rgb(45, 212, 191)',
      primaryHover: 'rgb(94, 234, 212)',
      secondary: 'rgb(192, 132, 252)',
      secondaryHover: 'rgb(216, 180, 254)',
      accent: 'rgb(251, 191, 36)',
      accentHover: 'rgb(252, 211, 77)',
      background: 'rgb(2, 6, 23)',
      surface: 'rgba(15, 23, 42, 0.8)',
      text: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgba(255, 255, 255, 0.1)',
      glow: 'rgba(45, 212, 191, 0.5)',
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    animation: {
      speed: 'fast',
      organic: false,
    },
    cssVarPrefix: 'default',
  },
  lotus: {
    name: 'Lotus Garden',
    colors: {
      primary: 'rgb(236, 72, 153)',
      primaryHover: 'rgb(244, 114, 182)',
      secondary: 'rgb(134, 239, 172)',
      secondaryHover: 'rgb(187, 247, 208)',
      accent: 'rgb(253, 224, 71)',
      accentHover: 'rgb(254, 240, 138)',
      background: 'rgb(24, 24, 27)',
      surface: 'rgba(39, 39, 42, 0.8)',
      text: 'rgb(250, 250, 250)',
      textSecondary: 'rgb(161, 161, 170)',
      border: 'rgba(244, 114, 182, 0.2)',
      glow: 'rgba(236, 72, 153, 0.4)',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    animation: {
      speed: 'slow',
      organic: true,
    },
    cssVarPrefix: 'lotus',
  },
};
