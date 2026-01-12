import { db } from '../db';
import { differenceInDays } from 'date-fns';

export type PlantPhase = 'seed' | 'sprout' | 'bloom' | 'flourish';

export interface PlantState {
  phase: PlantPhase;
  health: number;
  pulseSpeed: number;
  streak: number;
}

export async function calculatePlantHealth(): Promise<PlantState> {
  const logs = await db.logs.orderBy('date').reverse().toArray();

  if (logs.length === 0) {
    return {
      phase: 'seed',
      health: 0,
      pulseSpeed: 2.5,
      streak: 0
    };
  }

  const today = new Date();
  const lastLogDate = new Date(logs[0].date);
  const daysSinceLastLog = differenceInDays(today, lastLogDate);

  let streak = 0;
  let previousDate: Date | null = null;

  for (const log of logs) {
    const logDate = new Date(log.date);

    if (previousDate === null) {
      if (daysSinceLastLog <= 2) {
        streak = 1;
        previousDate = logDate;
      } else {
        break;
      }
    } else {
      const gap = differenceInDays(previousDate, logDate);

      if (gap <= 2) {
        streak++;
        previousDate = logDate;
      } else {
        break;
      }
    }
  }

  const health = Math.min(100, (streak / 30) * 100);

  let phase: PlantPhase;
  if (streak < 3) {
    phase = 'seed';
  } else if (streak < 7) {
    phase = 'sprout';
  } else if (streak < 21) {
    phase = 'bloom';
  } else {
    phase = 'flourish';
  }

  const pulseSpeed = Math.max(1.0, 3.0 - (health / 50));

  return {
    phase,
    health: Math.round(health),
    pulseSpeed,
    streak
  };
}

export function getPhaseDescription(phase: PlantPhase): string {
  switch (phase) {
    case 'seed':
      return 'Beginning your journey';
    case 'sprout':
      return 'Taking root';
    case 'bloom':
      return 'Thriving';
    case 'flourish':
      return 'In full bloom';
  }
}
