import { useMemo } from 'react';
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

interface WellnessRadarProps {
  logs: LogEntry[];
  hasLoggedToday: boolean;
  mostRecentLogDate: string | null;
}

function calculateAverage(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((sum, val) => sum + val, 0) / valid.length;
}

export function WellnessRadar({ logs, mostRecentLogDate }: WellnessRadarProps) {
  const today = new Date().toISOString().split('T')[0];

  const chartData = useMemo(() => {
    if (logs.length === 0) return null;

    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const cycleState = analyzeCycleState(logs);

    // Physical — only include dimensions the user actually logged
    const physicalScore = calculateAverage([
      latest.symptoms.cramps !== undefined ? normalizeSymptom(latest.symptoms.cramps) : null,
      latest.symptoms.acne !== undefined ? normalizeSymptom(latest.symptoms.acne) : null,
      latest.symptoms.bloat !== undefined ? normalizeSymptom(latest.symptoms.bloat) : null,
      latest.symptoms.hirsutism !== undefined ? normalizeSymptom(latest.symptoms.hirsutism) : null,
    ]);

    // Metabolic — pre-check each field before calling normalizer
    const energyValue = latest.customValues?.['energy'] ?? null;
    const sleepRaw = latest.lifestyle.sleep;
    const dietRaw = latest.lifestyle.diet;
    const metabolicScore = calculateAverage([
      energyValue,
      sleepRaw !== undefined ? normalizeSleep(sleepRaw) : null,
      dietRaw !== undefined ? normalizeDiet(dietRaw) : null,
    ]);

    // Emotional — pre-check each field
    const moodRaw = latest.psych.mood;
    const stressRaw = latest.psych.stress;
    const anxietyRaw = latest.psych.anxiety;
    const emotionalScore = calculateAverage([
      moodRaw !== undefined ? normalizeMood(moodRaw) : null,
      stressRaw !== undefined ? normalizeStress(stressRaw) : null,
      anxietyRaw !== undefined ? normalizeAnxiety(anxietyRaw) : null,
    ]);

    // Cycle — always available from history analysis
    const cycleScore = cycleState.stabilityScore / 10;

    // Lifestyle — pre-check each field
    const exerciseRaw = latest.lifestyle.exercise;
    const waterRaw = latest.lifestyle.waterIntake;
    const lifestyleScore = calculateAverage([
      exerciseRaw !== undefined ? normalizeExercise(exerciseRaw) : null,
      waterRaw !== undefined ? normalizeWater(waterRaw) : null,
    ]);

    const currentValues = [physicalScore, metabolicScore, emotionalScore, cycleScore, lifestyleScore];
    const baselineValues = [5, 5, 5, 5, 5];

    return {
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
          pointHoverBorderColor: '#86A873',
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
          pointRadius: 2,
        },
      ],
    };
  }, [logs]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 30, bottom: 20, left: 20, right: 20 },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { display: false, stepSize: 2 },
        grid: { display: false },
        angleLines: { display: false },
        pointLabels: {
          color: 'rgba(74, 74, 74, 0.8)',
          font: { size: 11, family: 'Georgia, serif' },
        },
      },
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
          label: function (context: any) {
            const value = context.parsed.r;
            if (value === null) return 'No data logged';
            return `${context.dataset.label}: ${value.toFixed(1)}/10`;
          },
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 py-8">
        No data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100%-56px)] px-4 py-2">
      <div className="flex-1 w-full max-h-[280px]">
        <Radar data={chartData} options={options as any} />
      </div>
      {mostRecentLogDate && mostRecentLogDate !== today && (
        <p className="text-[10px] text-stone-400 italic text-center mt-3">
          Based on your last log &bull;{' '}
          {new Date(mostRecentLogDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}
