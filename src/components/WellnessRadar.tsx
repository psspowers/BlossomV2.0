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
import { analyzeCycleState } from '../lib/logic/cycle';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Helper functions to convert string values to 0-10 scale
function stressToNumber(stress?: string): number {
  if (!stress) return 5;
  if (stress === 'low') return 2;
  if (stress === 'medium') return 5;
  if (stress === 'high') return 8;
  return 5;
}

function anxietyToNumber(anxiety?: string): number {
  if (!anxiety) return 5;
  if (anxiety === 'low') return 2;
  if (anxiety === 'medium') return 5;
  if (anxiety === 'high') return 8;
  return 5;
}

function sleepToNumber(sleep?: string): number {
  if (!sleep) return 7;
  if (sleep === '<6h') return 4;
  if (sleep === '6-7h') return 6;
  if (sleep === '7-8h') return 8;
  if (sleep === '>8h') return 9;
  return 7;
}

function dietToNumber(diet?: string): number {
  if (!diet) return 5;
  if (diet === 'poor') return 3;
  if (diet === 'okay') return 5;
  if (diet === 'good') return 7;
  if (diet === 'excellent') return 9;
  return 5;
}

function exerciseToNumber(exercise?: string): number {
  if (!exercise) return 5;
  if (exercise === 'none') return 2;
  if (exercise === 'light') return 5;
  if (exercise === 'moderate') return 7;
  if (exercise === 'intense') return 9;
  return 5;
}

// Calculate average from array of numbers, ignoring undefined/null values
function calculateAverage(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 5; // Default to midpoint if no valid values
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

export function WellnessRadar() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const logs = await db.logs.orderBy('date').reverse().limit(90).toArray();

      if (logs.length === 0) {
        return;
      }

      const latest = logs[0];
      const cycleState = analyzeCycleState(logs);

      // 1. Physical: Average of (10 - cramps), (10 - acne), (10 - bloat), (10 - hirsutism)
      const physicalScore = calculateAverage([
        latest.symptoms.cramps !== undefined ? 10 - latest.symptoms.cramps : undefined,
        latest.symptoms.acne !== undefined ? 10 - latest.symptoms.acne : undefined,
        latest.symptoms.bloat !== undefined ? 10 - latest.symptoms.bloat : undefined,
        latest.symptoms.hirsutism !== undefined ? 10 - latest.symptoms.hirsutism : undefined
      ]);

      // 2. Metabolic: Average of energy (customVal), sleep (converted), diet (converted)
      const energyValue = latest.customValues?.['energy'];
      const metabolicScore = calculateAverage([
        energyValue,
        sleepToNumber(latest.lifestyle.sleep),
        dietToNumber(latest.lifestyle.diet)
      ]);

      // 3. Emotional: Average of (mood / 10), (10 - stress), (10 - anxiety)
      const emotionalScore = calculateAverage([
        latest.psych.mood !== undefined ? latest.psych.mood / 10 : undefined,
        10 - stressToNumber(latest.psych.stress),
        10 - anxietyToNumber(latest.psych.anxiety)
      ]);

      // 4. Cycle: Use stabilityScore / 10
      const cycleScore = cycleState.stabilityScore / 10;

      // 5. Lifestyle: Average of exercise (converted), waterIntake
      const lifestyleScore = calculateAverage([
        exerciseToNumber(latest.lifestyle.exercise),
        latest.lifestyle.waterIntake
      ]);

      const currentValues = [
        physicalScore,
        metabolicScore,
        emotionalScore,
        cycleScore,
        lifestyleScore
      ];

      const baselineValues = [5, 5, 5, 5, 5];

      setChartData({
        labels: ['Physical', 'Metabolic', 'Emotional', 'Cycle', 'Lifestyle'],
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
