import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

export const AppHeader: React.FC = () => {
  const loadBasicLab = useSimulationStore(state => state.loadBasicLab);
  const loadBrokenGatewayLab = useSimulationStore(state => state.loadBrokenGatewayLab);

  return (
    <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-4 select-none z-50 relative">
      <div className="text-zinc-100 font-bold text-lg mr-8">NETLAB</div>
      <button 
        onClick={loadBasicLab}
        className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
      >
        Load Basic Lab
      </button>
      <button 
        onClick={loadBrokenGatewayLab}
        className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
      >
        Load Broken Gateway Lab
      </button>
    </div>
  );
};
