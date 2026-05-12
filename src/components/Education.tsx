import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, CircleAlert as AlertCircle, Heart, X, Brain, Baby, MessageSquare, Sprout, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EducationProps {
  onClose?: () => void;
  defaultSection?: string;
}

const SECTIONS = [
  {
    id: 'pcos-101',
    title: 'What is PCOS?',
    icon: BookOpen,
    content: (
      <div className="space-y-3">
        <p>
          Polycystic Ovary Syndrome (PCOS) is a complex hormonal, reproductive, and metabolic condition. It is <strong>not</strong> just a fertility issue, and you did not cause it.
        </p>
        <p>
          According to the 2023 Monash International Guidelines, it is typically diagnosed using the Rotterdam Criteria (you must have 2 of these 3):
        </p>
        <ul className="list-disc pl-5 space-y-1 text-stone-600">
          <li><strong>Irregular or absent periods</strong> (Ovulatory dysfunction).</li>
          <li><strong>High androgens</strong> (Clinical signs like acne, excess facial hair, or elevated blood markers).</li>
          <li><strong>Polycystic ovaries</strong> visible on an ultrasound.</li>
        </ul>
        <p>
          PCOS is a whole-body condition that can affect how your body processes insulin, your daily energy, and your emotional well-being.
        </p>
      </div>
    )
  },
  {
    id: 'mental-health',
    title: 'Mental Health & Body Image',
    icon: Brain,
    content: (
      <div className="space-y-3">
        <p className="font-serif italic text-emerald-800/80">
          "You are not broken. The emotional weight of PCOS is biologically real."
        </p>
        <p>
          If you feel anxious, depressed, or frustrated with your body, it is not in your head. Women with PCOS experience anxiety and depression at <strong>3 to 5 times the rate</strong> of women without it.
        </p>
        <p>
          This is driven by a mix of hormonal fluctuations, insulin resistance (which impacts brain energy), and the profound exhaustion of dealing with chronic symptoms.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-stone-600">
          <li><strong>Give yourself grace:</strong> A low mood day is a symptom, just like a cramp.</li>
          <li><strong>Protect your peace:</strong> Unfollow social media accounts that make you feel you need to "fix" your body overnight.</li>
          <li><strong>Seek support:</strong> The 2023 Guidelines explicitly recommend mental health screening for all PCOS patients. Therapy is a valid and necessary part of treatment.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle as Medicine',
    icon: Heart,
    content: (
      <div className="space-y-3">
        <p className="font-serif italic text-emerald-800/80">
          "Small, consistent changes bloom over time. No perfection required."
        </p>
        <p>
          Because PCOS affects metabolism, how you treat your body day-to-day has a profound impact:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-stone-600">
          <li><strong>Movement:</strong> Moderate activity (walking, yoga, strength training) improves insulin sensitivity. You don't need exhausting workouts to see benefits.</li>
          <li><strong>Sleep:</strong> 7–9 hours is foundational. Sleep deprivation spikes cortisol and worsens insulin resistance. Rest is a highly productive action.</li>
          <li><strong>Nutrition:</strong> Focus on balanced, low-GI foods to stabilize blood sugar. You do not need to starve—nourishment is healing.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'fertility',
    title: 'Fertility & Your Future',
    icon: Baby,
    content: (
      <div className="space-y-3">
        <p>
          One of the most damaging myths about PCOS is that it means you can never have children. <strong>This is absolutely false.</strong>
        </p>
        <p>
          While irregular ovulation can make getting pregnant take a little longer or require more planning, the vast majority of women with PCOS who want to have children are able to do so.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-stone-600">
          <li><strong>Natural conception:</strong> Many women conceive naturally once their metabolic health and cycle regularity improve through lifestyle changes.</li>
          <li><strong>Medical support:</strong> If ovulation needs a boost, there are highly effective, inexpensive medications (like Letrozole or Letrozole/Clomid) that your doctor can prescribe.</li>
        </ul>
        <p className="text-sm font-medium text-stone-700 mt-2">
          Your diagnosis is not a life sentence on your family planning.
        </p>
      </div>
    )
  },
  {
    id: 'advocacy',
    title: 'Advocating for Yourself',
    icon: MessageSquare,
    content: (
      <div className="space-y-3">
        <p>
          Medical gaslighting—being told to "just lose weight and come back when you want a baby"—is sadly common in PCOS care. You have the right to demand comprehensive treatment.
        </p>
        <p className="font-medium text-stone-800">How to prepare for your appointment:</p>
        <ul className="list-disc pl-5 space-y-2 text-stone-600">
          <li><strong>Bring Data:</strong> Print your <em>Blossom Clinical Summary</em>. Show them your symptom trends over months, not just how you feel today.</li>
          <li><strong>Ask Direct Questions:</strong> "Can we check my fasting insulin, testosterone, and thyroid levels?"</li>
          <li><strong>Pivot the Conversation:</strong> If weight is the only focus, say: "I am working on lifestyle, but I would like to discuss managing my hormones and inflammation today."</li>
        </ul>
      </div>
    )
  },
  {
    id: 'doctor',
    title: 'When to See a Doctor',
    icon: AlertCircle,
    content: (
      <div className="space-y-3">
        <p>
          Your body deserves care. Book an appointment with your healthcare provider if:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-stone-600">
          <li>You go <strong>more than 3 months</strong> without a period (this requires medical management to protect your uterine lining).</li>
          <li>You experience sudden, severe mood drops or debilitating anxiety.</li>
          <li>Pelvic pain stops you from doing your daily activities.</li>
          <li>You notice rapid, unexplained weight changes.</li>
          <li>Your symptoms are significantly impacting your quality of life.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'how-blossom-works',
    title: 'Understanding Blossom',
    icon: Sparkles,
    content: (
      <div className="space-y-3">
        <p>
          Blossom uses a compassionate algorithm to help you track your journey.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-stone-600">
          <li><strong>The Blossom Score (0–100):</strong> A holistic measure of your physical symptoms, metabolic consistency, and emotional balance.</li>
          <li><strong>Seasons:</strong> We use Resting, Growing, and Blooming instead of streaks. Rest is productive.</li>
          <li><strong>Today's Balance (Radar):</strong> The outer edge is optimal balance. If a point pulls toward the center, that area is asking for gentle care today.</li>
          <li><strong>Cycle Context:</strong> We analyze your flow history to find your unique stability pattern, acknowledging that PCOS cycles are often irregular.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'about-root-renew',
    title: 'About Root & Renew',
    icon: Sprout,
    content: (
      <div className="space-y-4">
        <p>
          <strong>Root & Renew</strong> is a privacy-first sole proprietorship dedicated to empowering women navigating PCOS.
        </p>
        <p>
          Blossom (your PCOS Companion) lets you easily track your daily cycle (period, spotting, or no bleeding), your symptoms (including cramps, acne, hair loss, facial hair, bloating, cravings, energy, mood, and sleep quality on a gentle 1–5 scale), and lifestyle factors like sleep hours, activity level, and sugar intake.
        </p>
        <p>
          Over time, Blossom helps you visualize simple trends and correlations—such as discovering that better sleep is linked to fewer cravings—so you can understand your unique body and advocate for your health.
        </p>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mt-4">
          <p className="text-sm text-emerald-900 font-medium mb-1">Our Privacy Promise</p>
          <p className="text-xs text-emerald-800/80 leading-relaxed">
            All your personal health data stays securely on your device only. There is no cloud sync, no tracking, and no sharing unless you explicitly choose to export your Clinical Summary for your doctor.
          </p>
        </div>

        <div className="pt-5 mt-2 border-t border-stone-100 text-xs text-stone-500 space-y-2">
          <p>
            <strong className="text-stone-600">Published by:</strong><br />
            Ritika Yen-Yen Yamdagni trading as Root & Renew, Singapore.
          </p>
          <p>
            <strong className="text-stone-600">Questions or feedback:</strong><br />
            <a href="mailto:ritika@yamdagni.com" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
              ritika@yamdagni.com
            </a>
          </p>
        </div>
      </div>
    )
  }
];

export function Education({ onClose, defaultSection }: EducationProps) {
  const [expanded, setExpanded] = useState<string | null>(defaultSection ?? 'pcos-101');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
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
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-slate-700 leading-relaxed text-base">
                          {section.content}
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

          <div className="text-center mt-8 px-8 flex flex-col items-center gap-3">
            <p className="text-[10px] text-stone-400">
              General information only. Not medical advice. Source: Monash International Guidelines (2023).
            </p>
            <div className="flex items-center gap-4 text-xs font-medium">
              <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
                Privacy Policy
              </Link>
              <span className="text-stone-300">•</span>
              <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
