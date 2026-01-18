import { useEffect, useState } from 'react';
import { db, LogEntry } from '../lib/db';
import { analyzeHistory, CycleAnalysis } from '../lib/logic/cycle';
import { Activity, TrendingUp } from 'lucide-react';

export function CycleContext() {
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [recentSpotting, setRecentSpotting] = useState<{ date: string; daysAgo: number } | null>(null);

  useEffect(() => {
    const loadCycleData = async () => {
      const allLogs = await db.logs
        .orderBy('date')
        .toArray();

      setLogs(allLogs);

      if (allLogs.length === 0) {
        return;
      }

      const cycleAnalysis = analyzeHistory(allLogs);
      setAnalysis(cycleAnalysis);

      const sortedLogs = [...allLogs].sort((a, b) => b.date.localeCompare(a.date));

      const spottingLog = sortedLogs.find(log =>
        log.flow === 'light' || log.flow === 'spotting'
      );

      if (spottingLog && cycleAnalysis.lastTruePeriod) {
        const spottingDate = new Date(spottingLog.date);
        const lastPeriodDate = new Date(cycleAnalysis.lastTruePeriod.startDate);
        const today = new Date();

        const daysAgoSpotting = Math.floor((today.getTime() - spottingDate.getTime()) / (1000 * 60 * 60 * 24));

        if (spottingDate > lastPeriodDate && daysAgoSpotting < 30) {
          setRecentSpotting({
            date: spottingLog.date,
            daysAgo: daysAgoSpotting
          });
        }
      }
    };

    loadCycleData();
  }, []);

  if (!analysis || analysis.isUntracked) {
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
                  Mark the first day with medium or heavy flow
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
                <div className="text-sm font-medium text-white">Get PCOS Insights</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Discover patterns with PCOS-aware cycle logic
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

  const { currentDay, isLongCycle, variability } = analysis;

  const getPhaseInsight = () => {
    if (isLongCycle) {
      return 'We are in an extended cycle. Focus on consistency and metabolic support.';
    }

    if (currentDay <= 5) {
      return 'Menstrual phase. Hormones are at baseline. Rest and replenish.';
    } else if (currentDay <= 14) {
      return 'Follicular phase. Estrogen levels are likely rising.';
    } else if (currentDay <= 21) {
      return 'Luteal phase. Progesterone is becoming dominant.';
    } else {
      return 'Late luteal phase. Listen to your body\'s rhythm.';
    }
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = isLongCycle ? 100 : Math.min((currentDay / 35) * 100, 100);
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const metabolicScore = isLongCycle ? Math.max(40, 100 - (currentDay - 35)) : 85;

  return (
    <div className="relative overflow-hidden h-full flex flex-col p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            {isLongCycle ? 'Metabolic Maintenance' : 'Cycle Context'}
          </h3>

          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-5xl font-bold ${isLongCycle ? 'text-blue-400' : 'text-teal-400'}`}>
              Day {currentDay}
            </span>

            {variability > 10 && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700 font-medium">
                Dynamic Pattern
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            {getPhaseInsight()}
          </p>

          {analysis.cycleHistory.length > 1 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Recent Cycles:</span>{' '}
                  <span className="text-white font-medium">
                    {analysis.cycleHistory
                      .slice(-3)
                      .reverse()
                      .map(c => c.daysFromPrevious)
                      .filter(d => d !== undefined)
                      .map(d => `${d}d`)
                      .join(' → ')}
                  </span>
                </div>

                {variability > 0 && (
                  <div>
                    <span className="text-slate-500">Variability:</span>{' '}
                    <span className={`font-medium ${variability > 10 ? 'text-amber-400' : 'text-teal-400'}`}>
                      ±{Math.round(variability)}d
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {recentSpotting && (
            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Spotting detected</span> {recentSpotting.daysAgo} days ago (No Reset)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="ml-6 flex-shrink-0">
          {isLongCycle ? (
            <div className="w-32 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stability</span>
                <span className="text-blue-400 font-semibold">{metabolicScore}%</span>
              </div>

              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${metabolicScore}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Maintenance Mode</span>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10">
                <div className="text-[10px] text-slate-500 space-y-1">
                  <p>Focus Areas:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Sleep</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Nutrition</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Movement</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-400 mb-1" />
                <div className="text-xs text-slate-400">Tracking</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
