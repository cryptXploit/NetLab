import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { HapticService } from '../../../core/native/HapticService';
import { useTranslation } from 'react-i18next';

export const SimulationControls: React.FC = () => {
  const { t } = useTranslation();
  const currentTick = useSimulationStore((state) => state.currentTick);
  const stepForward = useSimulationStore((state) => state.stepForward);
  const reset = useSimulationStore((state) => state.reset);
  const sendPing = useSimulationStore((state) => state.sendPing);
  const requestDHCP = useSimulationStore((state) => state.requestDHCP);
  
    const isPredictionModeEnabled = useWorkspaceStore(state => state.isPredictionModeEnabled);
  const setPendingPrediction = useWorkspaceStore(state => state.setPendingPrediction);
  const mode = useWorkspaceStore(state => state.mode);
  const setMode = useWorkspaceStore(state => state.setMode);
  const addDevice = useSimulationStore((state) => state.addDevice);

  return (
    <div className="absolute bottom-0 left-0 w-full md:bottom-6 md:left-1/2 md:-translate-x-1/2 bg-surface border-t md:border border-border-strong md:rounded-xl p-3 md:p-4 shadow-2xl flex flex-col items-center gap-3 text-primary z-30 pointer-events-auto">
      
      {/* Mode Toggle */}
      <div className="flex bg-elevated rounded-lg p-1">
        <button
          onClick={() => setMode('SIMULATE')}
          className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'SIMULATE' ? 'bg-accent text-white' : 'text-secondary hover:text-white'}`}
        >
          SIMULATE
        </button>
        <button
          onClick={() => setMode('EDIT')}
          className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'EDIT' ? 'bg-warning text-white' : 'text-secondary hover:text-white'}`}
        >
          EDIT GRAPH
        </button>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-3 md:gap-6 w-full max-w-md mx-auto">
        {mode === 'SIMULATE' ? (
          <>
            <div className="font-mono text-sm">
              Tick: <span className="font-bold text-primary">{currentTick}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => { HapticService.tap(); if (isPredictionModeEnabled) { setPendingPrediction({ sourceId: 'hostA', targetId: 'server.netlab' }); } else { sendPing('hostA', 'server.netlab'); } }}
                className="px-4 py-2 bg-accent/50 hover:bg-accent/80 active:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                {t('Send Ping')}
              </button>
              <button
                onClick={() => requestDHCP('hostC')}
                className="px-4 py-2 bg-green-600/50 hover:bg-green-600/80 active:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                Request IP (Host C)
              </button>
              <button
                onClick={() => { HapticService.tap(); stepForward(); }}
                className="px-4 py-2 bg-elevated hover:bg-border-strong active:bg-border-strong rounded-lg text-sm font-medium transition-colors"
              >
                {t('Tick')}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-900/80 active:bg-red-800 rounded-lg text-sm font-medium text-red-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => addDevice('HOST', 400, 300)}
              className="px-4 py-2 bg-elevated hover:bg-border-strong active:bg-border-strong rounded-lg text-sm font-medium transition-colors"
            >
              + Add Host
            </button>
            <button
              onClick={() => addDevice('SWITCH', 400, 300)}
              className="px-4 py-2 bg-elevated hover:bg-border-strong active:bg-border-strong rounded-lg text-sm font-medium transition-colors"
            >
              + Add Switch
            </button>
            <button
              onClick={() => addDevice('ROUTER', 400, 300)}
              className="px-4 py-2 bg-elevated hover:bg-border-strong active:bg-border-strong rounded-lg text-sm font-medium transition-colors"
            >
              + Add Router
            </button>
            <div className="px-4 py-2 text-sm text-secondary">
              Drag nodes to move. Click two nodes to link them.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
