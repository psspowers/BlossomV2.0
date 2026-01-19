import { Activity, Brain, Heart, RefreshCw, LucideIcon } from 'lucide-react';

export type InsightView = 'physical' | 'emotional' | 'metabolic' | 'cycle';

interface ViewConfig {
  label: string;
  icon: LucideIcon;
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
    label: 'Physical',
    icon: Activity,
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
    label: 'Metabolic',
    icon: Heart,
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
    label: 'Emotional',
    icon: Brain,
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
    label: 'Cycle',
    icon: RefreshCw,
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
  return (
    <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
      {(Object.entries(viewConfig) as [InsightView, ViewConfig][]).map(([key, config]) => {
        const Icon = config.icon;
        const isActive = view === key;
        return (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex-1 min-w-[70px] flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 ${
              isActive
                ? `bg-white ${config.textClass} border-b-2 ${config.borderClass} ${config.shadowClass} border-t border-x border-slate-200`
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-[9px] sm:text-sm leading-tight whitespace-nowrap">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
