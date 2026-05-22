export interface WisdomCard {
  id: string;
  text: string;
  source: string;
  sourceUrl: string;
  category: 'Physical' | 'Metabolic' | 'Emotional' | 'General';
  triggers: string[];
}

export const WISDOM_LIBRARY: WisdomCard[] = [
  {
    id: 'sleep_insulin',
    text: "Sleep deprivation (<6h) reduces insulin sensitivity by up to 30%. Prioritize rest today to help stabilize your metabolism.",
    source: "National Sleep Foundation",
    sourceUrl: "https://www.sleepfoundation.org/sleep-deprivation/sleep-deprivation-and-diabetes",
    category: "Metabolic",
    triggers: ['low_sleep']
  },
  {
    id: 'sleep_insulin_2',
    text: "Poor sleep quality disrupts leptin and ghrelin, the hormones that regulate hunger. This can worsen insulin resistance.",
    source: "American Diabetes Association",
    sourceUrl: "https://diabetes.org/health-wellness/sleep",
    category: "Metabolic",
    triggers: ['low_sleep']
  },
  {
    id: 'sleep_repair',
    text: "During deep sleep, your body repairs tissues and balances hormones. Aim for consistent sleep and wake times.",
    source: "Sleep Research Society",
    sourceUrl: "https://www.sleepresearchsociety.org/resources/sleep-health-basics/",
    category: "Physical",
    triggers: ['low_sleep']
  },
  {
    id: 'stress_cortisol',
    text: "High stress triggers cortisol, which can increase androgen production. A 5-minute deep breathing break is biological medicine.",
    source: "NIH National Institute of Mental Health",
    sourceUrl: "https://www.nimh.nih.gov/health/publications/stress",
    category: "Emotional",
    triggers: ['high_stress']
  },
  {
    id: 'stress_inflammation',
    text: "Chronic stress increases inflammatory markers like IL-6, which are linked to PCOS symptoms and insulin resistance.",
    source: "Journal of Clinical Endocrinology & Metabolism",
    sourceUrl: "https://academic.oup.com/jcem/article/96/1/39/2597062",
    category: "Metabolic",
    triggers: ['high_stress']
  },
  {
    id: 'stress_cycle',
    text: "Stress can delay ovulation or lengthen your cycle by disrupting the hypothalamic-pituitary-ovarian axis.",
    source: "Fertility and Sterility Journal",
    sourceUrl: "https://www.fertstert.org/article/S0015-0282(03)00893-2/fulltext",
    category: "Physical",
    triggers: ['high_stress']
  },
  {
    id: 'stress_mindfulness',
    text: "8 weeks of mindfulness practice reduced cortisol and improved ovulation frequency in women with PCOS.",
    source: "Monash University PCOS Research",
    sourceUrl: "https://www.monash.edu/medicine/sphpm/mchri/pcos/resources",
    category: "Emotional",
    triggers: ['high_stress']
  },
  {
    id: 'luteal_energy',
    text: "In the Luteal phase, your metabolic rate increases and energy naturally dips. It is okay to choose gentle movement today.",
    source: "ACOG (American College of Obstetricians and Gynecologists)",
    sourceUrl: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
    category: "Physical",
    triggers: ['luteal_phase']
  },
  {
    id: 'luteal_progesterone',
    text: "Progesterone peaks in the luteal phase, causing water retention and bloating. This is normal and temporary.",
    source: "Mayo Clinic",
    sourceUrl: "https://www.mayoclinic.org/diseases-conditions/premenstrual-syndrome/symptoms-causes/syc-20376780",
    category: "Physical",
    triggers: ['luteal_phase']
  },
  {
    id: 'luteal_cravings',
    text: "Luteal phase cravings for carbs and sweets are driven by progesterone. Choose complex carbs to stabilize blood sugar.",
    source: "Harvard T.H. Chan School of Public Health",
    sourceUrl: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/carbohydrates-and-blood-sugar/",
    category: "Metabolic",
    triggers: ['luteal_phase']
  },
  {
    id: 'magnesium_pain',
    text: "Magnesium-rich foods (spinach, pumpkin seeds) or supplements can help relax uterine muscles and reduce cramping.",
    source: "Mayo Clinic",
    sourceUrl: "https://www.mayoclinic.org/drugs-supplements-magnesium/art-20365496",
    category: "Physical",
    triggers: ['high_pain']
  },
  {
    id: 'magnesium_insulin',
    text: "Magnesium supplementation (200-400mg daily) improved insulin sensitivity in women with PCOS in clinical trials.",
    source: "European Journal of Nutrition",
    sourceUrl: "https://link.springer.com/article/10.1007/s00394-016-1143-3",
    category: "Metabolic",
    triggers: ['high_pain', 'general']
  },
  {
    id: 'omega3_inflammation',
    text: "Omega-3 fatty acids reduce inflammatory cytokines and may improve egg quality. Aim for fatty fish 2x/week or supplements.",
    source: "NIH Office of Dietary Supplements",
    sourceUrl: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'inositol_ovulation',
    text: "Myo-inositol (2g daily) improved ovulation frequency and menstrual regularity in multiple randomized controlled trials.",
    source: "Cochrane Review — Inositol for PCOS",
    sourceUrl: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012378.pub2/full",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'vitamin_d_fertility',
    text: "Vitamin D deficiency is common in PCOS and linked to insulin resistance and irregular cycles. Get your levels checked.",
    source: "Endocrine Society Clinical Practice Guidelines",
    sourceUrl: "https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-deficiency",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'exercise_insulin',
    text: "Just 30 minutes of moderate exercise improves insulin sensitivity for up to 48 hours afterward.",
    source: "American College of Sports Medicine",
    sourceUrl: "https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines",
    category: "Metabolic",
    triggers: ['low_movement', 'general']
  },
  {
    id: 'exercise_strength',
    text: "Strength training 2-3x/week builds muscle mass, which acts like a glucose sink and improves metabolic health.",
    source: "Journal of Strength and Conditioning Research",
    sourceUrl: "https://journals.lww.com/nsca-jscr/pages/default.aspx",
    category: "Physical",
    triggers: ['low_movement']
  },
  {
    id: 'exercise_hiit',
    text: "High-intensity interval training (HIIT) improves insulin sensitivity and reduces abdominal fat more effectively than steady cardio.",
    source: "Monash University PCOS Exercise Guidelines",
    sourceUrl: "https://www.monash.edu/medicine/sphpm/mchri/pcos/resources",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'low_gi_foods',
    text: "Low glycemic index foods (whole grains, legumes) prevent blood sugar spikes and reduce insulin demand.",
    source: "Glycemic Index Foundation",
    sourceUrl: "https://www.gisymbol.com/about-glycemic-index/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'protein_breakfast',
    text: "A protein-rich breakfast (20-30g) stabilizes blood sugar and reduces cravings throughout the day.",
    source: "American Journal of Clinical Nutrition",
    sourceUrl: "https://academic.oup.com/ajcn/article/90/5/1390/4597219",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'fiber_hormones',
    text: "Fiber (25-30g daily) helps eliminate excess estrogen through the gut and supports balanced hormones.",
    source: "Harvard T.H. Chan School of Public Health",
    sourceUrl: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/fiber/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'anti_inflammatory_diet',
    text: "A Mediterranean-style diet rich in vegetables, olive oil, and fish reduced inflammatory markers in PCOS patients.",
    source: "European Society of Endocrinology",
    sourceUrl: "https://www.ese-hormones.org/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'spearmint_tea',
    text: "Spearmint tea (2 cups daily) was shown to reduce free testosterone and improve hirsutism in clinical trials.",
    source: "Phytotherapy Research Journal (PubMed)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19585478/",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'cinnamon_insulin',
    text: "Cinnamon (1-2g daily) may improve insulin sensitivity and reduce fasting glucose in insulin-resistant women.",
    source: "Diabetes Care Journal",
    sourceUrl: "https://diabetesjournals.org/care/article/26/12/3215/27659/Cinnamon-Improves-Glucose-and-Lipids-of-People",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'cycle_variability',
    text: "Cycle length can vary by 7-9 days even in ovulatory women. Irregular cycles do not mean you are failing.",
    source: "ACOG Patient Education",
    sourceUrl: "https://www.acog.org/womens-health/faqs/your-menstrual-cycle",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'follicular_energy',
    text: "Rising estrogen in the follicular phase boosts energy, mood, and cognitive performance. Use this phase for challenging tasks.",
    source: "Journal of Women's Health",
    sourceUrl: "https://www.liebertpub.com/loi/jwh",
    category: "Physical",
    triggers: ['follicular_phase']
  },
  {
    id: 'ovulation_cervical',
    text: "Clear, stretchy cervical mucus signals peak fertility. This is driven by high estrogen just before ovulation.",
    source: "Mayo Clinic — Fertility Awareness",
    sourceUrl: "https://www.mayoclinic.org/tests-procedures/cervical-mucus-method/about/pac-20393452",
    category: "Physical",
    triggers: ['follicular_phase']
  },
  {
    id: 'menstrual_phase_rest',
    text: "During menstruation, progesterone drops and iron levels may be low. Rest is not laziness—it is recovery.",
    source: "Cleveland Clinic",
    sourceUrl: "https://my.clevelandclinic.org/health/articles/10508-menstrual-cycle",
    category: "Physical",
    triggers: ['menstrual_phase']
  },
  {
    id: 'menstrual_prostaglandins',
    text: "Prostaglandins cause uterine contractions and cramping. NSAIDs work best when taken just before symptoms start.",
    source: "American Family Physician",
    sourceUrl: "https://www.aafp.org/pubs/afp/issues/2005/0115/p285.html",
    category: "Physical",
    triggers: ['menstrual_phase', 'high_pain']
  },
  {
    id: 'weight_loss_5percent',
    text: "Losing just 5-10% of body weight can restore ovulation and improve insulin sensitivity in women with PCOS.",
    source: "2023 International PCOS Guideline (Teede et al.)",
    sourceUrl: "https://www.monash.edu/medicine/sphpm/mchri/pcos/guideline",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'body_compassion',
    text: "PCOS is not caused by lack of willpower. It is a genetic, hormonal condition. You are managing it with courage.",
    source: "NIH — PCOS Overview",
    sourceUrl: "https://www.nichd.nih.gov/health/topics/pcos",
    category: "Emotional",
    triggers: ['general']
  },
  {
    id: 'cognitive_symptoms',
    text: "Brain fog and difficulty concentrating are real symptoms of insulin resistance and hormonal fluctuations, not in your head.",
    source: "Journal of Clinical Psychology (PubMed)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/28941302/",
    category: "Emotional",
    triggers: ['high_stress', 'general']
  },
  {
    id: 'mental_health_screening',
    text: "Women with PCOS have 3x higher rates of anxiety and depression. Screening and support are part of holistic care.",
    source: "2023 International PCOS Guideline (Teede et al.)",
    sourceUrl: "https://www.monash.edu/medicine/sphpm/mchri/pcos/guideline",
    category: "Emotional",
    triggers: ['general']
  },
  {
    id: 'therapy_cbt',
    text: "Cognitive behavioral therapy (CBT) improved quality of life and reduced anxiety in women with PCOS.",
    source: "Journal of Behavioral Medicine (PubMed)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25673129/",
    category: "Emotional",
    triggers: ['high_stress']
  },
  {
    id: 'metformin_benefits',
    text: "Metformin improves insulin sensitivity and can restore cycles, but lifestyle changes are equally effective for many women.",
    source: "Endocrine Society Clinical Practice Guidelines",
    sourceUrl: "https://www.endocrine.org/clinical-practice-guidelines/polycystic-ovary-syndrome",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'hirsutism_time',
    text: "Treatments for hirsutism (hair growth) take 6-9 months to show results because of the hair growth cycle.",
    source: "American Academy of Dermatology",
    sourceUrl: "https://www.aad.org/public/diseases/a-z/hirsutism-treatment",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'acne_hormonal',
    text: "PCOS-related acne is driven by androgens. It often responds better to hormonal treatments than topical creams alone.",
    source: "Journal of the American Academy of Dermatology",
    sourceUrl: "https://www.jaad.org/",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'hair_loss_ferritin',
    text: "Hair loss in PCOS can be worsened by low ferritin (iron stores). Optimal levels are >70 ng/mL for hair regrowth.",
    source: "Cleveland Clinic — Dermatology",
    sourceUrl: "https://my.clevelandclinic.org/health/diseases/21753-female-pattern-baldness",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'testosterone_reference',
    text: "Total testosterone >50 ng/dL is considered elevated in women. Free testosterone is often a more sensitive marker.",
    source: "Androgen Excess and PCOS Society",
    sourceUrl: "https://www.ae-society.org/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'amh_fertility',
    text: "High AMH in PCOS reflects many small follicles, not better fertility. It is a diagnostic marker, not a prognosis.",
    source: "Fertility and Sterility Journal",
    sourceUrl: "https://www.fertstert.org/",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'insulin_testing',
    text: "Fasting insulin >10 mIU/L or a 2-hour glucose tolerance test can reveal insulin resistance before diabetes develops.",
    source: "American Diabetes Association",
    sourceUrl: "https://diabetes.org/diabetes/diagnosis",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'gut_microbiome',
    text: "Emerging research links gut microbiome imbalances to PCOS. Probiotics and fiber support a healthy gut ecosystem.",
    source: "Nature Reviews Endocrinology",
    sourceUrl: "https://www.nature.com/nrendo/",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'caffeine_cortisol',
    text: "Excessive caffeine (>400mg/day) can elevate cortisol and worsen anxiety. Consider green tea as a gentler alternative.",
    source: "Journal of Clinical Psychopharmacology (PubMed)",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/15201585/",
    category: "Emotional",
    triggers: ['high_stress']
  },
  {
    id: 'alcohol_hormones',
    text: "Alcohol disrupts estrogen metabolism and can worsen insulin resistance. Moderation is key for hormonal balance.",
    source: "NIH National Institute on Alcohol Abuse and Alcoholism",
    sourceUrl: "https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/women-and-alcohol",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'seed_cycling',
    text: "Seed cycling (flax, pumpkin, sesame, sunflower) is popular, but lacks rigorous clinical evidence. It is safe to try.",
    source: "Integrative Medicine: A Clinician's Journal",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19500961/",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'birth_control_benefits',
    text: "Combined oral contraceptives regulate cycles and reduce androgens but do not treat underlying insulin resistance.",
    source: "ACOG Practice Bulletin",
    sourceUrl: "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2018/05/polycystic-ovary-syndrome",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'ovulation_prediction',
    text: "LH surge tests may be harder to interpret in PCOS due to elevated baseline LH. Track multiple signs for accuracy.",
    source: "Mayo Clinic — Fertility Center",
    sourceUrl: "https://www.mayoclinic.org/tests-procedures/ovulation-predictor-kits/about/pac-20394810",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'pcos_pregnancy',
    text: "With appropriate management, 80% of women with PCOS can conceive naturally. PCOS does not mean infertility.",
    source: "Royal College of Obstetricians and Gynaecologists",
    sourceUrl: "https://www.rcog.org.uk/for-the-public/browse-all-patient-information-leaflets/polycystic-ovary-syndrome-patient-information-leaflet/",
    category: "Physical",
    triggers: ['general']
  },
  {
    id: 'long_term_health',
    text: "Managing PCOS now reduces long-term risks of type 2 diabetes, cardiovascular disease, and endometrial cancer.",
    source: "Endocrine Society",
    sourceUrl: "https://www.endocrine.org/patient-engagement/endocrine-library/pcos",
    category: "Metabolic",
    triggers: ['general']
  },
  {
    id: 'community_support',
    text: "Connecting with others who understand PCOS reduces isolation and improves mental health outcomes.",
    source: "PCOS Awareness Association",
    sourceUrl: "https://www.pcosaa.org/",
    category: "Emotional",
    triggers: ['general']
  },
  {
    id: 'general_resilience',
    text: "You are not broken. You are navigating a complex endocrine condition with grace and resilience.",
    source: "2023 International PCOS Guideline (Teede et al.)",
    sourceUrl: "https://www.monash.edu/medicine/sphpm/mchri/pcos/guideline",
    category: "General",
    triggers: ['general']
  }
];
