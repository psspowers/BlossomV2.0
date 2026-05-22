import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Heart, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useDashboardPreferences } from '../lib/hooks/useDashboardPreferences';

interface DisclaimerGateProps {
  children: React.ReactNode;
}

export function DisclaimerGate({ children }: DisclaimerGateProps) {
  const { prefs, loading, update } = useDashboardPreferences();
  const [isAccepting, setIsAccepting] = useState(false);

  // Prevent visual layout shifts prior to preference load
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-sage-600 text-xl font-serif font-medium animate-pulse">
          Entering sanctuary...
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await update({ disclaimerAcknowledged: true });
    } catch (error) {
      console.error('[DisclaimerGate] Failed to persist consent:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const showGate = prefs.disclaimerAcknowledged === false;

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Section */}
              <div className="p-6 bg-white border-b border-stone-100 flex items-center gap-3">
                <div className="p-2 bg-sage-50 text-sage-700 rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-stone-800">Your Blossom Sanctuary</h3>
                  <p className="text-xs text-stone-500">Medical Disclaimer & Guidelines</p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-stone-600 leading-relaxed">
                <p>
                  Welcome to <strong>Blossom</strong>. We are committed to helping you understand, track, and support your body through your PCOS journey in a completely private, sovereign environment.
                </p>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                      Important Medical Notice
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Blossom is a self-monitoring companion tool. It is <strong>not</strong> a medical device, and it does <strong>not</strong> provide diagnostic assessments, clinical evaluations, or medical treatments.
                    </p>
                  </div>
                </div>

                <p>
                  All generated stats, tracking indicators, and seasonal wellness patterns are intended strictly for educational and self-monitoring purposes.
                </p>

                <p className="font-semibold text-stone-800">
                  By entering Blossom, you acknowledge and agree that:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li>You will not substitute recommendations from Blossom or its AI companion for professional medical advice, clinical evaluations, or therapeutic guidelines.</li>
                  <li>You should always consult with your primary healthcare practitioner, endocrinologist, or obstetrician-gynecologist prior to modifying your physical therapy, nutrition, or supplement regimens.</li>
                  <li>In the event of acute clinical symptoms or distress, you will seek immediate medical evaluation from qualified practitioners.</li>
                </ul>
              </div>

              {/* Action Area */}
              <div className="p-6 bg-stone-50 border-t border-stone-100 flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full py-4 bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white font-serif font-medium rounded-2xl transition-all shadow-md text-center flex items-center justify-center gap-2"
                >
                  <Heart size={16} className="fill-current" />
                  {isAccepting ? 'Acknowledging...' : 'I Understand & Accept'}
                </button>
                <p className="text-[10px] text-stone-400 text-center">
                  Acknowledgement is required before entering Blossom.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showGate && children}
    </>
  );
}
