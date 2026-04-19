import { motion } from 'framer-motion';
import { Plus, MessageCircleHeart } from 'lucide-react';

interface ActionDockProps {
  mode: 'nurture' | 'steady' | 'thrive';
  onLogDay: () => void;
  onAskBlossom: () => void;
  lastAction: 'log' | 'ask';
}

const modeAccent: Record<'nurture' | 'steady' | 'thrive', string> = {
  nurture: 'bg-lavender-400 hover:bg-lavender-300',
  steady: 'bg-sage-500 hover:bg-sage-400',
  thrive: 'bg-terracotta-400 hover:bg-terracotta-300',
};

export function ActionDock({ mode, onLogDay, onAskBlossom, lastAction }: ActionDockProps) {
  const primary = modeAccent[mode];

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary actions"
    >
      <div className="mx-auto max-w-xl px-4 pb-3">
        <div className="flex items-stretch gap-2 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-2">
          <button
            onClick={onLogDay}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium text-sm transition-all ${primary} ${
              lastAction === 'log' ? 'ring-2 ring-offset-2 ring-offset-white ring-sage-200' : ''
            }`}
            aria-label="Log today"
          >
            <Plus className="w-4 h-4" />
            <span>Log Today</span>
          </button>
          <button
            onClick={onAskBlossom}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-sm border border-rose-200 transition-all ${
              lastAction === 'ask' ? 'ring-2 ring-offset-2 ring-offset-white ring-rose-200' : ''
            }`}
            aria-label="Ask Blossom"
          >
            <MessageCircleHeart className="w-4 h-4" />
            <span>Ask Blossom</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
