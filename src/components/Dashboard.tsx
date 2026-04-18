import { usePlantState, useInterfaceMode } from '../lib/hooks/useInsights';
import { WellnessLotus } from './WellnessLotus';
import { WellnessRadar } from './WellnessRadar';
import { CycleContext } from './CycleContext';
import { Insights } from './Insights';
import { DailyWisdom } from './DailyWisdom';
import { SettingsModal } from './SettingsModal';
import { Education } from './Education';
import { Navbar } from './Navbar';
import { DemoPreviewPill } from './DemoPreviewPill';
import { Plus, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DailyLog } from './DailyLog';
import { ClinicalGuide } from './clinical/ClinicalGuide';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason, SeasonState } from '../lib/logic/seasons';
import { generateDailyWisdom, DailyWisdom as WisdomType } from '../lib/logic/narratives';
import { DEMO_PREVIEW_KEY } from '../lib/db';

export function Dashboard() {
  const { plantState, loading: plantLoading } = usePlantState();
  const { themeState, loading: themeLoading } = useInterfaceMode();
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showClinicalGuide, setShowClinicalGuide] = useState(false);
  const [demoPersona, setDemoPersona] = useState<string | null>(null);

  useEffect(() => {
    setDemoPersona(localStorage.getItem(DEMO_PREVIEW_KEY));
  }, []);
  const [blossomScore, setBlossomScore] = useState<number>(50);
  const [season, setSeason] = useState<SeasonState>({
    currentSeason: 'resting',
    message: 'Loading your season...',
    icon: '🌱'
  });
  const [wisdom, setWisdom] = useState<WisdomType>({
    message: 'Listening to your body...',
    category: 'affirmation',
    hasData: false
  });

  useEffect(() => {
    const loadCompassionateData = async () => {
      const scoreResult = await calculateBlossomScore();
      setBlossomScore(scoreResult.score);

      const seasonState = await calculateSeason(scoreResult.score);
      setSeason(seasonState);

      const dailyWisdom = await generateDailyWisdom();
      setWisdom(dailyWisdom);
    };
    loadCompassionateData();
  }, []);


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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 relative overflow-x-hidden">
      <Navbar onOpenSettings={() => setShowSettings(true)} onOpenClinicalGuide={() => setShowClinicalGuide(true)} onOpenEducation={() => setShowLearn(true)} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-8">
        <WellnessLotus health={blossomScore} season={season} mode={themeState.mode} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12 mb-8">
          <div className="glass-card h-auto min-h-80">
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
                Today's Balance
              </h2>
            </div>
            <WellnessRadar />
          </div>

          {/* WHISPERS CARD (Internal Data Only) */}
          <div className="glass-card bg-stone-50 border border-stone-200 shadow-sm">
            <div className="p-4 border-b border-stone-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-sage-600" />
              <h2 className="text-sm font-serif font-medium text-sage-700 uppercase tracking-wide">
                Whispers from your Body
              </h2>
            </div>

            <div className="p-6 flex flex-col">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-sage-50 border border-sage-200 rounded-full text-xs font-medium text-sage-700">
                  {wisdom.category}
                </span>
              </div>

              {/* The Message (Strictly Narrative) */}
              <p className="text-slate-800 text-lg leading-relaxed italic font-serif">
                "{wisdom.message}"
              </p>

              {/* The Source (Strictly Internal) */}
              <p className="text-xs text-slate-500 mt-4 font-medium">
                Source: {wisdom.hasData ? "Your Pattern Data" : "Blossom Engine"}
              </p>
            </div>
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

      {demoPersona && (
        <DemoPreviewPill
          personaName={demoPersona}
          onReturn={() => setShowSettings(true)}
        />
      )}

      {showDailyLog && <DailyLog onClose={() => setShowDailyLog(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showLearn && <Education onClose={() => setShowLearn(false)} />}
      {showClinicalGuide && <ClinicalGuide onClose={() => setShowClinicalGuide(false)} />}

      <footer className="max-w-7xl mx-auto px-4 py-6 mt-12 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Your scores and insights are personal progress companions, not medical diagnoses. Always consult with your healthcare provider for medical advice and treatment decisions.
        </p>
      </footer>
    </div>
  );
}
