import { db } from '../db';
import { calculatePlantHealth } from './plant';
import { getLastNDays } from '../db';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface AchievementData {
  totalStreak: number;
  totalLogs: number;
  badges: Badge[];
  nextBadge: Badge | null;
}

async function checkSeedPlanted(): Promise<{ unlocked: boolean; progress: number }> {
  const count = await db.logs.count();
  return {
    unlocked: count >= 1,
    progress: Math.min(100, (count / 1) * 100)
  };
}

async function checkConsistentLogger(): Promise<{ unlocked: boolean; progress: number }> {
  const plantState = await calculatePlantHealth();
  return {
    unlocked: plantState.streak >= 3,
    progress: Math.min(100, (plantState.streak / 3) * 100)
  };
}

async function checkWeekWarrior(): Promise<{ unlocked: boolean; progress: number }> {
  const plantState = await calculatePlantHealth();
  return {
    unlocked: plantState.streak >= 7,
    progress: Math.min(100, (plantState.streak / 7) * 100)
  };
}

async function checkMightyTree(): Promise<{ unlocked: boolean; progress: number }> {
  const plantState = await calculatePlantHealth();
  return {
    unlocked: plantState.streak >= 21,
    progress: Math.min(100, (plantState.streak / 21) * 100)
  };
}

async function checkSleepWisdom(): Promise<{ unlocked: boolean; progress: number }> {
  const logs = await getLastNDays(7);
  const goodSleepDays = logs.filter(log => {
    const sleep = log.lifestyle.sleep;
    return sleep === '7-8h' || sleep === '>8h';
  }).length;

  return {
    unlocked: goodSleepDays >= 5,
    progress: Math.min(100, (goodSleepDays / 5) * 100)
  };
}

async function checkBalanceSeeker(): Promise<{ unlocked: boolean; progress: number }> {
  const logs = await getLastNDays(14);
  const balancedDays = logs.filter(log => {
    const diet = log.lifestyle.diet;
    return diet === 'balanced';
  }).length;

  return {
    unlocked: balancedDays >= 10,
    progress: Math.min(100, (balancedDays / 10) * 100)
  };
}

async function checkMovementMaster(): Promise<{ unlocked: boolean; progress: number }> {
  const logs = await getLastNDays(7);
  const activeDays = logs.filter(log => {
    const exercise = log.lifestyle.exercise;
    return exercise === 'moderate' || exercise === 'intense';
  }).length;

  return {
    unlocked: activeDays >= 4,
    progress: Math.min(100, (activeDays / 4) * 100)
  };
}

async function checkCycleExplorer(): Promise<{ unlocked: boolean; progress: number }> {
  const logs = await db.logs.toArray();
  const uniquePhases = new Set(logs.map(log => log.cyclePhase));
  const count = uniquePhases.size;

  return {
    unlocked: count >= 4,
    progress: Math.min(100, (count / 4) * 100)
  };
}

export async function calculateAchievements(): Promise<AchievementData> {
  const plantState = await calculatePlantHealth();
  const totalLogs = await db.logs.count();

  const badgeChecks = [
    {
      id: 'seed-planted',
      name: 'Seed Planted',
      description: 'Log your first entry',
      icon: '🌱',
      check: checkSeedPlanted
    },
    {
      id: 'consistent-logger',
      name: 'Consistent Logger',
      description: 'Maintain a 3-day streak',
      icon: '📝',
      check: checkConsistentLogger
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⭐',
      check: checkWeekWarrior
    },
    {
      id: 'mighty-tree',
      name: 'Mighty Tree',
      description: 'Maintain a 21-day streak',
      icon: '🌳',
      check: checkMightyTree
    },
    {
      id: 'sleep-wisdom',
      name: 'Sleep Wisdom',
      description: 'Log 7-8h sleep for 5 days in a week',
      icon: '😴',
      check: checkSleepWisdom
    },
    {
      id: 'balance-seeker',
      name: 'Balance Seeker',
      description: 'Maintain balanced diet for 10 days',
      icon: '🍎',
      check: checkBalanceSeeker
    },
    {
      id: 'movement-master',
      name: 'Movement Master',
      description: 'Exercise 4+ days in a week',
      icon: '💪',
      check: checkMovementMaster
    },
    {
      id: 'cycle-explorer',
      name: 'Cycle Explorer',
      description: 'Track all 4 cycle phases',
      icon: '🔄',
      check: checkCycleExplorer
    }
  ];

  const badges: Badge[] = [];

  for (const badgeConfig of badgeChecks) {
    const result = await badgeConfig.check();
    badges.push({
      id: badgeConfig.id,
      name: badgeConfig.name,
      description: badgeConfig.description,
      icon: badgeConfig.icon,
      unlocked: result.unlocked,
      progress: result.progress
    });
  }

  const nextBadge = badges.find(b => !b.unlocked) || null;

  return {
    totalStreak: plantState.streak,
    totalLogs,
    badges,
    nextBadge
  };
}
