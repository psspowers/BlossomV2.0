import { Activity, Zap, Sparkles, Droplet, Video as LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type InsightView = 'physical' | 'emotional' | 'metabolic' | 'cycle';

interface ViewConfig {
  label: string;
  icon: LucideIcon;
  activeClass: string;
  inactiveClass: string;
  color: string;
  borderColor: string;
  glowClass: string;
}

export const viewConfig: Record<InsightView, ViewConfig> = {
  physical: {
    label: 'Physical',
    icon: Activity,
    activeClass: 'bg-rose-100 text-rose-600 shadow-inner',
    inactiveClass: 'text-stone-400 hover:text-rose-400 hover:bg-white',
    color: 'rgba(232, 174, 178, 0.8)',
    borderColor: 'rgb(232, 174, 178)',
    glowClass: 'bg-rose-500/10'
  },
  metabolic: {
    label: 'Metabolic',
    icon: Zap,
    activeClass: 'bg-amber-100 text-amber-600 shadow-inner',
    inactiveClass: 'text-stone-400 hover:text-amber-400 hover:bg-white',
    color: 'rgba(134, 168, 115, 0.8)',
    borderColor: 'rgb(134, 168, 115)',
    glowClass: 'bg-amber-500/10'
  },
  emotional: {
    label: 'Emotional',
    icon: Sparkles,
    activeClass: 'bg-emerald-100 text-emerald-600 shadow-inner',
    inactiveClass: 'text-stone-400 hover:text-emerald-400 hover:bg-white',
    color: 'rgba(107, 143, 78, 0.8)',
    borderColor: 'rgb(107, 143, 78)',
    glowClass: 'bg-emerald-500/10'
  },
  cycle: {
    label: 'Cycle',
    icon: Droplet,
    activeClass: 'bg-violet-100 text-violet-600 shadow-inner',
    inactiveClass: 'text-stone-400 hover:text-violet-400 hover:bg-white',
    color: 'rgba(197, 179, 223, 0.8)',
    borderColor: 'rgb(197, 179, 223)',
    glowClass: 'bg-violet-500/10'
  }
};

interface InsightsNavigationProps {
  view: InsightView;
  onViewChange: (view: InsightView) => void;
}

export function InsightsNavigation({ view, onViewChange }: InsightsNavigationProps) {
  const views: InsightView[] = ['physical', 'metabolic', 'emotional', 'cycle'];

  const handleClick = (viewKey: InsightView, e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    onViewChange(viewKey);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center p-1.5 gap-1 bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-full shadow-sm">
        {views.map((viewKey) => {
          const config = viewConfig[viewKey];
          const Icon = config.icon;
          const isActive = view === viewKey;

          return (
            <button
              key={viewKey}
              onClick={(e) => handleClick(viewKey, e)}
              className={`
                relative flex flex-col items-center justify-center w-16 h-12 rounded-full gap-0.5
                transition-all duration-300 ease-out focus:outline-none
                ${isActive
                  ? `${config.activeClass} scale-105`
                  : `${config.inactiveClass} hover:shadow-sm`}
              `}
              aria-label={config.label}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-transform duration-200"
              />
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="text-[9px] font-semibold tracking-wide leading-none"
                  >
                    {config.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
