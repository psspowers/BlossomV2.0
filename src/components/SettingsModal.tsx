import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, Award, TrendingUp, RefreshCw, Shield, Palette, Beaker } from 'lucide-react';
import { useAchievements, usePlantState } from '../lib/hooks/useInsights';
import { db } from '../lib/db';
import { getPhaseDescription } from '../lib/logic/plant';
import { resetDatabase } from '../lib/resetData';
import { useState } from 'react';
import { useTheme } from '../lib/themes/ThemeContext';
import { usePCOSSeeder } from '../lib/hooks/usePCOSSeeder';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { plantState, loading: plantLoading } = usePlantState();
  const { designTheme, themeConfig, setDesignTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoadingPersona, setIsLoadingPersona] = useState(false);
  const { loadSarahPersona, loadAlexPersona } = usePCOSSeeder();

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

  if (plantLoading || achievementsLoading) {
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

  const unlockedCount = achievements.badges.filter(b => b.unlocked).length;
  const totalBadges = achievements.badges.length;

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
                <Palette className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-serif font-semibold text-text-main">Design Theme</h3>
              </div>
              <div className="paper-card">
                <p className="text-sm text-sage-600 mb-4">Choose your preferred aesthetic experience</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDesignTheme('default')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      designTheme === 'default'
                        ? 'border-primary bg-sage-50'
                        : 'border-border bg-surface hover:bg-sage-50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary mb-2" />
                      <h4 className="text-text-main font-serif font-semibold">Tesla-Apple</h4>
                      <p className="text-xs text-sage-600">Modern, sleek, precise</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setDesignTheme('lotus')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      designTheme === 'lotus'
                        ? 'border-secondary bg-pink-50'
                        : 'border-border bg-surface hover:bg-sage-50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary mb-2" />
                      <h4 className="text-text-main font-serif font-semibold">Lotus Garden</h4>
                      <p className="text-xs text-sage-600">Organic, elegant, serene</p>
                    </div>
                  </button>
                </div>
                <div className="mt-4 p-3 bg-sage-50 rounded-lg border border-border">
                  <p className="text-xs text-sage-600">
                    <strong className="text-text-main">Current: </strong>
                    {themeConfig.name}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-semibold text-text-main">Your Plant Profile</h3>
              </div>
              <div className="paper-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-1 font-medium">Current Phase</p>
                    <p className="text-xl font-serif font-bold text-primary capitalize">{plantState.phase}</p>
                    <p className="text-xs text-sage-600 mt-1">{getPhaseDescription(plantState.phase)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-1 font-medium">Health Score</p>
                    <p className="text-xl font-serif font-bold text-text-main">{plantState.health}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-1 font-medium">Current Streak</p>
                    <p className="text-xl font-serif font-bold text-sage-600">{achievements.totalStreak} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-600 uppercase tracking-wide mb-1 font-medium">Total Logs</p>
                    <p className="text-xl font-serif font-bold text-text-main">{achievements.totalLogs}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-sage-600" />
                  <h3 className="text-lg font-serif font-semibold text-text-main">Achievements</h3>
                </div>
                <div className="text-sm text-sage-600 font-medium">
                  {unlockedCount} / {totalBadges} unlocked
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`paper-card p-4 flex flex-col items-center text-center transition-all ${
                      badge.unlocked
                        ? 'border-2 border-primary bg-sage-50'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="text-sm font-semibold text-text-main mb-1">{badge.name}</h4>
                    <p className="text-xs text-sage-600 mb-2">{badge.description}</p>
                    {!badge.unlocked && (
                      <div className="w-full bg-sage-100 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                    {badge.unlocked && (
                      <div className="text-xs text-primary font-medium mt-1">✓ Unlocked</div>
                    )}
                  </div>
                ))}
              </div>

              {achievements.nextBadge && (
                <div className="mt-4 p-4 bg-sage-50 border-2 border-sage-200 rounded-xl">
                  <p className="text-sm text-sage-700 font-semibold mb-1">Next Achievement</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievements.nextBadge.icon}</span>
                      <div>
                        <p className="text-text-main font-medium text-sm">{achievements.nextBadge.name}</p>
                        <p className="text-xs text-sage-600">{achievements.nextBadge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-serif font-bold text-primary">{Math.round(achievements.nextBadge.progress)}%</p>
                      <p className="text-xs text-sage-600">Complete</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-text-main">Privacy Vault</h3>
              </div>

              <div className="space-y-3">
                <div className="paper-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-text-main font-semibold mb-1 flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        Export Your Data
                      </h4>
                      <p className="text-sm text-sage-600">
                        Download all your health logs as a JSON file. Share with your healthcare provider or keep for your records.
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-4 py-2 bg-primary hover:opacity-90 text-white font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                    >
                      {isExporting ? 'Exporting...' : 'Download Report'}
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

            <section className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-5 h-5 text-sage-700" />
                <h3 className="text-lg font-serif font-semibold text-text-main">Developer / Clinical Tools</h3>
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
