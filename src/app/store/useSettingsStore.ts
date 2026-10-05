import { create } from 'zustand';
import { PreferenceService } from '../../core/native/PreferenceService';
import i18next from '../i18n/config';

interface SettingsStoreState {
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'bn';
  hapticsEnabled: boolean;
  isSettingsOpen: boolean;

  initializeSettings: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setLanguage: (language: 'en' | 'bn') => void;
  setHaptics: (enabled: boolean) => void;
  toggleSettings: () => void;
}

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

const applyTheme = (theme: 'dark' | 'light' | 'system') => {
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  theme: 'system',
  language: 'en',
  hapticsEnabled: true,
  isSettingsOpen: false,

  initializeSettings: async () => {
    const savedTheme = (await PreferenceService.get('theme')) as 'dark' | 'light' | 'system' | null;
    const savedLang = (await PreferenceService.get('language')) as 'en' | 'bn' | null;
    const savedHaptics = await PreferenceService.get('hapticsEnabled');

    if (savedTheme) {
      get().setTheme(savedTheme);
    } else {
      get().setTheme('system');
    }
    
    if (savedLang) get().setLanguage(savedLang);
    if (savedHaptics !== null) get().setHaptics(savedHaptics === 'true');
  },

  setTheme: (theme) => {
    set({ theme });
    PreferenceService.set('theme', theme);
    applyTheme(theme);
    
    const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (mediaQueryListener && mq) {
      mq.removeEventListener('change', mediaQueryListener);
    }
    if (theme === 'system') {
      mediaQueryListener = () => {
        applyTheme('system');
      };
      if (mq) mq.addEventListener('change', mediaQueryListener);
    }
  },

  setLanguage: (language) => {
    set({ language });
    PreferenceService.set('language', language);
    i18next.changeLanguage(language);
  },

  setHaptics: (enabled) => {
    set({ hapticsEnabled: enabled });
    PreferenceService.set('hapticsEnabled', enabled ? 'true' : 'false');
    (window as any).NETLAB_HAPTICS_ENABLED = enabled;
  },

  toggleSettings: () => {
    set(state => ({ isSettingsOpen: !state.isSettingsOpen }));
  }
}));

// Setup initial listener if system is default
const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
mediaQueryListener = () => {
  if (useSettingsStore.getState().theme === 'system') {
    applyTheme('system');
  }
};
if (mq) mq.addEventListener('change', mediaQueryListener);
