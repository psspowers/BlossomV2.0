import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface CycleData {
  currentCycleDay: number;
  lastCycleLength: number;
  averageCycleLength: number;
  regularity: number;
  status: 'regular' | 'long' | 'irregular' | 'unknown';
}

export function CycleContext() {
  const [cycleData, setCycleData] = useState<CycleData>({
    currentCycleDay: 0,
    lastCycleLength: 28,
    averageCycleLength: 28,
    regularity: 0,
    status: 'unknown'
  });
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');

  useEffect(() => {
    const loadCycleData = async () => {
      const logs = await db.logs
        .orderBy('date')
        .reverse()
        .toArray();

      const menstrualLogs = logs.filter(log => log.cyclePhase === 'menstrual');

      if (menstrualLogs.length === 0) {
        setHasEnoughData(false);
        return;
      }

      const lastPeriod = new Date(menstrualLogs[0].date);
      const today = new Date();
      const currentCycleDay = differenceInDays(today, lastPeriod);

      let lastCycleLength = 28;
      let averageCycleLength = 28;
      let regularity = 0;
      let status: 'regular' | 'long' | 'irregular' | 'unknown' = 'unknown';

      if (menstrualLogs.length >= 2) {
        const secondLastPeriod = new Date(menstrualLogs[1].date);
        lastCycleLength = differenceInDays(lastPeriod, secondLastPeriod);

        if (lastCycleLength < 15) {
          setHasEnoughData(false);
          return;
        }

        if (menstrualLogs.length >= 3) {
          const thirdLastPeriod = new Date(menstrualLogs[2].date);
          const secondToLastCycleLength = differenceInDays(secondLastPeriod, thirdLastPeriod);

          if (secondToLastCycleLength < 15) {
            averageCycleLength = lastCycleLength;
          } else {
            regularity = Math.abs(lastCycleLength - secondToLastCycleLength);
            const cycleLengths = [lastCycleLength, secondToLastCycleLength];
            averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
          }

          if (lastCycleLength > 35) {
            status = 'long';
          } else if (regularity > 7) {
            status = 'irregular';
          } else {
            status = 'regular';
          }
        } else {
          if (lastCycleLength > 35) {
            status = 'long';
          } else {
            status = 'regular';
          }
          averageCycleLength = lastCycleLength;
        }
        setHasEnoughData(true);
      } else {
        setHasEnoughData(false);
      }

      const phase = currentCycleDay <= 5 ? 'Menstrual Phase'
        : currentCycleDay <= 13 ? 'Follicular Phase'
        : currentCycleDay <= 17 ? 'Ovulatory Phase'
        : 'Luteal Phase';
      setCurrentPhase(phase);

      setCycleData({
        currentCycleDay,
        lastCycleLength,
        averageCycleLength,
        regularity,
        status
      });
    };

    loadCycleData();
  }, []);

  const progress = Math.min((cycleData.currentCycleDay / cycleData.averageCycleLength) * 100, 100);

  const statusConfig = {
    regular: {
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/30',
      label: 'Regular Pattern'
    },
    long: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      label: 'Extended Cycle'
    },
    irregular: {
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      borderColor: 'border-rose-500/30',
      label: 'Varying Pattern'
    },
    unknown: {
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/30',
      label: 'Building Pattern'
    }
  };

  const currentStatus = statusConfig[cycleData.status];

  if (!hasEnoughData) {
    return (
      <div className="flex flex-col justify-center h-full p-6">
        <div className="space-y-6">
          <div>
            <div className="text-2xl font-semibold text-white mb-2">
              Start Tracking Your Cycle
            </div>
            <div className="text-sm text-slate-400 leading-relaxed">
              Log at least two periods to see your cycle patterns, length, and personalized insights.
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-teal-400">1</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Log Your Period</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Mark the first day of your menstrual cycle
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-teal-400">2</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Track Daily</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Log symptoms, mood, and lifestyle factors
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-teal-400">3</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Get Insights</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Discover patterns and personalized wellness tips
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-xs text-slate-500 italic">
              Your data is stored locally and never leaves your device
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full p-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-bold text-white">
              {cycleData.currentCycleDay > 0 ? cycleData.currentCycleDay : '-'}
            </div>
            <div className="text-slate-400">
              <div className="text-sm">day{cycleData.currentCycleDay !== 1 ? 's' : ''} into your cycle</div>
            </div>
          </div>

          {currentPhase && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-sm font-medium text-teal-400">{currentPhase}</span>
            </div>
          )}

          {cycleData.status !== 'unknown' && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border`}>
              <span className={`text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-500">Cycle Progress</span>
            <span className="text-slate-400">
              {cycleData.currentCycleDay} of ~{cycleData.averageCycleLength} days
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Previous cycle</span>
            </div>
            <span className="text-sm font-medium text-white">
              {cycleData.lastCycleLength} days
            </span>
          </div>

          {cycleData.regularity > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Pattern consistency</span>
              <span className={cycleData.regularity <= 3 ? 'text-teal-400' : cycleData.regularity <= 7 ? 'text-amber-400' : 'text-rose-400'}>
                ±{cycleData.regularity} day{cycleData.regularity !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="text-xs text-slate-500 italic pt-2">
            Average cycle length: {cycleData.averageCycleLength} days
          </div>
        </div>
      </div>
    </div>
  );
}
