import { useTranslation } from 'react-i18next';
import { usePlantState, useInterfaceMode } from '../lib/hooks/useInsights';
import { WellnessLotus } from './WellnessLotus';
import { WellnessRadar } from './WellnessRadar';
import { CycleContext } from './CycleContext';
import { Insights } from './Insights';
import { SettingsModal } from './SettingsModal';
import { Education } from './Education';
import { Navbar } from './Navbar';
import { DemoPreviewPill } from './DemoPreviewPill';
import { ContextualPrompts } from './ContextualPrompts';
import { BlossomCompanion } from './BlossomCompanion';
import { NotificationConsentCard } from './NotificationConsentCard';
import { TodayHero } from './TodayHero';
import { ActionDock } from './ActionDock';
import { TodaysInsight } from './TodaysInsight';
import { useState, useEffect, useCallback } from 'react';
import { DailyLog } from './DailyLog';
import { ClinicalGuide } from './clinical/ClinicalGuide';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason, SeasonState } from '../lib/logic/seasons';
import { analyzeHistory } from '../lib/logic/cycle';
import { db, DEMO_PREVIEW_KEY } from '../lib/db';
import { useDashboardPreferences } from '../lib/hooks/useDashboardPreferences';

export function Dashboard() {
  const { t } = useTranslation();
  const { plantState, loading: plantLoading } = usePlantState();
  const { themeState, loading: themeLoading } = useInterfaceMode();
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showClinicalGuide, setShowClinicalGuide] = useState(false);
  const [demoPersona, setDemoPersona] = useState<string | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [highSymptomTriggered, setHighSymptomTriggered] = useState(false);
  const [showNotificationConsent, setShowNotificationConsent] = useState(false);

  useEffect(() => {
    setDemoPersona(localStorage.getItem(DEMO_PREVIEW_KEY));
  }, []);
  const [blossomScore, setBlossomScore] = useState<number>(50);
  const [scoreDelta, setScoreDelta] = useState<number>(0);
  const [cycleDay, setCycleDay] = useState<number | undefined>(undefined);
  const [hasLoggedToday, setHasLoggedToday] = useState<boolean>(false);
  const [season, setSeason] = useState<SeasonState>({
    currentSeason: 'resting',
    message: 'Loading your season...',
    icon: '🌱'
  });
  const { prefs, update: updatePrefs } = useDashboardPreferences();

  const handleSaveSuccess = useCallback((result: {
    symptoms: Record<string, number>;
    isFirstLog: boolean;
    streak: number;
    season: string;
  }) => {
    const symptomValues = Object.values(result.symptoms).filter(
      (v): v is number => typeof v === 'number'
    );
    const maxSymptom = symptomValues.length > 0 ? Math.max(...symptomValues) : 0;
    if (maxSymptom > 7) {
      setTimeout(() => setHighSymptomTriggered(true), 2000);
    }

    if (result.isFirstLog && !localStorage.getItem('blossom_notification_prompted')) {
      setTimeout(() => setShowNotificationConsent(true), 3000);
    }
  }, []);

  useEffect(() => {
    const loadCompassionateData = async () => {
      const scoreResult = await calculateBlossomScore();
      setBlossomScore(scoreResult.score);

      const seasonState = await calculateSeason(scoreResult.score);
      setSeason(seasonState);

      const allLogs = await db.logs.orderBy('date').toArray();
      const today = new Date().toISOString().slice(0, 10);
      setHasLoggedToday(allLogs.some((log) => log.date === today));

      const analysis = analyzeHistory(allLogs);
      if (analysis && !analysis.isUntracked && analysis.currentDay) {
        setCycleDay(analysis.currentDay);
      }

      if (allLogs.length >= 2) {
        const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date));
        const priorLogs = sorted.slice(0, -1);
        if (priorLogs.length > 0) {
          const yesterdayResult = await calculateBlossomScore(priorLogs);
          setScoreDelta(scoreResult.score - yesterdayResult.score);
        }
      }
    };
    loadCompassionateData();
  }, []);


  if (plantLoading || themeLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-slate-600 animate-pulse">{t('dashboard.loading')}</div>
      </div>
    );
  }

  const handleLogDay = () => {
    setShowDailyLog(true);
    updatePrefs({ lastAction: 'log' });
  };

  const handleAskBlossom = () => {
    setCompanionOpen(true);
    updatePrefs({ lastAction: 'ask' });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 relative">
      <Navbar onOpenSettings={() => setShowSettings(true)} onOpenClinicalGuide={() => setShowClinicalGuide(true)} onOpenEducation={() => setShowLearn(true)} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(10rem+env(safe-area-inset-bottom))] overflow-x-hidden">
        <ContextualPrompts
          onOpenChat={() => setCompanionOpen(true)}
          highSymptomTriggered={highSymptomTriggered}
          onHighSymptomConsumed={() => setHighSymptomTriggered(false)}
        />
        <WellnessLotus
          health={blossomScore}
          scoreDelta={scoreDelta}
          season={season}
          mode={themeState.mode}
        />

        <TodayHero
          cycleDay={cycleDay}
          season={season}
          streak={plantState.streak}
          hasLoggedToday={hasLoggedToday}
          onLogToday={handleLogDay}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mb-8">
          <div className="glass-card min-h-80">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                {t('dashboard.cycle_context')}
              </h2>
            </div>
            <CycleContext />
          </div>

          <div className="glass-card min-h-80">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-serif font-medium text-slate-700 uppercase tracking-wide">
                {t('dashboard.todays_balance')}
              </h2>
            </div>
            <WellnessRadar />
          </div>

          <TodaysInsight />
        </div>

        <Insights />
      </div>

      <ActionDock
        mode={themeState.mode}
        onLogDay={handleLogDay}
        onAskBlossom={handleAskBlossom}
        lastAction={prefs.lastAction}
      />

      {demoPersona && (
        <DemoPreviewPill
          personaName={demoPersona}
          onReturn={() => setShowSettings(true)}
        />
      )}

      <BlossomCompanion
        blossomScore={blossomScore}
        season={season.currentSeason}
        streak={plantState.streak}
        isOpen={companionOpen}
        onOpenChange={setCompanionOpen}
      />

      {showNotificationConsent && (
        <NotificationConsentCard onDismiss={() => setShowNotificationConsent(false)} />
      )}

      {showDailyLog && (
        <DailyLog
          onClose={() => setShowDailyLog(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
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
