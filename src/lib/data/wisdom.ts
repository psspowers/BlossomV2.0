export interface WisdomCard {
  id: string;
  text: string;
  source: string;
  category: 'Physical' | 'Metabolic' | 'Emotional' | 'General';
  triggers: string[];
}

export const WISDOM_LIBRARY: WisdomCard[] = [
  {
    id: 'sleep_insulin',
    text: "Sleep deprivation (<6h) reduces insulin sensitivity by up to 30%. Prioritize rest today to help stabilize your metabolism.",
    source: "National Sleep Foundation",
    category: "Metabolic",
    triggers: ['low_sleep']
  },
  {
    id: 'stress_cortisol',
    text: "High stress triggers cortisol, which can increase androgen production. A 5-minute deep breathing break is biological medicine.",
    source: "NIH Research",
    category: "Emotional",
    triggers: ['high_stress']
  },
  {
    id: 'luteal_energy',
    text: "In the Luteal phase, your metabolic rate increases and energy naturally dips. It is okay to choose gentle movement today.",
    source: "ACOG Guidelines",
    category: "Physical",
    triggers: ['luteal_phase']
  },
  {
    id: 'magnesium_pain',
    text: "Magnesium-rich foods (spinach, pumpkin seeds) or supplements can help relax uterine muscles and reduce cramping.",
    source: "Mayo Clinic",
    category: "Physical",
    triggers: ['high_pain']
  },
  {
    id: 'general_resilience',
    text: "You are not broken. You are navigating a complex endocrine condition with grace and resilience.",
    source: "Blossom Affirmations",
    category: "General",
    triggers: ['general']
  }
];
