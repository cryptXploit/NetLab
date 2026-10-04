import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

export const SimulationControls: React.FC = () => {
  const currentTick = useSimulationStore((state) => state.currentTick);
  const stepForward = useSimulationStore((state) => state.stepForward);
  const reset = useSimulationStore((state) => state.reset);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl flex items-center space-x-6 text-zinc-200">
      <div className="font-mono text-sm">
        Tick: <span className="font-bold text-zinc-50">{currentTick}</span>
      </div>
      
      <div className="flex space-x-2">
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
    </div>
  );
};
