import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { motion } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const analysis = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  if (!analysis) return null;

  const score = analysis.score;
  const feedback = analysis.feedback;

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0: return 'bg-rose-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-600';
      default: return 'bg-slate-200';
    }
  };

  const suggestion = feedback.suggestions[0] || feedback.warning;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-2"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Password Strength</span>
        <span className={`font-medium ${
          score <= 1 ? 'text-rose-600' :
          score === 2 ? 'text-amber-600' :
          'text-emerald-600'
        }`}>
          {getStrengthLabel(score)}
        </span>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: level * 0.05 }}
            className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: score >= level ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: level * 0.05 }}
              className={`h-full ${score >= level ? getStrengthColor(score) : ''}`}
            />
          </motion.div>
        ))}
      </div>

      {suggestion && score < 3 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-slate-500 leading-relaxed"
        >
          💡 {suggestion}
        </motion.p>
      )}

      {score >= 3 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-emerald-600 leading-relaxed"
        >
          ✓ Great password! This will keep your account secure.
        </motion.p>
      )}
    </motion.div>
  );
}
