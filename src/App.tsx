
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { useEffect, useState } from "react";
import { seedDatabase } from "./lib/seed";
import { ThemeProvider } from "./lib/themes/ThemeContext";
import { db } from "./lib/db";

const queryClient = new QueryClient();

const App = () => {
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      console.log('[App] Resetting database...');

      await db.delete();
      localStorage.clear();

      console.log('[App] Database reset complete. Reloading...');
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
        console.log('[App] Starting database initialization...');

        await db.open();
        console.log('[App] Database opened successfully');

        await seedDatabase();
        console.log('[App] Database initialization complete');
        setSeeded(true);
      } catch (error) {
        console.error('[App] Database initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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

  if (!seeded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-teal-400 text-xl font-medium mb-2">Blossom</div>
          <div className="text-slate-400 text-sm animate-pulse mb-4">
            {isResetting ? 'Resetting database...' : 'Initializing database...'}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <div className="text-red-400 text-sm font-medium mb-1">Database Error</div>
              <div className="text-red-300 text-xs mb-3">{error}</div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-800 text-white text-xs rounded transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          )}

          {showTroubleshooting && !error && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
              <div className="text-slate-300 text-sm font-medium mb-2">Taking longer than usual?</div>
              <div className="text-slate-400 text-xs space-y-1">
                <p>• Check browser console (F12) for errors</p>
                <p>• Try refreshing the page (Ctrl/Cmd + R)</p>
                <p>• Make sure cookies/storage is enabled</p>
                <p>• Try a different browser</p>
              </div>
            </div>
          )}
        </div>
      </div>
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
