import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { db, LogEntry } from '../lib/db';
import { format } from 'date-fns';

interface DailyLogProps {
  onClose: () => void;
}

type CyclePhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'unknown';
type Flow = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export function DailyLog({ onClose }: DailyLogProps) {
  const [cyclePhase, setCyclePhase] = useState<CyclePhase>('unknown');
  const [flow, setFlow] = useState<Flow>('none');
  const [symptoms, setSymptoms] = useState({
    acne: 0,
    hirsutism: 0,
    hairLoss: 0,
    bloat: 0,
    cramps: 0
  });
  const [psych, setPsych] = useState({
    stress: 'low',
    bodyImage: 'neutral',
    mood: 5,
    anxiety: 'none'
  });
  const [lifestyle, setLifestyle] = useState({
    sleep: '7-8h',
    waterIntake: 8,
    exercise: 'moderate',
    diet: 'balanced'
  });
  const [customValues, setCustomValues] = useState<Record<string, number>>({});
  const [newTag, setNewTag] = useState('');
  const [newTagScore, setNewTagScore] = useState<number>(5);

  const handleSave = async () => {
    const entry: LogEntry = {
      date: format(new Date(), 'yyyy-MM-dd'),
      cyclePhase,
      flow,
      symptoms,
      psych,
      lifestyle,
      customValues: Object.keys(customValues).length > 0 ? customValues : undefined
    };

    await db.logs.add(entry);
    onClose();
    window.location.reload();
  };

  const CompactNumberSelector = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => {
    const ranges = [
      { label: '0', value: 0 },
      { label: '1-3', value: 2 },
      { label: '4-6', value: 5 },
      { label: '7-10', value: 8 }
    ];

    return (
      <div className="mb-4">
        <label className="block text-sm text-slate-300 mb-2">{label}</label>
        <div className="flex gap-2">
          {ranges.map(range => (
            <button
              key={range.label}
              onClick={() => onChange(range.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                value >= (range.value === 0 ? 0 : range.value - 1) && value <= (range.value === 0 ? 0 : range.value + 2)
                  ? 'bg-rose-400 text-slate-950 shadow-lg'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SegmentedPills = ({
    label,
    options,
    value,
    onChange,
    color = 'teal'
  }: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (val: string) => void;
    color?: string;
  }) => {
    const colorClasses = {
      teal: 'bg-teal-400',
      rose: 'bg-rose-400',
      violet: 'bg-violet-400',
      amber: 'bg-amber-400'
    };

    return (
      <div className="mb-4">
        <label className="block text-sm text-slate-300 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                value === option.value
                  ? `${colorClasses[color as keyof typeof colorClasses]} text-slate-950 shadow-lg`
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const addCustomTag = () => {
    if (newTag.trim() && Object.keys(customValues).length < 3 && !customValues[newTag.trim()]) {
      setCustomValues({ ...customValues, [newTag.trim()]: newTagScore });
      setNewTag('');
      setNewTagScore(5);
    }
  };

  const removeTag = (tag: string) => {
    const updatedValues = { ...customValues };
    delete updatedValues[tag];
    setCustomValues(updatedValues);
  };

  const updateTagScore = (tag: string, score: number) => {
    setCustomValues({ ...customValues, [tag]: score });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-h-[85vh] bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-white">Daily Check-in</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 pb-32" style={{ maxHeight: 'calc(85vh - 80px)' }}>
            <section className="mb-8">
              <h3 className="text-sm font-medium text-teal-400 uppercase tracking-wide mb-4">
                1. Cycle
              </h3>
              <SegmentedPills
                label="Phase"
                options={[
                  { label: 'menstrual', value: 'menstrual' },
                  { label: 'follicular', value: 'follicular' },
                  { label: 'ovulatory', value: 'ovulatory' },
                  { label: 'luteal', value: 'luteal' },
                  { label: 'unknown', value: 'unknown' }
                ]}
                value={cyclePhase}
                onChange={(val) => setCyclePhase(val as CyclePhase)}
                color="teal"
              />
              <SegmentedPills
                label="Flow"
                options={[
                  { label: 'none', value: 'none' },
                  { label: 'spotting', value: 'spotting' },
                  { label: 'light', value: 'light' },
                  { label: 'medium', value: 'medium' },
                  { label: 'heavy', value: 'heavy' }
                ]}
                value={flow}
                onChange={(val) => setFlow(val as Flow)}
                color="teal"
              />
            </section>

            <section className="mb-8">
              <h3 className="text-sm font-medium text-rose-400 uppercase tracking-wide mb-4">
                2. Physical (Hyperandrogenism)
              </h3>
              <CompactNumberSelector
                label="Acne Severity"
                value={symptoms.acne}
                onChange={val => setSymptoms({ ...symptoms, acne: val })}
              />
              <CompactNumberSelector
                label="Hirsutism (Excess Hair)"
                value={symptoms.hirsutism}
                onChange={val => setSymptoms({ ...symptoms, hirsutism: val })}
              />
              <CompactNumberSelector
                label="Hair Loss"
                value={symptoms.hairLoss}
                onChange={val => setSymptoms({ ...symptoms, hairLoss: val })}
              />
              <CompactNumberSelector
                label="Bloating"
                value={symptoms.bloat}
                onChange={val => setSymptoms({ ...symptoms, bloat: val })}
              />
              <CompactNumberSelector
                label="Cramps"
                value={symptoms.cramps}
                onChange={val => setSymptoms({ ...symptoms, cramps: val })}
              />
            </section>

            <section className="mb-8">
              <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wide mb-4">
                3. Metabolic & Lifestyle
              </h3>
              <SegmentedPills
                label="Sleep"
                options={[
                  { label: '<6h', value: '<6h' },
                  { label: '6-7h', value: '6-7h' },
                  { label: '7-8h', value: '7-8h' },
                  { label: '>8h', value: '>8h' }
                ]}
                value={lifestyle.sleep}
                onChange={(val) => setLifestyle({ ...lifestyle, sleep: val })}
                color="amber"
              />
              <SegmentedPills
                label="Exercise"
                options={[
                  { label: 'rest', value: 'rest' },
                  { label: 'light', value: 'light' },
                  { label: 'moderate', value: 'moderate' },
                  { label: 'intense', value: 'intense' }
                ]}
                value={lifestyle.exercise}
                onChange={(val) => setLifestyle({ ...lifestyle, exercise: val })}
                color="amber"
              />
              <SegmentedPills
                label="Diet"
                options={[
                  { label: 'balanced', value: 'balanced' },
                  { label: 'cravings', value: 'cravings' },
                  { label: 'restrictive', value: 'restrictive' }
                ]}
                value={lifestyle.diet}
                onChange={(val) => setLifestyle({ ...lifestyle, diet: val })}
                color="amber"
              />
            </section>

            <section className="mb-8">
              <h3 className="text-sm font-medium text-violet-400 uppercase tracking-wide mb-4">
                4. Psychological
              </h3>
              <SegmentedPills
                label="Stress"
                options={[
                  { label: 'low', value: 'low' },
                  { label: 'medium', value: 'medium' },
                  { label: 'high', value: 'high' }
                ]}
                value={psych.stress}
                onChange={(val) => setPsych({ ...psych, stress: val })}
                color="violet"
              />
              <SegmentedPills
                label="Body Image"
                options={[
                  { label: 'positive', value: 'positive' },
                  { label: 'neutral', value: 'neutral' },
                  { label: 'negative', value: 'negative' }
                ]}
                value={psych.bodyImage}
                onChange={(val) => setPsych({ ...psych, bodyImage: val })}
                color="violet"
              />
              <SegmentedPills
                label="Anxiety"
                options={[
                  { label: 'none', value: 'none' },
                  { label: 'low', value: 'low' },
                  { label: 'high', value: 'high' }
                ]}
                value={psych.anxiety}
                onChange={(val) => setPsych({ ...psych, anxiety: val })}
                color="violet"
              />
            </section>

            <section className="mb-8">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
                5. Custom Symptoms (Optional)
              </h3>
              <p className="text-xs text-slate-500 mb-3">Track custom symptoms with intensity (0-10)</p>

              {Object.keys(customValues).length < 3 && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    placeholder="Symptom name (e.g., Headache, Fatigue)"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 mb-3"
                    maxLength={20}
                  />
                  <label className="block text-xs text-slate-400 mb-2">Intensity (0-10)</label>
                  <div className="flex gap-1 mb-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                      <button
                        key={score}
                        onClick={() => setNewTagScore(score)}
                        className={`flex-1 px-2 py-2 rounded text-sm font-medium transition-all ${
                          newTagScore === score
                            ? 'bg-teal-400 text-slate-950 shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addCustomTag}
                    disabled={!newTag.trim()}
                    className="w-full px-4 py-2 bg-teal-400/20 hover:bg-teal-400/30 disabled:bg-white/5 disabled:text-slate-600 text-teal-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Symptom
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {Object.entries(customValues).map(([tag, score]) => (
                  <div
                    key={tag}
                    className="p-4 bg-slate-800/50 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-300">{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                        <button
                          key={s}
                          onClick={() => updateTagScore(tag, s)}
                          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                            score === s
                              ? 'bg-teal-400 text-slate-950 shadow-lg'
                              : 'bg-white/5 text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl"
            >
              Save Today's Log
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
