import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { Stethoscope, Shuffle, User, Share2, Download, Save, Library } from 'lucide-react';
import { LibraryService } from '../../../core/persistence/LibraryService';
import { useLibraryStore } from '../../../app/store/useLibraryStore';
import { useToastStore } from '../../../app/store/useToastStore';
import { useState } from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { useTutorialStore } from '../../../app/store/useTutorialStore';
import { useSettingsStore } from '../../../app/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { ShareLabModal } from '../sharing/ShareLabModal';
import { ImportLabModal } from '../sharing/ImportLabModal';
import { useProfileStore } from '../../../app/store/useProfileStore';

export const AppHeader: React.FC = () => {
  const loadBasicLab = useSimulationStore(state => state.loadBasicLab);
  const loadRandomScenario = useSimulationStore(state => state.loadRandomScenario);
  const injectFault = useSimulationStore(state => state.injectFault);
  const runDiagnostics = useSimulationStore(state => state.runDiagnostics);
  const isPredictionModeEnabled = useSimulationStore(state => state.isPredictionModeEnabled);
  const togglePredictionMode = useSimulationStore(state => state.togglePredictionMode);

  const currentView = useSimulationStore(state => state.currentView);
  const setView = useSimulationStore(state => state.setView);
  
  const level = useProfileStore(state => state.level);
  const toggleProfile = useProfileStore(state => state.toggleProfile);
  const toggleSettings = useSettingsStore(state => state.toggleSettings);
  const toggleLibrary = useLibraryStore(state => state.toggleLibrary);
  const startTutorial = useTutorialStore(state => state.startTutorial);
  const addToast = useToastStore(state => state.addToast);
  const engine = useSimulationStore(state => state.engine);
  const { t } = useTranslation();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleSaveLab = async () => {
    const name = window.prompt("Enter a name for this lab:");
    if (!name) return;
    try {
      await LibraryService.saveCurrentLab(engine, name);
      addToast('Lab Saved', `Successfully saved "${name}" to your library.`, 'success');
    } catch (e) {
      addToast('Save Failed', 'Failed to save the lab.', 'info');
    }
  };

  return (
    <div className="h-14 md:h-14 bg-zinc-900 border-t md:border-t-0 md:border-b border-zinc-800 flex items-center px-2 md:px-4 gap-2 md:gap-4 select-none w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none">
      <div className="text-zinc-100 font-bold text-lg hidden md:block">NETLAB</div>
      <div className="flex-1 min-w-0 flex items-center overflow-x-auto whitespace-nowrap hide-scrollbar gap-3 pb-1 pointer-events-auto">
      
      
      {/* Main View Navigation */}
      <div className="flex bg-zinc-950 rounded border border-zinc-800 p-0.5 mr-4">
        <button
          onClick={() => setView('LAB')}
          className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${currentView === 'LAB' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Lab Workspace
        </button>
        <button
          onClick={() => setView('PRACTICE')}
          className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${currentView === 'PRACTICE' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Practice Arena
        </button>
      </div>

      <button 
        onClick={loadBasicLab}
        className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors shrink-0"
      >
        {t('Load Basic Lab')}
      </button>
      <button 
        onClick={loadRandomScenario}
        className="px-3 py-1.5 text-sm bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50 transition-colors flex items-center gap-2 shrink-0"
      >
        <Shuffle className="w-4 h-4" />
        {t('Random Scenario')}
      </button>
      <div className="border-l border-zinc-700 h-8 mx-2"></div>
      
      <button 
        onClick={togglePredictionMode}
        className={`px-3 py-1.5 text-sm rounded border transition-colors ${
          isPredictionModeEnabled 
            ? 'bg-purple-900/50 border-purple-500/50 text-purple-300' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        Prediction Mode: {isPredictionModeEnabled ? 'ON' : 'OFF'}
      </button>

      <div className="border-l border-zinc-700 h-8 mx-2"></div>

      <button 
        onClick={runDiagnostics}
        className="px-3 py-1.5 text-sm bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded border border-blue-900/50 transition-colors flex items-center gap-2 shrink-0"
      >
        <Stethoscope className="w-4 h-4" />
        {t('Run Doctor')}
      </button>
      <div className="border-l border-zinc-700 h-8 mx-2"></div>
      <button 
        onClick={() => injectFault('LINK_DOWN')}
        className="px-3 py-1.5 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded border border-red-900/50 transition-colors"
      >
        Inject Link Cut
      </button>
      <button 
        onClick={() => injectFault('BAD_GATEWAY')}
        className="px-3 py-1.5 text-sm bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 rounded border border-orange-900/50 transition-colors"
      >
        Inject Bad Gateway
      </button>

      <div className="flex-1 hidden md:block shrink-0 min-w-8"></div>
      
      <button 
        onClick={handleSaveLab}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors shrink-0"
      >
        <Save className="w-4 h-4" />
        Save Lab
      </button>
      <button 
        onClick={toggleLibrary}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors mr-2 shrink-0"
      >
        <Library className="w-4 h-4" />
        My Library
      </button>
      
      <button 
        onClick={() => setIsShareOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {t('Share Lab')}
      </button>
      <button 
        onClick={() => setIsImportOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors mr-2"
      >
        <Download className="w-4 h-4" />
        {t('Import Lab')}
      </button>
      
      <div className="border-l border-zinc-700 h-8 mx-2"></div>
      <button 
        onClick={startTutorial}
        className="flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors shrink-0"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <button 
        onClick={toggleSettings}
        className="flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors shrink-0"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button 
        onClick={toggleProfile}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors group shrink-0"
      >
        <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/30">
          Lvl {level}
        </span>
        <User className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
      </button>
      </div>
      <ShareLabModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <ImportLabModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
};
