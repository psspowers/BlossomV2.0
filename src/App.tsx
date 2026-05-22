import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { useEffect, useState } from "react";
import { seedDatabase } from "./lib/seed";
import { ThemeProvider } from "./lib/themes/ThemeContext";
import { db, DEMO_PREVIEW_KEY, USER_DELETED_KEY } from "./lib/db";
import { supabase } from "./lib/supabase";
import { WelcomeStep } from "./components/onboarding/WelcomeStep";
import { AuthStep } from "./components/onboarding/AuthStep";
import { PrioritySelector } from "./components/onboarding/PrioritySelector";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfUse } from "./components/TermsOfUse";
import { ResetPassword } from "./components/onboarding/ResetPassword";
import { Sources } from "./components/Sources";
import type { Session } from "@supabase/supabase-js";
import { requestNotificationPermission, checkAndFireReminder } from "./lib/services/notificationService";

const queryClient = new QueryClient();

type OnboardingStep = 'welcome' | 'auth' | 'priorities';

const PUBLIC_PATHS = ['/privacy', '/terms', '/reset-password', '/sources'];

const AppInner = () => {
  const location = useLocation();
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Session retrieval error:', error);
        }
        setSession(currentSession);
      } catch (err) {
        console.error('[Auth] Failed to get session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setSession(newSession);
        return;
      }
      setSession(newSession);
      if (newSession && event !== 'PASSWORD_RECOVERY') {
        setOnboardingStep('priorities');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setOnboardingComplete(null);
      return;
    }

    const checkOnboarding = async () => {
      const settings = await db.settings.toCollection().first();
      const hasCompletedOnboarding = !!(settings?.priorities && settings.priorities.length > 0);
      setOnboardingComplete(hasCompletedOnboarding);
    };

    checkOnboarding();
  }, [session]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await db.delete();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      console.error('[App] Reset failed:', err);
      setError('Reset failed. Please clear browser data manually.');
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndFireReminder();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.open();

        const isInDemo = !!localStorage.getItem(DEMO_PREVIEW_KEY);
        if (!isInDemo) {
          await seedDatabase();
        }

        setSeeded(true);
      } catch (initError) {
        console.error('[App] Database initialization failed:', initError);
        const errorMessage = initError instanceof Error ? initError.message : 'Unknown error';
        setError(errorMessage);
        setSeeded(true);
      }
    };

    const troubleshootingTimer = setTimeout(() => {
      setShowTroubleshooting(true);
    }, 3000);

    initializeApp();

    return () => clearTimeout(troubleshootingTimer);
  }, []);

  // Public routes are always accessible regardless of auth state
  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/sources" element={<Sources />} />
      </Routes>
    );
  }

  if (isPasswordRecovery) {
    return <ResetPassword />;
  }

  if (!seeded || authLoading || (session && onboardingComplete === null)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-sage-600 text-xl font-serif font-medium mb-2">Blossom</div>
          <div className="text-slate-400 text-sm animate-pulse mb-4">
            {isResetting ? 'Resetting database...' : 'Preparing your sanctuary...'}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
              <div className="text-rose-600 text-sm font-medium mb-1">Something went wrong</div>
              <div className="text-rose-500 text-xs mb-3">{error}</div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white text-xs rounded-lg transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          )}

          {showTroubleshooting && !error && (
            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 text-left">
              <div className="text-slate-700 text-sm font-medium mb-2">Taking longer than usual?</div>
              <div className="text-slate-500 text-xs space-y-1">
                <p>Try refreshing the page or clearing browser data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!session) {
    if (onboardingStep === 'welcome') {
      return <WelcomeStep onNext={() => setOnboardingStep('auth')} />;
    }

    return (
      <AuthStep
        onNext={() => setOnboardingStep('priorities')}
        onBack={() => setOnboardingStep('welcome')}
      />
    );
  }

  if (!onboardingComplete) {
    return (
      <PrioritySelector
        onNext={() => {
          localStorage.removeItem(USER_DELETED_KEY);
          setOnboardingComplete(true);
          requestNotificationPermission();
        }}
        onBack={async () => {
          await supabase.auth.signOut();
          setOnboardingStep('welcome');
        }}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sources" element={<Sources />} />
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
);

export default App;
