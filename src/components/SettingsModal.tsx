import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, Award, TrendingUp, RefreshCw } from 'lucide-react';
import { useAchievements, usePlantState } from '../lib/hooks/useInsights';
import { db } from '../lib/db';
import { getPhaseDescription } from '../lib/logic/plant';
import { resetDatabase } from '../lib/resetData';
import { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { plantState, loading: plantLoading } = usePlantState();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  if (plantLoading || achievementsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="text-slate-400 animate-pulse">Loading...</div>
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[85vh] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Settings & Privacy</h2>
              <p className="text-sm text-slate-400 mt-1">Your wellness journey dashboard</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 pb-8" style={{ maxHeight: 'calc(85vh - 88px)' }}>
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">Your Plant Profile</h3>
              </div>
              <div className="glass-card p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Phase</p>
                    <p className="text-xl font-bold text-teal-400 capitalize">{plantState.phase}</p>
                    <p className="text-xs text-slate-400 mt-1">{getPhaseDescription(plantState.phase)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Health Score</p>
                    <p className="text-xl font-bold text-white">{plantState.health}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Streak</p>
                    <p className="text-xl font-bold text-amber-400">{achievements.totalStreak} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Logs</p>
                    <p className="text-xl font-bold text-white">{achievements.totalLogs}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Achievements</h3>
                </div>
                <div className="text-sm text-slate-400">
                  {unlockedCount} / {totalBadges} unlocked
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`glass-card p-4 flex flex-col items-center text-center transition-all ${
                      badge.unlocked
                        ? 'border-teal-400/30 bg-teal-400/5'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="text-sm font-semibold text-white mb-1">{badge.name}</h4>
                    <p className="text-xs text-slate-400 mb-2">{badge.description}</p>
                    {!badge.unlocked && (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-teal-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                    {badge.unlocked && (
                      <div className="text-xs text-teal-400 font-medium mt-1">✓ Unlocked</div>
                    )}
                  </div>
                ))}
              </div>

              {achievements.nextBadge && (
                <div className="mt-4 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                  <p className="text-sm text-amber-300 font-medium mb-1">Next Achievement</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievements.nextBadge.icon}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{achievements.nextBadge.name}</p>
                        <p className="text-xs text-slate-400">{achievements.nextBadge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">{Math.round(achievements.nextBadge.progress)}%</p>
                      <p className="text-xs text-slate-500">Complete</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-rose-400 rounded-full" />
                </div>
                <h3 className="text-lg font-semibold text-white">Privacy Vault</h3>
              </div>

              <div className="space-y-3">
                <div className="glass-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                        <Download className="w-4 h-4 text-teal-400" />
                        Export Your Data
                      </h4>
                      <p className="text-sm text-slate-400">
                        Download all your health logs as a JSON file. Share with your healthcare provider or keep for your records.
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isExporting ? 'Exporting...' : 'Download Report'}
                    </button>
                  </div>
                </div>

                <div className="glass-card p-4 border-amber-500/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-amber-400" />
                        Reset Demo Data
                      </h4>
                      <p className="text-sm text-slate-400">
                        Clear current data and reload fresh demo data with 30 days of insights.
                      </p>
                    </div>
                    <button
                      onClick={handleResetDemoData}
                      disabled={isResetting}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium rounded-lg transition-all border border-amber-500/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResetting ? 'Resetting...' : 'Reset Data'}
                    </button>
                  </div>
                </div>

                <div className="glass-card p-4 border-rose-500/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        Delete All Data
                      </h4>
                      <p className="text-sm text-slate-400">
                        Permanently delete all your health logs. This action cannot be undone.
                      </p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium rounded-lg transition-all border border-rose-500/30 whitespace-nowrap"
                      >
                        Delete Data
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAllData}
                          disabled={isDeleting}
                          className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Privacy Notice:</strong> All your data is stored locally in your browser.
                    We do not collect, transmit, or store any of your health information on external servers.
                    Your data is completely private and under your control.
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
