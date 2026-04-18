export async function requestWithInAppConsent(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem('blossom_reminders_enabled', 'true');
    return true;
  }
  return false;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function checkAndFireReminder(): void {
  const enabled = localStorage.getItem('blossom_reminders_enabled') === 'true';
  if (!enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const hour = now.getHours();
  const todayKey = now.toDateString();

  const reminders = [
    {
      hour: 8,
      key: 'morning',
      title: 'Blossom',
      body: 'Good morning 🌸 How are you feeling today?',
    },
    {
      hour: 13,
      key: 'midday',
      title: 'Blossom',
      body: 'Midday check-in 🌿 A moment for yourself.',
    },
    {
      hour: 19,
      key: 'evening',
      title: 'Blossom',
      body: 'Evening reflection 🌸 How did your body feel today?',
    },
  ];

  reminders.forEach((reminder) => {
    const storageKey = `blossom_reminder_${reminder.key}_${todayKey}`;
    if (hour >= reminder.hour && !localStorage.getItem(storageKey)) {
      try {
        new Notification(reminder.title, {
          body: reminder.body,
          icon: '/logo-icon.png',
          badge: '/logo-icon.png',
          tag: `blossom-${reminder.key}`,
        });
        localStorage.setItem(storageKey, 'shown');
      } catch {
      }
    }
  });
}

export function areRemindersEnabled(): boolean {
  return (
    localStorage.getItem('blossom_reminders_enabled') === 'true' &&
    Notification.permission === 'granted'
  );
}

export function scheduleProactiveReminder(): void {
  checkAndFireReminder();
}

export function cancelProactiveReminders(): void {
  localStorage.removeItem('blossom_reminders_enabled');
  localStorage.removeItem('last_proactive_reminder');
}
