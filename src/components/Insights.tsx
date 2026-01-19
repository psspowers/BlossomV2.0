import { useState, useEffect } from 'react';
import { useCategoryInsights, InsightCategory } from '../lib/hooks/useInsights';
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
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Heart, Calendar, Leaf, Sparkles } from 'lucide-react';
import { analyzeHistory, CycleAnalysis } from '../lib/logic/cycle';
import { db } from '../lib/db';
import { WellnessRadar } from './WellnessRadar';

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

type ViewType = InsightCategory | 'cycle';

export function Insights() {
  const [view, setView] = useState<ViewType>('hyperandrogenism');
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  const [cycleAnalysis, setCycleAnalysis] = useState<CycleAnalysis | null>(null);
  const [cycleLoading, setCycleLoading] = useState(true);

  const category: InsightCategory = view === 'cycle' ? 'hyperandrogenism' : view;
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

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const viewConfig = {
    hyperandrogenism: {
      label: 'Physical',
      icon: Activity,
      color: 'rgba(232, 174, 178, 0.8)',
      bgColor: 'rgba(232, 174, 178, 0.1)',
      borderColor: 'rgb(232, 174, 178)',
      hex: '#E8AEB2',
      glowClass: 'bg-secondary/10',
      shadowClass: 'shadow-[0_4px_20px_rgba(232,174,178,0.3)]',
      borderClass: 'border-secondary',
      textClass: 'text-secondary',
      badgeBgClass: 'bg-secondary/20 text-secondary border-secondary/30'
    },
    metabolic: {
      label: 'Metabolic',
      icon: Heart,
      color: 'rgba(134, 168, 115, 0.8)',
      bgColor: 'rgba(134, 168, 115, 0.1)',
      borderColor: 'rgb(134, 168, 115)',
      hex: '#86A873',
      glowClass: 'bg-primary/10',
      shadowClass: 'shadow-[0_4px_20px_rgba(134,168,115,0.3)]',
      borderClass: 'border-primary',
      textClass: 'text-primary',
      badgeBgClass: 'bg-primary/20 text-primary border-primary/30'
    },
    psych: {
      label: 'Emotional',
      icon: Brain,
      color: 'rgba(107, 143, 78, 0.8)',
      bgColor: 'rgba(107, 143, 78, 0.1)',
      borderColor: 'rgb(107, 143, 78)',
      hex: '#6b8f4e',
      glowClass: 'bg-sage-600/10',
      shadowClass: 'shadow-[0_4px_20px_rgba(107,143,78,0.3)]',
      borderClass: 'border-sage-600',
      textClass: 'text-sage-600',
      badgeBgClass: 'bg-sage-600/20 text-sage-600 border-sage-600/30'
    },
    cycle: {
      label: 'Cycle History',
      icon: Calendar,
      color: 'rgba(197, 179, 223, 0.8)',
      bgColor: 'rgba(197, 179, 223, 0.1)',
      borderColor: 'rgb(197, 179, 223)',
      hex: '#C5B3DF',
      glowClass: 'bg-lavender-400/10',
      shadowClass: 'shadow-[0_4px_20px_rgba(197,179,223,0.3)]',
      borderClass: 'border-lavender-400',
      textClass: 'text-lavender-600',
      badgeBgClass: 'bg-lavender-400/20 text-lavender-600 border-lavender-400/30'
    }
  };

  const currentConfig = viewConfig[view as keyof typeof viewConfig];

  if (loading) {
    return (
      <div className="mt-6 glass-card p-6">
        <div className="flex items-center justify-center">
          <div className="text-slate-600 animate-pulse">Loading insights...</div>
        </div>
      </div>
    );
  }

  const hasData = insights.trendData.length > 0;

  if (!hasData) {
    return (
      <div className="mt-6 glass-card p-6">
        <div className="text-center">
          <h3 className="text-lg font-serif font-semibold text-slate-800 mb-2">No Data Yet</h3>
          <p className="text-slate-600 text-sm">
            Start logging your daily data to see personalized insights and trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-800">Insights Engine</h2>
          <p className="text-sm text-slate-600 mt-1">Evidence-based pattern analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 gap-1">
            {[7, 30].map(days => (
              <button
                key={days}
                onClick={() => setTimeframe(days as 7 | 30)}
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
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
        {Object.entries(viewConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = view === key;
          return (
            <button
              key={key}
              onClick={() => handleViewChange(key as ViewType)}
              className={`flex-1 min-w-[70px] flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? `bg-white ${config.textClass} border-b-2 ${config.borderClass} ${config.shadowClass} border-t border-x border-slate-200`
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-sm leading-tight whitespace-nowrap">{config.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div
          className={`absolute inset-0 -inset-x-12 -inset-y-12 ${currentConfig.glowClass} blur-[100px] rounded-full transition-all duration-700 pointer-events-none opacity-50`}
        />
        {view === 'cycle' ? (
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
                      Last 6 Cycles
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Track your cycle lengths over time
                    </p>
                  </div>
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: cycleAnalysis.cycleHistory.slice(-6).map((_, i) => `Cycle ${i + 1}`),
                        datasets: [
                          {
                            label: 'Days',
                            data: cycleAnalysis.cycleHistory.slice(-6).map(c => c.daysFromPrevious || 0),
                            backgroundColor: cycleAnalysis.cycleHistory.slice(-6).map(c => {
                              const days = c.daysFromPrevious || 0;
                              if (days >= 21 && days <= 35) return 'rgba(107, 143, 78, 0.8)';
                              if (days > 35) return 'rgba(134, 168, 115, 0.8)';
                              return 'rgba(232, 174, 178, 0.8)';
                            }),
                            borderColor: cycleAnalysis.cycleHistory.slice(-6).map(c => {
                              const days = c.daysFromPrevious || 0;
                              if (days >= 21 && days <= 35) return 'rgb(107, 143, 78)';
                              if (days > 35) return 'rgb(134, 168, 115)';
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
                                let status = 'Short cycle';
                                if (days >= 21 && days <= 35) status = 'Stable';
                                else if (days > 35) status = 'Long cycle';
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
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-sage-600"></div>
                      <span className="text-slate-600">21-35 days (Stable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary"></div>
                      <span className="text-slate-600">&gt;35 days (Long)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-secondary"></div>
                      <span className="text-slate-600">&lt;21 days (Short)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide mb-4">
                    Variability Index
                  </h3>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-5xl font-serif font-bold text-lavender-600 mb-2">
                      {Math.round(cycleAnalysis.variability)}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">days</div>
                    <div className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                      cycleAnalysis.variability <= 5
                        ? 'bg-sage-100 text-sage-700 border border-sage-200'
                        : cycleAnalysis.variability <= 10
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {cycleAnalysis.variability <= 5 ? 'Stable' : cycleAnalysis.variability <= 10 ? 'Moderate' : 'Dynamic'}
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-lavender-50 rounded-lg border border-lavender-100">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium">Your stability is {Math.round(cycleAnalysis.variability)} days.</span> This represents
                      how much your cycle length varies. Lower numbers indicate more predictable cycles.
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
        ) : (
          <div className="relative space-y-6">
            <div className="glass-card p-8">
              {insights.velocity ? (
                <div className="text-center">
                  {insights.velocity.direction === 'improving' ? (
                    <>
                      <Sparkles className="w-8 h-8 text-[#86A873] mx-auto mb-4" />
                      <h3 className="text-3xl md:text-4xl font-serif text-[#4A4A4A] leading-relaxed mb-2">
                        You are finding your rhythm.
                      </h3>
                      <p className="text-lg text-[#86A873] font-serif mt-4">
                        Your {insights.velocity.symptomName.toLowerCase()} improved by{' '}
                        <span className="font-bold">{Math.abs(insights.velocity.percentChange)}%</span> this week.
                      </p>
                    </>
                  ) : insights.velocity.direction === 'stable' ? (
                    <>
                      <Minus className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-3xl md:text-4xl font-serif text-[#4A4A4A] leading-relaxed mb-2">
                        You are maintaining a steady rhythm.
                      </h3>
                      <p className="text-lg text-slate-600 font-serif mt-4">
                        Your {insights.velocity.symptomName.toLowerCase()} remains stable this week.
                      </p>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-3xl md:text-4xl font-serif text-[#4A4A4A] leading-relaxed mb-2">
                        Your body is navigating change.
                      </h3>
                      <p className="text-lg text-slate-600 font-serif mt-4">
                        Your {insights.velocity.symptomName.toLowerCase()} shifted by{' '}
                        <span className="font-medium">{Math.abs(insights.velocity.percentChange)}%</span> this week.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-serif text-slate-600 italic">
                    Keep logging. We are listening for patterns.
                  </p>
                </div>
              )}
            </div>

            <div className="glass-card">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                  Holistic Balance
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  Current vs. 30-Day Baseline
                </p>
              </div>
              <WellnessRadar />
            </div>

            <div className="glass-card p-6">
              <div className="mb-6">
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
                        className="p-5 bg-[#FDFBF7] border border-sage-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-[#86A873]" />
                          </div>
                          <div className="flex-1">
                            {index === 0 && (
                              <div className="inline-block px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-medium rounded-full mb-2">
                                Your Strongest Lever
                              </div>
                            )}
                            <h4 className="text-base font-serif font-semibold text-[#4A4A4A] mb-2">
                              {factor.factor}
                            </h4>
                            <p className="text-sm text-slate-700 font-serif leading-relaxed">
                              Data shows that when you prioritize{' '}
                              <span className="font-semibold text-[#86A873]">{factor.factor}</span>, your overall wellness lifts by{' '}
                              <span className="font-bold text-[#86A873]">{factor.impact}%</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-serif italic">
                    Keep logging. We are listening for patterns.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
