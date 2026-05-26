import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, FileText, ChartBar as BarChart3, Users, Shield, TriangleAlert as AlertTriangle } from 'lucide-react';
import { ScoringPipeline } from './ScoringPipeline';
import { PatientScenarios } from './PatientScenarios';
import { ChartGuide } from './ChartGuide';
import { GoldenRules } from './GoldenRules';

interface ClinicalGuideProps {
  onClose: () => void;
}

type Section = 'pipeline' | 'charts' | 'patients' | 'rules';

const sections: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pipeline', label: 'Scoring Methodology', icon: FileText },
  { id: 'charts', label: 'Chart Interpretation', icon: BarChart3 },
  { id: 'patients', label: 'Patient Examples', icon: Users },
  { id: 'rules', label: 'Rules, Exceptions & Assumptions', icon: Shield },
];

export function ClinicalGuide({ onClose }: ClinicalGuideProps) {
  const [activeSection, setActiveSection] = useState<Section>('pipeline');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDFBF7] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="bg-slate-800 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold">Blossom Score -- Clinical Reference Guide</h2>
            <p className="text-sm text-slate-300 mt-1">
              For healthcare professionals: scoring methodology, chart interpretation, and worked examples
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border-b border-slate-200 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'pipeline' && <PipelineContent />}
              {activeSection === 'charts' && <ChartGuide />}
              {activeSection === 'patients' && <PatientScenarios />}
              {activeSection === 'rules' && <GoldenRules />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Patient engagement tool -- not a validated clinical instrument</span>
          </div>
          <div className="flex gap-2">
            {activeSection !== 'pipeline' && (
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  if (idx > 0) setActiveSection(sections[idx - 1].id);
                }}
                className="text-xs text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Previous
              </button>
            )}
            {activeSection !== 'rules' && (
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                }}
                className="text-xs text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PipelineContent() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-serif font-bold text-slate-800 mb-3">
          Overview
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The Blossom Score is a 0-100 point weighted composite wellness index designed for
          individuals managing PCOS. It integrates self-reported data across <strong>five orthogonal
          factors</strong> -- Physical (symptom severity), Metabolic (sleep, energy, diet),
          Emotional (mood, stress, anxiety), Cycle (menstrual regularity), and Lifestyle
          (exercise, hydration) -- into a single longitudinal tracking metric.
        </p>
      </div>

      <ScoringPipeline />

      <NormalizationTable />
      <WeightingExplainer />
    </div>
  );
}

function NormalizationTable() {
  const categories = [
    {
      title: 'Categorical Inputs',
      mappings: [
        { field: 'Stress', raw: 'low / medium / high', normalized: '8 / 5 / 2' },
        { field: 'Anxiety', raw: 'none / low / high', normalized: '9 / 7 / 2' },
        { field: 'Sleep', raw: '<6h / 6-7h / 7-8h / >8h', normalized: '3 / 6 / 9 / 9' },
        { field: 'Exercise', raw: 'rest / light / moderate / intense', normalized: '5 / 7 / 9 / 10' },
        { field: 'Diet', raw: 'balanced / cravings / restrictive', normalized: '9 / 4 / 4' },
        { field: 'Body Image', raw: 'positive / neutral / negative', normalized: '9 / 5 / 2' },
      ],
    },
    {
      title: 'Numeric Inputs',
      mappings: [
        { field: 'Symptoms', raw: 'Severity 0-10', normalized: '10 - severity (inverted)' },
        { field: 'Mood', raw: 'Rating 0-10', normalized: 'Passed through, clamped [0,10]' },
        { field: 'Water', raw: 'Glasses/day', normalized: '<3=3, <6=6, <8=8, 8+=10' },
      ],
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-4">
        Normalization Reference Table
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        All raw inputs are projected onto a unified 0-10 scale where <strong>higher always means
        better wellness</strong>. Constants: NEUTRAL = 5, SCALE_MAX = 10.
      </p>

      {categories.map((cat) => (
        <div key={cat.title} className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
            {cat.title}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-2 text-slate-600 font-semibold">Field</th>
                  <th className="text-left px-4 py-2 text-slate-600 font-semibold">Raw Values</th>
                  <th className="text-left px-4 py-2 text-slate-600 font-semibold">Normalized (0-10)</th>
                </tr>
              </thead>
              <tbody>
                {cat.mappings.map((m) => (
                  <tr key={m.field} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-700">{m.field}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono">{m.raw}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono">{m.normalized}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function WeightingExplainer() {
  return (
    <div>
      <h3 className="text-lg font-serif font-bold text-slate-800 mb-3">
        Priority Weighting System
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-700 mb-2">Default (Equal Weights)</div>
          <div className="space-y-2">
            {['Symptom', 'Self-Care', 'Emotional', 'Stability'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="h-full rounded-full bg-slate-400" style={{ width: '25%' }} />
                </div>
                <span className="text-xs text-slate-600 w-20">{f}: 0.25</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-700 mb-2">
            With Priorities (Acne + Hirsutism selected)
          </div>
          <div className="space-y-2">
            {[
              { name: 'Symptom', weight: 0.39 },
              { name: 'Self-Care', weight: 0.18 },
              { name: 'Emotional', weight: 0.18 },
              { name: 'Stability', weight: 0.18 },
            ].map((f) => {
              const pct = Math.round(f.weight * 100);
              return (
                <div key={f.name} className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: f.name === 'Symptom' ? '#86A873' : '#94a3b8',
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-20">
                    {f.name}: {f.weight.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Both priorities map to symptomFactor: 0.25 + 0.15 + 0.15 = 0.55, then renormalized so all weights sum to ~1.0
          </div>
        </div>
      </div>
    </div>
  );
}
