import React from 'react';

import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';

export const NetworkDoctorPanel: React.FC = () => {
  const report = useWorkspaceStore(state => state.diagnosticReport);
  const clearDiagnostics = useWorkspaceStore(state => state.clearDiagnostics);

  if (!report) return null;

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className={`p-4 flex items-center justify-between border-b ${report.isHealthy ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10'}`}>
          <div className="flex items-center gap-3">
            {report.isHealthy ? (
              <ShieldCheck className="w-6 h-6 text-green-500" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-500" />
            )}
            <h2 className={`font-bold text-lg ${report.isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {report.isHealthy ? 'NETWORK HEALTHY' : 'NETWORK ANOMALIES DETECTED'}
            </h2>
          </div>
          <button 
            onClick={clearDiagnostics}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {report.isHealthy ? (
            <div className="text-zinc-300">
              <p className="mb-2">All systems nominal.</p>
              <p className="text-sm text-zinc-500">Physical layer links are UP and routing tables match valid next-hop gateways across all L2 segments.</p>
            </div>
          ) : (
            <div>
              <p className="text-zinc-300 mb-4">The following issues require your attention:</p>
              <ul className="space-y-3">
                {report.issues.map((issue, idx) => (
                  <li key={idx} className="flex gap-3 items-start bg-zinc-800/50 p-3 rounded border border-zinc-800">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span className="text-sm text-zinc-300 leading-tight">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={clearDiagnostics}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors text-sm font-medium"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
