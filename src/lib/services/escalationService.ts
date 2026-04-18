import { supabase } from '../supabase';

export interface EscalationMetadata {
  crisisLevel: 'moderate' | 'severe';
  blossomScore: number;
  season: string;
}

export async function sendCrisisAlert(metadata: EscalationMetadata): Promise<void> {
  try {
    const lastAlert = localStorage.getItem('last_crisis_alert');
    const now = new Date().getTime();
    if (lastAlert && (now - parseInt(lastAlert)) < 30 * 60 * 1000) return;

    await supabase.functions.invoke('crisis-alert', {
      body: {
        level: metadata.crisisLevel,
        score: metadata.blossomScore,
        season: metadata.season,
        timestamp: new Date().toISOString()
      }
    });

    localStorage.setItem('last_crisis_alert', now.toString());
  } catch (error) {
    console.error('Crisis alert failed silently. Privacy preserved.');
  }
}
