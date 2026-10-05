import React from 'react';
import { useSettingsStore } from '../../../app/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { X, Moon, Sun, Monitor, Globe, Vibrate } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const { isSettingsOpen, toggleSettings, theme, setTheme, language, setLanguage, hapticsEnabled, setHaptics } = useSettingsStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[250] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">{t('Settings')}</h2>
          <button onClick={toggleSettings} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {/* Theme */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4" />
              {t('Theme')}
            </label>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800/50">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-md text-sm transition-all ${theme === 'light' ? 'bg-zinc-800 text-zinc-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-md text-sm transition-all ${theme === 'dark' ? 'bg-zinc-800 text-zinc-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-md text-sm transition-all ${theme === 'system' ? 'bg-zinc-800 text-zinc-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('Language')}
            </label>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800/50">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-zinc-800 text-zinc-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'bn' ? 'bg-zinc-800 text-zinc-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                BN
              </button>
            </div>
          </div>

          {/* Haptics */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              {t('Haptics')}
            </label>
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800/50 p-3 rounded-lg">
              <span className="text-sm text-zinc-300">Enable tactile feedback</span>
              <button
                onClick={() => setHaptics(!hapticsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${hapticsEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hapticsEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
