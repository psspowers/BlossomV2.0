import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

export function CycleRing() {
  const [cycleDay, setCycleDay] = useState<number>(0);
  const [phase, setPhase] = useState<string>('unknown');

  useEffect(() => {
    const loadCycleData = async () => {
      const logs = await db.logs
        .orderBy('date')
        .reverse()
        .toArray();

      const menstrualLogs = logs.filter(log => log.cyclePhase === 'menstrual');

      if (menstrualLogs.length > 0) {
        const lastPeriod = new Date(menstrualLogs[0].date);
        const today = new Date();
        const daysSince = differenceInDays(today, lastPeriod);
        setCycleDay(daysSince);

        if (daysSince <= 5) {
          setPhase('menstrual');
        } else if (daysSince <= 13) {
          setPhase('follicular');
        } else if (daysSince <= 17) {
          setPhase('ovulatory');
        } else {
          setPhase('luteal');
        }
      } else if (logs.length > 0) {
        setPhase(logs[0].cyclePhase);
      }
    };

    loadCycleData();
  }, []);

  const progress = (cycleDay / 28) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const phaseColors: Record<string, string> = {
    menstrual: '#ef4444',
    follicular: '#a78bfa',
    ovulatory: '#2dd4bf',
    luteal: '#fbbf24',
    unknown: '#64748b'
  };

  const phaseLabels: Record<string, string> = {
    menstrual: 'Menstrual',
    follicular: 'Follicular',
    ovulatory: 'Ovulatory',
    luteal: 'Luteal',
    unknown: 'Tracking'
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
            fill="none"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="45"
            stroke={phaseColors[phase]}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${phaseColors[phase]})`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white">
            {cycleDay > 0 ? cycleDay : '-'}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            Day
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div
          className="text-sm font-medium uppercase tracking-wide"
          style={{ color: phaseColors[phase] }}
        >
          {phaseLabels[phase]}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {cycleDay > 0 ? `Day ${cycleDay} of cycle` : 'Start tracking'}
        </div>
      </div>
    </div>
  );
}
