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
import { LogEntry } from '../lib/db';
import { dbAdapter as db } from '../lib/dbAdapter';
import { analyzeCycleState } from '../lib/logic/cycle';
import {
  normalizeSymptom,
  normalizeSleep,
  normalizeDiet,
  normalizeMood,
  normalizeStress,
  normalizeAnxiety,
  normalizeExercise,
  normalizeWater
} from '../lib/logic/conversions';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function calculateAverage(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 5;
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

      const physicalScore = calculateAverage([
        latest.symptoms.cramps !== undefined ? normalizeSymptom(latest.symptoms.cramps) : undefined,
        latest.symptoms.acne !== undefined ? normalizeSymptom(latest.symptoms.acne) : undefined,
        latest.symptoms.bloat !== undefined ? normalizeSymptom(latest.symptoms.bloat) : undefined,
        latest.symptoms.hirsutism !== undefined ? normalizeSymptom(latest.symptoms.hirsutism) : undefined
      ]);

      const energyValue = latest.customValues?.['energy'];
      const metabolicScore = calculateAverage([
        energyValue,
        normalizeSleep(latest.lifestyle.sleep),
        normalizeDiet(latest.lifestyle.diet)
      ]);

      const emotionalScore = calculateAverage([
        latest.psych.mood !== undefined ? normalizeMood(latest.psych.mood) : undefined,
        normalizeStress(latest.psych.stress),
        normalizeAnxiety(latest.psych.anxiety)
      ]);

      const cycleScore = cycleState.stabilityScore / 10;

      const lifestyleScore = calculateAverage([
        normalizeExercise(latest.lifestyle.exercise),
        latest.lifestyle.waterIntake !== undefined ? normalizeWater(latest.lifestyle.waterIntake) : undefined
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
      padding: {
        top: 30,
        bottom: 20,
        left: 20,
        right: 20
      }
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
    <div className="flex items-center justify-center h-[calc(100%-56px)] px-4 py-2">
      <div className="w-full h-full max-h-[280px]">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}
