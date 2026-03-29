import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, CircleAlert as AlertCircle, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PasswordResetModalProps {
  onClose: () => void;
}

type ResetState = 'input' | 'sending' | 'sent' | 'error';

export function PasswordResetModal({ onClose }: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ResetState>('input');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendReset = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address.');
      setState('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setState('error');
      return;
    }

    setState('sending');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setState('sent');
    } catch (err) {
      console.error('[PasswordReset] Error:', err);
      setErrorMessage(
        'Unable to send reset email. Please check your email address and try again.'
      );
      setState('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state === 'input') {
      handleSendReset();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {state === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                  <Mail className="text-sage-600" size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-slate-800">Reset Password</h3>
                  <p className="text-xs text-slate-500">We'll email you a reset link</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    inputMode="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
                    autoFocus
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>

                <button
                  onClick={handleSendReset}
                  className="w-full bg-slate-800 text-[#FDFBF7] py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex justify-center items-center gap-2 text-sm"
                >
                  <Send size={16} />
                  Send Reset Link
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-6">
                You'll receive an email with instructions to reset your password.
              </p>
            </motion.div>
          )}

          {state === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
                <Send className="text-sage-600 animate-pulse" size={32} />
              </div>
              <h3 className="font-serif text-xl text-slate-800 mb-2">Sending...</h3>
              <p className="text-sm text-slate-500">Please wait a moment</p>
            </motion.div>
          )}

          {state === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="text-emerald-600" size={32} strokeWidth={3} />
              </div>
              <h3 className="font-serif text-xl text-slate-800 mb-2">Check Your Email</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-left mb-6">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Didn't receive it?</strong> Check your spam folder. The email should arrive within 5 minutes.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 text-[#FDFBF7] py-3 rounded-2xl font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="text-rose-600" size={32} />
              </div>
              <h3 className="font-serif text-xl text-slate-800 mb-2">Unable to Send</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {errorMessage}
              </p>

              <button
                onClick={() => setState('input')}
                className="w-full bg-slate-800 text-[#FDFBF7] py-3 rounded-2xl font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
