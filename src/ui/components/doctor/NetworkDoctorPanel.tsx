import React from 'react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { useLabStore } from '../../../app/store/useLabStore';
import { ShieldCheck, ShieldAlert, X, FileSearch } from 'lucide-react';

export const NetworkDoctorPanel: React.FC = () => {
  const report = useWorkspaceStore(state => state.diagnosticReport);
  const clearDiagnostics = useWorkspaceStore(state => state.clearDiagnostics);
  const activeLabId = useLabStore(state => state.activeLabId);
  const progress = useLabStore(state => state.progress[activeLabId || '']);
  const lab = useLabStore(state => state.getLabById(activeLabId || ''));

  if (!report) return null;

  const isTroubleshooting = lab?.mode === 'troubleshooting';
  const isChallenge = lab?.isChallenge;

  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
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
              <p className="mb-2 font-medium">All systems nominal.</p>
              <p className="text-sm text-muted">Physical layer links are UP and routing tables match valid next-hop gateways across all L2 segments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!isTroubleshooting && (
                <div>
                  <p className="text-secondary font-medium mb-3">The following issues require your attention:</p>
                  <ul className="space-y-2">
                    {report.issues.map((issue, idx) => (
                      <li key={idx} className="flex gap-2 items-start bg-elevated p-3 rounded-lg border border-border">
                        <span className="text-danger font-bold mt-0.5">•</span>
                        <span className="text-sm text-secondary leading-tight">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isTroubleshooting && (
                <div className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 font-bold text-accent mb-2">
                      <FileSearch className="w-5 h-5" /> Diagnostic Assistant
                    </h4>
                    
                    <p className="text-sm text-primary mb-3">
                      I see you're troubleshooting <span className="font-semibold text-accent">{lab?.title}</span>.
                    </p>

                    <div className="bg-surface rounded border border-border p-3 mb-3">
                      <p className="text-xs font-bold text-muted uppercase mb-1">Evidence Collected</p>
                      {progress?.investigationLog?.length ? (
                        <p className="text-sm text-secondary">{progress.investigationLog.length} clues found.</p>
                      ) : (
                        <p className="text-sm text-secondary italic">No evidence collected yet. Use Terminal tools.</p>
                      )}
                    </div>

                    {!isChallenge && lab?.troubleshootingConfig && (
                      <div className="bg-surface rounded border border-border p-3">
                        <p className="text-xs font-bold text-muted uppercase mb-1">Doctor's Hint</p>
                        <p className="text-sm text-secondary">
                          {lab.hints.length > 0 ? lab.hints[0].message : "Check your routing tables and default gateways carefully."}
                        </p>
                      </div>
                    )}
                    
                    {isChallenge && (
                      <p className="text-sm text-secondary">
                        This is a Challenge scenario. You must rely on your collected evidence to deduce the root cause. Use the terminal tools!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-base border-t border-border flex justify-end">
          <button 
            onClick={clearDiagnostics}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
