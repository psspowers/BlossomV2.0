import { motion } from 'framer-motion';
import { Eye, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { restoreUserLogs } from '../lib/db';

interface DemoPreviewPillProps {
  personaName: string;
  onReturn: () => void;
}

const PERSONA_LABELS: Record<string, string> = {
  Emma: 'Emma (Insulin Resistant)',
  Sophia: 'Sophia (Adrenal)',
  Olivia: 'Olivia (Inflammatory)',
  Ava: 'Ava (Post-Pill)',
  Isabella: 'Isabella (Lean)',
};

export function DemoPreviewPill({ personaName }: DemoPreviewPillProps) {
  const label = PERSONA_LABELS[personaName] || personaName;
  const [restoring, setRestoring] = useState(false);

  const handleReturn = async () => {
    setRestoring(true);
    await restoreUserLogs();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60]"
    >
      <button
        onClick={handleReturn}
        disabled={restoring}
        className="flex items-center gap-3 px-5 py-3 bg-stone-800/95 backdrop-blur-sm text-white rounded-full shadow-2xl hover:bg-stone-700 transition-all group disabled:opacity-70"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
      >
        <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">
          {restoring ? 'Restoring...' : `Viewing: ${label}`}
        </span>
        {!restoring && (
          <span className="flex items-center gap-1 text-xs text-stone-300 group-hover:text-white transition-colors border-l border-stone-600 pl-3 ml-1">
            <ArrowLeft className="w-3 h-3" />
            Return
          </span>
        )}
      </button>
    </motion.div>
  );
}
