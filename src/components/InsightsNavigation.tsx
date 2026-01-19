import { Droplet, LucideIcon, Apple, Flower2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export type InsightView = 'physical' | 'emotional' | 'metabolic' | 'cycle';

interface ViewConfig {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  activeBgLight: string;
  activeBgDark: string;
  activeTextLight: string;
  activeTextDark: string;
  inactiveText: string;
  color: string;
  borderColor: string;
  glowClass: string;
}

export const viewConfig: Record<InsightView, ViewConfig> = {
  physical: {
    label: 'Physical & Movement',
    shortLabel: 'Physical',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    activeBgLight: 'bg-rose-100',
    activeBgDark: 'bg-rose-900/30',
    activeTextLight: 'text-rose-600',
    activeTextDark: 'text-rose-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(232, 174, 178, 0.8)',
    borderColor: 'rgb(232, 174, 178)',
    glowClass: 'bg-rose-500/10'
  },
  metabolic: {
    label: 'Metabolic & Fuel',
    shortLabel: 'Metabolic',
    icon: Apple,
    activeBgLight: 'bg-green-100',
    activeBgDark: 'bg-green-900/30',
    activeTextLight: 'text-green-600',
    activeTextDark: 'text-green-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(134, 168, 115, 0.8)',
    borderColor: 'rgb(134, 168, 115)',
    glowClass: 'bg-green-500/10'
  },
  emotional: {
    label: 'Emotional Well-being',
    shortLabel: 'Emotional',
    icon: Flower2,
    activeBgLight: 'bg-blue-100',
    activeBgDark: 'bg-blue-900/30',
    activeTextLight: 'text-blue-600',
    activeTextDark: 'text-blue-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(107, 143, 78, 0.8)',
    borderColor: 'rgb(107, 143, 78)',
    glowClass: 'bg-blue-500/10'
  },
  cycle: {
    label: 'Cycle & Fertility',
    shortLabel: 'Cycle',
    icon: Droplet,
    activeBgLight: 'bg-slate-100',
    activeBgDark: 'bg-slate-900/30',
    activeTextLight: 'text-slate-700',
    activeTextDark: 'text-slate-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(197, 179, 223, 0.8)',
    borderColor: 'rgb(197, 179, 223)',
    glowClass: 'bg-slate-500/10'
  }
};

interface InsightsNavigationProps {
  view: InsightView;
  onViewChange: (view: InsightView) => void;
}

export function InsightsNavigation({ view, onViewChange }: InsightsNavigationProps) {
  const [showLabels, setShowLabels] = useState(true);
  const [longPressHintShown, setLongPressHintShown] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressedRef = useRef(false);

  const views: InsightView[] = ['physical', 'metabolic', 'emotional', 'cycle'];

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('insightsNavHint');
    if (!hasSeenHint) {
      setLongPressHintShown(true);
      const timer = setTimeout(() => {
        setLongPressHintShown(false);
        localStorage.setItem('insightsNavHint', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePressStart = () => {
    pressedRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      pressedRef.current = true;
      setShowLabels(prev => !prev);
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  return (
    <div className="relative mb-6">
      {longPressHintShown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50"
        >
          Long press any button to toggle labels
        </motion.div>
      )}

      <div className="flex justify-center gap-3">
        {views.map((viewKey) => {
          const config = viewConfig[viewKey];
          const Icon = config.icon;
          const isActive = view === viewKey;

          return (
            <button
              key={viewKey}
              onClick={() => {
                if (!pressedRef.current) {
                  onViewChange(viewKey);
                }
              }}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className={`
                relative flex ${showLabels ? 'flex-row items-center gap-2 px-4' : 'items-center justify-center w-16'} py-3 rounded-2xl
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300
                ${isActive
                  ? `${config.activeBgLight} dark:${config.activeBgDark} shadow-md border border-transparent`
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
              aria-label={config.label}
            >
              <Icon
                className={`
                  ${showLabels ? 'w-6 h-6' : 'w-7 h-7'}
                  transition-all duration-300
                  ${isActive
                    ? `${config.activeTextLight} dark:${config.activeTextDark}`
                    : `${config.inactiveText} hover:text-slate-600 dark:hover:text-slate-300`
                  }
                `}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className={`
                    text-sm font-medium whitespace-nowrap
                    ${isActive
                      ? `${config.activeTextLight} dark:${config.activeTextDark}`
                      : 'text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {config.shortLabel}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
