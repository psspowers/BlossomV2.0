import { useState } from 'react';
import { Info, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_GLOSSARY } from '../../lib/data/glossary';

interface InfoPopoverProps {
  termKey: string;
  onOpenEducation: (sectionId: string) => void;
}

export function InfoPopover({ termKey, onOpenEducation }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const term = APP_GLOSSARY[termKey];

  if (!term) return null;

  const handleLearnMore = () => {
    setOpen(false);
    onOpenEducation(term.educationId);
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="p-2 -m-2 inline-flex items-center justify-center focus:outline-none"
        aria-label={`Learn about ${term.title}`}
      >
        <Info size={14} className="text-stone-300" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7] rounded-t-2xl border-t border-stone-200 shadow-xl px-6 pt-5 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-serif font-semibold text-slate-800">
                  {term.title}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 -m-1 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {term.brief}
              </p>

              <button
                onClick={handleLearnMore}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sage-50 border border-sage-200 text-sage-700 text-sm font-medium hover:bg-sage-100 transition-colors"
              >
                <BookOpen size={15} />
                Learn more in the manual
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
