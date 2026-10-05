import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { Stethoscope, Shuffle } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const loadBasicLab = useSimulationStore(state => state.loadBasicLab);
  const loadRandomScenario = useSimulationStore(state => state.loadRandomScenario);
  const injectFault = useSimulationStore(state => state.injectFault);
  const runDiagnostics = useSimulationStore(state => state.runDiagnostics);
  const isPredictionModeEnabled = useSimulationStore(state => state.isPredictionModeEnabled);
  const togglePredictionMode = useSimulationStore(state => state.togglePredictionMode);

  const currentView = useSimulationStore(state => state.currentView);
  const setView = useSimulationStore(state => state.setView);

  return (
    <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-4 select-none z-50 relative">
      <div className="text-zinc-100 font-bold text-lg mr-4">NETLAB</div>
      
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
        className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
      >
        Load Basic Lab
      </button>
      <button 
        onClick={loadRandomScenario}
        className="px-3 py-1.5 text-sm bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50 transition-colors flex items-center gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Random Scenario
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
        className="px-3 py-1.5 text-sm bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded border border-blue-900/50 transition-colors flex items-center gap-2"
      >
        <Stethoscope className="w-4 h-4" />
        Run Doctor
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
    </div>
  );
};
