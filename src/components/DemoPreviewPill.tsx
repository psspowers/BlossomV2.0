import { motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useState } from 'react';
import { restoreUserLogs } from '../lib/db';

interface DemoPreviewPillProps {
  personaName: string;
  onReturn: () => void;
}

const PERSONA_SHORT: Record<string, string> = {
  Emma: 'Emma',
  Sophia: 'Sophia',
  Olivia: 'Olivia',
  Ava: 'Ava',
  Isabella: 'Isabella',
};

export function DemoPreviewPill({ personaName }: DemoPreviewPillProps) {
  const label = PERSONA_SHORT[personaName] || personaName;
  const [restoring, setRestoring] = useState(false);

  const handleReturn = async () => {
    setRestoring(true);
    await restoreUserLogs();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      className="fixed bottom-28 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-800/95 backdrop-blur-sm text-white rounded-full shadow-2xl pointer-events-auto"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
      >
        <Eye className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-medium">
          {restoring ? 'Restoring...' : `Demo: ${label}`}
        </span>
        {!restoring && (
          <button
            onClick={handleReturn}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 transition-colors ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
