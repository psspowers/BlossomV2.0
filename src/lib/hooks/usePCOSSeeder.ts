import { db, LogEntry } from '../db';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function clearAllLogs() {
  await db.logs.clear();
}

export function usePCOSSeeder() {
  const loadSarahPersona = async () => {
    await clearAllLogs();

    const logs: LogEntry[] = [];

    logs.push({
      date: formatDate(daysAgo(78)),
      cyclePhase: 'menstrual',
      flow: 'heavy',
      symptoms: { cramps: 6, bloat: 5 },
      psych: { mood: 4, stress: 'moderate' },
      lifestyle: { sleep: 'poor', waterIntake: 4, exercise: 'none', diet: 'poor' }
    });

    logs.push({
      date: formatDate(daysAgo(77)),
      cyclePhase: 'menstrual',
      flow: 'medium',
      symptoms: { cramps: 4, bloat: 4 },
      psych: { mood: 5, stress: 'moderate' },
      lifestyle: { sleep: 'fair', waterIntake: 5, exercise: 'light', diet: 'fair' }
    });

    logs.push({
      date: formatDate(daysAgo(76)),
      cyclePhase: 'menstrual',
      flow: 'light',
      symptoms: { cramps: 2, bloat: 2 },
      psych: { mood: 6, stress: 'low' },
      lifestyle: { sleep: 'good', waterIntake: 6, exercise: 'light', diet: 'good' }
    });

    logs.push({
      date: formatDate(daysAgo(32)),
      cyclePhase: 'menstrual',
      flow: 'medium',
      symptoms: { cramps: 5, bloat: 4, acne: 3 },
      psych: { mood: 5, stress: 'moderate' },
      lifestyle: { sleep: 'fair', waterIntake: 5, exercise: 'none', diet: 'fair' }
    });

    logs.push({
      date: formatDate(daysAgo(31)),
      cyclePhase: 'menstrual',
      flow: 'heavy',
      symptoms: { cramps: 7, bloat: 6, acne: 4 },
      psych: { mood: 4, stress: 'high' },
      lifestyle: { sleep: 'poor', waterIntake: 4, exercise: 'none', diet: 'poor' }
    });

    logs.push({
      date: formatDate(daysAgo(30)),
      cyclePhase: 'menstrual',
      flow: 'light',
      symptoms: { cramps: 3, bloat: 2 },
      psych: { mood: 6, stress: 'moderate' },
      lifestyle: { sleep: 'fair', waterIntake: 6, exercise: 'light', diet: 'fair' }
    });

    logs.push({
      date: formatDate(daysAgo(5)),
      cyclePhase: 'unknown',
      flow: 'light',
      symptoms: { bloat: 2 },
      psych: { mood: 7, stress: 'low' },
      lifestyle: { sleep: 'good', waterIntake: 7, exercise: 'moderate', diet: 'good' }
    });

    for (let i = 25; i >= 6; i--) {
      if (i % 3 === 0) {
        logs.push({
          date: formatDate(daysAgo(i)),
          cyclePhase: 'follicular',
          flow: 'none',
          symptoms: { acne: Math.floor(Math.random() * 3) + 1 },
          psych: { mood: Math.floor(Math.random() * 3) + 6, stress: 'low' },
          lifestyle: {
            sleep: 'good',
            waterIntake: Math.floor(Math.random() * 3) + 6,
            exercise: 'moderate',
            diet: 'good'
          }
        });
      }
    }

    await db.logs.bulkAdd(logs);

    return {
      persona: 'Sarah',
      description: 'The Spotter - High Variance',
      expectedCurrentDay: 32,
      trapDescription: 'Single light flow day 5 days ago should be ignored'
    };
  };

  const loadAlexPersona = async () => {
    await clearAllLogs();

    const logs: LogEntry[] = [];

    logs.push({
      date: formatDate(daysAgo(65)),
      cyclePhase: 'menstrual',
      flow: 'heavy',
      symptoms: { cramps: 6, bloat: 5, acne: 4 },
      psych: { mood: 5, stress: 'moderate', anxiety: 'moderate' },
      lifestyle: { sleep: 'fair', waterIntake: 5, exercise: 'none', diet: 'fair' }
    });

    logs.push({
      date: formatDate(daysAgo(64)),
      cyclePhase: 'menstrual',
      flow: 'medium',
      symptoms: { cramps: 5, bloat: 4, acne: 3 },
      psych: { mood: 5, stress: 'moderate', anxiety: 'moderate' },
      lifestyle: { sleep: 'fair', waterIntake: 6, exercise: 'light', diet: 'fair' }
    });

    logs.push({
      date: formatDate(daysAgo(63)),
      cyclePhase: 'menstrual',
      flow: 'light',
      symptoms: { cramps: 2, bloat: 2 },
      psych: { mood: 6, stress: 'low', anxiety: 'low' },
      lifestyle: { sleep: 'good', waterIntake: 7, exercise: 'light', diet: 'good' }
    });

    for (let i = 60; i >= 1; i--) {
      const sleepQuality = i % 7 === 0 ? 'fair' : 'good';
      const waterIntake = Math.floor(Math.random() * 2) + 7;
      const exercise = i % 5 === 0 ? 'light' : i % 3 === 0 ? 'moderate' : 'vigorous';
      const diet = i % 10 === 0 ? 'fair' : 'good';
      const mood = Math.floor(Math.random() * 2) + 7;

      logs.push({
        date: formatDate(daysAgo(i)),
        cyclePhase: i > 45 ? 'follicular' : i > 30 ? 'ovulatory' : 'luteal',
        flow: 'none',
        symptoms: {
          acne: i > 40 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 2,
          bloat: i > 40 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 2
        },
        psych: { mood, stress: 'low', anxiety: 'low', bodyImage: 'positive' },
        lifestyle: {
          sleep: sleepQuality,
          waterIntake,
          exercise,
          diet
        }
      });
    }

    await db.logs.bulkAdd(logs);

    return {
      persona: 'Alex',
      description: 'The Long Cycle - Metabolic Focus',
      expectedCurrentDay: 65,
      note: 'Consistent lifestyle tracking for 60 days, showing maintenance mode'
    };
  };

  return {
    loadSarahPersona,
    loadAlexPersona
  };
}
