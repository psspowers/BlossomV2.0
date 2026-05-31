export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
      console.warn('[Storage] Safe read failed for key:', key, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('[Storage] Safe write failed for key:', key, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[Storage] Safe delete failed for key:', key, e);
    }
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (e) {
      console.warn('[Storage] Safe clear failed', e);
    }
  },
  sessionGet: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
    } catch (e) {
      console.warn('[Storage] Safe session read failed for key:', key, e);
      return null;
    }
  },
  sessionSet: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('[Storage] Safe session write failed for key:', key, e);
    }
  },
};
