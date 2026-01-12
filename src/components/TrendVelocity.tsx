import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { db } from '../lib/db';
import { getVelocity } from '../lib/logic/velocity';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function TrendVelocity() {
  const [chartData, setChartData] = useState<any>(null);
  const [velocity, setVelocity] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const logs = await db.logs.orderBy('date').toArray();

      if (logs.length < 2) {
        return;
      }

      const last30 = logs.slice(-30);

      const stressToNumber = (stress?: string) => {
        if (!stress) return 5;
        if (stress === 'low') return 3;
        if (stress === 'medium') return 5;
        if (stress === 'high') return 8;
        return 5;
      };

      const anxietyToNumber = (anxiety?: string) => {
        if (!anxiety) return 5;
        if (anxiety === 'none') return 0;
        if (anxiety === 'low') return 3;
        if (anxiety === 'high') return 8;
        return 5;
      };

      const labels = last30.map(log => format(new Date(log.date), 'MMM d'));
      const stressData = last30.map(log => stressToNumber(log.psych.stress));
      const anxietyData = last30.map(log => anxietyToNumber(log.psych.anxiety));

      const velocityResult = await getVelocity('anxiety');
      setVelocity(velocityResult);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Stress',
            data: stressData,
            borderColor: 'rgba(148, 163, 184, 0.6)',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: 'Anxiety',
            data: anxietyData,
            borderColor: 'rgba(45, 212, 191, 1)',
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, 'rgba(45, 212, 191, 0.3)');
              gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
              return gradient;
            },
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4
          }
        ]
      });
    };

    loadData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxRotation: 0,
          maxTicksLimit: 6,
          font: {
            size: 10
          }
        },
        border: {
          display: false
        }
      },
      y: {
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          },
          stepSize: 2
        },
        border: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12
      }
    }
  };

  const getVelocityIcon = () => {
    if (!velocity) return <Minus className="w-4 h-4" />;
    if (velocity.direction === 'improving') return <ArrowDown className="w-4 h-4 text-teal-400" />;
    if (velocity.direction === 'worsening') return <ArrowUp className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getVelocityText = () => {
    if (!velocity) return 'Gathering insights...';
    const absChange = Math.abs(velocity.percentChange);
    if (velocity.direction === 'improving') {
      return `Anxiety ↓ ${absChange}%`;
    } else if (velocity.direction === 'worsening') {
      return `Anxiety ↑ ${absChange}%`;
    }
    return 'Anxiety — Stable';
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center gap-2">
        {getVelocityIcon()}
        <h3 className="text-sm font-medium text-white/90">
          {getVelocityText()}
        </h3>
      </div>
      <div className="flex-1 px-4 pb-4">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
