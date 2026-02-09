export function GoldenRules() {
  return (
    <div className="space-y-8">
      <RulesSection />
      <ExceptionsSection />
      <AssumptionsSection />
    </div>
  );
}

function RulesSection() {
  const rules = [
    {
      number: 1,
      title: 'Minimum Data Threshold',
      desc: 'Blossom Score requires >= 3 logged days. Below that, returns a fixed 50 (indeterminate). Velocity engine requires >= 7 days. Do not interpret scores from insufficient data.',
    },
    {
      number: 2,
      title: 'Higher-Is-Always-Better Invariant',
      desc: 'After normalization, every metric follows the same polarity on the 0-10 scale. Code consuming normalized values never needs polarity flags or direction checks.',
    },
    {
      number: 3,
      title: 'Consistent 7-Day Window',
      desc: 'All four Blossom Score factors use the same 7-day window from a 14-day data pull. This prevents temporal misalignment between factors.',
    },
    {
      number: 4,
      title: 'Weight Normalization is Mandatory',
      desc: 'After priority boosting (+0.15 per user-selected priority), weights are re-normalized to sum to 1.0. Without this, scores could exceed 100.',
    },
    {
      number: 5,
      title: 'Sleep as a Gating Variable',
      desc: 'Sleep < 6 hours (normalized = 3) disqualifies that day from Self-Care status, regardless of exercise or diet quality. This reflects evidence that sleep is foundational to PCOS management.',
    },
    {
      number: 6,
      title: 'Neutral Defaults for Missing Data',
      desc: 'Unlogged categorical fields default to NEUTRAL (5/10), not worst-case or best-case. This prevents unlogged days from distorting trends in either direction.',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">Golden Rules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.number}
            className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
              {rule.number}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 mb-1">{rule.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExceptionsSection() {
  const exceptions = [
    {
      title: 'Insufficient Data States',
      items: [
        '< 3 logs: Blossom Score = 50, all factors = 50',
        '< 7 logs: Velocity engine returns null (no trend)',
        '< 2 logs: Trend chart shows "No data yet"',
        '0 logs: Radar chart hidden entirely',
      ],
    },
    {
      title: 'Symptom Absence Assumption',
      items: [
        'Unreported symptom = normalizeSymptom(undefined) = 10 (maximum wellness)',
        'Assumes absent report means absent symptom',
        'Clinically reasonable for longitudinal self-tracking, not for acute assessment',
      ],
    },
    {
      title: 'Cycle Stability Fallback',
      items: [
        'When cycle regularity cannot be determined, stabilityFactor = 50',
        'This neutral value prevents the factor from pulling the composite score disproportionately',
        'Common in early-stage users or anovulatory patients',
      ],
    },
    {
      title: 'Priority Boosting Saturation',
      items: [
        'Multiple priorities mapping to the same factor (e.g., acne + hirsutism + hair loss) compound their +0.15 boosts',
        'After normalization, one factor can become dominant by design',
        'Reflects the patient\'s stated clinical priorities -- not a bug',
      ],
    },
    {
      title: 'Self-Care Edge Case',
      items: [
        '>8h sleep alone qualifies as self-care day (sleep normalized = 9, meets >= 9 threshold)',
        'No exercise or diet quality required if sleep is excellent',
        'Reflects evidence that adequate sleep alone provides significant PCOS benefit',
      ],
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">
        Exceptions and Edge Cases
      </h3>
      <div className="space-y-4">
        {exceptions.map((exc) => (
          <div key={exc.title} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-800 mb-2">{exc.title}</div>
            <ul className="space-y-1">
              {exc.items.map((item, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5 flex-shrink-0">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssumptionsSection() {
  const assumptions = [
    {
      title: 'Target Population',
      text: 'Individuals with diagnosed or suspected PCOS. The symptom set (acne, hirsutism, hair loss, bloating, cramps) reflects the Rotterdam criteria phenotype.',
    },
    {
      title: 'Self-Report Validity',
      text: 'All inputs are patient-reported. The system assumes honest, consistent self-assessment. No biomarker calibration exists.',
    },
    {
      title: 'Equal Symptom Weighting',
      text: 'All 5 PCOS symptoms contribute equally to the symptom factor. In practice, different phenotypes (hyperandrogenic, ovulatory, metabolic) may weight these differently.',
    },
    {
      title: 'Ordinal-to-Interval Assumption',
      text: 'Categorical inputs (e.g., stress: low/medium/high) are treated as interval data on the 0-10 scale. The distances between categories are designer-chosen, not empirically validated.',
    },
    {
      title: 'Recency Bias (Intentional)',
      text: 'The 7-day window reflects the goal of tracking current wellness state, not lifetime trajectory. Appropriate for treatment response monitoring, not epidemiological assessment.',
    },
    {
      title: 'Linear Compositing',
      text: 'The final score assumes additive, linear relationships between factors. No interaction terms exist (e.g., no model for sleep amplifying symptom severity non-linearly).',
    },
    {
      title: 'Stationarity',
      text: 'The system assumes stable baseline sensitivity to metrics. Does not account for treatment changes, menopause transition, or pregnancy.',
    },
    {
      title: 'Velocity Threshold',
      text: 'The 5% threshold for velocity direction is a pragmatic dampening choice, not a statistically derived significance level. With ~7 data points per half, true effect detection power is limited.',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">
        Underlying Assumptions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assumptions.map((a) => (
          <div key={a.title} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-800 mb-1">{a.title}</div>
            <p className="text-xs text-slate-600 leading-relaxed">{a.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-amber-800 mb-2">Scope of Use Disclaimer</h4>
        <p className="text-sm text-amber-700 leading-relaxed">
          The Blossom Score is a <strong>patient engagement and self-monitoring tool</strong>, not a
          validated clinical instrument. It provides structured feedback to support behavior change
          and clinician-patient dialogue. It should not be used as a sole basis for treatment
          decisions, diagnostic conclusions, or as a replacement for clinical assessment tools such
          as the modified Ferriman-Gallwey score, HOMA-IR, or AMH testing.
        </p>
      </div>
    </div>
  );
}
