import { supabase } from '../supabase';
import { db } from '../db';

export async function getOrGenerateBotToken(): Promise<string | null> {
  try {
    const profile = await db.settings.toCollection().first();
    if (profile?.botToken) return profile.botToken;

    const newToken = crypto.randomUUID().replace(/-/g, '');

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ bot_token: newToken }).eq('id', user.id);
    }

    if (profile?.id) {
      await db.settings.update(profile.id, { botToken: newToken });
    }

    return newToken;
  } catch (error) {
    console.error('Token generation failed:', error);
    return null;
  }
}
