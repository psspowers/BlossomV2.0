export function ScoringPipeline() {
  const stages = [
    {
      label: 'Raw Input',
      examples: ['Stress: "high"', 'Acne: 7/10', 'Sleep: "7-8h"', 'Mood: 6/10'],
      color: '#e2e8f0',
      textColor: '#475569',
    },
    {
      label: 'Normalize (0-10)',
      examples: ['Stress: 2', 'Acne: 3', 'Sleep: 9', 'Mood: 6'],
      color: '#86A873',
      textColor: '#fff',
    },
    {
      label: 'Factor Scores (0-100)',
      examples: ['Symptom: 52', 'Self-Care: 71', 'Emotional: 47', 'Stability: 65'],
      color: '#E8A79B',
      textColor: '#fff',
    },
    {
      label: 'Weighted Composite',
      examples: ['0.25 x 52 = 13', '0.25 x 71 = 18', '0.25 x 47 = 12', '0.25 x 65 = 16'],
      color: '#C5B3DF',
      textColor: '#fff',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif font-bold text-slate-800">
        Scoring Pipeline: Raw Data to Blossom Score
      </h3>

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex-1 flex items-stretch">
            <div
              className="flex-1 rounded-xl p-4 border border-slate-200"
              style={{ backgroundColor: stage.color }}
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: stage.textColor, opacity: 0.85 }}
              >
                Stage {i + 1}
              </div>
              <div
                className="text-sm font-semibold mb-2"
                style={{ color: stage.textColor }}
              >
                {stage.label}
              </div>
              <div className="space-y-1">
                {stage.examples.map((ex) => (
                  <div
                    key={ex}
                    className="text-xs font-mono"
                    style={{ color: stage.textColor, opacity: 0.9 }}
                  >
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="hidden md:flex items-center px-2 text-slate-400 text-xl font-bold">
                &rarr;
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <div className="hidden md:block text-slate-400 text-2xl mr-3">&darr;</div>
        <div className="bg-slate-800 text-white rounded-xl px-8 py-4 text-center shadow-lg">
          <div className="text-xs uppercase tracking-wide text-slate-300 mb-1">Final</div>
          <div className="text-3xl font-bold">59</div>
          <div className="text-sm text-slate-300 mt-1">Blossom Score</div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <span className="font-bold">Key Principle:</span> After normalization, higher always means
        better wellness on every metric. Stress "high" (raw) becomes 2/10 (normalized = poor
        wellness). This "normalize-first" design eliminates polarity confusion in all downstream
        calculations.
      </div>
    </div>
  );
}
