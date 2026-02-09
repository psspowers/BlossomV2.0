interface Scenario {
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  inputs: { label: string; raw: string; normalized: number }[];
  factors: { label: string; value: number }[];
  blossomScore: number;
  mode: 'nurture' | 'steady' | 'thrive';
  modeColor: string;
  clinicalNote: string;
}

const scenarios: Scenario[] = [
  {
    name: 'Patient A: "Sarah" -- Acute Flare',
    description:
      '28yo with hyperandrogenic PCOS. Missed 2 periods, severe acne flare, high stress from work deadlines.',
    tag: 'Nurture Mode',
    tagColor: '#C5B3DF',
    inputs: [
      { label: 'Acne', raw: '8/10 severity', normalized: 2 },
      { label: 'Hirsutism', raw: '6/10 severity', normalized: 4 },
      { label: 'Cramps', raw: '3/10 severity', normalized: 7 },
      { label: 'Stress', raw: '"high"', normalized: 2 },
      { label: 'Anxiety', raw: '"high"', normalized: 2 },
      { label: 'Mood', raw: '3/10', normalized: 3 },
      { label: 'Sleep', raw: '"<6h"', normalized: 3 },
      { label: 'Exercise', raw: '"rest"', normalized: 5 },
      { label: 'Diet', raw: '"cravings"', normalized: 4 },
    ],
    factors: [
      { label: 'Symptom', value: 38 },
      { label: 'Self-Care', value: 0 },
      { label: 'Emotional', value: 23 },
      { label: 'Stability', value: 30 },
    ],
    blossomScore: 23,
    mode: 'nurture',
    modeColor: '#C5B3DF',
    clinicalNote:
      'Self-Care factor = 0% because sleep < 6h disqualifies the day. The UI enters Nurture Mode (purple), softening language and prioritizing supportive messaging. This score pattern warrants discussion of sleep hygiene and stress management interventions.',
  },
  {
    name: 'Patient B: "Maya" -- Steady Management',
    description:
      '32yo with ovulatory PCOS phenotype. Regular cycles, moderate symptoms, managing well with lifestyle.',
    tag: 'Steady Mode',
    tagColor: '#86A873',
    inputs: [
      { label: 'Acne', raw: '3/10 severity', normalized: 7 },
      { label: 'Hirsutism', raw: '2/10 severity', normalized: 8 },
      { label: 'Bloating', raw: '4/10 severity', normalized: 6 },
      { label: 'Stress', raw: '"medium"', normalized: 5 },
      { label: 'Anxiety', raw: '"low"', normalized: 7 },
      { label: 'Mood', raw: '7/10', normalized: 7 },
      { label: 'Sleep', raw: '"7-8h"', normalized: 9 },
      { label: 'Exercise', raw: '"moderate"', normalized: 9 },
      { label: 'Diet', raw: '"balanced"', normalized: 9 },
    ],
    factors: [
      { label: 'Symptom', value: 68 },
      { label: 'Self-Care', value: 100 },
      { label: 'Emotional', value: 63 },
      { label: 'Stability', value: 75 },
    ],
    blossomScore: 77,
    mode: 'steady',
    modeColor: '#86A873',
    clinicalNote:
      'Self-Care hits 100% because sleep >= 9, exercise >= 7, AND diet >= 9 (all three thresholds met). The dominant factor pulling the score down is Emotional (stress = "medium"). This is a good candidate for targeted stress reduction while maintaining current lifestyle patterns.',
  },
  {
    name: 'Patient C: "Priya" -- Thriving Phase',
    description:
      '26yo, 6 months post-lifestyle overhaul. Minimal symptoms, regular cycles, strong mental health support.',
    tag: 'Thrive Mode',
    tagColor: '#E8A79B',
    inputs: [
      { label: 'Acne', raw: '1/10 severity', normalized: 9 },
      { label: 'Hirsutism', raw: '1/10 severity', normalized: 9 },
      { label: 'Cramps', raw: '0/10 severity', normalized: 10 },
      { label: 'Stress', raw: '"low"', normalized: 8 },
      { label: 'Anxiety', raw: '"none"', normalized: 9 },
      { label: 'Mood', raw: '9/10', normalized: 9 },
      { label: 'Sleep', raw: '">8h"', normalized: 9 },
      { label: 'Exercise', raw: '"moderate"', normalized: 9 },
      { label: 'Diet', raw: '"balanced"', normalized: 9 },
    ],
    factors: [
      { label: 'Symptom', value: 90 },
      { label: 'Self-Care', value: 100 },
      { label: 'Emotional', value: 87 },
      { label: 'Stability', value: 88 },
    ],
    blossomScore: 91,
    mode: 'thrive',
    modeColor: '#E8A79B',
    clinicalNote:
      'All domains above 7/10 triggers Thrive Mode (amber UI). This score validates the patient\'s lifestyle intervention. Clinically, this is the maintenance phase -- continue current approach and monitor for regression. The high Stability Factor (88) indicates regular ovulatory cycles returning.',
  },
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 w-8 text-right">{value}</span>
    </div>
  );
}

export function PatientScenarios() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-bold text-slate-800">
        Worked Patient Examples
      </h3>
      <p className="text-sm text-slate-600">
        Three PCOS phenotypes demonstrating how the same scoring engine produces clinically
        distinct outputs. All values are from a single representative day within a 7-day window.
      </p>

      {scenarios.map((s) => (
        <div
          key={s.name}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base font-serif font-bold text-slate-800">{s.name}</h4>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: s.tagColor }}
              >
                {s.tag}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{s.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-slate-100">
            <div className="p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
                Inputs (Raw &rarr; Normalized)
              </div>
              <div className="space-y-1.5">
                {s.inputs.map((inp) => (
                  <div key={inp.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{inp.label}</span>
                    <span className="font-mono text-slate-500">
                      {inp.raw} &rarr;{' '}
                      <span
                        className="font-bold"
                        style={{ color: inp.normalized >= 7 ? '#86A873' : inp.normalized <= 3 ? '#dc2626' : '#475569' }}
                      >
                        {inp.normalized}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
                Factor Scores (0-100)
              </div>
              <div className="space-y-3">
                {s.factors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{f.label}</span>
                    </div>
                    <ScoreBar value={f.value} color={s.modeColor} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 flex flex-col items-center justify-center">
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Blossom Score
              </div>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                style={{ borderColor: s.modeColor }}
              >
                <span className="text-3xl font-bold text-slate-800">{s.blossomScore}</span>
              </div>
              <div
                className="text-xs font-bold mt-2 uppercase tracking-wide"
                style={{ color: s.modeColor }}
              >
                {s.mode} mode
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
              Clinical Interpretation
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{s.clinicalNote}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
