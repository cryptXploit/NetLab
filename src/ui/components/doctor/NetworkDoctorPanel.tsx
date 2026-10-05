import React from 'react';

import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';

export const NetworkDoctorPanel: React.FC = () => {
  const report = useWorkspaceStore(state => state.diagnosticReport);
  const clearDiagnostics = useWorkspaceStore(state => state.clearDiagnostics);

  if (!report) return null;

  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-base rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className={`p-4 flex items-center justify-between border-b ${report.isHealthy ? 'border-success/50 bg-success/10' : 'border-danger/50 bg-danger/10'}`}>
          <div className="flex items-center gap-3">
            {report.isHealthy ? (
              <ShieldCheck className="w-6 h-6 text-success" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-danger" />
            )}
            <h2 className={`font-bold text-lg ${report.isHealthy ? 'text-success' : 'text-danger'}`}>
              {report.isHealthy ? 'NETWORK HEALTHY' : 'NETWORK ANOMALIES DETECTED'}
            </h2>
          </div>
          <button 
            onClick={clearDiagnostics}
            className="text-muted hover:text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {report.isHealthy ? (
            <div className="text-secondary">
              <p className="mb-2">All systems nominal.</p>
              <p className="text-sm text-muted">Physical layer links are UP and routing tables match valid next-hop gateways across all L2 segments.</p>
            </div>
          ) : (
            <div>
              <p className="text-secondary mb-4">The following issues require your attention:</p>
              <ul className="space-y-3">
                {report.issues.map((issue, idx) => (
                  <li key={idx} className="flex gap-3 items-start bg-elevated/50 p-3 rounded border border-border-base">
                    <span className="text-danger font-bold mt-0.5">•</span>
                    <span className="text-sm text-secondary leading-tight">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-base border-t border-border-base flex justify-end">
          <button 
            onClick={clearDiagnostics}
            className="px-4 py-2 bg-elevated hover:bg-border-strong text-primary rounded transition-colors text-sm font-medium"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
