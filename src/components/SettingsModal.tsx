import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, FileText, Beaker, RotateCcw, UserX, Heart, CreditCard as Edit3, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlantState } from '../lib/hooks/useInsights';
import { db, backupUserLogs, restoreUserLogs, DEMO_PREVIEW_KEY, USER_DELETED_KEY } from '../lib/db';
import { useState, useEffect } from 'react';
import { usePCOSSeeder } from '../lib/hooks/usePCOSSeeder';
import { analyzeHistory } from '../lib/logic/cycle';
import { calculateBlossomScore } from '../lib/logic/blossomScore';
import { calculateSeason } from '../lib/logic/seasons';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import { exportClinicalPDF } from '../lib/utils/exportPDF';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const navigate = useNavigate();
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
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showPriorityEditor, setShowPriorityEditor] = useState(false);
  const [priorities, setPriorities] = useState<Array<{ id: string; label: string; happiness: number }>>([]);
  const [isSavingPriorities, setIsSavingPriorities] = useState(false);
  const [showRecalibrateWarning, setShowRecalibrateWarning] = useState(false);
  const [pendingPriorities, setPendingPriorities] = useState<Array<{ id: string; label: string; happiness: number }>>([]);
  const [maxPrioritiesMessage, setMaxPrioritiesMessage] = useState(false);

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
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    const settings = await db.settings.toCollection().first();
    if (settings?.priorities && settings.happinessWeights) {
      const priorityList = settings.priorities.map(id => ({
        id,
        label: getPriorityLabel(id),
        happiness: settings.happinessWeights[id] || 5
      }));
      setPriorities(priorityList);
    }
  };

  const allAvailablePriorities = [
    { id: 'acne', label: 'Acne' },
    { id: 'hirsutism', label: 'Facial Hair' },
    { id: 'hair_loss', label: 'Hair Loss' },
    { id: 'bloating', label: 'Bloating' },
    { id: 'cramps', label: 'Pain & Cramps' },
    { id: 'cravings', label: 'Cravings' },
    { id: 'mood', label: 'Mood Swings' },
    { id: 'sleep', label: 'Sleep Quality' },
    { id: 'cycle', label: 'Cycle Regularity' },
    { id: 'fertility', label: 'Fertility' },
    { id: 'weight', label: 'Weight & Metabolism' },
    { id: 'energy', label: 'Daily Energy' }
  ];

  const getPriorityLabel = (id: string): string => {
    const labels: Record<string, string> = {
      acne: 'Acne',
      hirsutism: 'Facial Hair',
      hair_loss: 'Hair Loss',
      bloating: 'Bloating',
      cramps: 'Pain & Cramps',
      cravings: 'Cravings',
      mood: 'Mood Swings',
      sleep: 'Sleep Quality',
      cycle: 'Cycle Regularity',
      fertility: 'Fertility',
      weight: 'Weight & Metabolism',
      energy: 'Daily Energy'
    };
    return labels[id] || id;
  };

  const handleSavePriorities = () => {
    const settings = db.settings.toCollection().first();
    settings.then(s => {
      if (s) {
        const originalIds = s.priorities || [];
        const newIds = priorities.map(p => p.id);
        const prioritiesChanged =
          originalIds.length !== newIds.length ||
          originalIds.some(id => !newIds.includes(id));

        if (prioritiesChanged) {
          setPendingPriorities(priorities);
          setShowRecalibrateWarning(true);
        } else {
          handleUpdatePriorities();
        }
      }
    });
  };

  const handleUpdatePriorities = async () => {
    try {
      setIsSavingPriorities(true);
      const settings = await db.settings.toCollection().first();
      if (!settings) return;

      const priorityIds = priorities.map(p => p.id);
      const happinessWeights: Record<string, number> = {};
      priorities.forEach(p => {
        happinessWeights[p.id] = p.happiness;
      });

      await db.settings.update(settings.id!, {
        priorities: priorityIds,
        happinessWeights
      });

      setShowPriorityEditor(false);
      setShowRecalibrateWarning(false);
      await loadPriorities();
    } catch (error) {
      console.error('Failed to update priorities:', error);
      alert('Failed to save priorities. Please try again.');
    } finally {
      setIsSavingPriorities(false);
    }
  };

  const togglePriority = (priorityId: string, label: string) => {
    const exists = priorities.find(p => p.id === priorityId);
    if (exists) {
      setPriorities(priorities.filter(p => p.id !== priorityId));
      setMaxPrioritiesMessage(false);
    } else {
      if (priorities.length >= 3) {
        setMaxPrioritiesMessage(true);
        setTimeout(() => setMaxPrioritiesMessage(false), 3000);
        return;
      }
      setPriorities([...priorities, { id: priorityId, label, happiness: 5 }]);
    }
  };

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
      await exportClinicalPDF({
        includeCharts: false,
      });
    } catch (error) {
      console.error('Clinical report generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate clinical report. Please try again.';
      alert(errorMessage);
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

      setShowDeleteConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);

      await db.logs.clear();
      await db.settings.clear();
      await db.backupLogs.clear();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      localStorage.clear();
      await supabase.auth.signOut();

      setShowDeleteAccountConfirm(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Local data cleared. If server deletion failed, please contact support.');
      localStorage.clear();
      await supabase.auth.signOut();
      window.location.href = '/';
    } finally {
      setIsDeletingAccount(false);
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
                Personalization
              </h3>
              <button
                onClick={() => setShowPriorityEditor(true)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl text-left hover:border-sage-300 hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-sage-50 rounded-lg text-sage-600 shadow-sm">
                  <Heart size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-stone-800 font-medium group-hover:text-sage-800">
                    Manage Priorities
                  </p>
                  <p className="text-xs text-stone-500">
                    {priorities.length > 0
                      ? `${priorities.length} priorities set: ${priorities.map(p => p.label).join(', ')}`
                      : 'Update your happiness impact ratings'}
                  </p>
                </div>
                <Edit3 size={16} className="text-stone-400 group-hover:text-sage-600" />
              </button>
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
                  onClick={() => {
                    onClose();
                    navigate('/privacy');
                  }}
                  className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-800">Read Privacy Policy</p>
                    <p className="text-xs text-stone-500">How we protect your data</p>
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
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-4 p-4 bg-white border border-red-200 rounded-xl text-left hover:bg-red-50 transition-colors group"
                >
                  <div className="p-2 bg-red-50 rounded-lg text-red-600 shadow-sm">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-red-800 font-medium">Delete All Data</p>
                    <p className="text-xs text-red-600">Clear all tracking data (keeps account)</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowDeleteAccountConfirm(true)}
                  className="flex items-center gap-4 p-4 bg-white border border-red-300 rounded-xl text-left hover:bg-red-100 transition-colors group"
                >
                  <div className="p-2 bg-red-100 rounded-lg text-red-700 shadow-sm">
                    <UserX size={20} />
                  </div>
                  <div>
                    <p className="font-serif text-red-900 font-medium">Delete Account</p>
                    <p className="text-xs text-red-700">Remove account and all data permanently</p>
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

      {showDeleteAccountConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setShowDeleteAccountConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX size={24} className="text-red-700" />
              </div>
              <h3 className="text-xl font-serif text-stone-800">Delete Account?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-4">
              This will permanently delete your login credentials from our servers and wipe all local health data from this device.
            </p>
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-sage-800">
                <strong>Your Privacy:</strong> Only your email and login credentials are stored on our servers. All health data (logs, symptoms, priorities) is already 100% local on this device.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-amber-800 font-medium">
                Warning: This action cannot be undone. You will need to create a new account to use Blossom again.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showRecalibrateWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setShowRecalibrateWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sage-100 rounded-lg">
                <Heart size={24} className="text-sage-700" />
              </div>
              <h3 className="text-xl font-serif text-stone-800">Recalibrating Your Journey</h3>
            </div>
            <p className="text-sm text-stone-600 mb-4">
              You've updated your priorities. This will refresh your wellness patterns and insights to better align with what matters most to you now.
            </p>
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-sage-800 font-medium mb-2">
                Your personalized journey continues
              </p>
              <p className="text-xs text-sage-700">
                Blossom will recalculate your wellness score and insights based on your new priorities. This helps surface the patterns most relevant to your current goals.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRecalibrateWarning(false);
                  setPendingPriorities([]);
                }}
                className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setPriorities(pendingPriorities);
                  handleUpdatePriorities();
                }}
                disabled={isSavingPriorities}
                className="flex-1 px-4 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isSavingPriorities ? 'Updating...' : 'Continue'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showPriorityEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowPriorityEditor(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#FDFBF7] rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif text-stone-800">Your Priorities</h3>
              <button
                onClick={() => setShowPriorityEditor(false)}
                className="p-2 hover:bg-stone-100 rounded-full text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-stone-600">
                    Choose up to 3 priorities that matter most to you
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    priorities.length >= 3
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {priorities.length}/3
                  </span>
                </div>

                <AnimatePresence>
                  {maxPrioritiesMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <p className="text-xs text-amber-800">
                        Maximum of 3 priorities reached. Remove one to add another.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {allAvailablePriorities.map(p => {
                    const isSelected = priorities.some(pr => pr.id === p.id);
                    const isDisabled = !isSelected && priorities.length >= 3;
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePriority(p.id, p.label)}
                        disabled={isDisabled}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-sage-50 border-sage-300 text-sage-800'
                            : isDisabled
                            ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {priorities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-stone-700">Happiness Impact</h4>
                  {priorities.map((priority, idx) => (
                    <div key={priority.id} className="bg-white p-4 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-stone-800">{priority.label}</span>
                        <span className="text-2xl font-serif text-sage-700">{priority.happiness}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={priority.happiness}
                        onChange={(e) => {
                          const newPriorities = [...priorities];
                          newPriorities[idx].happiness = parseInt(e.target.value);
                          setPriorities(newPriorities);
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-stone-500 font-medium tracking-wider">None</span>
                        <label className="text-[10px] font-serif italic text-sage-600">Happiness Impact</label>
                        <span className="text-[10px] text-stone-500 font-medium tracking-wider">Life Changing</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPriorityEditor(false);
                    loadPriorities();
                  }}
                  className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePriorities}
                  disabled={isSavingPriorities || priorities.length === 0}
                  className="flex-1 px-4 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSavingPriorities ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
