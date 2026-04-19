import { useState, useEffect } from 'react';
import { useCategoryInsights, InsightCategory } from '../lib/hooks/useInsights';
import { InsightsNavigation, InsightView, viewConfig } from './InsightsNavigation';
import { Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingDown, Minus, TrendingUp, Leaf } from 'lucide-react';
import { analyzeHistory, CycleAnalysis } from '../lib/logic/cycle';
import { db } from '../lib/db';
import { SeasonTimeline } from './SeasonTimeline';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';
import { useLiveQuery } from 'dexie-react-hooks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Insights() {
  const [view, setView] = useState<InsightView>('physical');
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  const [cycleAnalysis, setCycleAnalysis] = useState<CycleAnalysis | null>(null);
  const [cycleLoading, setCycleLoading] = useState(true);
  const [seasonData, setSeasonData] = useState<{ score: number; season: any } | null>(null);

  const logsTrigger = useLiveQuery(() => db.logs.orderBy('date').last());

  const getCategoryFromView = (v: InsightView): InsightCategory => {
    switch (v) {
      case 'physical': return 'hyperandrogenism';
      case 'emotional': return 'psych';
      case 'metabolic': return 'metabolic';
      case 'cycle': return 'hyperandrogenism';
    }
  };
  const category = getCategoryFromView(view);
  const { insights, loading } = useCategoryInsights(category, timeframe);

  useEffect(() => {
    const loadCycleHistory = async () => {
      setCycleLoading(true);
      const logs = await db.logs.toArray();
      const analysis = analyzeHistory(logs);
      setCycleAnalysis(analysis);
      setCycleLoading(false);
    };
    loadCycleHistory();
  }, []);

  useEffect(() => {
    const loadSeasonData = async () => {
      const { score } = await calculateBlossomScore();
      const season = await calculateSeason(score);
      setSeasonData({ score, season });
    };
    loadSeasonData();
  }, [logsTrigger]);

  const currentConfig = viewConfig[view];
  const ViewIcon = currentConfig.icon;
  const hasData = insights.trendData.length > 0;

  return (
    <div className="mt-6">
      {seasonData && (
        <SeasonTimeline season={seasonData.season} score={seasonData.score} />
      )}

      <div className="sticky top-[64px] z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-100/60 -mx-4 px-4 pt-3 pb-2 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-800 leading-tight">Pattern Explorer</h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">Evidence-based pattern analysis</p>
          </div>
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 gap-1">
            {[7, 30].map(days => (
              <button
                key={days}
                onClick={(e) => { e.currentTarget.blur(); setTimeframe(days as 7 | 30); }}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
                  timeframe === days
                    ? 'bg-sage-500 text-white'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
        <InsightsNavigation view={view} onViewChange={setView} />
      </div>

      <div className="relative min-h-[500px]">
        <div
          className={`absolute inset-0 -inset-x-12 -inset-y-12 ${currentConfig.glowClass} blur-[100px] rounded-full transition-all duration-700 pointer-events-none opacity-50`}
        />

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center glass-card rounded-2xl z-10">
            <div className="text-slate-500 animate-pulse font-serif">Listening to your patterns...</div>
          </div>
        ) : !hasData ? (
          <div className="absolute inset-0 flex items-center justify-center glass-card rounded-2xl z-10">
            <div className="text-center px-4">
              <h3 className="text-lg font-serif font-semibold text-slate-800 mb-2">No Patterns Yet</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">
                Log a few more days of data. Your personalized insights will appear here soon.
              </p>
            </div>
          </div>
        ) : null}

        {!loading && hasData && view === 'cycle' ? (
          <div className="relative">
            {cycleLoading ? (
              <div className="glass-card p-8 flex items-center justify-center">
                <div className="text-slate-600 animate-pulse">Loading cycle history...</div>
              </div>
            ) : cycleAnalysis && !cycleAnalysis.isUntracked && cycleAnalysis.cycleHistory.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="glass-card p-4 lg:col-span-2">
                  <div className="mb-3">
                    <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                      Cycle History
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Visual comparison: Stable vs. Irregular patterns
                    </p>
                  </div>
                  <div style={{ height: '400px' }}>
                    <Bar
                      data={{
                        labels: cycleAnalysis.cycleHistory.slice(-6).map((_, i) => `Cycle ${i + 1}`),
                        datasets: [
                          {
                            label: 'Days',
                            data: cycleAnalysis.cycleHistory.slice(-6).map(c => c.daysFromPrevious || 0),
                            backgroundColor: cycleAnalysis.cycleHistory.slice(-6).map(c => {
                              const days = c.daysFromPrevious || 0;
                              if (days >= 21 && days <= 35) return 'rgba(134, 168, 115, 0.8)';
                              if (days > 35) return 'rgba(167, 199, 231, 0.8)';
                              return 'rgba(232, 174, 178, 0.8)';
                            }),
                            borderColor: cycleAnalysis.cycleHistory.slice(-6).map(c => {
                              const days = c.daysFromPrevious || 0;
                              if (days >= 21 && days <= 35) return 'rgb(134, 168, 115)';
                              if (days > 35) return 'rgb(167, 199, 231)';
                              return 'rgb(232, 174, 178)';
                            }),
                            borderWidth: 2,
                            borderRadius: 6
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: 20 },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            titleColor: '#4A4A4A',
                            bodyColor: '#4A4A4A',
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: (context: any) => {
                                const days = context.raw;
                                let status = 'Short';
                                if (days >= 21 && days <= 35) status = 'Normal';
                                else if (days > 35) status = 'Extended';
                                return `${days} days (${status})`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: {
                              color: 'rgba(74, 74, 74, 0.6)',
                              callback: (value: any) => `${value}d`
                            }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: 'rgba(74, 74, 74, 0.6)' }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#86A873' }}></div>
                      <span className="text-slate-600">21-35 days (Normal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#A7C7E7' }}></div>
                      <span className="text-slate-600">&gt;35 days (Extended)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#E8AEB2' }}></div>
                      <span className="text-slate-600">&lt;21 days (Short)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide mb-6">
                    Clinical Summary
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Average Length</div>
                      <div className="text-3xl font-serif font-bold text-slate-800">
                        {(() => {
                          const cycleLengths = cycleAnalysis.cycleHistory
                            .map(c => c.daysFromPrevious)
                            .filter((d): d is number => d !== undefined && !isNaN(d));
                          if (cycleLengths.length === 0) return <span className="text-slate-300">--</span>;
                          return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
                        })()}
                        {cycleAnalysis.cycleHistory.length > 0 && <span className="text-lg text-slate-500 ml-1">days</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stability Index</div>
                      <div className="text-3xl font-serif font-bold text-slate-800">
                        {cycleAnalysis.cycleHistory.length < 2 ? (
                          <span className="text-slate-300">--</span>
                        ) : (
                          `±${Math.round(cycleAnalysis.variability)}`
                        )}
                        {cycleAnalysis.cycleHistory.length >= 2 && <span className="text-lg text-slate-500 ml-1">days</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Status</div>
                      <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                        cycleAnalysis.cycleHistory.length < 2
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : cycleAnalysis.variability <= 5
                          ? 'bg-sage-100 text-sage-700 border border-sage-200'
                          : cycleAnalysis.variability <= 10
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {cycleAnalysis.cycleHistory.length < 2
                          ? 'Tracking...'
                          : cycleAnalysis.variability <= 5 ? 'Stable'
                          : cycleAnalysis.variability <= 10 ? 'Dynamic'
                          : 'Irregular'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-lavender-50 rounded-lg border border-lavender-100">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium">Stability Index of ±{Math.round(cycleAnalysis.variability)} days</span> shows
                      how much your cycle varies. Values under ±5 indicate high regularity, while values over ±10 suggest more dynamic patterns common with PCOS.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8">
                <div className="text-center">
                  <h3 className="text-lg font-serif font-semibold text-slate-800 mb-2">No Cycle Data Yet</h3>
                  <p className="text-slate-600 text-sm">
                    Start tracking your menstrual cycle to see cycle history and patterns.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : !loading && hasData ? (
          <div className="relative space-y-3">
            <div className="glass-card px-4 py-3">
              {insights.velocity ? (
                <div className="flex items-center gap-3">
                  {insights.velocity.direction === 'improving' ? (
                    <>
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${currentConfig.activeClass}`}>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif font-semibold text-[#4A4A4A] leading-snug">
                          Finding your rhythm
                        </p>
                        <p className="text-xs text-[#86A873] mt-0.5">
                          {insights.velocity.symptomName} improved by{' '}
                          <span className="font-bold">{Math.abs(insights.velocity.percentChange)}%</span> this week
                        </p>
                      </div>
                    </>
                  ) : insights.velocity.direction === 'stable' ? (
                    <>
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                        <Minus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif font-semibold text-[#4A4A4A] leading-snug">
                          Steady rhythm
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {insights.velocity.symptomName} remains stable this week
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-rose-50 text-rose-400">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif font-semibold text-[#4A4A4A] leading-snug">
                          Navigating change
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {insights.velocity.symptomName} shifted by{' '}
                          <span className="font-medium">{Math.abs(insights.velocity.percentChange)}%</span> this week
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${currentConfig.activeClass}`}>
                    <ViewIcon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-serif text-slate-500 italic">
                    Keep logging — we are listening for patterns.
                  </p>
                </div>
              )}
            </div>

            <div className="glass-card">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                  {currentConfig.label} Deep Dive
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  Current vs. Baseline - Granular Analysis
                </p>
              </div>
              <div className="h-[280px] sm:h-[350px] p-4 sm:p-6">
                {insights.radarLabels.length > 0 ? (
                  <Radar
                    data={{
                      labels: insights.radarLabels,
                      datasets: [
                        {
                          label: 'Current',
                          data: insights.radarCurrent.data,
                          backgroundColor: `${currentConfig.color.replace('0.8', '0.2')}`,
                          borderColor: currentConfig.borderColor,
                          borderWidth: 2,
                          tension: 0.4,
                          pointBackgroundColor: currentConfig.borderColor,
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: currentConfig.borderColor
                        },
                        {
                          label: 'Baseline',
                          data: insights.radarBaseline.data,
                          backgroundColor: 'rgba(229, 224, 216, 0.1)',
                          borderColor: '#E5E0D8',
                          borderWidth: 1,
                          borderDash: [4, 4],
                          tension: 0.4,
                          pointBackgroundColor: '#E5E0D8',
                          pointBorderColor: '#E5E0D8',
                          pointRadius: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: { padding: 20 },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 10,
                          ticks: { display: false, stepSize: 2 },
                          grid: { display: false },
                          angleLines: { display: false },
                          pointLabels: {
                            color: 'rgba(74, 74, 74, 0.8)',
                            font: { size: 11, family: 'Georgia, serif' }
                          }
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          titleColor: '#4A4A4A',
                          bodyColor: '#64748b',
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          borderWidth: 1,
                          padding: 12,
                          displayColors: false,
                          callbacks: {
                            label: (context: any) => {
                              const label = context.dataset.label || '';
                              const value = context.parsed.r;
                              return `${label}: ${value.toFixed(1)}/10`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-600">
                    No data yet
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="mb-4">
                <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide mb-1">
                  What Nourishes You
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  Patterns we've observed in your journey
                </p>
              </div>

              {insights.factorImpacts.length > 0 ? (
                <div className="space-y-4">
                  {insights.factorImpacts.slice(0, 3).map((factor, index) => {
                    if (factor.impact <= 0) return null;
                    return (
                      <div
                        key={index}
                        className="p-4 bg-[#FDFBF7] border border-sage-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-[#86A873]" />
                          </div>
                          <div className="flex-1">
                            {index === 0 && (
                              <div className="inline-block px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-medium rounded-full mb-2">
                                Your Strongest Lever
                              </div>
                            )}
                            <h4 className="text-sm font-serif font-semibold text-[#4A4A4A] mb-1">
                              {factor.factor}
                            </h4>
                            <p className="text-xs text-slate-700 font-sans leading-relaxed">
                              When you prioritize{' '}
                              <span className="font-semibold text-[#86A873]">{factor.factor}</span>, your wellness lifts by{' '}
                              <span className="font-bold text-[#86A873]">{factor.impact}%</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-serif italic text-sm">
                    Keep logging. We are listening for patterns.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
