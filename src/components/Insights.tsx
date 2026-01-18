import { useState } from 'react';
import { useCategoryInsights, InsightCategory } from '../lib/hooks/useInsights';
import { Line, Radar, Bar } from 'react-chartjs-2';
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
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Heart } from 'lucide-react';

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
  const [category, setCategory] = useState<InsightCategory>('hyperandrogenism');
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { insights, loading, filterByMetric, resetToComposite } = useCategoryInsights(category, timeframe);

  const handleMetricClick = async (metric: string, label: string) => {
    setSelectedMetric(metric);
    await filterByMetric(metric, label);
  };

  const handleResetFilter = async () => {
    setSelectedMetric(null);
    await resetToComposite();
  };

  const handleCategoryChange = (newCategory: InsightCategory) => {
    setCategory(newCategory);
    setSelectedMetric(null);
  };

  const categoryConfig = {
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
    }
  };

  const currentConfig = categoryConfig[category as keyof typeof categoryConfig];

  const maxDataPoints = Math.max(insights.trendData.length, insights.baselineTrendData.length);
  const trendLabels = insights.trendData.map((d, i) => {
    if (insights.trendData.length <= 10) {
      return new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return `Day ${i + 1}`;
  });

  const currentData = insights.trendData.map(d => d.value);
  const baselineData = insights.baselineTrendData.map(d => d.value);

  const paddedBaselineData = [...Array(maxDataPoints - baselineData.length).fill(null), ...baselineData];

  const calculateVelocityIntensity = () => {
    if (!insights.velocity || insights.velocity.direction === 'stable') return 0.3;
    const absChange = Math.abs(insights.velocity.percentChange);
    if (absChange < 10) return 0.3;
    if (absChange < 20) return 0.45;
    if (absChange < 30) return 0.6;
    return 0.75;
  };

  const velocityIntensity = calculateVelocityIntensity();

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Current Period',
        data: currentData,
        fill: true,
        borderColor: currentConfig.borderColor,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, `${currentConfig.color.replace('0.8', String(velocityIntensity))}`);
          gradient.addColorStop(1, 'rgba(253, 251, 247, 0)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: currentConfig.borderColor,
        pointBorderWidth: 2,
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        order: 1
      },
      {
        label: 'Previous Period',
        data: paddedBaselineData,
        fill: false,
        borderColor: 'rgb(197, 206, 186)',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(148, 163, 184)',
        pointBorderWidth: 1,
        pointBorderColor: 'rgba(15, 23, 42, 1)',
        order: 2
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(74, 74, 74, 0.8)',
          padding: 12,
          font: { size: 11 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#4A4A4A',
        bodyColor: '#4A4A4A',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: 'rgba(74, 74, 74, 0.6)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(74, 74, 74, 0.6)', maxRotation: 45 }
      }
    }
  };

  const radarData = {
    labels: insights.radarLabels,
    datasets: [
      {
        label: 'Current',
        data: insights.radarCurrent.data,
        backgroundColor: currentConfig.bgColor,
        borderColor: currentConfig.borderColor,
        borderWidth: 2,
        pointBackgroundColor: currentConfig.borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: currentConfig.borderColor
      },
      {
        label: 'Baseline (Ghost)',
        data: insights.radarBaseline.data,
        backgroundColor: 'rgba(134, 168, 115, 0.05)',
        borderColor: 'rgba(134, 168, 115, 0.3)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(255, 255, 255, 0.3)',
        pointBorderColor: 'rgba(255, 255, 255, 0.3)',
        pointRadius: 2
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any, chart: any) => {
      const points = chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: false }, false);
      if (points.length > 0) {
        const index = points[0].index;
        const metric = insights.radarMetrics[index];
        const label = insights.radarLabels[index];
        if (metric && label) {
          handleMetricClick(metric, label);
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(74, 74, 74, 0.8)',
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#4A4A4A',
        bodyColor: '#4A4A4A',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          footer: () => 'Click to filter factors'
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        grid: { color: 'rgba(0, 0, 0, 0.08)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
        pointLabels: {
          color: (context: any) => {
            const metric = insights.radarMetrics[context.index];
            return selectedMetric === metric ? currentConfig.borderColor : 'rgba(74, 74, 74, 0.8)';
          },
          font: (context: any) => {
            const metric = insights.radarMetrics[context.index];
            return {
              size: 13,
              weight: selectedMetric === metric ? 'bold' : 'normal',
              family: 'Inter, system-ui, sans-serif'
            };
          }
        },
        ticks: {
          display: false,
          stepSize: 2
        }
      }
    }
  };

  const barData = {
    labels: insights.factorImpacts.map(f => `${f.factor}`),
    datasets: [
      {
        label: 'Impact %',
        data: insights.factorImpacts.map(f => Math.abs(f.impact)),
        backgroundColor: insights.factorImpacts.map(f =>
          f.impact > 0 ? currentConfig.color : 'rgba(244, 63, 94, 0.8)'
        ),
        borderColor: insights.factorImpacts.map(f =>
          f.impact > 0 ? currentConfig.borderColor : 'rgb(244, 63, 94)'
        ),
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    indexAxis: 'y' as const,
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
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const impact = insights.factorImpacts[context.dataIndex];
            const direction = impact.impact > 0 ? 'Improves' : 'Worsens';
            return `${direction} ${impact.targetSymptomLabel} by ${Math.abs(impact.impact)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: 'rgba(74, 74, 74, 0.6)',
          callback: (value: any) => `${value}%`
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: 'rgba(74, 74, 74, 0.8)' }
      }
    }
  };

  const VelocityBadge = () => {
    if (!insights.velocity) return null;

    const { direction, value, symptomName, percentChange, polarity } = insights.velocity;
    const colors = {
      improving: currentConfig.badgeBgClass,
      worsening: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      stable: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };

    const isIncreasing = percentChange > 0;
    const Icon = direction === 'improving' ? TrendingUp : direction === 'worsening' ? TrendingDown : Minus;
    const arrow = isIncreasing ? '↑' : percentChange < 0 ? '↓' : '—';

    let displayText = '';
    if (direction === 'stable') {
      displayText = `${symptomName} — Stable`;
    } else {
      const sign = percentChange > 0 ? '+' : '';
      displayText = `${symptomName} ${arrow} ${sign}${Math.abs(percentChange)}%`;
    }

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${colors[direction]}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{displayText}</span>
      </div>
    );
  };

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

      <div className="flex gap-2 mb-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = category === key;
          return (
            <button
              key={key}
              onClick={() => handleCategoryChange(key as InsightCategory)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? `bg-white ${config.textClass} border-b-2 ${config.borderClass} ${config.shadowClass} border-t border-x border-slate-200`
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div
          className={`absolute inset-0 -inset-x-12 -inset-y-12 ${currentConfig.glowClass} blur-[100px] rounded-full transition-all duration-700 pointer-events-none opacity-50`}
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="mb-3">
            <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
              Holistic Balance
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Current vs Baseline comparison
              <span className="text-sage-600 ml-1">• Click labels to filter</span>
            </p>
          </div>
          <div className="relative" style={{ height: '300px' }}>
            <Radar data={radarData} options={radarOptions} />
            {insights.spokeVelocities.map((spoke, index) => {
              if (spoke.direction === 'stable') return null;
              const totalSpokes = insights.spokeVelocities.length;
              const angle = (index * 360) / totalSpokes - 90;
              const radians = (angle * Math.PI) / 180;
              const radius = spoke.direction === 'improving' ? 85 : 115;
              const x = 50 + radius * Math.cos(radians) * 0.85;
              const y = 50 + radius * Math.sin(radians) * 0.85;
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {spoke.direction === 'improving' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center">
                      <span className="text-emerald-300 text-xs">↓</span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-rose-500/30 border border-rose-400 flex items-center justify-center">
                      <span className="text-rose-300 text-xs">↑</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                  {insights.targetSymptomLabel ? `Factors Affecting ${insights.targetSymptomLabel}` : 'Factor Analysis'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedMetric
                    ? `How lifestyle choices impact ${insights.targetSymptomLabel.toLowerCase()}`
                    : `How lifestyle choices impact overall ${insights.targetSymptomLabel.toLowerCase()}`}
                </p>
              </div>
              {selectedMetric && (
                <button
                  onClick={handleResetFilter}
                  className="text-xs px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition-all"
                >
                  Show All
                </button>
              )}
            </div>
            {selectedMetric && (
              <div className="mt-2 px-2 py-1 bg-sage-100 border border-sage-200 rounded-lg inline-block">
                <span className="text-xs text-sage-700 font-medium">
                  Filtered by: {insights.targetSymptomLabel}
                </span>
              </div>
            )}
          </div>
          {insights.factorImpacts.length > 0 ? (
            <>
              <div style={{ height: '260px' }}>
                <Bar data={barData} options={barOptions} />
              </div>
              {insights.fastestPositiveFactor && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-sage-700 font-medium">
                    Fastest positive shift: <span className="text-slate-800">{insights.fastestPositiveFactor.factor}</span> linked to <span className="text-sage-600">{insights.fastestPositiveFactor.impact}%</span> improvement
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-slate-600 text-sm">Not enough data for correlations</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
