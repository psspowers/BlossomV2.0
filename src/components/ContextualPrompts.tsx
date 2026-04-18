import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getLastNDays } from '../lib/db';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { format, subDays } from 'date-fns';

interface ContextualPromptsProps {
  onOpenChat?: () => void;
  highSymptomTriggered?: boolean;
  onHighSymptomConsumed?: () => void;
}

interface PromptAction {
  label: string;
  variant: 'primary' | 'secondary';
  opensChat?: boolean;
}

interface Prompt {
  id: string;
  message: string;
  actions: PromptAction[];
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

  if (logs.length >= 2) {
    const older = await getLastNDays(14);
    const olderSorted = [...older].sort((a, b) => a.date.localeCompare(b.date));
    if (olderSorted.length >= 4 && !wasShownToday('score_drop')) {
      const midpoint = Math.floor(olderSorted.length / 2);
      const prevLogs = olderSorted.slice(0, midpoint);
      const recentLogs = olderSorted.slice(midpoint);

      const avgScore = (logSet: typeof olderSorted) => {
        const vals = logSet.flatMap((l) =>
          Object.values(l.symptoms).filter((v): v is number => typeof v === 'number')
        );
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      };

      const prevAvg = avgScore(prevLogs);
      const recentAvg = avgScore(recentLogs);
      if (prevAvg > 0 && (recentAvg - prevAvg) / prevAvg > 0.15) {
        return {
          id: 'score_drop',
          message: "Your body's been working hard this week 💛 Your companion has some gentle ideas.",
          actions: [
            { label: 'Open Blossom Support', variant: 'primary', opensChat: true },
            { label: "I'm okay", variant: 'secondary' },
          ],
        };
      }
    }
  }

  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  const recentDates = logs.map((l) => l.date);
  const hasRecentLog = recentDates.some((d) => d >= threeDaysAgo);
  if (!hasRecentLog && logs.length > 0 && !wasShownToday('no_log')) {
    return {
      id: 'no_log',
      message: "We missed you 🌿 No pressure — just here when you're ready.",
      actions: [
        { label: 'Chat with Blossom', variant: 'primary', opensChat: true },
        { label: 'Maybe later', variant: 'secondary' },
      ],
    };
  }

  const prevSeasonKey = 'prev_companion_season';
  const prevSeason = localStorage.getItem(prevSeasonKey);
  const bloomingCelebratedKey = 'blossom_blooming_celebrated';
  if (
    scoreResult.score >= 70 &&
    prevSeason !== 'blooming' &&
    !localStorage.getItem(bloomingCelebratedKey) &&
    !wasShownToday('first_blooming')
  ) {
    localStorage.setItem(prevSeasonKey, 'blooming');
    localStorage.setItem(bloomingCelebratedKey, '1');
    return {
      id: 'first_blooming',
      message: "You're blooming! 🌸 Your consistency is showing up beautifully.",
      actions: [
        { label: 'Tell Blossom!', variant: 'primary', opensChat: true },
        { label: 'Keep going 💛', variant: 'secondary' },
      ],
    };
  } else if (scoreResult.score < 70 && prevSeason === 'blooming') {
    localStorage.removeItem(prevSeasonKey);
  }

  if (logs.length >= 7) {
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const streakLogs = logs.filter((l) => l.date >= sevenDaysAgo);
    const streakCelebratedKey = 'blossom_streak_7_celebrated';
    if (streakLogs.length >= 7 && !localStorage.getItem(streakCelebratedKey) && !wasShownToday('seven_day_streak')) {
      localStorage.setItem(streakCelebratedKey, '1');
      return {
        id: 'seven_day_streak',
        message: "Seven days of showing up for yourself 💛 That's real self-care.",
        actions: [
          { label: 'Chat with Blossom', variant: 'primary', opensChat: true },
          { label: 'Keep going 🌿', variant: 'secondary' },
        ],
      };
    }
  }

  const latestLog = sortedLogs[sortedLogs.length - 1];
  if (latestLog && !wasShownToday('heavy_symptoms')) {
    const symptomValues = Object.values(latestLog.symptoms).filter(
      (v): v is number => typeof v === 'number'
    );
    const avgSymptom =
      symptomValues.length > 0 ? symptomValues.reduce((a, b) => a + b, 0) / symptomValues.length : 0;
    if (avgSymptom > 3.5) {
      return {
        id: 'heavy_symptoms',
        message: "That sounds hard. Blossom Support is here if you want to talk 🌸",
        actions: [
          { label: 'Chat with Blossom', variant: 'primary', opensChat: true },
          { label: "I'm okay, thanks", variant: 'secondary' },
        ],
      };
    }
  }

  return null;
}

export function ContextualPrompts({
  onOpenChat,
  highSymptomTriggered,
  onHighSymptomConsumed,
}: ContextualPromptsProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = (p?: Prompt) => {
    const target = p ?? prompt;
    if (target) markShownToday(target.id);
    setVisible(false);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    evaluatePrompts().then((p) => {
      if (p) {
        setPrompt(p);
        setVisible(true);
        timer = setTimeout(() => dismiss(p), 10000);
      }
    });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!highSymptomTriggered) return;

    const p: Prompt = {
      id: 'high_symptom_post_log',
      message: "That sounds hard. Blossom Support is here if you want to talk 🌸",
      actions: [
        { label: 'Chat with Blossom', variant: 'primary', opensChat: true },
        { label: "I'm okay, thanks", variant: 'secondary' },
      ],
    };
    setPrompt(p);
    setVisible(true);
    onHighSymptomConsumed?.();

    const timer = setTimeout(() => dismiss(p), 10000);
    return () => clearTimeout(timer);
  }, [highSymptomTriggered]);

  const handleAction = (action: PromptAction) => {
    if (action.opensChat) onOpenChat?.();
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && prompt && (
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mb-6"
        >
          <div
            className="rounded-2xl px-5 py-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(253,242,248,1), rgba(252,231,243,1))',
              border: '1px solid rgba(236,72,153,0.15)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">🌸</span>
              <p
                className="text-sm leading-relaxed flex-1 font-medium"
                style={{ color: 'rgb(157,23,77)' }}
              >
                {prompt.message}
              </p>
              <button
                onClick={() => dismiss()}
                className="flex-shrink-0 mt-0.5 transition-colors"
                style={{ color: 'rgba(236,72,153,0.5)' }}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3 ml-8">
              {prompt.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    action.variant === 'primary'
                      ? { background: 'rgb(236,72,153)', color: 'white' }
                      : {
                          background: 'transparent',
                          color: 'rgb(157,23,77)',
                          border: '1px solid rgba(236,72,153,0.3)',
                        }
                  }
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
