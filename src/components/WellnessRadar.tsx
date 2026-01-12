import { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { db, LogEntry } from '../lib/db';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function WellnessRadar() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const logs = await db.logs.orderBy('date').reverse().limit(7).toArray();

      if (logs.length === 0) {
        return;
      }

      const latest = logs[0];

      const stressToNumber = (stress?: string) => {
        if (!stress) return 5;
        if (stress === 'low') return 3;
        if (stress === 'medium') return 5;
        if (stress === 'high') return 8;
        return 5;
      };

      const sleepToNumber = (sleep?: string) => {
        if (!sleep) return 7;
        if (sleep === '<6h') return 5;
        if (sleep === '6-7h') return 6.5;
        if (sleep === '7-8h') return 7.5;
        if (sleep === '>8h') return 8.5;
        return 7;
      };

      const bodyImageToNumber = (bodyImage?: string) => {
        if (!bodyImage) return 5;
        if (bodyImage === 'positive') return 8;
        if (bodyImage === 'neutral') return 5;
        if (bodyImage === 'negative') return 2;
        return 5;
      };

      const currentValues = [
        10 - stressToNumber(latest.psych.stress),
        sleepToNumber(latest.lifestyle.sleep) * 1.4,
        10 - (latest.symptoms.acne || 5),
        bodyImageToNumber(latest.psych.bodyImage),
        (latest.psych.mood || 5)
      ];

      const baselineValues = [5, 7, 5, 5, 5];

      setChartData({
        labels: ['Calm', 'Rest', 'Skin', 'Body Image', 'Mood'],
        datasets: [
          {
            label: 'Current',
            data: currentValues,
            backgroundColor: 'rgba(45, 212, 191, 0.2)',
            borderColor: 'rgba(45, 212, 191, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(45, 212, 191, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(45, 212, 191, 1)'
          },
          {
            label: 'Baseline',
            data: baselineValues,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointBackgroundColor: 'rgba(255, 255, 255, 0.3)',
            pointBorderColor: 'rgba(255, 255, 255, 0.3)',
            pointRadius: 2
          }
        ]
      });
    };

    loadData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          display: false,
          stepSize: 2
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
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
        padding: 12,
        displayColors: false
      }
    }
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <Radar data={chartData} options={options} />
    </div>
  );
}
