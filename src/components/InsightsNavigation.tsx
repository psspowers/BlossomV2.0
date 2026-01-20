import { Activity, Zap, Sparkles, Droplet, LucideIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  const [pressedView, setPressedView] = useState<InsightView | null>(null);
  const [showLabel, setShowLabel] = useState<InsightView | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const views: InsightView[] = ['physical', 'metabolic', 'emotional', 'cycle'];

  const handlePressStart = (viewKey: InsightView) => {
    setPressedView(viewKey);
    setShowLabel(viewKey);

    pressTimerRef.current = setTimeout(() => {
      onViewChange(viewKey);
      setPressedView(null);
      setShowLabel(null);
    }, 800);
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    setPressedView(null);
    setShowLabel(null);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center mb-6 sticky top-4 z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center p-1.5 gap-2 bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-full shadow-md">
        {views.map((viewKey) => {
          const config = viewConfig[viewKey];
          const Icon = config.icon;
          const isActive = view === viewKey;
          const isPressed = pressedView === viewKey;
          const shouldShowLabel = showLabel === viewKey;

          return (
            <div key={viewKey} className="relative">
              <button
                onMouseDown={() => handlePressStart(viewKey)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(viewKey)}
                onTouchEnd={handlePressEnd}
                className={`
                  relative flex items-center justify-center w-14 h-14 rounded-full
                  transition-all duration-300 ease-out focus:outline-none
                  ${isActive
                    ? `${config.activeClass} scale-105`
                    : `${config.inactiveClass} hover:shadow-sm`}
                  ${isPressed ? 'scale-95' : ''}
                `}
                aria-label={config.label}
              >
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-transform duration-200"
                />
              </button>

              <AnimatePresence>
                {shouldShowLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 px-2 py-1 text-xs font-medium text-stone-600 bg-white/95 backdrop-blur border border-stone-100 rounded-md shadow-lg"
                  >
                    {config.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
