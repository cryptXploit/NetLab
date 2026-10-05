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

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  theme: 'dark',
  language: 'en',
  hapticsEnabled: true,
  isSettingsOpen: false,

  initializeSettings: async () => {
    const savedTheme = (await PreferenceService.get('theme')) as 'dark' | 'light' | 'system' | null;
    const savedLang = (await PreferenceService.get('language')) as 'en' | 'bn' | null;
    const savedHaptics = await PreferenceService.get('hapticsEnabled');

    if (savedTheme) get().setTheme(savedTheme);
    if (savedLang) get().setLanguage(savedLang);
    if (savedHaptics !== null) get().setHaptics(savedHaptics === 'true');
  },

  setTheme: (theme) => {
    set({ theme });
    PreferenceService.set('theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
