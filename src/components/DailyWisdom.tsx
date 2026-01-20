import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { useWisdomEngine } from '../lib/hooks/useWisdomEngine';

export function DailyWisdom() {
  const { wisdomCard, loading, context, refreshCard } = useWisdomEngine();

  if (loading || !wisdomCard) {
    return (
      <div className="paper-card flex flex-col p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          <Lightbulb className="w-4 h-4 text-sage-600" />
        </div>

        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
            <p className="text-sm text-sage-600">Loading wisdom...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-card flex flex-col p-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          {context && !context.matchedCard.triggers.includes('general') && (
            <Sparkles className="w-3 h-3 text-sage-600" title="Responding to your health patterns" />
          )}
        </div>
        <button
          onClick={refreshCard}
          className="p-1 hover:bg-sage-100 rounded-full transition-colors"
          title="Refresh wisdom"
        >
          <RefreshCw className="w-4 h-4 text-sage-600" />
        </button>
      </div>

      <div className="p-6 flex flex-col">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-sage-50 border border-sage-200 rounded-full text-xs font-medium text-sage-700">
            {wisdomCard.category}
          </span>
        </div>

        <p className="text-base text-text-main leading-relaxed mb-4">
          {wisdomCard.text}
        </p>

        <p className="text-xs text-sage-600 italic">
          Source: {wisdomCard.source}
        </p>
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-sage-600 text-center">
          {context && !context.matchedCard.triggers.includes('general')
            ? 'Responding to your current health patterns'
            : 'Daily evidence-based insight'}
        </p>
      </div>
    </div>
  );
}
