export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function scheduleProactiveReminder(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const lastReminder = localStorage.getItem('last_proactive_reminder');
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (lastReminder && now - parseInt(lastReminder) < oneDayMs) return;

  const messages = [
    { title: 'Blossom', body: 'How are you feeling today? Take a moment to log your wellness.' },
    { title: 'Blossom', body: 'Your body has a story to tell. Ready to listen together?' },
    { title: 'Blossom', body: 'A gentle check-in when you are ready.' },
    { title: 'Blossom', body: 'Showing up for yourself, even on hard days, is beautiful.' }
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];

  try {
    new Notification(msg.title, {
      body: msg.body,
      icon: '/logo-icon.png',
      badge: '/logo-icon.png',
      tag: 'blossom-daily-reminder',
      renotify: false
    });
    localStorage.setItem('last_proactive_reminder', now.toString());
  } catch {
  }
}

export function cancelProactiveReminders(): void {
  localStorage.removeItem('last_proactive_reminder');
}
