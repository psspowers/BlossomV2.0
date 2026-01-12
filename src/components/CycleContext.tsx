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

  useEffect(() => {
    const loadCycleData = async () => {
      const logs = await db.logs
        .orderBy('date')
        .reverse()
        .toArray();

      const menstrualLogs = logs.filter(log => log.cyclePhase === 'menstrual');

      if (menstrualLogs.length === 0) {
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

        if (menstrualLogs.length >= 3) {
          const thirdLastPeriod = new Date(menstrualLogs[2].date);
          const secondToLastCycleLength = differenceInDays(secondLastPeriod, thirdLastPeriod);
          regularity = Math.abs(lastCycleLength - secondToLastCycleLength);

          const cycleLengths = [lastCycleLength, secondToLastCycleLength];
          averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);

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
      }

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
      label: 'Regular'
    },
    long: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      label: 'Long Cycle'
    },
    irregular: {
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      borderColor: 'border-rose-500/30',
      label: 'Irregular'
    },
    unknown: {
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/30',
      label: 'Tracking'
    }
  };

  const currentStatus = statusConfig[cycleData.status];

  return (
    <div className="flex flex-col justify-center h-full p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-white">
              Day {cycleData.currentCycleDay > 0 ? cycleData.currentCycleDay : '-'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              of {cycleData.averageCycleLength} day cycle
            </div>
          </div>
          {cycleData.status !== 'unknown' && cycleData.status !== 'regular' && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border`}>
              <AlertCircle className={`w-3.5 h-3.5 ${currentStatus.color}`} />
              <span className={`text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Progress</span>
            <span className={currentStatus.color}>{Math.round(progress)}%</span>
          </div>
        </div>

        {cycleData.lastCycleLength > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Last cycle</span>
              </div>
              <span className="text-sm font-medium text-white">
                {cycleData.lastCycleLength} days
              </span>
            </div>
            {cycleData.regularity > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                Variance: ±{cycleData.regularity} days
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
