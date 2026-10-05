import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { CheckCircle2, XCircle } from 'lucide-react';

export const PredictionModal: React.FC = () => {
  const pending = useWorkspaceStore(state => state.pendingPrediction);
  const submitPrediction = useSimulationStore(state => state.submitPrediction);

  if (!pending) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-zinc-800 text-center">
          <h2 className="font-bold text-xl text-blue-400 mb-2">Prediction Mode</h2>
          <p className="text-zinc-300 text-sm">
            What do you think will happen to the ping from <span className="font-mono text-zinc-100">{pending.sourceId}</span> to <span className="font-mono text-zinc-100">{pending.targetId}</span>?
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <button 
            onClick={() => submitPrediction('DELIVERED')}
            className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-green-900/40 border border-zinc-700 hover:border-green-500/50 rounded-lg transition-all group text-left"
          >
            <CheckCircle2 className="w-8 h-8 text-zinc-500 group-hover:text-green-500" />
            <div>
              <div className="font-bold text-zinc-200 group-hover:text-green-400">It will reach the destination</div>
              <div className="text-xs text-zinc-500 group-hover:text-green-500/70">The network path is healthy and routing is correct.</div>
            </div>
          </button>

          <button 
            onClick={() => submitPrediction('DROPPED')}
            className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-all group text-left"
          >
            <XCircle className="w-8 h-8 text-zinc-500 group-hover:text-red-500" />
            <div>
              <div className="font-bold text-zinc-200 group-hover:text-red-400">It will be dropped</div>
              <div className="text-xs text-zinc-500 group-hover:text-red-500/70">A failure exists in the physical or routing layer.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
