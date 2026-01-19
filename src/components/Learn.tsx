import { useState } from 'react';
import { ChevronDown, BookOpen, Heart, Stethoscope, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LearnProps {
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  source: string;
}

const sections: Section[] = [
  {
    id: 'what-is-pcos',
    title: 'What is PCOS?',
    icon: BookOpen,
    content: 'Polycystic Ovary Syndrome (PCOS) is a metabolic and endocrine condition affecting 8-13% of women of reproductive age. It is characterized by hormonal imbalances, including elevated androgens (male hormones), insulin resistance, and irregular menstrual cycles. Despite its name, not all individuals with PCOS have ovarian cysts. The condition manifests differently in each person, but common features include irregular periods, excess hair growth, acne, weight challenges, and fertility concerns. PCOS is a chronic condition, but with proper management through lifestyle modifications, nutrition, exercise, and medical support, symptoms can be significantly improved.',
    source: 'NIH - National Institute of Child Health and Human Development'
  },
  {
    id: 'lifestyle-management',
    title: 'Lifestyle & Management',
    icon: Heart,
    content: 'Evidence-based lifestyle interventions are the cornerstone of PCOS management. Resistance training and moderate aerobic exercise improve insulin sensitivity and help regulate hormone levels. A balanced diet focusing on whole foods, complex carbohydrates, lean proteins, and healthy fats can reduce inflammation and stabilize blood sugar. Sleep regulation is critical—aim for 7-9 hours per night, as poor sleep worsens insulin resistance and hormonal imbalances. Stress management through mindfulness, yoga, or therapy can lower cortisol levels, which otherwise exacerbate PCOS symptoms. Weight loss of even 5-10% in individuals with elevated BMI can restore ovulation and improve metabolic markers. Consistency in these habits often yields better results than medication alone.',
    source: 'ACOG - American College of Obstetricians and Gynecologists'
  },
  {
    id: 'when-to-see-doctor',
    title: 'When to See a Doctor',
    icon: Stethoscope,
    content: 'Seek medical evaluation if your menstrual cycles are consistently longer than 35 days or absent for more than 90 days, as this increases anovulatory risk and potential complications. Consult a healthcare provider if you experience severe hirsutism (excess hair growth), persistent acne that does not respond to over-the-counter treatments, or sudden weight gain despite healthy habits. Pain that prevents daily activities or interferes with quality of life requires assessment. If you are trying to conceive and have been unsuccessful after 6-12 months, fertility evaluation and ovulation-inducing treatments may be necessary. Additionally, if you have risk factors for metabolic syndrome—such as elevated blood pressure, high cholesterol, or prediabetes—regular screening and intervention are essential to prevent long-term complications like type 2 diabetes and cardiovascular disease.',
    source: 'Mayo Clinic'
  }
];

export function Learn({ onClose }: LearnProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(sections[0].id);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

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
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
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
                          <p className="text-slate-700 leading-relaxed text-base mb-4">
                            {section.content}
                          </p>
                          <div className="flex items-start gap-2 p-3 bg-sage-50 rounded-lg border border-sage-100">
                            <div className="text-sage-600 text-sm font-medium mt-0.5">
                              Source:
                            </div>
                            <div className="text-sage-700 text-sm flex-1">
                              {section.source}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-sage-50 to-lavender-50 rounded-xl border border-sage-200">
            <h4 className="text-lg font-serif font-semibold text-slate-800 mb-2">
              Your Health Journey
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              Remember: PCOS is highly individual. What works for one person may not work for another.
              Use this app to track your unique patterns and work with your healthcare provider to develop
              a personalized management plan. You are not alone in this journey.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
