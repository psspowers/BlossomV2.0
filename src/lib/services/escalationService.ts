import { supabase } from '../supabase';

const CRISIS_ALERT_RATE_KEY = 'blossom_crisis_alert_last';
const CRISIS_ALERT_COOLDOWN_MS = 30 * 60 * 1000;

function canFireCrisisAlert(): boolean {
  const last = localStorage.getItem(CRISIS_ALERT_RATE_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last) > CRISIS_ALERT_COOLDOWN_MS;
}

function markCrisisAlertFired(): void {
  localStorage.setItem(CRISIS_ALERT_RATE_KEY, String(Date.now()));
}

export async function triggerEscalation(message: string): Promise<void> {
  if (!canFireCrisisAlert()) return;

  markCrisisAlertFired();

  try {
    await supabase.functions.invoke('crisis-alert', {
      body: {
        message: message.slice(0, 200),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Crisis alert dispatch failed:', error);
  }
}

export function isCrisisMessage(text: string): boolean {
  const lower = text.toLowerCase();
  const keywords = [
    'kill myself',
    'end my life',
    'want to die',
    'suicide',
    'not worth living',
    'hurt myself',
    'self harm',
    'self-harm',
    'cutting',
    'no reason to live',
    'give up on life',
    'i cant go on',
    "i can't go on",
    'rather be dead',
  ];
  return keywords.some((kw) => lower.includes(kw));
}
