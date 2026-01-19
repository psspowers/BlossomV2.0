import { Lightbulb, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useWisdomEngine } from '../lib/hooks/useWisdomEngine';

export function DailyWisdom() {
  const { wisdomCard, loading, error, context, refreshCard } = useWisdomEngine();

  if (loading) {
    return (
      <div className="paper-card h-80 flex flex-col p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          <Lightbulb className="w-4 h-4 text-sage-600" />
        </div>

        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
            <p className="text-sm text-sage-600">Loading wisdom...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-card h-80 flex flex-col p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>

        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Failed to load wisdom cards</p>
            <p className="text-xs text-sage-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wisdomCard) {
    return (
      <div className="paper-card h-80 flex flex-col p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          <Lightbulb className="w-4 h-4 text-sage-600" />
        </div>

        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-sm text-sage-600 text-center">
            No wisdom cards available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-card h-80 flex flex-col p-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-serif font-semibold text-text-main uppercase tracking-wide">
            Daily Wisdom
          </h2>
          {context && context.triggers.size > 1 && (
            <Sparkles className="w-3 h-3 text-sage-600" title="Personalized for you" />
          )}
        </div>
        <button
          onClick={refreshCard}
          className="p-1 hover:bg-sage-100 rounded-full transition-colors"
          title="Get another insight"
        >
          <RefreshCw className="w-4 h-4 text-sage-600" />
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-sage-50 border border-sage-200 rounded-full text-xs font-medium text-sage-700">
            {wisdomCard.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-text-main mb-3 font-serif">
          {wisdomCard.title}
        </h3>

        <p className="text-base text-text-main leading-relaxed mb-4">
          {wisdomCard.text}
        </p>

        <p className="text-xs text-sage-600 italic">
          Source: {wisdomCard.source}
        </p>
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-sage-600 text-center">
          Evidence-based insight • Personalized to your patterns
        </p>
      </div>
    </div>
  );
}
