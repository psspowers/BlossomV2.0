import { Activity, Zap, Sparkles, Droplet, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type InsightView = 'physical' | 'emotional' | 'metabolic' | 'cycle';

interface ViewConfig {
  label: string;
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
    icon: Activity,
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
    icon: Zap,
    activeBgLight: 'bg-amber-100',
    activeBgDark: 'bg-amber-900/30',
    activeTextLight: 'text-amber-600',
    activeTextDark: 'text-amber-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(134, 168, 115, 0.8)',
    borderColor: 'rgb(134, 168, 115)',
    glowClass: 'bg-amber-500/10'
  },
  emotional: {
    label: 'Emotional Well-being',
    icon: Sparkles,
    activeBgLight: 'bg-violet-100',
    activeBgDark: 'bg-violet-900/30',
    activeTextLight: 'text-violet-600',
    activeTextDark: 'text-violet-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(107, 143, 78, 0.8)',
    borderColor: 'rgb(107, 143, 78)',
    glowClass: 'bg-violet-500/10'
  },
  cycle: {
    label: 'Cycle & Fertility',
    icon: Droplet,
    activeBgLight: 'bg-teal-100',
    activeBgDark: 'bg-teal-900/30',
    activeTextLight: 'text-teal-600',
    activeTextDark: 'text-teal-400',
    inactiveText: 'text-slate-400',
    color: 'rgba(197, 179, 223, 0.8)',
    borderColor: 'rgb(197, 179, 223)',
    glowClass: 'bg-teal-500/10'
  }
};

interface InsightsNavigationProps {
  view: InsightView;
  onViewChange: (view: InsightView) => void;
}

export function InsightsNavigation({ view, onViewChange }: InsightsNavigationProps) {
  const views: InsightView[] = ['physical', 'metabolic', 'emotional', 'cycle'];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-sm">
          {views.map((viewKey) => {
            const config = viewConfig[viewKey];
            const Icon = config.icon;
            const isActive = view === viewKey;

            return (
              <Tooltip key={viewKey}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(viewKey)}
                    className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                    aria-label={config.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className={`absolute inset-0 rounded-full ${config.activeBgLight} dark:${config.activeBgDark}`}
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}

                    <motion.div
                      className="relative z-10"
                      animate={{
                        scale: isActive ? 1 : 0.9,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isActive
                            ? `${config.activeTextLight} dark:${config.activeTextDark}`
                            : `${config.inactiveText} hover:text-slate-600 dark:hover:text-slate-300`
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md"
                  sideOffset={8}
                >
                  {config.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
