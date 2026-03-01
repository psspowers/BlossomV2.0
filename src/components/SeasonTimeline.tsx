import { motion } from 'framer-motion';
import { SeasonState, SeasonType } from '../lib/logic/seasons';
import { Leaf, Snowflake, Sun } from 'lucide-react';
import clsx from 'clsx';

interface SeasonTimelineProps {
  season: SeasonState;
  score: number;
}

export function SeasonTimeline({ season, score }: SeasonTimelineProps) {
  const steps: { id: SeasonType; label: string; icon: typeof Snowflake; color: string }[] = [
    { id: 'resting', label: 'Resting', icon: Snowflake, color: 'text-stone-400' },
    { id: 'growing', label: 'Growing', icon: Leaf, color: 'text-emerald-500' },
    { id: 'blooming', label: 'Blooming', icon: Sun, color: 'text-rose-500' },
  ];

  const narratives: Record<SeasonType, string> = {
    resting: "Energy is low, but roots are deepening. This is necessary work.",
    growing: "Consistency is building. You are nurturing your foundation.",
    blooming: "Vibrant energy. A time to connect, create, and move."
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-stone-100 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{season.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-widest">
            Season of {season.currentSeason}
          </h3>
          <p className="text-xs text-stone-500 font-serif italic">
            "{season.message}"
          </p>
        </div>
      </div>

      <div className="relative h-2 bg-stone-100 rounded-full mt-6 mb-8 mx-4">
        <div className="absolute inset-0 flex justify-between items-center -mt-1.5">
          {steps.map((step) => {
            const isActive = step.id === season.currentSeason;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative flex flex-col items-center group">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isActive ? 'white' : '#e7e5e4'
                  }}
                  className={clsx(
                    "w-4 h-4 rounded-full border-2 z-10 transition-colors",
                    isActive ? "border-current" : "border-stone-200",
                    step.color
                  )}
                />

                <span className={clsx(
                  "absolute top-6 text-[10px] font-medium uppercase tracking-wider transition-colors whitespace-nowrap",
                  isActive ? "text-stone-800" : "text-stone-300"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-xs text-stone-600 leading-relaxed text-center">
        {narratives[season.currentSeason]}
      </div>
    </div>
  );
}
