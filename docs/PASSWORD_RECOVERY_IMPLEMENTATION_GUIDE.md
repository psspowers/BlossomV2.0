# Password Recovery Implementation Guide

**Target Completion**: 2-3 weeks
**Priority**: CRITICAL
**Effort**: 12 hours development + 2 hours testing

---

## Overview

This guide provides step-by-step implementation instructions for adding password recovery to the Blossom PCOS Companion app.

---

## Phase 1: Strengthen Password Requirements (IMMEDIATE)

### Step 1.1: Update Password Validation

**File**: `src/components/onboarding/AuthStep.tsx`

**Current Code** (Line 27-30):
```typescript
if (mode === 'signup' && password.length < 6) {
  setError('Password must be at least 6 characters.');
  return;
}
```

**Replace With**:
```typescript
if (mode === 'signup') {
  if (password.length < 8) {
    setError('Password must be at least 8 characters.');
    return;
  }
  if (!/[0-9]/.test(password)) {
    setError('Password must include at least one number.');
    return;
  }
  if (password.length > 128) {
    setError('Password is too long (maximum 128 characters).');
    return;
  }
}
```

**Test**:
- Try "pass" → Should show "8 characters" error
- Try "password" → Should show "include one number" error
- Try "password1" → Should succeed

---

### Step 1.2: Enable Leaked Password Protection

**Action**: Manual configuration in Supabase Dashboard

**Steps**:
1. Navigate to: https://supabase.com/dashboard/project/beasajhtkdfppefagpla/auth/providers
2. Click "Email" provider
3. Scroll to "Password Protection" section
4. Toggle ON "Enable leaked password protection"
5. Click "Save"

**Verification**:
Try signing up with "password123" → Should be blocked if it's in the breach database

---

## Phase 2: Add "Forgot Password?" Link

### Step 2.1: Add State Management

**File**: `src/components/onboarding/AuthStep.tsx`

**Add to existing state** (after line 19):
```typescript
const [showResetModal, setShowResetModal] = useState(false);
```

---

### Step 2.2: Add Link Below Password Input

**File**: `src/components/onboarding/AuthStep.tsx`

**Insert After** the password input div (after line 182):
```typescript
{mode === 'signin' && (
  <div className="text-right mt-2">
    <button
      type="button"
      onClick={() => setShowResetModal(true)}
      className="text-xs text-sage-600 hover:text-sage-700 transition-colors underline decoration-dotted underline-offset-2"
    >
      Forgot password?
    </button>
  </div>
)}
```

---

## Phase 3: Create Password Reset Modal Component

### Step 3.1: Create New Component File

**File**: `src/components/onboarding/PasswordResetModal.tsx`

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, AlertCircle, Send } from 'lucide-react';
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
        {/* Close Button */}
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
```

---

### Step 3.2: Import Modal in AuthStep

**File**: `src/components/onboarding/AuthStep.tsx`

**Add Import** (top of file):
```typescript
import { PasswordResetModal } from './PasswordResetModal';
```

**Add Modal Render** (before closing div):
```typescript
<AnimatePresence>
  {showResetModal && (
    <PasswordResetModal onClose={() => setShowResetModal(false)} />
  )}
</AnimatePresence>
```

---

## Phase 4: Create Password Reset Page

### Step 4.1: Create Reset Password Page Component

**File**: `src/components/ResetPasswordPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    // Check if we have a valid session from the reset link
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

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.message || 'Invalid password');
      return;
    }

    // Check passwords match
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

      // Redirect to dashboard after 2 seconds
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
```

---

### Step 4.2: Add Route to App

**File**: `src/App.tsx`

**Add Import**:
```typescript
import { ResetPasswordPage } from './components/ResetPasswordPage';
```

**Add Route** (in your router configuration):
```typescript
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

---

## Phase 5: Configure Email Templates (Optional)

### Customize Reset Email in Supabase

1. Navigate to: https://supabase.com/dashboard/project/beasajhtkdfppefagpla/auth/templates
2. Select "Reset Password" template
3. Customize the email copy to match your brand
4. Update sender name from "Supabase" to "Blossom"

**Recommended Email Template**:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for your Blossom account.</p>
<p>Click the button below to create a new password:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #2d3748; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
<p style="margin-top: 20px; font-size: 14px; color: #718096;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
<p style="font-size: 12px; color: #a0aec0;">This link will expire in 1 hour.</p>
```

---

## Testing Checklist

### End-to-End Password Recovery Test

- [ ] **Step 1**: Navigate to sign-in page
- [ ] **Step 2**: Click "Forgot password?" link
- [ ] **Step 3**: Enter email in modal, click "Send Reset Link"
- [ ] **Step 4**: Verify "Check Your Email" success state appears
- [ ] **Step 5**: Check email inbox (wait up to 5 min)
- [ ] **Step 6**: Open reset email, click reset link
- [ ] **Step 7**: Verify redirect to /reset-password page
- [ ] **Step 8**: Enter new password (test validation):
  - Try "short" → Should show "8 characters" error
  - Try "longpassword" → Should show "include number" error
  - Try "password123" → Should succeed
- [ ] **Step 9**: Confirm password in second field
  - Try mismatched password → Should show "do not match" error
  - Enter matching password → Should succeed
- [ ] **Step 10**: Click "Set New Password"
- [ ] **Step 11**: Verify success message and redirect to dashboard
- [ ] **Step 12**: Sign out, sign back in with new password
- [ ] **Step 13**: Verify old password no longer works

### Edge Cases to Test

- [ ] **Expired link**: Wait 61 minutes after requesting reset, try to use link → Should show error
- [ ] **Already used link**: Complete reset, try to reuse same link → Should show error
- [ ] **Invalid email**: Enter non-existent email → Should still show "Check Your Email" (security by obscurity)
- [ ] **Email deliverability**: Test with Gmail, Outlook, Yahoo, ProtonMail
- [ ] **Mobile responsive**: Test modal and reset page on mobile viewport
- [ ] **Keyboard navigation**: Tab through form, press Enter to submit

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed by second developer
- [ ] Email templates configured in Supabase
- [ ] Leaked password protection enabled
- [ ] Documentation updated (Help/FAQ section)

### Deployment Steps

1. [ ] Deploy to staging environment
2. [ ] Run full E2E test on staging
3. [ ] Test email delivery from staging
4. [ ] Deploy to production
5. [ ] Monitor error logs for 24 hours
6. [ ] Check Supabase Auth logs for reset requests

### Post-Deployment

- [ ] Monitor password reset completion rate (target: >70%)
- [ ] Check support ticket volume (expect 30% reduction in password issues)
- [ ] Gather user feedback
- [ ] Update analytics dashboard with new metrics

---

## Rollback Plan

If critical issues occur:

1. **Disable "Forgot Password?" link** (comment out in AuthStep.tsx)
2. **Remove /reset-password route** (comment out in App.tsx)
3. **Deploy hotfix** within 1 hour
4. **Notify users** via in-app banner: "Password recovery temporarily unavailable"

**Rollback does NOT affect**:
- Existing user accounts
- Current sessions
- Stronger password requirements (keep these)

---

## Success Metrics (30-Day)

| Metric | Baseline (Current) | Target (After Implementation) |
|--------|-------------------|-------------------------------|
| Users locked out | ~5% of users | <0.5% |
| Password reset requests | 0 | Baseline (track) |
| Password reset completion rate | N/A | >70% |
| Support tickets (password issues) | High | -30% |
| Weak passwords created | ~60% | <10% |
| Average password strength (zxcvbn) | 1.2/4 | >3.0/4 |

---

## Support Documentation

Add to Help/FAQ section:

**Q: I forgot my password. How do I reset it?**
A: On the sign-in page, click "Forgot password?" below the password field. Enter your email address and we'll send you a link to create a new password. The link expires after 1 hour.

**Q: I didn't receive the password reset email.**
A: Check your spam folder. The email should arrive within 5 minutes. If you still don't see it, try requesting a new reset link. Make sure you're using the same email address you signed up with.

**Q: The password reset link says it's expired.**
A: Reset links expire after 1 hour for security. Click "Forgot password?" again to request a new link.

**Q: What are the password requirements?**
A: Your password must be at least 8 characters long and include at least one number. We also check your password against known data breaches to keep your account secure.

---

## Questions or Issues?

- Review the main analysis: `docs/AUTH_SYSTEM_ANALYSIS.md`
- Check Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase support: https://supabase.com/support
- File issues in project tracker

---

**Document Version**: 1.0
**Last Updated**: March 29, 2026
**Estimated Completion**: 2-3 weeks
