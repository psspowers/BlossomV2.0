import { usePlantState, useInterfaceMode } from '../lib/hooks/useInsights';
import { BioOrb } from './BioOrb';
import { WellnessRadar } from './WellnessRadar';
import { CycleContext } from './CycleContext';
import { Insights } from './Insights';
import { DailyWisdom } from './DailyWisdom';
import { SettingsModal } from './SettingsModal';
import { Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { DailyLog } from './DailyLog';

export function Dashboard() {
  const { plantState, loading: plantLoading } = usePlantState();
  const { themeState, loading: themeLoading } = useInterfaceMode();
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (plantLoading || themeLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const fabColors = {
    nurture: 'bg-purple-400 hover:bg-purple-300',
    steady: 'bg-teal-400 hover:bg-teal-300',
    thrive: 'bg-amber-400 hover:bg-amber-300'
  };

  const fabGlow = {
    nurture: '0 0 30px rgba(192, 132, 252, 0.5)',
    steady: '0 0 30px rgba(45, 212, 191, 0.5)',
    thrive: '0 0 30px rgba(251, 191, 36, 0.5)'
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.1), transparent 50%)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Blossom
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your PCOS wellness companion
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
        </header>

        <BioOrb health={plantState.health} streak={plantState.streak} mode={themeState.mode} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="glass-card h-80">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-sm font-medium text-white/90 uppercase tracking-wide">
                Cycle Context
              </h2>
            </div>
            <CycleContext />
          </div>

          <div className="glass-card h-80">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-sm font-medium text-white/90 uppercase tracking-wide">
                Wellness Balance
              </h2>
            </div>
            <WellnessRadar />
          </div>

          <DailyWisdom />
        </div>

        <Insights />
      </div>

      <button
        onClick={() => setShowDailyLog(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full ${fabColors[themeState.mode]} transition-all shadow-lg hover:shadow-xl flex items-center justify-center group hover:scale-105 z-50`}
        style={{
          boxShadow: fabGlow[themeState.mode]
        }}
        aria-label="Add daily log entry"
      >
        <Plus className="w-8 h-8 text-white drop-shadow-lg group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {showDailyLog && <DailyLog onClose={() => setShowDailyLog(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
