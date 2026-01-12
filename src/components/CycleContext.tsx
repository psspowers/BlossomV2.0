import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { differenceInDays, format, addDays } from 'date-fns';

interface CycleData {
  currentCycleDay: number;
  lastCycleLength: number;
  averageCycleLength: number;
  regularity: number;
  status: 'regular' | 'long' | 'irregular' | 'unknown';
  periodStarts: Date[];
  cycleLengths: number[];
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
    status: 'unknown',
    periodStarts: [],
    cycleLengths: []
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
      const cycleLengths: number[] = [];

      if (periodStarts.length >= 2) {
        const secondLastPeriod = periodStarts[1];
        lastCycleLength = differenceInDays(lastPeriod, secondLastPeriod);

        if (lastCycleLength < 15) {
          setHasEnoughData(false);
          return;
        }

        cycleLengths.push(lastCycleLength);

        if (periodStarts.length >= 3) {
          const thirdLastPeriod = periodStarts[2];
          const secondToLastCycleLength = differenceInDays(secondLastPeriod, thirdLastPeriod);

          if (secondToLastCycleLength >= 15) {
            cycleLengths.push(secondToLastCycleLength);
            regularity = Math.abs(lastCycleLength - secondToLastCycleLength);
            averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
          } else {
            averageCycleLength = lastCycleLength;
          }

          if (periodStarts.length >= 4) {
            const fourthLastPeriod = periodStarts[3];
            const thirdToLastCycleLength = differenceInDays(thirdLastPeriod, fourthLastPeriod);
            if (thirdToLastCycleLength >= 15) {
              cycleLengths.push(thirdToLastCycleLength);
              averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
            }
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
        status,
        periodStarts: periodStarts.slice(0, 4),
        cycleLengths
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

  const daysToShow = 28;
  const today = new Date();
  const startDate = addDays(today, -14);

  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));

  const isPeriodStartDay = (date: Date) => {
    return cycleData.periodStarts.some(periodDate => {
      const diff = Math.abs(differenceInDays(date, periodDate));
      return diff === 0;
    });
  };

  const getPhaseForDay = (date: Date) => {
    if (!cycleData.periodStarts[0]) return 3;
    const daysSinceLastPeriod = differenceInDays(date, cycleData.periodStarts[0]);
    if (daysSinceLastPeriod < 0) {
      const cyclesBack = cycleData.periodStarts.findIndex(ps => differenceInDays(date, ps) >= 0);
      if (cyclesBack === -1) return 3;
      const relevantPeriod = cycleData.periodStarts[cyclesBack];
      const daysSince = differenceInDays(date, relevantPeriod);
      if (daysSince <= 5) return 0;
      if (daysSince <= 13) return 1;
      if (daysSince <= 17) return 2;
      return 3;
    }
    if (daysSinceLastPeriod <= 5) return 0;
    if (daysSinceLastPeriod <= 13) return 1;
    if (daysSinceLastPeriod <= 17) return 2;
    return 3;
  };

  const phaseHeights = dates.map(date => {
    const phase = getPhaseForDay(date);
    const heights = [20, 45, 65, 35];
    const variance = Math.sin(date.getTime() / 100000000) * 5;
    return heights[phase] + variance;
  });

  const maxHeight = 70;
  const chartHeight = 100;

  const getCycleLengthText = () => {
    if (cycleData.cycleLengths.length === 0) return '';
    const reversed = [...cycleData.cycleLengths].reverse();
    return reversed.map(len => `${len}d`).join(' → ');
  };

  return (
    <div className="relative overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 space-y-3 flex-shrink-0">
        <div>
          <div className={`text-xl font-semibold ${phaseConfig.color}`}>
            {phaseConfig.name}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            {phaseConfig.insight}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs pt-2 border-t border-white/10">
          <div>
            <span className="text-slate-500">Cycles:</span>{' '}
            <span className="text-white font-medium">{getCycleLengthText() || `${cycleData.lastCycleLength}d`}</span>
          </div>
          <div>
            <span className="text-slate-500">Avg:</span>{' '}
            <span className="text-white font-medium">{cycleData.averageCycleLength}d</span>
          </div>
          {cycleData.regularity > 0 && (
            <div>
              <span className="text-slate-500">±</span>{' '}
              <span className="text-white font-medium">{cycleData.regularity}d</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pb-2 relative">
        <div className="flex items-center justify-between mb-2 text-[9px] text-slate-500 px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 bg-gradient-to-r from-rose-400 via-teal-400 to-purple-400 opacity-40 rounded"></div>
              <span>Hormone phases</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
              <span>Period start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-white"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${daysToShow * 10} ${chartHeight}`}
          className="w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="phaseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.3" />
              <stop offset="33%" stopColor="#2dd4bf" stopOpacity="0.3" />
              <stop offset="66%" stopColor="#fbbf24" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <path
            d={`
              M 0,${chartHeight}
              ${dates.map((date, i) => {
                const x = i * 10 + 5;
                const y = chartHeight - phaseHeights[i];
                return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
              }).join(' ')}
              L ${daysToShow * 10},${chartHeight}
              Z
            `}
            fill="url(#phaseGradient)"
            className="transition-all duration-300"
          />

          <path
            d={dates.map((date, i) => {
              const x = i * 10 + 5;
              const y = chartHeight - phaseHeights[i];
              return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="0.5"
            className="transition-all duration-300"
          />

          {dates.map((date, i) => {
            const isToday = differenceInDays(date, today) === 0;
            const isPeriod = isPeriodStartDay(date);
            const x = i * 10 + 5;

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={chartHeight}
                  stroke={isToday ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isToday ? 1 : 0.3}
                />
                {isPeriod && (
                  <circle
                    cx={x}
                    cy={chartHeight - phaseHeights[i]}
                    r={2}
                    fill="#fb7185"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between text-[8px] text-slate-500 mt-1 px-1">
          {dates.filter((_, i) => i % 4 === 0).map((date, i) => (
            <div key={i} className="flex flex-col items-center">
              <span>{format(date, 'EEE')}</span>
              <span className="font-medium">{format(date, 'd')}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-2 space-y-0.5">
          <div className="text-xs">
            <span className="text-slate-500">You are on day</span>{' '}
            <span className="text-white font-semibold">{cycleData.currentCycleDay}</span>
            <span className="text-slate-500"> since your last period</span>
          </div>
          <div className="text-[10px] text-slate-600">
            Expected cycle length: ~{sanitizedCycleLength} days (based on your history)
          </div>
        </div>
      </div>
    </div>
  );
}
