import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Activity, Leaf, Wind, Scissors, Waves } from 'lucide-react';
import { useHaptics } from '../lib/hooks/useHaptics';
import { db, LogEntry } from '../lib/db';
import { format } from 'date-fns';
import { calculatePlantHealth } from '../lib/logic/plant';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';

interface SaveSuccessResult {
  symptoms: Record<string, number>;
  isFirstLog: boolean;
  streak: number;
  season: string;
}

interface DailyLogProps {
  onClose: () => void;
  onSaveSuccess?: (result: SaveSuccessResult) => void;
}

type FlowValue = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

const GRACE_AFFIRMATIONS = [
  "Rough days are valid. You are still blooming.",
  "Your body is listening. Speak kindly.",
  "Rest is a productive action.",
  "Healing is non-linear. You are doing enough.",
  "Small steps create the biggest shifts.",
  "You are safe in this season.",
  "Consistency, not perfection, is the practice.",
  "Being aware is already half the healing.",
];

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Intention', 'My Cycle', 'My Body', 'My Habits', 'My Mind'];

function Pill({
  label,
  selected,
  onClick,
  selectedClass = 'bg-emerald-600 text-white shadow-sm',
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  selectedClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 ${
        selected
          ? selectedClass
          : 'bg-white/70 text-stone-600 border border-stone-200 hover:border-stone-300 active:scale-95'
      }`}
    >
      {label}
    </button>
  );
}

function SymptomSlider({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  onChange: (v: number) => void;
}) {
  const badgeColor =
    value === 0
      ? 'bg-emerald-100 text-emerald-700'
      : value <= 3
      ? 'bg-amber-100 text-amber-700'
      : value <= 6
      ? 'bg-orange-100 text-orange-700'
      : 'bg-rose-100 text-rose-700';

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-rose-400" />
          <span className="text-sm font-medium text-stone-700">{label}</span>
        </div>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${badgeColor}`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer accent-rose-500"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-stone-400 uppercase tracking-wide">None</span>
        <span className="text-[10px] text-stone-400 uppercase tracking-wide">Severe</span>
      </div>
    </div>
  );
}

function MoodSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const moodLabel =
    value <= 2 ? 'Struggling' : value <= 4 ? 'Low' : value <= 6 ? 'Okay' : value <= 8 ? 'Good' : 'Thriving';

  return (
    <div className="mb-1">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium text-stone-700">How are you feeling today?</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">{moodLabel}</span>
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
            {value}
          </span>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-stone-400 uppercase tracking-wide">Low</span>
        <span className="text-[10px] text-stone-400 uppercase tracking-wide">High</span>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as number[] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56,
    opacity: 0,
    transition: { duration: 0.18 },
  }),
};

export function DailyLog({ onClose, onSaveSuccess }: DailyLogProps) {
  const { trigger: haptic } = useHaptics();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [affirmation] = useState(
    () => GRACE_AFFIRMATIONS[Math.floor(Math.random() * GRACE_AFFIRMATIONS.length)]
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning.' : hour < 17 ? 'Good afternoon.' : 'Good evening.';

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    flow: 'none' as FlowValue,
    symptoms: { acne: 0, hirsutism: 0, hairLoss: 0, bloat: 0, cramps: 0 },
    psych: { stress: 'low', anxiety: 'none', mood: 5, bodyImage: 'neutral' },
    lifestyle: { sleep: '7-8h', exercise: 'rest', diet: 'balanced' },
    intention: '',
  });

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose();
        window.location.reload();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose]);

  const goNext = () => {
    setDirection(1);
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    haptic('light');
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(s => Math.max(s - 1, 0));
    haptic('light');
  };

  const handleSave = async () => {
    const entry: LogEntry = {
      date: formData.date,
      cyclePhase: 'unknown',
      flow: formData.flow,
      symptoms: formData.symptoms,
      psych: formData.psych,
      lifestyle: formData.lifestyle,
      intention: formData.intention.trim() || undefined,
    };

    await db.logs.add(entry);
    haptic('heavy');

    const plantState = await calculatePlantHealth();
    setStreak(plantState.streak);
    setIsSubmitted(true);

    if (onSaveSuccess) {
      try {
        const allLogs = await db.logs.count();
        const scoreResult = await calculateBlossomScore();
        const seasonState = await calculateSeason(scoreResult.score);
        onSaveSuccess({
          symptoms: formData.symptoms,
          isFirstLog: allLogs === 1,
          streak: plantState.streak,
          season: seasonState.currentSeason,
        });
      } catch {
        /* non-critical */
      }
    }
  };

  const updateSymptom = (key: keyof typeof formData.symptoms, value: number) => {
    setFormData(d => ({ ...d, symptoms: { ...d.symptoms, [key]: value } }));
    haptic('light');
  };

  const updatePsych = (key: keyof typeof formData.psych, value: string | number) => {
    setFormData(d => ({ ...d, psych: { ...d.psych, [key]: value } }));
    haptic('light');
  };

  const updateLifestyle = (key: keyof typeof formData.lifestyle, value: string) => {
    setFormData(d => ({ ...d, lifestyle: { ...d.lifestyle, [key]: value } }));
    haptic('light');
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[#FAF8F3] z-50 flex flex-col items-center justify-center px-8"
        onClick={() => { onClose(); window.location.reload(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-200 mx-auto mb-10 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-400 opacity-70" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-serif text-2xl text-stone-800 leading-relaxed mb-6"
          >
            {affirmation}
          </motion.p>

          {formData.intention.trim() && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="italic text-stone-500 text-base mb-6 leading-relaxed"
            >
              &ldquo;{formData.intention}&rdquo;
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-sm font-semibold text-emerald-600 tracking-wide"
          >
            {streak > 1
              ? `Logged ${streak} days in a row`
              : streak === 1
              ? 'Day 1 — the hardest step.'
              : 'Your first log is saved.'}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
            className="text-xs text-stone-400 mt-10 uppercase tracking-widest"
          >
            Tap to continue
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="w-full max-h-[92vh] bg-[#FAF8F3] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>

          <div className="w-20 flex justify-end">
            {currentStep > 0 && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSave}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Save & Close
              </motion.button>
            )}
          </div>
        </div>

        {/* Step label */}
        <div className="px-6 pb-3 shrink-0">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
          <h2 className="font-serif text-xl font-semibold text-stone-800">
            {STEP_LABELS[currentStep]}
          </h2>
        </div>

        {/* Scrollable step content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="px-6 pb-6"
            >
              {/* ── Step 0: Intention ── */}
              {currentStep === 0 && (
                <div>
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 mb-6">
                    <p className="font-serif text-2xl text-stone-800 mb-1">{greeting}</p>
                    <p className="font-serif italic text-stone-500 text-base leading-relaxed">
                      &ldquo;{affirmation}&rdquo;
                    </p>
                  </div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
                    Daily Intention
                  </label>
                  <input
                    type="text"
                    placeholder="Today I choose..."
                    value={formData.intention}
                    onChange={e => setFormData(d => ({ ...d, intention: e.target.value }))}
                    maxLength={80}
                    className="w-full bg-white/80 border-b-2 border-stone-200 focus:border-emerald-400 outline-none py-3 px-1 text-stone-700 placeholder:text-stone-400 placeholder:italic transition-colors text-base"
                  />
                  <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-wider">
                    Optional — set your intention for today
                  </p>
                </div>
              )}

              {/* ── Step 1: My Cycle ── */}
              {currentStep === 1 && (
                <div>
                  <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 mb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Flow</span>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      How would you describe your flow today?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {([
                      { label: 'None', value: 'none' },
                      { label: 'Spotting', value: 'spotting' },
                      { label: 'Light', value: 'light' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Heavy', value: 'heavy' },
                    ] as { label: string; value: FlowValue }[]).map(opt => (
                      <Pill
                        key={opt.value}
                        label={opt.label}
                        selected={formData.flow === opt.value}
                        onClick={() => {
                          setFormData(d => ({ ...d, flow: opt.value }));
                          haptic('light');
                        }}
                        selectedClass="bg-rose-500 text-white shadow-sm"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 mt-5 leading-relaxed">
                    No flow today? Select &ldquo;None&rdquo;. Your cycle phase is calculated automatically.
                  </p>
                </div>
              )}

              {/* ── Step 2: My Body ── */}
              {currentStep === 2 && (
                <div>
                  <div className="bg-rose-50/40 border border-rose-100/50 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Physical Symptoms</span>
                    </div>
                    <p className="text-sm text-stone-500">Rate each symptom from 0 (none) to 10 (severe).</p>
                  </div>
                  <div className="space-y-1">
                    <SymptomSlider
                      label="Cramps"
                      icon={Waves}
                      value={formData.symptoms.cramps}
                      onChange={v => updateSymptom('cramps', v)}
                    />
                    <SymptomSlider
                      label="Acne"
                      icon={Activity}
                      value={formData.symptoms.acne}
                      onChange={v => updateSymptom('acne', v)}
                    />
                    <SymptomSlider
                      label="Hair Loss"
                      icon={Wind}
                      value={formData.symptoms.hairLoss}
                      onChange={v => updateSymptom('hairLoss', v)}
                    />
                    <SymptomSlider
                      label="Facial Hair"
                      icon={Scissors}
                      value={formData.symptoms.hirsutism}
                      onChange={v => updateSymptom('hirsutism', v)}
                    />
                    <SymptomSlider
                      label="Bloating"
                      icon={Droplets}
                      value={formData.symptoms.bloat}
                      onChange={v => updateSymptom('bloat', v)}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 3: My Habits ── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Daily Habits</span>
                    </div>
                    <p className="text-sm text-stone-500">Small consistent choices shape your season.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Sleep</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Under 6h', value: '<6h' },
                        { label: '6–7 hours', value: '6-7h' },
                        { label: '7–8 hours', value: '7-8h' },
                        { label: 'Over 8h', value: '>8h' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.lifestyle.sleep === opt.value}
                          onClick={() => updateLifestyle('sleep', opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Movement</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Rest Day', value: 'rest' },
                        { label: 'Light', value: 'light' },
                        { label: 'Moderate', value: 'moderate' },
                        { label: 'Intense', value: 'intense' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.lifestyle.exercise === opt.value}
                          onClick={() => updateLifestyle('exercise', opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Nourishment</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Nourished', value: 'balanced' },
                        { label: 'Skipped Meals', value: 'restrictive' },
                        { label: 'Struggled / Cravings', value: 'cravings' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.lifestyle.diet === opt.value}
                          onClick={() => updateLifestyle('diet', opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: My Mind ── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-stone-50/80 border border-stone-100 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Mood</p>
                    <MoodSlider
                      value={formData.psych.mood}
                      onChange={v => {
                        updatePsych('mood', v);
                      }}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Stress</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.psych.stress === opt.value}
                          onClick={() => updatePsych('stress', opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Anxiety</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'None', value: 'none' },
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.psych.anxiety === opt.value}
                          onClick={() => updatePsych('anxiety', opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Body Image</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Good', value: 'positive' },
                        { label: 'Okay', value: 'neutral' },
                        { label: 'Hard Today', value: 'negative' },
                      ].map(opt => (
                        <Pill
                          key={opt.value}
                          label={opt.label}
                          selected={formData.psych.bodyImage === opt.value}
                          onClick={() => updatePsych('bodyImage', opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="px-6 pt-4 pb-8 border-t border-stone-100 bg-[#FAF8F3] shrink-0">
          <button
            type="button"
            onClick={currentStep === TOTAL_STEPS - 1 ? handleSave : goNext}
            className="w-full py-4 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white font-semibold rounded-2xl transition-colors text-base shadow-sm"
          >
            {currentStep === TOTAL_STEPS - 1 ? 'Save Today' : 'Continue'}
          </button>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="w-full mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors text-center"
            >
              Back
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
