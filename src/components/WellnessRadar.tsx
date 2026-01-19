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
        if (stress === 'low') return 1;
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
        if (bodyImage === 'positive') return 9;
        if (bodyImage === 'neutral') return 6;
        if (bodyImage === 'negative') return 3;
        return 5;
      };

      const skinScore = () => {
        const acne = latest.symptoms.acne || 5;
        const hirsutism = latest.symptoms.hirsutism || 5;
        const averageSymptom = (acne + hirsutism) / 2;
        return 10 - averageSymptom;
      };

      const currentValues = [
        10 - stressToNumber(latest.psych.stress),
        sleepToNumber(latest.lifestyle.sleep) * 1.4,
        skinScore(),
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
            backgroundColor: 'rgba(134, 168, 115, 0.2)',
            borderColor: '#86A873',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: '#86A873',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#86A873'
          },
          {
            label: 'Baseline',
            data: baselineValues,
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
      });
    };

    loadData();
  }, []);

  const options = {
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
        displayColors: false
      }
    }
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-[350px] p-6">
      <Radar data={chartData} options={options} />
    </div>
  );
}
