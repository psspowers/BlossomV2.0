import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Check, CircleAlert as AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must include at least one number' };
    }
    if (password.length > 128) {
      return { valid: false, message: 'Password is too long (max 128 characters)' };
    }
    return { valid: true };
  };

  const handleResetPassword = async () => {
    setError(null);

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.message || 'Invalid password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleResetPassword();
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#FDFBF7]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="text-emerald-600" size={40} strokeWidth={3} />
          </div>
          <h2 className="font-serif text-3xl text-slate-800 mb-3">Password Updated</h2>
          <p className="text-slate-600 mb-2">Your password has been successfully changed.</p>
          <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#FDFBF7]">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
              <ShieldCheck className="text-sage-600" size={24} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-slate-800">New Password</h2>
              <p className="text-slate-500 text-sm">Choose a strong password</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password (min 8 chars, 1 number)"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 text-rose-600 text-xs mt-4 bg-rose-50 border border-rose-100 p-3 rounded-xl"
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          onClick={handleResetPassword}
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full mt-8 bg-slate-800 text-[#FDFBF7] py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex justify-center items-center text-sm"
        >
          {loading ? (
            <span className="animate-pulse">Updating Password...</span>
          ) : (
            'Set New Password'
          )}
        </button>

        <div className="bg-sage-50/50 border border-sage-100 p-4 rounded-xl mt-6">
          <p className="text-xs text-sage-800/80 leading-relaxed">
            <strong>Password Requirements:</strong><br />
            • At least 8 characters long<br />
            • Must include at least one number<br />
            • Avoid common passwords or passwords used on other sites
          </p>
        </div>
      </div>
    </div>
  );
}
