import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Lightbulb, Sparkles } from 'lucide-react';
import { db } from '../lib/db';
import { generatePrimaryStory, PatternStory } from '../lib/logic/stories';

export function TodaysInsight() {
  const [story, setStory] = useState<PatternStory | null>(null);
  const latestLog = useLiveQuery(
    () => db.logs.orderBy('date').reverse().limit(1).first(),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await generatePrimaryStory();
      if (!cancelled) setStory(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [latestLog?.id, latestLog?.date]);

  if (!story) {
    return (
      <div className="glass-card bg-stone-50 border border-stone-200 shadow-sm md:col-span-2 min-h-80 animate-pulse">
        <div className="p-6">
          <div className="h-3 w-32 bg-stone-200 rounded mb-4" />
          <div className="h-6 w-full bg-stone-200 rounded mb-2" />
          <div className="h-6 w-4/5 bg-stone-200 rounded" />
        </div>
      </div>
    );
  }

  const isPersonal = story.category !== 'education';

  const palette = isPersonal
    ? {
        card: 'bg-gradient-to-br from-rose-50 via-white to-rose-50/40 border-rose-200/70',
        headerBorder: 'border-rose-100',
        icon: 'text-rose-500',
        title: 'text-rose-700',
        pillBg: 'bg-rose-50 border-rose-200 text-rose-700',
        quote: 'text-slate-800',
        source: 'text-rose-600/80'
      }
    : {
        card: 'bg-gradient-to-br from-sage-50 via-white to-sage-50/40 border-sage-200/70',
        headerBorder: 'border-sage-100',
        icon: 'text-sage-600',
        title: 'text-sage-700',
        pillBg: 'bg-sage-50 border-sage-200 text-sage-700',
        quote: 'text-slate-800',
        source: 'text-sage-600/80'
      };

  const title = isPersonal ? 'Whispers from your Body' : 'Daily Wisdom';
  const sourceLabel = isPersonal
    ? 'Your Personal Data Patterns'
    : 'Monash Int. Guidelines (2023)';

  const HeaderIcon = isPersonal ? Lightbulb : Sparkles;

  return (
    <div className={`glass-card md:col-span-2 min-h-80 border shadow-sm transition-all duration-500 ${palette.card}`}>
      <div className={`p-4 border-b flex items-center gap-2 ${palette.headerBorder}`}>
        <HeaderIcon className={`w-4 h-4 ${palette.icon}`} />
        <h2 className={`text-sm font-serif font-medium uppercase tracking-wide ${palette.title}`}>
          {title}
        </h2>
      </div>

      <div className="p-6 flex flex-col h-full">
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className={`inline-block px-3 py-1 border rounded-full text-xs font-medium capitalize ${palette.pillBg}`}>
            {story.category}
          </span>
          {story.badge && (
            <span className="inline-block px-3 py-1 bg-white/70 border border-stone-200 rounded-full text-[10px] font-medium text-stone-500 uppercase tracking-wide">
              {story.badge}
            </span>
          )}
        </div>

        <p className={`text-lg md:text-xl leading-relaxed italic font-serif ${palette.quote}`}>
          &ldquo;{story.story}&rdquo;
        </p>

        <p className={`text-xs mt-auto pt-4 font-medium ${palette.source}`}>
          Source: {sourceLabel}
        </p>
      </div>
    </div>
  );
}
