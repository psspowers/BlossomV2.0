import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { db, WhisperEntry } from '../lib/db';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface WhisperHistoryProps {
  onClose: () => void;
}

const CARD_COLORS = [
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-rose-50', text: 'text-rose-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-sky-50', text: 'text-sky-500' },
  { bg: 'bg-stone-50', text: 'text-stone-500' },
];

function colorForIndex(i: number) {
  return CARD_COLORS[i % CARD_COLORS.length];
}

function relativeDay(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function WhisperHistory({ onClose }: WhisperHistoryProps) {
  const [whispers, setWhispers] = useState<WhisperEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.whispers
      .orderBy('savedAt')
      .reverse()
      .toArray()
      .then((rows) => {
        setWhispers(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="whisper-history-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          key="whisper-history-panel"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full sm:w-[420px] max-h-[85vh] bg-gradient-to-b from-[#FDFBF7] to-[#FFF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h2 className="font-serif text-lg font-semibold text-stone-800">Whisper History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {loading && (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
              </div>
            )}

            {!loading && whispers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <MessageCircle className="w-8 h-8 text-rose-300" />
                </div>
                <p className="font-serif text-stone-700 text-base">No whispers yet</p>
                <p className="text-stone-400 text-sm max-w-[240px]">
                  Your daily wisdom cards will appear here as you use the app each day.
                </p>
              </div>
            )}

            {!loading && whispers.map((w, i) => {
              const color = colorForIndex(i);
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/70 transition-colors"
                >
                  <div className={`p-2 ${color.bg} ${color.text} rounded-xl mt-0.5 shrink-0`}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-stone-400 font-medium">{relativeDay(w.date)}</span>
                      <span className="text-[10px] text-stone-300 bg-stone-100 rounded-full px-1.5 py-0.5">{w.category}</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-snug">"{w.text}"</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-stone-100 text-center">
            <p className="text-[10px] text-stone-400">Whispers are stored privately on your device only</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
