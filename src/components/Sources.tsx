import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SourceEntry {
  name: string;
  url: string;
  description: string;
}

interface SourceCategory {
  category: string;
  sources: SourceEntry[];
}

const SOURCE_CATEGORIES: SourceCategory[] = [
  {
    category: "Primary Clinical Guidelines",
    sources: [
      {
        name: "2023 International Evidence-Based Guideline for the Assessment and Management of PCOS (Teede et al., Monash University)",
        url: "https://www.monash.edu/medicine/sphpm/mchri/pcos/guideline",
        description: "The primary evidence-based guideline that informs the health information throughout Blossom, covering diagnosis, lifestyle, mental health, and treatment."
      },
      {
        name: "ACOG Practice Bulletin — Polycystic Ovary Syndrome",
        url: "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2018/05/polycystic-ovary-syndrome",
        description: "American College of Obstetricians and Gynecologists guidelines on PCOS diagnosis and management."
      },
      {
        name: "Endocrine Society Clinical Practice Guidelines — PCOS",
        url: "https://www.endocrine.org/clinical-practice-guidelines/polycystic-ovary-syndrome",
        description: "Clinical practice guidelines from the Endocrine Society on treatment and long-term health risks of PCOS."
      },
      {
        name: "Royal College of Obstetricians and Gynaecologists — PCOS Patient Information",
        url: "https://www.rcog.org.uk/for-the-public/browse-all-patient-information-leaflets/polycystic-ovary-syndrome-patient-information-leaflet/",
        description: "Patient-facing clinical information on PCOS, fertility, and management."
      }
    ]
  },
  {
    category: "Mental Health & Emotional Wellbeing",
    sources: [
      {
        name: "NIH National Institute of Mental Health — Stress",
        url: "https://www.nimh.nih.gov/health/publications/stress",
        description: "NIH guidance on the physiological effects of stress, including cortisol and hormonal impacts."
      },
      {
        name: "Journal of Behavioral Medicine — CBT in PCOS (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/25673129/",
        description: "Research showing cognitive behavioral therapy (CBT) improved quality of life and reduced anxiety in women with PCOS."
      },
      {
        name: "Journal of Clinical Psychology — Cognitive Symptoms in PCOS (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/28941302/",
        description: "Research on brain fog and cognitive difficulties associated with insulin resistance and hormonal fluctuations in PCOS."
      },
      {
        name: "PCOS Awareness Association",
        url: "https://www.pcosaa.org/",
        description: "Patient advocacy and community support resources for women with PCOS."
      }
    ]
  },
  {
    category: "Metabolism, Insulin & Nutrition",
    sources: [
      {
        name: "American Diabetes Association — Sleep and Diabetes",
        url: "https://diabetes.org/health-wellness/sleep",
        description: "Research on how sleep disruption affects insulin resistance, leptin and ghrelin regulation."
      },
      {
        name: "American Diabetes Association — Diagnosis",
        url: "https://diabetes.org/diabetes/diagnosis",
        description: "Standards for glucose testing and interpretation of insulin resistance markers."
      },
      {
        name: "Harvard T.H. Chan School of Public Health — Carbohydrates and Blood Sugar",
        url: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/carbohydrates-and-blood-sugar/",
        description: "Evidence on low-GI nutrition and blood sugar stabilization."
      },
      {
        name: "Harvard T.H. Chan School of Public Health — Dietary Fiber",
        url: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/fiber/",
        description: "Research on dietary fiber's role in hormone regulation and gut health."
      },
      {
        name: "Glycemic Index Foundation",
        url: "https://www.gisymbol.com/about-glycemic-index/",
        description: "Explanation of the glycemic index and its use in managing blood sugar through food choices."
      },
      {
        name: "American Journal of Clinical Nutrition — Protein and Satiety",
        url: "https://academic.oup.com/ajcn/article/90/5/1390/4597219",
        description: "Research on protein-rich breakfast intake, blood sugar, and appetite control."
      },
      {
        name: "NIH Office of Dietary Supplements — Omega-3 Fatty Acids",
        url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
        description: "Evidence on omega-3s reducing inflammatory cytokines and supporting reproductive health."
      },
      {
        name: "European Journal of Nutrition — Magnesium and Insulin Sensitivity",
        url: "https://link.springer.com/article/10.1007/s00394-016-1143-3",
        description: "Clinical trial evidence on magnesium supplementation improving insulin sensitivity in PCOS."
      },
      {
        name: "Endocrine Society — Vitamin D Deficiency",
        url: "https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-deficiency",
        description: "Guidelines on vitamin D deficiency, its prevalence in PCOS, and links to insulin resistance."
      },
      {
        name: "Cochrane Review — Inositol for PCOS",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012378.pub2/full",
        description: "Systematic review of randomized controlled trials on myo-inositol for ovulation and menstrual regularity."
      },
      {
        name: "NIH National Institute on Alcohol Abuse and Alcoholism — Women and Alcohol",
        url: "https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/women-and-alcohol",
        description: "Evidence on how alcohol disrupts estrogen metabolism and insulin sensitivity."
      },
      {
        name: "Diabetes Care Journal — Cinnamon and Glucose",
        url: "https://diabetesjournals.org/care/article/26/12/3215/27659/Cinnamon-Improves-Glucose-and-Lipids-of-People",
        description: "Research on cinnamon's effects on fasting glucose and insulin sensitivity."
      },
      {
        name: "Journal of Clinical Endocrinology & Metabolism — Stress and Inflammation",
        url: "https://academic.oup.com/jcem/article/96/1/39/2597062",
        description: "Research linking chronic stress to elevated IL-6 inflammatory markers and insulin resistance in PCOS."
      }
    ]
  },
  {
    category: "Exercise & Physical Activity",
    sources: [
      {
        name: "American College of Sports Medicine — Physical Activity Guidelines",
        url: "https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines",
        description: "Evidence on moderate exercise and its effects on insulin sensitivity and metabolic health."
      },
      {
        name: "Monash University PCOS Exercise Guidelines",
        url: "https://www.monash.edu/medicine/sphpm/mchri/pcos/resources",
        description: "PCOS-specific exercise recommendations including HIIT and resistance training evidence."
      },
      {
        name: "Journal of Strength and Conditioning Research",
        url: "https://journals.lww.com/nsca-jscr/pages/default.aspx",
        description: "Research on resistance training, muscle mass, and metabolic glucose management."
      }
    ]
  },
  {
    category: "Sleep",
    sources: [
      {
        name: "National Sleep Foundation — Sleep Deprivation and Diabetes",
        url: "https://www.sleepfoundation.org/sleep-deprivation/sleep-deprivation-and-diabetes",
        description: "Evidence on how sleep deprivation reduces insulin sensitivity and impacts metabolic health."
      },
      {
        name: "Sleep Research Society — Sleep Health Basics",
        url: "https://www.sleepresearchsociety.org/resources/sleep-health-basics/",
        description: "Research on sleep's role in hormonal repair and regulation."
      }
    ]
  },
  {
    category: "Reproductive Health & Fertility",
    sources: [
      {
        name: "ACOG — Your Menstrual Cycle",
        url: "https://www.acog.org/womens-health/faqs/your-menstrual-cycle",
        description: "Patient education on normal cycle variability and what to expect."
      },
      {
        name: "ACOG — Premenstrual Syndrome",
        url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
        description: "ACOG patient guidance on the luteal phase, progesterone, and PMS symptoms."
      },
      {
        name: "Mayo Clinic — Premenstrual Syndrome",
        url: "https://www.mayoclinic.org/diseases-conditions/premenstrual-syndrome/symptoms-causes/syc-20376780",
        description: "Mayo Clinic explanation of progesterone's role in bloating, water retention, and mood in the luteal phase."
      },
      {
        name: "Mayo Clinic — Cervical Mucus Method",
        url: "https://www.mayoclinic.org/tests-procedures/cervical-mucus-method/about/pac-20393452",
        description: "Fertility awareness guidance on interpreting cervical mucus as an ovulation sign."
      },
      {
        name: "Mayo Clinic — Ovulation Predictor Kits",
        url: "https://www.mayoclinic.org/tests-procedures/ovulation-predictor-kits/about/pac-20394810",
        description: "Guidance on interpreting LH surge tests, especially for women with PCOS who have elevated baseline LH."
      },
      {
        name: "Fertility and Sterility Journal",
        url: "https://www.fertstert.org/",
        description: "Peer-reviewed research on ovulation, AMH, and fertility outcomes in PCOS."
      },
      {
        name: "Androgen Excess and PCOS Society",
        url: "https://www.ae-society.org/",
        description: "Clinical guidance on androgen levels, testosterone reference ranges, and PCOS diagnosis."
      }
    ]
  },
  {
    category: "Skin, Hair & Hyperandrogenism",
    sources: [
      {
        name: "American Academy of Dermatology — Hirsutism Treatment",
        url: "https://www.aad.org/public/diseases/a-z/hirsutism-treatment",
        description: "Evidence on treatment timelines for hirsutism and the hair growth cycle."
      },
      {
        name: "Journal of the American Academy of Dermatology",
        url: "https://www.jaad.org/",
        description: "Research on androgen-driven acne and the effectiveness of hormonal versus topical treatments."
      },
      {
        name: "Cleveland Clinic — Female Pattern Baldness",
        url: "https://my.clevelandclinic.org/health/diseases/21753-female-pattern-baldness",
        description: "Clinical guidance on the role of ferritin and iron stores in PCOS-related hair loss."
      },
      {
        name: "Phytotherapy Research — Spearmint Tea and Testosterone (PubMed)",
        url: "https://pubmed.ncbi.nlm.nih.gov/19585478/",
        description: "Clinical trial showing spearmint tea reduced free testosterone and improved hirsutism in women with PCOS."
      }
    ]
  },
  {
    category: "Menstrual Health",
    sources: [
      {
        name: "Cleveland Clinic — Menstrual Cycle",
        url: "https://my.clevelandclinic.org/health/articles/10508-menstrual-cycle",
        description: "Overview of the menstrual cycle, progesterone fluctuations, and iron considerations during menstruation."
      },
      {
        name: "American Family Physician — Dysmenorrhea",
        url: "https://www.aafp.org/pubs/afp/issues/2005/0115/p285.html",
        description: "Research on prostaglandins and evidence for NSAID timing in managing menstrual cramping."
      },
      {
        name: "Mayo Clinic — Magnesium",
        url: "https://www.mayoclinic.org/drugs-supplements-magnesium/art-20365496",
        description: "Evidence on magnesium supplementation for muscle relaxation and menstrual pain."
      }
    ]
  },
  {
    category: "Long-Term Health",
    sources: [
      {
        name: "Endocrine Society — PCOS Patient Education",
        url: "https://www.endocrine.org/patient-engagement/endocrine-library/pcos",
        description: "Evidence on long-term PCOS health risks including type 2 diabetes, cardiovascular disease, and endometrial cancer."
      },
      {
        name: "NIH — PCOS Overview (NICHD)",
        url: "https://www.nichd.nih.gov/health/topics/pcos",
        description: "NIH overview of PCOS as a genetic, hormonal condition and its systemic health implications."
      },
      {
        name: "Nature Reviews Endocrinology — Gut Microbiome and PCOS",
        url: "https://www.nature.com/nrendo/",
        description: "Emerging research on gut microbiome imbalances and their connection to PCOS symptoms."
      }
    ]
  }
];

export function Sources() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blossom
          </Link>

          <h1 className="text-3xl font-serif font-bold text-slate-800 mb-3">
            Sources & References
          </h1>
          <p className="text-slate-600 leading-relaxed">
            All health information in Blossom is drawn from peer-reviewed research, systematic reviews, and evidence-based clinical guidelines from recognized medical organizations.
            This page lists the primary sources behind the information displayed in the app.
          </p>

          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Important:</strong> The information in Blossom is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your individual health.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {SOURCE_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-lg font-serif font-semibold text-slate-800 mb-3 pb-2 border-b border-stone-200">
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 group-hover:text-emerald-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-800 transition-colors leading-snug mb-1">
                        {source.name}
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {source.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Blossom is published by Root & Renew (Ritika Yen-Yen Yamdagni), Singapore.
            For questions about the health information in this app, please contact{' '}
            <a href="mailto:ritika@yamdagni.com" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
              ritika@yamdagni.com
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-medium">
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
    </div>
  );
}
