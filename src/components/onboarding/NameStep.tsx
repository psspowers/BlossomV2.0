import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '../../lib/db';

interface NameStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function NameStep({ onNext, onBack }: NameStepProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await db.settings.clear();
      await db.settings.add({
        id: 'user-profile',
        userName: name.trim(),
        createdAt: new Date().toISOString(),
      });

      await new Promise(resolve => setTimeout(resolve, 300));
      onNext();
    } catch (err) {
      console.error('[NameStep] Failed to save profile:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#FDFBF7] relative overflow-hidden">
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-20 top-1/4"
        style={{ background: 'radial-gradient(circle, rgba(134,168,115,0.3) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img
          src="/logo-icon.png"
          alt=""
          className="w-[500px] h-[500px] object-contain opacity-[0.18]"
        />
      </motion.div>

      <div className="w-full max-w-sm relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-sm mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-8"
        >
          <h2 className="font-serif text-3xl text-slate-800 mb-2">
            Your Safe Space
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            What should we call you? Your data lives only on this device. No cloud. No tracking.
          </p>
        </motion.div>

        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
              autoComplete="name"
              autoFocus
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-rose-600 text-xs mt-4 bg-rose-50 border border-rose-100 p-3 rounded-xl"
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 bg-slate-800 text-[#FDFBF7] py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex justify-center items-center text-sm"
        >
          {loading ? (
            <span className="animate-pulse tracking-wide">
              Initializing Safe Space...
            </span>
          ) : (
            'Initialize Safe Space'
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-[0.15em]">
          Your story is yours, alone.
        </p>
      </div>
    </div>
  );
}
