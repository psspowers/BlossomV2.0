import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { useEffect, useState } from "react";
import { seedDatabase } from "./lib/seed";
import { ThemeProvider } from "./lib/themes/ThemeContext";
import { db, DEMO_PREVIEW_KEY, USER_DELETED_KEY } from "./lib/db";
import { WelcomeStep } from "./components/onboarding/WelcomeStep";
import { NameStep } from "./components/onboarding/NameStep";
import { PrioritySelector } from "./components/onboarding/PrioritySelector";

const queryClient = new QueryClient();

type OnboardingStep = 'welcome' | 'name' | 'priorities';

const App = () => {
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [hasPriorities, setHasPriorities] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const profile = await db.settings.get('user-profile');
        setHasProfile(!!profile);

        const prioritiesCount = await db.settings.where('id').startsWith('priority-').count();
        setHasPriorities(prioritiesCount > 0);
      } catch (err) {
        console.error('[App] Failed to check onboarding status:', err);
        setHasProfile(false);
        setHasPriorities(false);
      }
    };

    checkOnboarding();
  }, []);

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

  if (!seeded || hasProfile === null || hasPriorities === null) {
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

  if (!hasProfile) {
    if (onboardingStep === 'welcome') {
      return <WelcomeStep onNext={() => setOnboardingStep('name')} />;
    }

    if (onboardingStep === 'name') {
      return (
        <NameStep
          onNext={() => {
            setHasProfile(true);
            setOnboardingStep('priorities');
          }}
          onBack={() => setOnboardingStep('welcome')}
        />
      );
    }
  }

  if (!hasPriorities) {
    return (
      <PrioritySelector
        onNext={() => {
          localStorage.removeItem(USER_DELETED_KEY);
          setHasPriorities(true);
        }}
        onBack={() => {
          setOnboardingStep('name');
          setHasProfile(false);
        }}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
