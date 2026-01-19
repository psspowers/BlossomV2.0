import { getLastNDays } from '../db';

export type SeasonType = 'resting' | 'growing' | 'blooming';

export interface SeasonState {
  currentSeason: SeasonType;
  message: string;
  icon: string;
}

export async function calculateSeason(blossomScore: number): Promise<SeasonState> {
  const recentLogs = await getLastNDays(7);

  const logsInLast7Days = recentLogs.length;

  if (logsInLast7Days < 3 || blossomScore < 40) {
    return {
      currentSeason: 'resting',
      message: 'Winter is necessary for Spring. Rest is productive.',
      icon: '🍂'
    };
  }

  if (blossomScore >= 80) {
    return {
      currentSeason: 'blooming',
      message: 'You are radiant. Enjoy this season.',
      icon: '🌸'
    };
  }

  return {
    currentSeason: 'growing',
    message: 'Your roots are deepening. Consistency is magic.',
    icon: '🌿'
  };
}

export function getSeasonColors(season: SeasonType) {
  switch (season) {
    case 'resting':
      return {
        primary: '#A1887F',
        secondary: '#EFEBE9',
        accent: '#8D6E63'
      };
    case 'growing':
      return {
        primary: '#66BB6A',
        secondary: '#E8F5E9',
        accent: '#4CAF50'
      };
    case 'blooming':
      return {
        primary: '#FF69B4',
        secondary: '#FFF0F5',
        accent: '#FFD700'
      };
  }
}

export function getSeasonDescription(season: SeasonType): string {
  switch (season) {
    case 'resting':
      return 'A time of gentle care and reflection. Your body needs this pause.';
    case 'growing':
      return 'Building strength and routine. Small steps create lasting change.';
    case 'blooming':
      return 'Thriving in balance. Your efforts are bearing fruit.';
  }
}
