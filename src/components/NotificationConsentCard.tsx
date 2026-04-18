import { motion, AnimatePresence } from 'framer-motion';
import { requestWithInAppConsent } from '../lib/services/notificationService';

interface NotificationConsentCardProps {
  onDismiss: () => void;
}

export function NotificationConsentCard({ onDismiss }: NotificationConsentCardProps) {
  const handleYes = async () => {
    await requestWithInAppConsent();
    localStorage.setItem('blossom_notification_prompted', '1');
    onDismiss();
  };

  const handleLater = () => {
    localStorage.setItem('blossom_notification_dismissed', '1');
    localStorage.setItem('blossom_notification_prompted', '1');
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-md mx-4 mb-8 rounded-3xl p-6 shadow-2xl"
          style={{
            background: 'rgb(24,24,27)',
            border: '1px solid rgba(244,114,182,0.2)',
            pointerEvents: 'auto',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl flex-shrink-0">🌸</span>
            <div>
              <h3 className="text-base font-serif font-semibold text-white mb-1">
                Stay connected to your journey
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(161,161,170)' }}>
                Blossom can send gentle reminders to help you log and check in. Three times a day —
                morning, midday, and evening.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleYes}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: 'rgb(236,72,153)',
                color: 'white',
              }}
            >
              Yes please 🌸
            </button>
            <button
              onClick={handleLater}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: 'transparent',
                color: 'rgb(161,161,170)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
