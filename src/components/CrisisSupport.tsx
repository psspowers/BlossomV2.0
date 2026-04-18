import { motion } from 'framer-motion';
import { Heart, Phone } from 'lucide-react';

interface CrisisSupportProps {
  onDismiss: () => void;
}

const RESOURCES = [
  { label: 'Thailand Crisis Line', number: '1323', flag: '🇹🇭' },
  { label: 'International Association for Suicide Prevention', number: 'https://www.iasp.info/resources/Crisis_Centres/', flag: '🌍' },
];

export function CrisisSupport({ onDismiss }: CrisisSupportProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'rgba(253, 242, 248, 0.92)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="w-full max-w-lg mx-auto rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #fff5f8 0%, #fce7f3 100%)',
          border: '1.5px solid rgba(236,72,153,0.15)',
          borderBottom: 'none',
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(236,72,153,0.12)' }}
          >
            <Heart className="w-7 h-7" style={{ color: 'rgb(219,39,119)' }} />
          </div>
        </div>

        <h2
          className="text-xl font-serif font-semibold text-center mb-3 leading-snug"
          style={{ color: 'rgb(131,24,67)' }}
        >
          You matter. This feeling won't last forever. 💛
        </h2>

        <p
          className="text-sm text-center leading-relaxed mb-6"
          style={{ color: 'rgb(157,23,77)' }}
        >
          Whatever you're carrying right now, you don't have to carry it alone.
          Reaching out is an act of courage — and there are people ready to listen.
        </p>

        <div className="space-y-3 mb-6">
          {RESOURCES.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(236,72,153,0.2)',
              }}
            >
              <span className="text-xl flex-shrink-0">{r.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'rgb(131,24,67)' }}>
                  {r.label}
                </p>
                <p className="text-sm font-mono font-bold" style={{ color: 'rgb(219,39,119)' }}>
                  {r.number}
                </p>
              </div>
              {/^\d/.test(r.number) && (
                <a
                  href={`tel:${r.number}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(236,72,153,0.15)', color: 'rgb(219,39,119)' }}
                  aria-label={`Call ${r.label}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>

        <p
          className="text-xs text-center leading-relaxed mb-6"
          style={{ color: 'rgb(190,114,150)' }}
        >
          Blossom Support is here alongside these resources — not instead of them.
          Your wellbeing always comes first.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-full text-sm font-semibold transition-all"
          style={{
            background: 'rgba(236,72,153,0.1)',
            color: 'rgb(157,23,77)',
            border: '1px solid rgba(236,72,153,0.25)',
          }}
        >
          I'm okay for now — take me back
        </button>
      </motion.div>
    </motion.div>
  );
}
