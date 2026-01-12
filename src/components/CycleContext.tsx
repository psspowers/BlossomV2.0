import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { differenceInDays } from 'date-fns';

interface CycleData {
  currentCycleDay: number;
  lastCycleLength: number;
  averageCycleLength: number;
  regularity: number;
  status: 'regular' | 'long' | 'irregular' | 'unknown';
}

interface PhaseConfig {
  name: string;
  insight: string;
  color: string;
  ringColor: string;
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

      const periodStarts: Date[] = [];
      for (let i = 0; i < menstrualLogs.length; i++) {
        const currentDate = new Date(menstrualLogs[i].date);
        const isFirstDay = i === 0 ||
          differenceInDays(new Date(menstrualLogs[i - 1].date), currentDate) > 1;

        if (isFirstDay) {
          periodStarts.push(currentDate);
        }
      }

      if (periodStarts.length === 0) {
        setHasEnoughData(false);
        return;
      }

      const lastPeriod = periodStarts[0];
      const today = new Date();
      const currentCycleDay = differenceInDays(today, lastPeriod);

      let lastCycleLength = 28;
      let averageCycleLength = 28;
      let regularity = 0;
      let status: 'regular' | 'long' | 'irregular' | 'unknown' = 'unknown';

      if (periodStarts.length >= 2) {
        const secondLastPeriod = periodStarts[1];
        lastCycleLength = differenceInDays(lastPeriod, secondLastPeriod);

        if (lastCycleLength < 15) {
          setHasEnoughData(false);
          return;
        }

        if (periodStarts.length >= 3) {
          const thirdLastPeriod = periodStarts[2];
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

  const getPhaseConfig = (day: number): PhaseConfig => {
    if (day <= 5) {
      return {
        name: 'Menstrual Phase',
        insight: 'Hormones are at baseline. Your body is resetting.',
        color: 'text-rose-400',
        ringColor: '#fb7185'
      };
    } else if (day <= 13) {
      return {
        name: 'Follicular Phase',
        insight: 'Estrogen is rising. You may feel a boost in energy and focus.',
        color: 'text-teal-400',
        ringColor: '#2dd4bf'
      };
    } else if (day === 14) {
      return {
        name: 'Ovulation',
        insight: 'Peak energy. A great time for important conversations.',
        color: 'text-amber-400',
        ringColor: '#fbbf24'
      };
    } else {
      return {
        name: 'Luteal Phase',
        insight: 'Progesterone is dominant. Prioritize rest and gentle movement.',
        color: 'text-purple-400',
        ringColor: '#c084fc'
      };
    }
  };

  const sanitizedCycleLength = cycleData.averageCycleLength < 21 ? 28 : cycleData.averageCycleLength;
  const progress = Math.min((cycleData.currentCycleDay / sanitizedCycleLength) * 100, 100);
  const phaseConfig = getPhaseConfig(cycleData.currentCycleDay);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
    <div className="relative overflow-hidden h-full">
      <div className="flex items-center justify-between h-full px-6 py-4">

        <div className="flex-1 pr-6 space-y-4">
          <div>
            <div className={`text-2xl font-semibold mb-3 ${phaseConfig.color}`}>
              {phaseConfig.name}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {phaseConfig.insight}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-white/10">
            <div>
              <span className="text-slate-500">Previous cycle:</span>{' '}
              <span className="text-white font-medium">{cycleData.lastCycleLength} days</span>
            </div>
            <div>
              <span className="text-slate-500">Average:</span>{' '}
              <span className="text-white font-medium">{cycleData.averageCycleLength} days</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-32 h-32 flex-shrink-0">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={phaseConfig.ringColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Day</span>
            <span className="text-3xl font-bold text-white">{cycleData.currentCycleDay}</span>
            <span className="text-xs text-slate-400 mt-0.5">of ~{sanitizedCycleLength}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
