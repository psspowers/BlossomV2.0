import { usePlantState, useInterfaceMode } from '../lib/hooks/useInsights';
import { WellnessLotus } from './WellnessLotus';
import { WellnessRadar } from './WellnessRadar';
import { CycleContext } from './CycleContext';
import { Insights } from './Insights';
import { DailyWisdom } from './DailyWisdom';
import { SettingsModal } from './SettingsModal';
import { Plus, Settings, Shield } from 'lucide-react';
import { useState } from 'react';
import { DailyLog } from './DailyLog';

export function Dashboard() {
  const { plantState, loading: plantLoading } = usePlantState();
  const { themeState, loading: themeLoading } = useInterfaceMode();
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (plantLoading || themeLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  const fabColors = {
    nurture: 'bg-lavender-400 hover:bg-lavender-300',
    steady: 'bg-sage-500 hover:bg-sage-400',
    thrive: 'bg-terracotta-400 hover:bg-terracotta-300'
  };

  const fabGlow = {
    nurture: '0 4px 12px rgba(197, 179, 223, 0.4)',
    steady: '0 4px 12px rgba(107, 143, 78, 0.4)',
    thrive: '0 4px 12px rgba(232, 167, 155, 0.4)'
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 grid grid-cols-3 items-start gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
              Blossom
            </h1>
            <p className="text-sm text-slate-600 mt-1 whitespace-nowrap">
              Your PCOS wellness companion
            </p>
          </div>

          <div className="flex justify-center items-start">
            <div className="px-6 py-2 rounded-full bg-sage-50 border border-sage-200 flex items-center gap-2.5 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-sage-600" />
              <span className="text-sm font-medium text-sage-700">100% Private</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all group shadow-sm"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-slate-800 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </header>

        <WellnessLotus health={plantState.health} streak={plantState.streak} mode={themeState.mode} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="glass-card h-80">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                Cycle Context
              </h2>
            </div>
            <CycleContext />
          </div>

          <div className="glass-card h-80">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
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
