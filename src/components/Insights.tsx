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
import { TrendingDown, Minus, Leaf, Sparkles } from 'lucide-react';
import { analyzeHistory, CycleAnalysis } from '../lib/logic/cycle';
import { db } from '../lib/db';

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

  const currentConfig = viewConfig[view];

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

      <InsightsNavigation view={view} onViewChange={setView} />

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
                              if (days >= 21 && days <= 35) return 'rgba(134, 168, 115, 0.8)'; // #86A873 Sage Green
                              if (days > 35) return 'rgba(167, 199, 231, 0.8)'; // #A7C7E7 Soft Blue
                              return 'rgba(232, 174, 178, 0.8)'; // #E8AEB2 Rose
                            }),
                            borderColor: cycleAnalysis.cycleHistory.slice(-6).map(c => {
                              const days = c.daysFromPrevious || 0;
                              if (days >= 21 && days <= 35) return 'rgb(134, 168, 115)'; // #86A873
                              if (days > 35) return 'rgb(167, 199, 231)'; // #A7C7E7
                              return 'rgb(232, 174, 178)'; // #E8AEB2
                            }),
                            borderWidth: 2,
                            borderRadius: 6
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                          padding: 20
                        },
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
                            .filter((d): d is number => d !== undefined);
                          if (cycleLengths.length === 0) return 0;
                          return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
                        })()}
                        <span className="text-lg text-slate-500 ml-1">days</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stability Index</div>
                      <div className="text-3xl font-serif font-bold text-slate-800">
                        ±{Math.round(cycleAnalysis.variability)}
                        <span className="text-lg text-slate-500 ml-1">days</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Status</div>
                      <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                        cycleAnalysis.variability <= 5
                          ? 'bg-sage-100 text-sage-700 border border-sage-200'
                          : cycleAnalysis.variability <= 10
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {cycleAnalysis.variability <= 5 ? 'Stable' : cycleAnalysis.variability <= 10 ? 'Dynamic' : 'Irregular'}
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
                  {currentConfig.label} Deep Dive
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  Current vs. Baseline - Granular Analysis
                </p>
              </div>
              <div className="h-[350px] p-6">
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
                      layout: {
                        padding: 20
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 10,
                          ticks: {
                            display: false,
                            stepSize: 2
                          },
                          grid: {
                            display: false
                          },
                          angleLines: {
                            display: false
                          },
                          pointLabels: {
                            color: 'rgba(74, 74, 74, 0.8)',
                            font: {
                              size: 11,
                              family: 'Georgia, serif'
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          titleColor: '#4A4A4A',
                          bodyColor: '#64748b',
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          borderWidth: 1,
                          padding: 12,
                          displayColors: false,
                          callbacks: {
                            label: function(context: any) {
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
