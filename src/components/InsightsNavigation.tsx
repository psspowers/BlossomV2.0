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
  activeColor: string;
  glowColor: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hex: string;
  glowClass: string;
  shadowClass: string;
  borderClass: string;
  textClass: string;
  badgeBgClass: string;
}

export const viewConfig: Record<InsightView, ViewConfig> = {
  physical: {
    label: 'Physical & Movement',
    icon: Activity,
    activeColor: 'text-emerald-400',
    glowColor: 'bg-emerald-500/50',
    color: 'rgba(232, 174, 178, 0.8)',
    bgColor: 'rgba(232, 174, 178, 0.1)',
    borderColor: 'rgb(232, 174, 178)',
    hex: '#E8AEB2',
    glowClass: 'bg-secondary/10',
    shadowClass: 'shadow-[0_4px_20px_rgba(232,174,178,0.3)]',
    borderClass: 'border-secondary',
    textClass: 'text-secondary',
    badgeBgClass: 'bg-secondary/20 text-secondary border-secondary/30'
  },
  metabolic: {
    label: 'Metabolic & Fuel',
    icon: Zap,
    activeColor: 'text-amber-400',
    glowColor: 'bg-amber-500/50',
    color: 'rgba(134, 168, 115, 0.8)',
    bgColor: 'rgba(134, 168, 115, 0.1)',
    borderColor: 'rgb(134, 168, 115)',
    hex: '#86A873',
    glowClass: 'bg-primary/10',
    shadowClass: 'shadow-[0_4px_20px_rgba(134,168,115,0.3)]',
    borderClass: 'border-primary',
    textClass: 'text-primary',
    badgeBgClass: 'bg-primary/20 text-primary border-primary/30'
  },
  emotional: {
    label: 'Emotional Well-being',
    icon: Sparkles,
    activeColor: 'text-purple-400',
    glowColor: 'bg-purple-500/50',
    color: 'rgba(107, 143, 78, 0.8)',
    bgColor: 'rgba(107, 143, 78, 0.1)',
    borderColor: 'rgb(107, 143, 78)',
    hex: '#6b8f4e',
    glowClass: 'bg-sage-600/10',
    shadowClass: 'shadow-[0_4px_20px_rgba(107,143,78,0.3)]',
    borderClass: 'border-sage-600',
    textClass: 'text-sage-600',
    badgeBgClass: 'bg-sage-600/20 text-sage-600 border-sage-600/30'
  },
  cycle: {
    label: 'Cycle & Fertility',
    icon: Droplet,
    activeColor: 'text-rose-400',
    glowColor: 'bg-rose-500/50',
    color: 'rgba(197, 179, 223, 0.8)',
    bgColor: 'rgba(197, 179, 223, 0.1)',
    borderColor: 'rgb(197, 179, 223)',
    hex: '#C5B3DF',
    glowClass: 'bg-lavender-400/10',
    shadowClass: 'shadow-[0_4px_20px_rgba(197,179,223,0.3)]',
    borderClass: 'border-lavender-400',
    textClass: 'text-lavender-600',
    badgeBgClass: 'bg-lavender-400/20 text-lavender-600 border-lavender-400/30'
  }
};

interface InsightsNavigationProps {
  view: InsightView;
  onViewChange: (view: InsightView) => void;
}

export function InsightsNavigation({ view, onViewChange }: InsightsNavigationProps) {
  const views: InsightView[] = ['physical', 'metabolic', 'emotional', 'cycle'];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative mb-6">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-2 flex items-center justify-around gap-1 border border-slate-700/50 shadow-2xl">
          {views.map((viewKey) => {
            const config = viewConfig[viewKey];
            const Icon = config.icon;
            const isActive = view === viewKey;

            return (
              <Tooltip key={viewKey}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(viewKey)}
                    className={`relative flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `${config.activeColor} scale-105`
                        : 'text-slate-400 hover:text-slate-200 hover:scale-110 hover:bg-slate-800/40'
                    }`}
                    aria-label={config.label}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                        rotate: isActive ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full ${config.glowColor} blur-sm`}
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className={`absolute inset-0 ${config.glowColor} rounded-xl blur-2xl opacity-20 -z-10`}
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-900/95 backdrop-blur-sm border-slate-700 text-slate-100 text-sm font-medium px-3 py-2"
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
