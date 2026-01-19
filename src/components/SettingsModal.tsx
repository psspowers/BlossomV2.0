import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, RefreshCw, Shield, Beaker, FileText, Sparkles } from 'lucide-react';
import { usePlantState } from '../lib/hooks/useInsights';
import { db } from '../lib/db';
import { resetDatabase } from '../lib/resetData';
import { useState, useEffect } from 'react';
import { usePCOSSeeder } from '../lib/hooks/usePCOSSeeder';
import { analyzeHistory } from '../lib/logic/cycle';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { plantState, loading: plantLoading } = usePlantState();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingClinical, setIsExportingClinical] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoadingPersona, setIsLoadingPersona] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<string>('Loading...');
  const [blossomScore, setBlossomScore] = useState<number>(0);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const { loadSarahPersona, loadAlexPersona } = usePCOSSeeder();

  useEffect(() => {
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
  return `  - Average Daily Water: ${avgWater}${avgWater === 'N/A' ? '' : ' glasses'}`;
})()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLINICAL NOTES
${cycleAnalysis.isLongCycle
  ? '⚠ Extended cycle detected. Consider metabolic and hormonal evaluation.\n'
  : ''}${cycleAnalysis.variability > 10
  ? `⚠ High cycle variability (±${Math.round(cycleAnalysis.variability)} days). May indicate irregular ovulation.\n`
  : ''}${highPainDays > 5
  ? '⚠ Frequent high pain days. Consider pain management strategies.\n'
  : ''}${blossomScoreData.score < 50
  ? '⚠ Low wellness score. Increased symptom burden or lifestyle factors affecting wellbeing.\n'
  : ''}${cycleAnalysis.isUntracked
  ? '• Recommend continued tracking to establish cycle baseline.\n'
  : ''}
This report is generated from patient self-tracking data using the Blossom
PCOS wellness app. All data is based on subjective patient reporting and
should be used in conjunction with clinical examination and diagnostic testing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABOUT BLOSSOM
Blossom is a PCOS-aware cycle tracking application that uses PCOS-specific
logic to differentiate between true menstrual periods and spotting events,
providing more accurate cycle analysis for individuals with PCOS.

For questions about this report, please visit: https://github.com/yourusername/blossom
      `.trim();

      const blob = new Blob([report], {
        type: 'text/plain'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blossom-clinical-snapshot-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Clinical export failed:', error);
      alert('Failed to generate clinical report. Please try again.');
    } finally {
      setIsExportingClinical(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      await db.logs.clear();
      setShowDeleteConfirm(false);
      alert('All data has been deleted successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDemoData = async () => {
    try {
      setIsResetting(true);
      await resetDatabase();
      alert('Demo data has been reset successfully with updated insights!');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset demo data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLoadSarah = async () => {
    try {
      setIsLoadingPersona(true);
      const result = await loadSarahPersona();
      alert(`Loaded: ${result.persona}\n\n${result.description}\n\nExpected Current Day: ${result.expectedCurrentDay}\n\n${result.trapDescription}`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to load Sarah persona:', error);
      alert('Failed to load persona. Please try again.');
    } finally {
      setIsLoadingPersona(false);
    }
  };

  const handleLoadAlex = async () => {
    try {
      setIsLoadingPersona(true);
      const result = await loadAlexPersona();
      alert(`Loaded: ${result.persona}\n\n${result.description}\n\nExpected Current Day: ${result.expectedCurrentDay}\n\n${result.note}`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to load Alex persona:', error);
      alert('Failed to load persona. Please try again.');
    } finally {
      setIsLoadingPersona(false);
    }
  };

  if (plantLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="text-sage-600 animate-pulse">Loading...</div>
      </motion.div>
    );
  }

  const seasonIcons = {
    resting: '🌱',
    growing: '🌿',
    blooming: '🌸',
    thriving: '✨'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[85vh] bg-surface rounded-3xl border-2 border-border overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface/95 backdrop-blur-xl border-b-2 border-border p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-serif font-bold text-text-main">Settings & Privacy</h2>
                <p className="text-sm text-sage-600 mt-1">Your wellness journey dashboard</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-sage-50 border border-sage-200 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-sage-600" />
                <span className="text-xs font-medium text-sage-700">100% Private</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-sage-500 hover:text-text-main transition-colors p-2 hover:bg-sage-50 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 pb-8 bg-background" style={{ maxHeight: 'calc(85vh - 88px)' }}>
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-semibold text-text-main">Your Journey</h3>
              </div>
              <div className="paper-card bg-gradient-to-br from-sage-50 to-white border-2 border-primary/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-2 font-medium">Current Season</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-3xl">{seasonIcons[currentSeason as keyof typeof seasonIcons] || '🌱'}</span>
                      <p className="text-xl font-serif font-bold text-primary capitalize">{currentSeason}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-2 font-medium">Blossom Score</p>
                    <div className="inline-block px-4 py-2 bg-sage-100 rounded-full border-2 border-sage-300">
                      <p className="text-2xl font-serif font-bold text-sage-700">{blossomScore}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-2 font-medium">Total Days Logged</p>
                    <p className="text-xl font-serif font-bold text-text-main">{totalLogs}</p>
                    <p className="text-xs text-sage-600 mt-1">{plantState.streak} day streak</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-text-main">Privacy Vault</h3>
              </div>

              <div className="space-y-3">
                <div className="paper-card p-4 border-2 border-primary bg-sage-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Clinical Snapshot
                      </h4>
                      <p className="text-sm text-sage-600">
                        Generate a human-readable clinical report for your healthcare provider. Includes cycle analysis, symptom patterns, and lifestyle correlations.
                      </p>
                    </div>
                    <button
                      onClick={generateClinicalReport}
                      disabled={isExportingClinical}
                      className="px-4 py-2 bg-primary hover:opacity-90 text-white font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                    >
                      {isExportingClinical ? 'Generating...' : 'Download'}
                    </button>
                  </div>
                </div>

                <div className="paper-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        <Download className="w-4 h-4 text-sage-600" />
                        Export Raw Data (JSON)
                      </h4>
                      <p className="text-sm text-sage-600">
                        Download all your health logs as a JSON file for personal backup or data portability.
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-full transition-all border border-sage-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isExporting ? 'Exporting...' : 'Download'}
                    </button>
                  </div>
                </div>

                <div className="paper-card p-4 border-2 border-sage-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-sage-600" />
                        Reset Demo Data
                      </h4>
                      <p className="text-sm text-sage-600">
                        Clear current data and reload fresh demo data with 3 complete menstrual cycles and realistic symptom patterns.
                      </p>
                    </div>
                    <button
                      onClick={handleResetDemoData}
                      disabled={isResetting}
                      className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-full transition-all border border-sage-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResetting ? 'Resetting...' : 'Reset Data'}
                    </button>
                  </div>
                </div>

                <div className="paper-card p-4 border-2 border-red-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        Delete All Data
                      </h4>
                      <p className="text-sm text-sage-600">
                        Permanently delete all your health logs. This action cannot be undone.
                      </p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-full transition-all border border-red-200 whitespace-nowrap"
                      >
                        Delete Data
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-2 bg-sage-100 hover:bg-sage-200 text-text-main text-sm rounded-full transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAllData}
                          disabled={isDeleting}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
                  <p className="text-xs text-sage-700 leading-relaxed">
                    <strong className="text-text-main">Privacy Notice:</strong> All your data is stored locally in your browser.
                    We do not collect, transmit, or store any of your health information on external servers.
                    Your data is completely private and under your control.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-5 h-5 text-sage-700" />
                <h3 className="text-lg font-serif font-semibold text-text-main">Developer Tools</h3>
              </div>

              <div className="space-y-3">
                <div className="paper-card p-4 border-2 border-sage-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        Persona: Sarah - The Spotter
                      </h4>
                      <p className="text-sm text-sage-600 mb-2">
                        High variance cycle with spotting trap. Tests if engine correctly ignores single-day light flow.
                      </p>
                      <div className="text-xs text-sage-700 space-y-1">
                        <p><strong>Cycle History:</strong> 32 days ago (TRUE), 78 days ago (TRUE)</p>
                        <p><strong>Trap:</strong> 5 days ago (single light flow - should be ignored)</p>
                        <p><strong>Expected:</strong> Current Day ~32, NOT 5</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLoadSarah}
                      disabled={isLoadingPersona}
                      className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-full transition-all border border-sage-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingPersona ? 'Loading...' : 'Load Sarah'}
                    </button>
                  </div>
                </div>

                <div className="paper-card p-4 border-2 border-sage-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        Persona: Alex - The Long Cycle
                      </h4>
                      <p className="text-sm text-sage-600 mb-2">
                        Extended 65-day cycle with consistent lifestyle tracking. Tests maintenance mode detection.
                      </p>
                      <div className="text-xs text-sage-700 space-y-1">
                        <p><strong>Cycle History:</strong> 65 days ago (TRUE period)</p>
                        <p><strong>Tracking:</strong> 60 consecutive days of lifestyle logs</p>
                        <p><strong>Expected:</strong> Current Day 65, Maintenance Mode status</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLoadAlex}
                      disabled={isLoadingPersona}
                      className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium rounded-full transition-all border border-sage-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingPersona ? 'Loading...' : 'Load Alex'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
                  <p className="text-xs text-sage-700 leading-relaxed">
                    <strong className="text-text-main">Clinical Testing:</strong> These personas inject PCOS-specific test scenarios
                    to validate the Blossom Logic Constitution. Use them to verify cycle analysis handles edge cases like spotting,
                    long cycles, and high variability correctly.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
