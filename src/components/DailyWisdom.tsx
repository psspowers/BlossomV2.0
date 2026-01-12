import { Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';

const wisdomTips = [
  {
    category: 'Exercise',
    tip: 'Resistance training improves insulin sensitivity more than cardio for some PCOS phenotypes.',
    source: 'Monash Guidelines'
  },
  {
    category: 'Mental Health',
    tip: 'Anxiety in PCOS is often linked to hormonal fluctuations, not just life events.',
    source: 'Clinical Research'
  },
  {
    category: 'Sleep',
    tip: 'Poor sleep quality can worsen insulin resistance and increase androgen levels.',
    source: 'Endocrine Studies'
  },
  {
    category: 'Nutrition',
    tip: 'Low-GI diets have been shown to improve menstrual regularity and reduce testosterone levels.',
    source: 'Monash Guidelines'
  },
  {
    category: 'Body Composition',
    tip: 'Even 5% weight loss can restore ovulation in women with PCOS who have elevated BMI.',
    source: 'Evidence-Based Research'
  },
  {
    category: 'Cycle Tracking',
    tip: 'Irregular cycles are often the first sign of hormonal imbalance in PCOS.',
    source: 'Clinical Guidelines'
  },
  {
    category: 'Stress Management',
    tip: 'Chronic stress elevates cortisol, which can worsen insulin resistance and inflammation.',
    source: 'Psychoneuroendocrinology'
  },
  {
    category: 'Hyperandrogenism',
    tip: 'Acne and hirsutism may take 6-12 months to improve with lifestyle changes alone.',
    source: 'Dermatology Research'
  },
  {
    category: 'Metabolism',
    tip: 'Women with PCOS may have 20-30% lower resting metabolic rate than those without.',
    source: 'Metabolic Studies'
  },
  {
    category: 'Inflammation',
    tip: 'Anti-inflammatory foods like omega-3s and turmeric may help reduce PCOS symptoms.',
    source: 'Nutritional Science'
  }
];

export function DailyWisdom() {
  const [currentTip, setCurrentTip] = useState(wisdomTips[0]);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const tipIndex = dayOfYear % wisdomTips.length;
    setCurrentTip(wisdomTips[tipIndex]);
  }, []);

  return (
    <div className="glass-card h-80 flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/90 uppercase tracking-wide">
          Daily Wisdom
        </h2>
        <Lightbulb className="w-4 h-4 text-amber-400" />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs font-medium text-amber-300">
            {currentTip.category}
          </span>
        </div>

        <p className="text-base text-white/90 leading-relaxed mb-4 font-medium">
          {currentTip.tip}
        </p>

        <p className="text-xs text-slate-500 italic">
          Source: {currentTip.source}
        </p>
      </div>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-slate-400 text-center">
          Evidence-based insight • Rotates daily
        </p>
      </div>
    </div>
  );
}
