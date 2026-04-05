import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, CircleAlert as AlertCircle, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EducationProps {
  onClose?: () => void;
}

const SECTIONS = [
  {
    id: 'pcos-101',
    title: 'What is PCOS?',
    icon: BookOpen,
    content: `Polycystic Ovary Syndrome (PCOS) is a complex hormonal and metabolic condition, not just a fertility issue. According to the 2023 Monash International Guidelines, it is diagnosed by 2 of 3 criteria (Rotterdam):

1. Irregular or absent periods (Ovulatory dysfunction).
2. High androgens (Clinical signs like acne/hirsutism or bloodwork).
3. Polycystic ovaries on ultrasound.

It is a whole-body condition affecting insulin, mood, and heart health. PCOS manifests differently in each person, but with proper understanding and management, symptoms can be significantly improved.`
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle as Medicine',
    icon: Heart,
    content: `Small, consistent changes bloom over time. No perfection required.

• Movement: Moderate activity (walking, yoga, strength training) improves insulin sensitivity significantly. Even 20-30 minutes of daily movement makes a difference.

• Sleep: 7-9 hours is foundational. Sleep deprivation spikes cortisol and worsens insulin resistance.

• Nutrition: Focus on low-GI foods to stabilize blood sugar. Include protein with each meal. You do not need to starve—nourishment is healing.

• Stress Management: Chronic stress raises cortisol, which increases androgens. Deep breathing, mindfulness, and rest are biological medicine.

Evidence shows that lifestyle interventions are as effective as medication for many PCOS symptoms.`
  },
  {
    id: 'doctor',
    title: 'When to See a Doctor',
    icon: AlertCircle,
    content: `Your body deserves care. Consider booking an appointment if:

• You go more than 3 months without a period.
• You experience sudden, severe mood changes or depression.
• Pain stops you from daily activities.
• You notice rapid weight change without lifestyle change.
• You have concerns about fertility or family planning.
• Symptoms significantly impact your quality of life.

This app's "Clinical Snapshot" can help you explain your history to your provider. Bring your data—patterns speak louder than single visits.

Remember: You are your own best advocate.`
  }
];

export function Education({ onClose }: EducationProps) {
  const [expanded, setExpanded] = useState<string | null>('pcos-101');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDFBF7] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-sage-50 border-b border-sage-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">PCOS Education Library</h2>
            <p className="text-sm text-slate-600 mt-1">Evidence-based information from trusted sources</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expanded === section.id;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-sage-600" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-slate-800">
                        {section.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                          <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                            {section.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-sage-50 to-emerald-50 rounded-xl border border-sage-200">
            <h4 className="text-lg font-serif font-semibold text-slate-800 mb-2">
              Your Health Journey
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              Remember: PCOS is highly individual. What works for one person may not work for another.
              Use this app to track your unique patterns and work with your healthcare provider to develop
              a personalized management plan. You are not alone in this journey.
            </p>
          </div>

          <div className="text-center mt-8 px-8 flex flex-col items-center gap-2">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">
              General information only. Not medical advice. Source: Monash International Guidelines (2023).
            </p>
            <Link to="/privacy" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4">
              Read our 100% Local Privacy Policy
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
