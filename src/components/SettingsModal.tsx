import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, FileText, Beaker, RotateCcw } from 'lucide-react';
import { usePlantState } from '../lib/hooks/useInsights';
import { backupUserLogs, restoreUserLogs, DEMO_PREVIEW_KEY, USER_DELETED_KEY } from '../lib/db';
import { dbAdapter as db, migrateLocalToSupabase } from '../lib/dbAdapter';
import { useState, useEffect } from 'react';
import { usePCOSSeeder } from '../lib/hooks/usePCOSSeeder';
import { analyzeHistory } from '../lib/logic/cycle';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { plantState } = usePlantState();
  const { generateHistory } = usePCOSSeeder();
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>('Loading...');
  const [blossomScore, setBlossomScore] = useState<number>(0);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingClinical, setIsExportingClinical] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [demoActive, setDemoActive] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    const preview = localStorage.getItem(DEMO_PREVIEW_KEY);
    if (preview) {
      setDemoActive(preview);
      setIsRestoring(true);
      restoreUserLogs().then(() => {
        window.location.reload();
      });
      return;
    }

    const loadJourneyData = async () => {
      const score = await calculateBlossomScore();
      setBlossomScore(score.score);

      const season = await calculateSeason(score.score);
      setCurrentSeason(season.currentSeason);

      const logs = await db.logs.count();
      setTotalLogs(logs);
    };

    loadJourneyData();
  }, []);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const logs = await db.logs.toArray();
      const settings = await db.settings.toArray();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        logs,
        settings,
        summary: {
          totalLogs: logs.length,
          dateRange: {
            first: logs[logs.length - 1]?.date || 'N/A',
            last: logs[0]?.date || 'N/A'
          },
          currentStreak: plantState.streak
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blossom-health-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateClinicalReport = async () => {
    try {
      setIsExportingClinical(true);
      const logs = await db.logs.orderBy('date').toArray();

      if (logs.length === 0) {
        alert('No data available to generate a clinical report. Please log some entries first.');
        return;
      }

      const cycleAnalysis = analyzeHistory(logs);
      const blossomScoreData = await calculateBlossomScore();
      const today = new Date();
      const last30Days = logs.filter(log => {
        const logDate = new Date(log.date);
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      });

      const avgCycleLength = cycleAnalysis.cycleHistory.length > 1
        ? Math.round(
            cycleAnalysis.cycleHistory
              .slice(-3)
              .map(c => c.daysFromPrevious)
              .filter((d): d is number => d !== undefined)
              .reduce((a, b) => a + b, 0) /
            cycleAnalysis.cycleHistory.slice(-3).filter(c => c.daysFromPrevious !== undefined).length
          )
        : 0;

      const painLevels = last30Days
        .map(log => log.symptoms.cramps || 0)
        .filter(val => val > 0);
      const avgPainLevel = painLevels.length > 0
        ? (painLevels.reduce((a, b) => a + b, 0) / painLevels.length).toFixed(1)
        : 'N/A';

      const moodScores = last30Days
        .map(log => log.psych.mood || 0)
        .filter(val => val > 0);
      const avgMoodScore = moodScores.length > 0
        ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length)
        : 0;

      const highAcneDays = last30Days.filter(log => (log.symptoms.acne || 0) >= 7).length;
      const highPainDays = last30Days.filter(log => (log.symptoms.cramps || 0) >= 7).length;

      const goodSleepDays = last30Days.filter(log =>
        log.lifestyle.sleep === '7-8h' || log.lifestyle.sleep === '>8h'
      ).length;

      const goodSleepMood = last30Days
        .filter(log => log.lifestyle.sleep === '7-8h' || log.lifestyle.sleep === '>8h')
        .map(log => log.psych.mood || 0)
        .filter(val => val > 0);

      const avgGoodSleepMood = goodSleepMood.length > 0
        ? Math.round(goodSleepMood.reduce((a, b) => a + b, 0) / goodSleepMood.length)
        : 0;

      const moodImprovement = avgMoodScore > 0 && avgGoodSleepMood > avgMoodScore
        ? Math.round(((avgGoodSleepMood - avgMoodScore) / avgMoodScore) * 100)
        : 0;

      const report = `
BLOSSOM CLINICAL SNAPSHOT
Generated: ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT TRACKING SUMMARY
• Total Days Tracked: ${logs.length} days
• Data Range: ${logs[0]?.date || 'N/A'} to ${logs[logs.length - 1]?.date || 'N/A'}
• Current Streak: ${plantState.streak} consecutive days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CYCLE HISTORY
${cycleAnalysis.isUntracked ? '• Status: Insufficient cycle data (less than 2 periods tracked)' : `• Last Period Start: ${cycleAnalysis.lastTruePeriod?.startDate || 'N/A'}
• Last Period Duration: ${cycleAnalysis.lastTruePeriod ? Math.round((new Date(cycleAnalysis.lastTruePeriod.endDate).getTime() - new Date(cycleAnalysis.lastTruePeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0} days
• Current Cycle Day: Day ${cycleAnalysis.currentDay}
• Average Cycle Length (Last 3): ${avgCycleLength > 0 ? `${avgCycleLength} days` : 'N/A'}
• Cycle Stability: ${cycleAnalysis.variability <= 7 ? 'Stable' : 'Dynamic'} (±${Math.round(cycleAnalysis.variability)} days)
• Cycle Pattern: ${cycleAnalysis.isLongCycle ? 'Extended Cycle (>35 days)' : 'Regular Pattern'}
• Total Cycles Tracked: ${cycleAnalysis.cycleHistory.length} cycles`}

Recent Cycle Lengths:
${cycleAnalysis.cycleHistory.length > 0
  ? cycleAnalysis.cycleHistory
      .slice(-5)
      .reverse()
      .map((c, idx) => `  ${idx + 1}. ${c.startDate}${c.daysFromPrevious ? ` (${c.daysFromPrevious} days from previous)` : ' (first tracked cycle)'}`)
      .join('\n')
  : '  No cycles tracked yet'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYMPTOM OVERVIEW (Last 30 Days)
• Average Pain Level: ${avgPainLevel}${typeof avgPainLevel === 'string' ? '' : '/10'}
• High Pain Days (7+/10): ${highPainDays} days
• High Acne Days (7+/10): ${highAcneDays} days
• Average Mood Score: ${avgMoodScore}/100
• Wellness Score (Blossom): ${blossomScoreData.score}/100

Symptom Breakdown:
  - Symptom Factor: ${Math.round(blossomScoreData.symptomFactor)}/100
  - Self-Care Factor: ${Math.round(blossomScoreData.selfCareFactor)}/100
  - Emotional Factor: ${Math.round(blossomScoreData.emotionalFactor)}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIFESTYLE CORRELATIONS (Last 30 Days)
• Days with Good Sleep (7+ hours): ${goodSleepDays} days (${Math.round((goodSleepDays / Math.max(last30Days.length, 1)) * 100)}%)
${moodImprovement > 0
  ? `• Sleep-Mood Correlation: ${moodImprovement}% better mood on days with 7+ hours of sleep`
  : '• Sleep-Mood Correlation: Insufficient data or no improvement detected'}

Exercise Frequency:
${(() => {
  const exerciseCounts = {
    rest: last30Days.filter(l => l.lifestyle.exercise === 'rest').length,
    light: last30Days.filter(l => l.lifestyle.exercise === 'light').length,
    moderate: last30Days.filter(l => l.lifestyle.exercise === 'moderate').length,
    intense: last30Days.filter(l => l.lifestyle.exercise === 'intense').length
  };
  return `  - Rest: ${exerciseCounts.rest} days
  - Light: ${exerciseCounts.light} days
  - Moderate: ${exerciseCounts.moderate} days
  - Intense: ${exerciseCounts.intense} days`;
})()}

Hydration:
${(() => {
  const waterIntakes = last30Days
    .map(l => l.lifestyle.waterIntake || 0)
    .filter(w => w > 0);
  const avgWater = waterIntakes.length > 0
    ? (waterIntakes.reduce((a, b) => a + b, 0) / waterIntakes.length).toFixed(1)
    : 'N/A';
  return `  - Average Daily Water: ${avgWater} glasses`;
})()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTES FOR HEALTHCARE PROVIDER
This report is generated from self-tracked menstrual and wellness data.
All symptom ratings use a 0-10 scale unless otherwise specified.
Mood scores range from 0-100.

For questions about this data or the Blossom Health app, please contact:
support@blossomhealth.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blossom-clinical-snapshot-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Clinical report generation failed:', error);
      alert('Failed to generate clinical report. Please try again.');
    } finally {
      setIsExportingClinical(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      await db.logs.clear();
      await db.settings.clear();
      await db.backupLogs.clear();
      localStorage.setItem(USER_DELETED_KEY, 'true');
      localStorage.removeItem(DEMO_PREVIEW_KEY);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_priorities').delete().eq('user_id', user.id);
      }

      setShowDeleteConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMigrateToCloud = async () => {
    try {
      setIsMigrating(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be signed in to migrate data to the cloud.');
        return;
      }

      const result = await migrateLocalToSupabase();
      setMigrationComplete(true);

      setTimeout(() => {
        alert(`Migration complete! ${result.logsCount} logs and settings synced to cloud.`);
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Failed to migrate data. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleLoadPersona = async (name: 'Emma' | 'Sophia' | 'Olivia' | 'Ava' | 'Isabella') => {
    setLoadingPersona(name);
    const isAlreadyPreviewing = !!localStorage.getItem(DEMO_PREVIEW_KEY);
    if (!isAlreadyPreviewing) {
      await backupUserLogs();
    }
    await generateHistory(name);
    localStorage.setItem(DEMO_PREVIEW_KEY, name);
    localStorage.removeItem(USER_DELETED_KEY);
    window.location.reload();
  };

  if (isRestoring) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm">
          <RotateCcw className="w-8 h-8 text-sage-600 animate-spin mx-auto mb-4" />
          <p className="font-serif text-stone-800 text-lg mb-1">Restoring Your Profile</p>
          <p className="text-sm text-stone-500">Switching back from {demoActive} demo...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white">
            <h2 className="text-2xl font-serif text-stone-800">Settings & Privacy</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full text-stone-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8">
            <section>
              <h3 className="text-sm font-sans font-bold text-stone-400 uppercase tracking-widest mb-4">
                Your Journey
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-3xl font-serif text-stone-800 mb-1">{blossomScore}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Blossom Score</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-serif text-sage-700">{currentSeason}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Current Season</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-sans font-bold text-stone-400 uppercase tracking-widest mb-4">
                Privacy Vault
              </h3>
              <div className="grid gap-3">
                <button
                  onClick={generateClinicalReport}
                  disabled={isExportingClinical}
                  className="flex items-center gap-4 p-4 bg-sage-50 border border-sage-100 rounded-xl text-left hover:bg-sage-100 transition-colors group disabled:opacity-50"
                >
                  <div className="p-2 bg-white rounded-lg text-sage-600 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-stone-800 font-medium group-hover:text-sage-800">
                      {isExportingClinical ? 'Generating...' : 'Clinical Snapshot'}
                    </p>
                    <p className="text-xs text-stone-500">Download report for your doctor</p>
                  </div>
                </button>

                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl text-left hover:border-stone-300 hover:shadow-md transition-all group disabled:opacity-50"
                >
                  <div className="p-2 bg-stone-50 rounded-lg text-stone-600 shadow-sm">
                    <Download size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-stone-800 font-medium">
                      {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
                    </p>
                    <p className="text-xs text-stone-500">Download all your tracking data</p>
                  </div>
                </button>

                <button
                  onClick={handleMigrateToCloud}
                  disabled={isMigrating || migrationComplete}
                  className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors group disabled:opacity-50"
                >
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-stone-800 font-medium group-hover:text-blue-800">
                      {isMigrating ? 'Migrating...' : migrationComplete ? 'Migration Complete' : 'Sync to Cloud'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {migrationComplete ? 'Your data is now synced' : 'Backup your data to Supabase'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-4 p-4 bg-white border border-red-200 rounded-xl text-left hover:bg-red-50 transition-colors group"
                >
                  <div className="p-2 bg-red-50 rounded-lg text-red-600 shadow-sm">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-red-800 font-medium">Delete All Data</p>
                    <p className="text-xs text-red-600">Permanently remove all tracking data</p>
                  </div>
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Beaker size={16} className="text-stone-400" />
                <h3 className="text-sm font-sans font-bold text-stone-400 uppercase tracking-widest">
                  Beta / Clinical Profiles
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: 'Emma',
                    label: 'Emma (Insulin Resistant)',
                    desc: 'Irregular cycles, high cravings, improving.'
                  },
                  { id: 'Sophia', label: 'Sophia (Adrenal)', desc: 'Short cycles, high stress, poor sleep.' },
                  {
                    id: 'Olivia',
                    label: 'Olivia (Inflammatory)',
                    desc: 'Regular cycles, high pain/bloating.'
                  },
                  { id: 'Ava', label: 'Ava (Post-Pill)', desc: 'Long cycles (60+), frequent spotting.' },
                  {
                    id: 'Isabella',
                    label: 'Isabella (Lean)',
                    desc: 'Regular cycles, high androgen symptoms.'
                  }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      handleLoadPersona(p.id as 'Emma' | 'Sophia' | 'Olivia' | 'Ava' | 'Isabella')
                    }
                    disabled={!!loadingPersona}
                    className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-sage-300 hover:shadow-md transition-all text-left disabled:opacity-50"
                  >
                    <div>
                      <p className="font-serif text-stone-800 font-medium">{p.label}</p>
                      <p className="text-xs text-stone-500">{p.desc}</p>
                    </div>
                    {loadingPersona === p.id ? (
                      <div className="animate-spin w-4 h-4 border-2 border-sage-500 rounded-full border-t-transparent" />
                    ) : (
                      <span className="text-xs font-medium text-sage-600 bg-sage-50 px-3 py-1 rounded-full">
                        Load
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong className="text-stone-800">Clinical Testing:</strong> These 5 personas
                  represent distinct PCOS subtypes validated by medical consultants. Each generates
                  180 days of realistic symptom patterns for testing the Blossom Logic Constitution.
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-stone-800 mb-3">Delete All Data?</h3>
            <p className="text-sm text-stone-600 mb-6">
              This will permanently delete all your tracking data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
