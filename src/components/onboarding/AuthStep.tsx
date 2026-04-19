import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, CircleAlert as AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck, CircleCheck as CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';

interface AuthStepProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

type AuthMode = 'signup' | 'signin' | 'reset';

export function AuthStep({ onNext, onBack }: AuthStepProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signup');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const detectExistingProfile = async () => {
      try {
        const count = await db.settings.count();
        if (count > 0) {
          setMode('signin');
        }
      } catch (err) {
        console.error('[Auth] Could not check local profile:', err);
      }
    };
    detectExistingProfile();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (signUpError) throw signUpError;
        if (data?.user) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data?.session) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onNext(email);
    } catch (err: unknown) {
      console.error('[Auth] Authentication error:', err);
      let message = 'Authentication failed. Please try again.';

      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password.';
        } else if (err.message.includes('User already registered')) {
          message = 'This email is already registered. Try signing in.';
          setMode('signin');
        } else if (err.message.includes('Email not confirmed')) {
          message = 'Please check your email to confirm your account.';
        } else {
          message = err.message;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'reset') handlePasswordReset();
      else handleAuth();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
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
            {mode === 'signup' ? 'Secure Space' : mode === 'signin' ? 'Welcome Back' : 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {mode === 'signup'
              ? 'Create your private vault to store your patterns. Your data is sovereign.'
              : mode === 'signin'
              ? 'Enter your vault to continue your journey.'
              : 'Enter your email and we\'ll send you a link to reset your password.'}
          </p>

          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex gap-3 mt-6"
            >
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                <strong>Privacy Promise:</strong> We store only your email & password (hashed) to secure your account.
                All your health data—logs, symptoms, priorities—stays on this device. We cannot see it.
              </p>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'reset' && resetSent ? (
            <motion.div
              key="reset-sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex gap-3 mb-6"
            >
              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-emerald-800 mb-1">Check your inbox</p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don't see it.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-4" onKeyDown={handleKeyDown}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    inputMode="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>

                {mode !== 'reset' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400 text-slate-800 placeholder:text-slate-300 transition-all text-sm"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}
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
                onClick={mode === 'reset' ? handlePasswordReset : handleAuth}
                disabled={loading}
                className="w-full mt-8 bg-slate-800 text-[#FDFBF7] py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex justify-center items-center text-sm"
              >
                {loading ? (
                  <span className="animate-pulse tracking-wide">
                    {mode === 'signup' ? 'Creating Vault...' : mode === 'signin' ? 'Opening Vault...' : 'Sending Link...'}
                  </span>
                ) : (
                  mode === 'signup' ? 'Create Private Account' : mode === 'signin' ? 'Sign In' : 'Send Reset Link'
                )}
              </button>

              <div className="mt-6 text-center space-y-3">
                {mode === 'signin' && (
                  <div>
                    <button
                      onClick={() => { setMode('reset'); setError(null); setResetSent(false); }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                <div>
                  {mode === 'reset' ? (
                    <button
                      onClick={() => { setMode('signin'); setError(null); setResetSent(false); }}
                      className="text-sm text-slate-400 hover:text-sage-600 transition-colors"
                    >
                      Back to sign in
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); }}
                      className="text-sm text-slate-400 hover:text-sage-600 transition-colors"
                    >
                      {mode === 'signup'
                        ? 'Already have an account? Sign in'
                        : 'New here? Create an account'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'reset' && resetSent && (
          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode('signin'); setResetSent(false); setError(null); }}
              className="text-sm text-slate-400 hover:text-sage-600 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-[0.15em]">
          We do not sell your data. Ever.
        </p>
      </div>
    </div>
  );
}
