import React from 'react';

import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { CheckCircle2, XCircle } from 'lucide-react';

export const PredictionModal: React.FC = () => {
  const pending = useWorkspaceStore(state => state.pendingPrediction);
  const submitPrediction = useWorkspaceStore(state => state.submitPrediction);

  if (!pending) return null;

  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-[110] backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-strong rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-base text-center">
          <h2 className="font-bold text-xl text-accent mb-2">Prediction Mode</h2>
          <p className="text-secondary text-sm">
            What do you think will happen to the ping from <span className="font-mono text-primary">{pending.sourceId}</span> to <span className="font-mono text-primary">{pending.targetId}</span>?
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <button 
            onClick={() => submitPrediction('DELIVERED')}
            className="flex items-center gap-4 p-4 bg-elevated hover:bg-green-900/40 border border-border-strong hover:border-green-500/50 rounded-lg transition-all group text-left"
          >
            <CheckCircle2 className="w-8 h-8 text-muted group-hover:text-success" />
            <div>
              <div className="font-bold text-primary group-hover:text-success">It will reach the destination</div>
              <div className="text-xs text-muted group-hover:text-success/70">The network path is healthy and routing is correct.</div>
            </div>
          </button>

          <button 
            onClick={() => submitPrediction('DROPPED')}
            className="flex items-center gap-4 p-4 bg-elevated hover:bg-red-900/40 border border-border-strong hover:border-red-500/50 rounded-lg transition-all group text-left"
          >
            <XCircle className="w-8 h-8 text-muted group-hover:text-danger" />
            <div>
              <div className="font-bold text-primary group-hover:text-danger">It will be dropped</div>
              <div className="text-xs text-muted group-hover:text-danger/70">A failure exists in the physical or routing layer.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
