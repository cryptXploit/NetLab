import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

export const SimulationControls: React.FC = () => {
  const currentTick = useSimulationStore((state) => state.currentTick);
  const stepForward = useSimulationStore((state) => state.stepForward);
  const reset = useSimulationStore((state) => state.reset);
  const sendPing = useSimulationStore((state) => state.sendPing);
  const requestDHCP = useSimulationStore((state) => state.requestDHCP);
  
  const mode = useSimulationStore((state) => state.mode);
  const setMode = useSimulationStore((state) => state.setMode);
  const addDevice = useSimulationStore((state) => state.addDevice);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl flex flex-col items-center space-y-4 text-zinc-200">
      
      {/* Mode Toggle */}
      <div className="flex bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setMode('SIMULATE')}
          className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'SIMULATE' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          SIMULATE
        </button>
        <button
          onClick={() => setMode('EDIT')}
          className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'EDIT' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          EDIT GRAPH
        </button>
      </div>

      <div className="flex items-center space-x-6">
        {mode === 'SIMULATE' ? (
          <>
            <div className="font-mono text-sm">
              Tick: <span className="font-bold text-zinc-50">{currentTick}</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => sendPing('hostA', 'server.netlab')}
                className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/80 active:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Ping server.netlab
              </button>
              <button
                onClick={() => requestDHCP('hostC')}
                className="px-4 py-2 bg-green-600/50 hover:bg-green-600/80 active:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                Request IP (Host C)
              </button>
              <button
                onClick={stepForward}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
              >
                Step Forward
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
          <div className="flex space-x-2">
            <button
              onClick={() => addDevice('HOST', 400, 300)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Host
            </button>
            <button
              onClick={() => addDevice('SWITCH', 400, 300)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Switch
            </button>
            <button
              onClick={() => addDevice('ROUTER', 400, 300)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Router
            </button>
            <div className="px-4 py-2 text-sm text-zinc-400">
              Drag nodes to move. Click two nodes to link them.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
