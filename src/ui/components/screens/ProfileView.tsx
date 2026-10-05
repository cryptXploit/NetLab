import React from 'react';
import { User, Download, Share2, Award, Moon, Sun, Monitor, Smartphone, Globe } from 'lucide-react';
import { useProfileStore } from '../../../app/store/useProfileStore';
import { useSettingsStore } from '../../../app/store/useSettingsStore';


export const ProfileView: React.FC = () => {
  
  
  
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);
  const language = useSettingsStore(state => state.language);
  const setLanguage = useSettingsStore(state => state.setLanguage);
  const hapticsEnabled = useSettingsStore(state => state.hapticsEnabled);
  const setHaptics = useSettingsStore(state => state.setHaptics);

  

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-base text-primary pb-24 pt-8 px-4 md:px-8">
      
      <header className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-accent-soft text-accent rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Level {useProfileStore(state => state.level)}</h1>
          <p className="text-secondary">{useProfileStore(state => state.totalXp)} XP Total</p>
        </div>
      </header>

      <div className="flex flex-col gap-8 max-w-lg w-full">
        
        {/* Settings Section */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Preferences</h2>
          <div className="bg-surface border border-border-base rounded-2xl overflow-hidden divide-y divide-border-base">
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary font-medium">
                <Moon className="w-5 h-5 text-secondary" />
                Theme
              </div>
              <div className="flex bg-elevated rounded-lg p-1 border border-border-base">
                <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-surface shadow text-primary' : 'text-muted'}`}>
                  <Sun className="w-4 h-4" />
                </button>
                <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-surface shadow text-primary' : 'text-muted'}`}>
                  <Moon className="w-4 h-4" />
                </button>
                <button onClick={() => setTheme('system')} className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === 'system' ? 'bg-surface shadow text-primary' : 'text-muted'}`}>
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary font-medium">
                <Globe className="w-5 h-5 text-secondary" />
                Language
              </div>
              <div className="flex bg-elevated rounded-lg p-1 border border-border-base">
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-md text-sm transition-colors ${language === 'en' ? 'bg-surface shadow text-primary' : 'text-muted'}`}>EN</button>
                <button onClick={() => setLanguage('bn')} className={`px-3 py-1 rounded-md text-sm transition-colors ${language === 'bn' ? 'bg-surface shadow text-primary' : 'text-muted'}`}>BN</button>
              </div>
            </div>

            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-elevated transition-colors">
              <div className="flex items-center gap-3 text-primary font-medium">
                <Smartphone className="w-5 h-5 text-secondary" />
                Haptics
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" checked={hapticsEnabled} onChange={(e) => setHaptics(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-elevated appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:bg-white checked:border-accent" style={{ backgroundColor: hapticsEnabled ? 'var(--accent)' : '' }} />
                <div className="toggle-label block overflow-hidden h-5 rounded-full bg-border-strong cursor-pointer" style={{ backgroundColor: hapticsEnabled ? 'var(--accent)' : '' }}></div>
              </div>
            </label>

          </div>
        </section>

        {/* Tools Section */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Data</h2>
          <div className="bg-surface border border-border-base rounded-2xl overflow-hidden divide-y divide-border-base">
            <button className="w-full p-4 flex items-center gap-3 text-primary font-medium hover:bg-elevated transition-colors text-left">
              <Download className="w-5 h-5 text-secondary" />
              Import Lab
            </button>
            <button className="w-full p-4 flex items-center gap-3 text-primary font-medium hover:bg-elevated transition-colors text-left">
              <Share2 className="w-5 h-5 text-secondary" />
              Export / Share Lab
            </button>
          </div>
        </section>

        {/* Progress */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Achievements</h2>
          <div className="bg-surface border border-border-base rounded-2xl p-6 flex flex-col items-center justify-center text-secondary min-h-[150px]">
            <Award className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Complete challenges to earn achievements.</p>
          </div>
        </section>
        
      </div>
    </div>
  );
};
