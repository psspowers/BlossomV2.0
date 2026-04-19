import { motion } from 'framer-motion';
import { Flame, Leaf, Calendar, ArrowRight } from 'lucide-react';
import { SeasonState } from '../lib/logic/seasons';

interface TodayHeroProps {
  score: number;
  scoreDelta?: number;
  cycleDay?: number;
  season: SeasonState;
  streak: number;
  hasLoggedToday: boolean;
  onLogToday: () => void;
}

const seasonColors: Record<string, { bg: string; border: string; text: string }> = {
  resting: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
  growing: { bg: 'bg-sage-50', border: 'border-sage-200', text: 'text-sage-700' },
  blooming: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

export function TodayHero({
  score,
  scoreDelta = 0,
  cycleDay,
  season,
  streak,
  hasLoggedToday,
  onLogToday,
}: TodayHeroProps) {
  const seasonKey = season.currentSeason.toLowerCase();
  const colors = seasonColors[seasonKey] ?? seasonColors.resting;

  const nudge = !hasLoggedToday
    ? streak > 0
      ? `Log today to keep your ${streak}-day streak`
      : 'Log today to begin your rhythm'
    : streak > 0
      ? `You are on a ${streak}-day streak`
      : 'Today is logged. Rest easy.';

  const deltaLabel =
    scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta < 0 ? `${scoreDelta}` : '—';
  const deltaTone =
    scoreDelta > 0 ? 'text-sage-600' : scoreDelta < 0 ? 'text-rose-500' : 'text-slate-400';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 mb-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-sm overflow-hidden"
      aria-label="Today summary"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200">
        <div className="p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 mb-1">
            Today&apos;s Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-semibold text-slate-800 leading-none">
              {score}
            </span>
            <span className={`text-xs font-medium ${deltaTone}`}>{deltaLabel}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Cycle
          </div>
          <div className="text-3xl font-serif font-semibold text-slate-800 leading-none">
            {cycleDay ? `Day ${cycleDay}` : '—'}
          </div>
        </div>

        <div className={`p-5 ${colors.bg}`}>
          <div className={`text-[10px] font-medium uppercase tracking-[0.12em] ${colors.text} mb-1 flex items-center gap-1`}>
            <Leaf className="w-3 h-3" /> Season
          </div>
          <div className={`text-lg font-serif font-semibold ${colors.text} leading-snug capitalize`}>
            {season.currentSeason}
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Streak
          </div>
          <div className="text-3xl font-serif font-semibold text-slate-800 leading-none">
            {streak}
            <span className="text-xs font-sans font-medium text-slate-500 ml-1">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onLogToday}
        className={`w-full px-5 py-3 flex items-center justify-between text-left border-t ${colors.border} ${colors.bg} hover:brightness-95 transition-all`}
        aria-label={hasLoggedToday ? 'View today log' : 'Log today'}
      >
        <span className={`text-sm font-medium ${colors.text}`}>{nudge}</span>
        <ArrowRight className={`w-4 h-4 ${colors.text}`} />
      </button>
    </motion.section>
  );
}
