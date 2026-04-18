import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { getLastNDays } from '../lib/db';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { format, subDays } from 'date-fns';

interface Prompt {
  id: string;
  message: string;
}

function getTodayKey(promptId: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  return `prompt_shown_${promptId}_${today}`;
}

function wasShownToday(promptId: string): boolean {
  return !!localStorage.getItem(getTodayKey(promptId));
}

function markShownToday(promptId: string): void {
  localStorage.setItem(getTodayKey(promptId), '1');
}

async function evaluatePrompts(): Promise<Prompt | null> {
  const logs = await getLastNDays(10);
  const scoreResult = await calculateBlossomScore();

  if (logs.length === 0) return null;

  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const symptomValues = Object.values(latestLog.symptoms).filter((v): v is number => typeof v === 'number');
  const avgSymptom = symptomValues.length > 0
    ? symptomValues.reduce((a, b) => a + b, 0) / symptomValues.length
    : 0;
  if (avgSymptom > 3.5 && !wasShownToday('heavy_symptoms')) {
    return { id: 'heavy_symptoms', message: "I see your symptoms are heavy today. Please be exceptionally gentle with yourself." };
  }

  if (logs.length >= 2) {
    const older = await getLastNDays(14);
    const olderSorted = [...older].sort((a, b) => a.date.localeCompare(b.date));
    if (olderSorted.length >= 4) {
      const midpoint = Math.floor(olderSorted.length / 2);
      const prevLogs = olderSorted.slice(0, midpoint);
      const recentLogs = olderSorted.slice(midpoint);

      const avgScore = (logSet: typeof olderSorted) => {
        const vals = logSet.flatMap(l => Object.values(l.symptoms).filter((v): v is number => typeof v === 'number'));
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      };

      const prevAvg = avgScore(prevLogs);
      const recentAvg = avgScore(recentLogs);
      if (prevAvg > 0 && (recentAvg - prevAvg) / prevAvg > 0.15 && !wasShownToday('score_drop')) {
        return { id: 'score_drop', message: "Your wellness score dipped recently. Remember, resting is a productive action." };
      }
    }
  }

  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  const recentDates = logs.map(l => l.date);
  const hasRecentLog = recentDates.some(d => d >= threeDaysAgo);
  if (!hasRecentLog && logs.length > 0 && !wasShownToday('no_log')) {
    return { id: 'no_log', message: "It's been a few days. Whenever you're ready, I'm here." };
  }

  const prevSeasonKey = 'prev_companion_season';
  const prevSeason = localStorage.getItem(prevSeasonKey);
  if (scoreResult.score >= 70 && prevSeason !== 'blooming' && !wasShownToday('first_blooming')) {
    localStorage.setItem(prevSeasonKey, 'blooming');
    return { id: 'first_blooming', message: "You've reached a Blooming season! Take a moment to celebrate your consistency." };
  } else if (scoreResult.score < 70 && prevSeason === 'blooming') {
    localStorage.removeItem(prevSeasonKey);
  }

  if (logs.length >= 7) {
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const streakLogs = logs.filter(l => l.date >= sevenDaysAgo);
    if (streakLogs.length >= 7 && !wasShownToday('seven_day_streak')) {
      return { id: 'seven_day_streak', message: "7 days of showing up for yourself. You are building beautiful habits." };
    }
  }

  return null;
}

export function ContextualPrompts() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    evaluatePrompts().then(p => {
      if (p) {
        setPrompt(p);
        setVisible(true);
      }
    });
  }, []);

  const dismiss = () => {
    if (prompt) markShownToday(prompt.id);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && prompt && (
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-sm text-rose-800 leading-relaxed flex-1 font-medium italic">
              {prompt.message}
            </p>
            <button
              onClick={dismiss}
              className="text-rose-300 hover:text-rose-500 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
