import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Zap, Heart, Activity, Sparkles, Scale,
  Droplet, Frown, Sun, Plus, Check, ArrowLeft, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import { MiniLotus } from './MiniLotus';
import { BloomLotus } from './BloomLotus';
import { supabase } from '../../lib/supabase';

export interface UserPriority {
  id: string;
  label: string;
  happinessImpact: number;
  category: 'symptom' | 'goal' | 'custom';
}

interface PrioritySelectorProps {
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS = [
  { id: 'acne', label: 'Acne', icon: Sparkles, category: 'symptom' as const },
  { id: 'hirsutism', label: 'Facial Hair', icon: Sun, category: 'symptom' as const },
  { id: 'hair_loss', label: 'Hair Loss', icon: Frown, category: 'symptom' as const },
  { id: 'bloating', label: 'Bloating', icon: Droplet, category: 'symptom' as const },
  { id: 'cramps', label: 'Pain & Cramps', icon: Zap, category: 'symptom' as const },
  { id: 'cravings', label: 'Cravings', icon: Heart, category: 'symptom' as const },
  { id: 'mood', label: 'Mood Swings', icon: Moon, category: 'symptom' as const },
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, category: 'symptom' as const },
  { id: 'cycle', label: 'Cycle Regularity', icon: Activity, category: 'goal' as const },
  { id: 'fertility', label: 'Fertility', icon: Sparkles, category: 'goal' as const },
  { id: 'weight', label: 'Weight & Metabolism', icon: Scale, category: 'goal' as const },
  { id: 'energy', label: 'Daily Energy', icon: Sun, category: 'goal' as const },
];

const MAX_SELECTION = 3;

export function PrioritySelector({ onNext, onBack }: PrioritySelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [customInput, setCustomInput] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalSelected = selectedIds.length + (isCustomSelected ? 1 : 0);
  const isMaxReached = totalSelected >= MAX_SELECTION;

  const handleToggle = useCallback((id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(pid => pid !== id));
      setScores(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else if (!isMaxReached) {
      setSelectedIds(prev => [...prev, id]);
      setScores(prev => ({ ...prev, [id]: 5 }));
    }
  }, [selectedIds, isMaxReached]);

  const handleCustomToggle = useCallback(() => {
    if (isCustomSelected) {
      setIsCustomSelected(false);
      setCustomInput('');
      setScores(prev => {
        const next = { ...prev };
        delete next['custom'];
        return next;
      });
    } else if (!isMaxReached) {
      setIsCustomSelected(true);
      setScores(prev => ({ ...prev, custom: 5 }));
    }
  }, [isCustomSelected, isMaxReached]);

  const handleScoreChange = useCallback((id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  }, []);

  const averageBloom = useMemo(() => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [scores]);

  const priorities = useMemo((): UserPriority[] => {
    const result: UserPriority[] = selectedIds.map(id => {
      const item = OPTIONS.find(o => o.id === id);
      return {
        id,
        label: item?.label || id,
        category: (item?.category || 'goal') as UserPriority['category'],
        happinessImpact: scores[id] ?? 5,
      };
    });

    if (isCustomSelected && customInput.trim().length > 0) {
      result.push({
        id: 'custom',
        label: customInput.trim(),
        category: 'custom',
        happinessImpact: scores['custom'] ?? 5,
      });
    }

    return result;
  }, [selectedIds, scores, customInput, isCustomSelected]);

  const canProceed = priorities.length > 0;

  const handleSaveAndContinue = async () => {
    if (!canProceed) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rows = priorities.map(p => ({
        user_id: user.id,
        priority_id: p.id,
        label: p.label,
        category: p.category,
        happiness_impact: p.happinessImpact,
      }));

      const { error } = await supabase.from('user_priorities').upsert(rows, {
        onConflict: 'user_id,priority_id',
      });

      if (error) throw error;

      onNext();
    } catch (err) {
      console.error('Failed to save priorities:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_priorities')
        .select('priority_id, label, category, happiness_impact')
        .eq('user_id', user.id);

      if (!data || data.length === 0) return;

      const ids: string[] = [];
      const loadedScores: Record<string, number> = {};

      for (const row of data) {
        if (row.priority_id === 'custom') {
          setIsCustomSelected(true);
          setCustomInput(row.label);
        } else {
          ids.push(row.priority_id);
        }
        loadedScores[row.priority_id] = row.happiness_impact;
      }

      setSelectedIds(ids);
      setScores(loadedScores);
    };

    loadExisting();
  }, []);

  const renderItem = (item: typeof OPTIONS[0]) => {
    const isSelected = selectedIds.includes(item.id);
    const isDisabled = !isSelected && isMaxReached;
    const Icon = item.icon;

    return (
      <motion.div
        key={item.id}
        layout
        initial={false}
        className={clsx(
          'border rounded-2xl p-4 transition-colors cursor-pointer relative overflow-hidden',
          isSelected
            ? 'border-sage-400 bg-sage-50'
            : isDisabled
              ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
              : 'border-slate-200 bg-white hover:border-sage-300',
        )}
        onClick={() => !isDisabled && handleToggle(item.id)}
      >
        <div className="flex items-center gap-3">
          <div className={clsx(
            'p-2 rounded-xl',
            isSelected ? 'bg-sage-200 text-sage-700' : 'bg-slate-100 text-slate-400',
          )}>
            <Icon size={18} />
          </div>
          <span className={clsx(
            'font-medium text-sm',
            isSelected ? 'text-sage-800' : 'text-slate-600',
          )}>
            {item.label}
          </span>
          {isSelected && <Check size={16} className="ml-auto text-sage-600" />}
        </div>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-4 mt-3 border-t border-sage-200/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-serif italic text-sage-700">
                    Happiness Impact
                  </label>
                  <MiniLotus progress={scores[item.id] ?? 5} />
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scores[item.id] ?? 5}
                  onChange={(e) => handleScoreChange(item.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-sage-500 mt-1 font-medium tracking-wider">
                  <span>None</span>
                  <span>Life Changing</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative">
      <div
        className="fixed w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-15 top-0 right-0"
        style={{ background: 'radial-gradient(circle, rgba(134,168,115,0.4) 0%, transparent 70%)' }}
      />

      <div className="sticky top-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-slate-100 px-6 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            {totalSelected} / {MAX_SELECTION}
          </span>
        </div>

        <h2 className="font-serif text-2xl text-slate-800 text-center mb-1">Your Priorities</h2>

        <BloomLotus progress={averageBloom} />
      </div>

      <div className="w-full max-w-md mx-auto px-6 pt-6 pb-32">
        <div className="space-y-6">
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Symptoms
            </h4>
            <div className="flex flex-col gap-3">
              {OPTIONS.filter(o => o.category === 'symptom').map(renderItem)}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Goals & Priorities
            </h4>
            <div className="flex flex-col gap-3">
              {OPTIONS.filter(o => o.category === 'goal').map(renderItem)}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Other
            </h4>
            <motion.div
              layout
              className={clsx(
                'border rounded-2xl p-4 transition-colors',
                isCustomSelected
                  ? 'border-sage-400 bg-sage-50'
                  : 'border-slate-200 bg-white',
                !isCustomSelected && isMaxReached && 'opacity-40',
              )}
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (!isCustomSelected && isMaxReached) return;
                  handleCustomToggle();
                }}
              >
                <div className={clsx(
                  'p-2 rounded-xl',
                  isCustomSelected ? 'bg-sage-200 text-sage-700' : 'bg-slate-100 text-slate-400',
                )}>
                  <Plus size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Add your own..."
                  disabled={!isCustomSelected}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder:text-slate-400 font-medium text-sm w-full"
                />
                {isCustomSelected && <Check size={16} className="ml-auto text-sage-600 flex-shrink-0" />}
              </div>

              <AnimatePresence>
                {isCustomSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-3 border-t border-sage-200/50">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-serif italic text-sage-700">
                          Happiness Impact
                        </label>
                        <MiniLotus progress={scores['custom'] ?? 5} />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={scores['custom'] ?? 5}
                        onChange={(e) => handleScoreChange('custom', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-sage-500 mt-1 font-medium tracking-wider">
                        <span>None</span>
                        <span>Life Changing</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-sm border-t border-slate-100 p-4 safe-area-inset-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSaveAndContinue}
            disabled={!canProceed || saving}
            className={clsx(
              'w-full py-4 rounded-2xl font-medium text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2',
              canProceed
                ? 'bg-slate-800 text-[#FDFBF7] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
              saving && 'opacity-60 cursor-not-allowed',
            )}
          >
            {saving ? (
              <span className="animate-pulse">Saving your priorities...</span>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-[0.15em]">
            Select 1-3 priorities to personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
}
