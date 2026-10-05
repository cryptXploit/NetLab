import React from 'react';

import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { Award, Frown, X } from 'lucide-react';

export const PredictionResultModal: React.FC = () => {
  const result = useWorkspaceStore(state => state.predictionResult);
  const clearPredictionResult = useWorkspaceStore(state => state.clearPredictionResult);

  if (!result) return null;

  return (
    <div className="absolute inset-0 flex items-start justify-center pt-24 z-[120] pointer-events-none">
      <div className={`pointer-events-auto bg-surface border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in slide-in-from-top-10
        ${result.success ? 'border-green-500/50 shadow-green-900/20' : 'border-red-500/50 shadow-red-900/20'}
      `}>
        <div className={`p-4 flex items-center justify-between border-b ${result.success ? 'bg-green-900/20 border-green-900/30' : 'bg-red-900/20 border-red-900/30'}`}>
          <div className="flex items-center gap-3">
            {result.success ? (
              <Award className="w-6 h-6 text-success" />
            ) : (
              <Frown className="w-6 h-6 text-danger" />
            )}
            <h2 className={`font-bold text-lg ${result.success ? 'text-success' : 'text-danger'}`}>
              {result.success ? 'Prediction Correct!' : 'Prediction Incorrect'}
            </h2>
          </div>
          <button 
            onClick={clearPredictionResult}
            className="text-muted hover:text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-secondary mb-2 font-medium">
            Actual Outcome: <span className={result.actualOutcome === 'DELIVERED' ? 'text-success' : 'text-danger'}>{result.actualOutcome}</span>
          </div>
          <div className="bg-base border border-border-base rounded p-3 text-sm text-secondary font-mono">
            {result.explanation}
          </div>
        </div>

        <div className="p-4 bg-base border-t border-border-base flex justify-end">
          <button 
            onClick={clearPredictionResult}
            className="px-4 py-2 bg-elevated hover:bg-border-strong text-primary rounded transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
