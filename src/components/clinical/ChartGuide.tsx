export function ChartGuide() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">
          Chart Interpretation Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RadarGuide />
          <VelocityGuide />
        </div>
      </div>

      <PolarityWarning />
      <ModeDecisionTree />
    </div>
  );
}

function RadarGuide() {
  const axes = [
    { name: 'Physical', angle: -90, desc: 'Inverse symptom severity (acne, cramps, bloating, hirsutism)' },
    { name: 'Metabolic', angle: -18, desc: 'Energy + sleep quality + diet quality' },
    { name: 'Lifestyle', angle: 54, desc: 'Exercise regularity + hydration' },
    { name: 'Cycle', angle: 126, desc: 'Menstrual regularity stability score' },
    { name: 'Emotional', angle: 198, desc: 'Mood + inverse-stress + inverse-anxiety' },
  ];

  const cx = 120, cy = 110, r = 80;

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const baselinePoints = axes.map(a => toXY(a.angle, r * 0.5));
  const currentPoints = [
    toXY(-90, r * 0.4),
    toXY(-18, r * 0.7),
    toXY(54, r * 0.85),
    toXY(126, r * 0.55),
    toXY(198, r * 0.3),
  ];

  const pointsToPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="text-sm font-bold text-slate-700 mb-3">Wellness Radar (5-Axis Spider Chart)</div>

      <div className="flex justify-center mb-4">
        <svg width="240" height="220" viewBox="0 0 240 220">
          {[0.25, 0.5, 0.75, 1].map((s) => (
            <polygon
              key={s}
              points={axes.map(a => {
                const p = toXY(a.angle, r * s);
                return `${p.x},${p.y}`;
              }).join(' ')}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {axes.map(a => {
            const end = toXY(a.angle, r);
            return (
              <line
                key={a.name}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={baselinePoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(229,224,216,0.15)"
            stroke="#E5E0D8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          <path
            d={pointsToPath(currentPoints)}
            fill="rgba(134,168,115,0.2)"
            stroke="#86A873"
            strokeWidth="2"
          />

          {currentPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#86A873" stroke="#fff" strokeWidth="1.5" />
          ))}

          {axes.map(a => {
            const label = toXY(a.angle, r + 18);
            return (
              <text
                key={a.name}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] fill-slate-500 font-medium"
              >
                {a.name}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-[#86A873]" />
          <span className="text-slate-600">Solid green = Current wellness</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 border-t border-dashed border-[#E5E0D8]" />
          <span className="text-slate-600">Dashed gray = Neutral baseline (5/10)</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {axes.map(a => (
          <div key={a.name} className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">{a.name}:</span> {a.desc}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <span className="font-bold">Reading tip:</span> Areas where the green shape extends beyond
        the dashed baseline indicate above-average wellness. Areas where green falls inside the
        baseline are domains requiring clinical attention.
      </div>
    </div>
  );
}

function VelocityGuide() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stressRaw = [5, 6, 7, 8, 7, 6, 5];
  const anxietyRaw = [3, 4, 5, 6, 7, 8, 8];

  const chartW = 200, chartH = 100;
  const padL = 10, padR = 10, padT = 5, padB = 5;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toSVG = (i: number, val: number) => ({
    x: padL + (i / (days.length - 1)) * plotW,
    y: padT + plotH - (val / 10) * plotH,
  });

  const pathFromData = (data: number[]) =>
    data.map((v, i) => {
      const p = toSVG(i, v);
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
    }).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="text-sm font-bold text-slate-700 mb-3">Trend Velocity Chart (Line + Badge)</div>

      <div className="bg-slate-900 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M6 2 L10 8 L2 8 Z" fill="#f87171" />
          </svg>
          <span className="text-xs text-rose-400 font-medium">Anxiety up 20%</span>
        </div>

        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
          {[0, 2, 4, 6, 8, 10].map(v => {
            const y = padT + plotH - (v / 10) * plotH;
            return (
              <line
                key={v}
                x1={padL}
                y1={y}
                x2={chartW - padR}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            );
          })}

          <path d={pathFromData(stressRaw)} fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
          <path d={pathFromData(anxietyRaw)} fill="none" stroke="#2dd4bf" strokeWidth="2" />

          {days.map((d, i) => {
            const x = padL + (i / (days.length - 1)) * plotW;
            return (
              <text
                key={d}
                x={x}
                y={chartH + 2}
                textAnchor="middle"
                className="text-[8px] fill-slate-400"
              >
                {d}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-[#2dd4bf]" />
          <span className="text-slate-600">Teal = Anxiety (raw severity 0-10)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-slate-400 opacity-60" />
          <span className="text-slate-600">Gray = Stress (raw severity 0-10)</span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-700">X-axis:</span> Calendar dates (up to 30 days)
        </div>
        <div>
          <span className="font-semibold text-slate-700">Y-axis:</span> Raw severity (0-10, higher = worse symptoms)
        </div>
        <div>
          <span className="font-semibold text-slate-700">Badge:</span> Velocity as normalized wellness % change
        </div>
      </div>
    </div>
  );
}

function PolarityWarning() {
  return (
    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-rose-700 font-bold text-sm">!</span>
        </div>
        <div>
          <h4 className="text-base font-serif font-bold text-rose-800 mb-2">
            Critical Polarity Note for Clinicians
          </h4>
          <p className="text-sm text-rose-700 leading-relaxed mb-4">
            The Trend Velocity chart uses a <strong>bifurcated polarity model</strong> that may
            initially appear contradictory. Understanding this design is essential for accurate
            clinical interpretation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-rose-100">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                What the Chart Shows
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">&uarr;</span>
                  Rising line = Worsening symptoms
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&darr;</span>
                  Falling line = Improving symptoms
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 italic">
                Raw severity scale: higher number = more severe
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-rose-100">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                What the Badge Shows
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">-20%</span>
                  Negative % = Worsening wellness
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">+20%</span>
                  Positive % = Improving wellness
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 italic">
                Normalized wellness scale: higher number = better health
              </div>
            </div>
          </div>

          <div className="mt-4 bg-rose-100 rounded-lg p-3 text-sm text-rose-800">
            <span className="font-bold">Concordance:</span> For negative metrics (stress, anxiety),
            a <strong>rising line</strong> on the chart and a <strong>negative percentage</strong> in
            the badge both indicate <strong>worsening</strong>. The visual direction and the
            mathematical sign align in meaning (negative outcome), even though the geometric
            direction of the line is upward.
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeDecisionTree() {
  const modes = [
    {
      mode: 'Nurture',
      trigger: 'ANY domain avg < 4/10',
      color: '#C5B3DF',
      desc: 'Softened language, supportive messaging, reduced data density',
      example: 'Sarah: Symptom 3.8, Emotional 2.3 -- triggers Nurture',
    },
    {
      mode: 'Steady',
      trigger: 'Neither extreme met',
      color: '#86A873',
      desc: 'Balanced view, full data visibility, neutral encouragement',
      example: 'Maya: All domains 5-7 range -- defaults to Steady',
    },
    {
      mode: 'Thrive',
      trigger: 'ALL domains avg > 7/10',
      color: '#E8A79B',
      desc: 'Celebratory tone, maintenance guidance, progress validation',
      example: 'Priya: All domains 8+ -- triggers Thrive',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">
        Adaptive Interface Mode (3-Day Rolling Window)
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        The app evaluates 4 dimensions (symptoms, sleep, mood, stress/anxiety) over the most
        recent 3 days to determine which interface tone to present. This prevents single-day
        volatility from whiplashing the patient experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((m) => (
          <div
            key={m.mode}
            className="rounded-2xl border-2 p-5 bg-white"
            style={{ borderColor: m.color }}
          >
            <div
              className="text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: m.color }}
            >
              {m.mode} Mode
            </div>
            <div className="text-xs font-mono text-slate-500 mb-3">{m.trigger}</div>
            <p className="text-sm text-slate-700 mb-3">{m.desc}</p>
            <div className="text-xs text-slate-500 italic bg-slate-50 rounded-lg p-2">
              {m.example}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <div className="flex-1 h-px bg-slate-200" />
        <span>Evaluation order: Nurture check first, then Thrive, else Steady</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    </div>
  );
}
