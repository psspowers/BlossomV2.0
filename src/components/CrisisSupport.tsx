import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ExternalLink } from 'lucide-react';

interface CrisisSupportProps {
  onClose: () => void;
}

const WARMLINES = [
  {
    label: 'International Association for Suicide Prevention',
    url: 'https://www.iasp.info/resources/Crisis_Centres/'
  },
  {
    label: 'Crisis Text Line (US) — Text HOME to 741741',
    url: 'https://www.crisistextline.org/'
  }
];

export function CrisisSupport({ onClose }: CrisisSupportProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(254, 242, 242, 0.92)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100"
        >
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 px-8 pt-10 pb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-8 h-8 text-rose-400" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-rose-900 mb-3">
              You matter so much.
            </h2>
            <p className="text-rose-700 leading-relaxed text-base">
              It sounds like you are carrying something very heavy right now. That pain is real, and you deserve support from someone who can truly be there for you.
            </p>
          </div>

          <div className="px-8 py-6 space-y-4">
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
              <p className="text-sm font-semibold text-rose-800 mb-1">Right now, please reach out to:</p>
              <p className="text-xs text-rose-700 leading-relaxed mb-4">
                A trained listener is available around the clock. You do not have to carry this alone.
              </p>
              {WARMLINES.map((line) => (
                <a
                  key={line.label}
                  href={line.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-rose-600 hover:text-rose-800 underline underline-offset-2 mb-2 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  {line.label}
                </a>
              ))}
            </div>

            <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
              <p className="text-sm text-pink-800 leading-relaxed italic font-serif">
                "Reaching out is one of the bravest things you can do. Your life has value — exactly as you are."
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={onClose}
                className="w-full py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold rounded-full transition-all text-sm"
              >
                I'm okay — take me back
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3 h-3" />
                Keep it private
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
