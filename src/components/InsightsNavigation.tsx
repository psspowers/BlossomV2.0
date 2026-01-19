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

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full flex justify-center mb-8">
        <div className="flex items-center p-2 gap-4 bg-white/70 backdrop-blur-md border border-stone-200/60 rounded-full shadow-sm">

          {views.map((viewKey) => {
            const config = viewConfig[viewKey];
            const Icon = config.icon;
            const isActive = view === viewKey;

            return (
              <Tooltip key={viewKey}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(viewKey)}
                    className={`
                      relative group flex items-center justify-center w-12 h-12 rounded-full
                      transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2
                      ${isActive
                        ? `${config.activeClass} scale-105`
                        : `${config.inactiveClass} hover:shadow-sm`}
                    `}
                    aria-label={config.label}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="relative z-10 transition-transform duration-300"
                    />

                    {isActive && (
                      <motion.div
                        layoutId="active-breath"
                        className="absolute inset-0 rounded-full bg-current opacity-10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1.1 }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </button>
                </TooltipTrigger>

                <TooltipContent
                  className="z-50 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white/90 backdrop-blur border border-stone-100 rounded-lg shadow-lg"
                  sideOffset={8}
                  side="bottom"
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
