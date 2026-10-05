import React, { useEffect, useState } from 'react';
import { useLabStore } from '../../../app/store/useLabStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { CheckCircle2, FileText, HelpCircle, X, Maximize2, Minimize2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TroubleshootingOverlay: React.FC = () => {
  const activeLabId = useLabStore(state => state.activeLabId);
  const progress = useLabStore(state => state.progress[activeLabId || '']);
  const getLabById = useLabStore(state => state.getLabById);
  const exitLab = useLabStore(state => state.exitLab);
  const markLabComplete = useLabStore(state => state.markLabComplete);

  const eventHistory = useSimulationStore(state => state.eventHistory);
  const engine = useSimulationStore(state => state.engine);

  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    if (!activeLabId || !progress) return;
    const lab = getLabById(activeLabId);
    if (!lab || lab.mode !== 'troubleshooting' || !lab.troubleshootingConfig) return;

    if (progress.status === 'Completed') return;

    if (lab.troubleshootingConfig.verificationCondition(engine, eventHistory)) {
      markLabComplete(activeLabId);
    }
  }, [eventHistory, activeLabId, progress, engine, markLabComplete, getLabById]);

  if (!activeLabId || !progress) return null;
  const lab = getLabById(activeLabId);
  if (!lab || lab.mode !== 'troubleshooting' || !lab.troubleshootingConfig) return null;

  const isCompleted = progress.status === 'Completed';
  const config = lab.troubleshootingConfig;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`absolute top-safe-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[350px] bg-surface/95 backdrop-blur border-2 border-danger/50 shadow-2xl rounded-2xl z-40 overflow-hidden transition-all duration-300 ${minimized ? 'h-14' : ''}`}
      >
        <div className="flex items-center justify-between p-3 border-b border-border bg-danger/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-danger" />
            <h3 className="font-bold text-danger truncate text-sm uppercase tracking-wide">Network Broken</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(!minimized)} className="p-1.5 text-secondary hover:text-primary rounded-md">
              {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={exitLab} className="p-1.5 text-secondary hover:text-danger rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {isCompleted ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <h4 className="text-lg font-bold text-primary mb-1">Network Restored!</h4>
                <div className="bg-elevated p-3 rounded-lg border border-border text-left mb-4 mt-4">
                  <p className="text-xs font-bold text-muted uppercase mb-1">Root Cause</p>
                  <p className="text-sm text-primary font-medium mb-3">{config.rootCause}</p>
                  <p className="text-xs font-bold text-muted uppercase mb-1">Why it worked</p>
                  <p className="text-sm text-secondary">{config.solutionExplanation}</p>
                </div>
                <button 
                  onClick={exitLab}
                  className="w-full py-2 bg-success hover:bg-success-hover text-white rounded-lg font-medium text-sm"
                >
                  Return to Sandbox
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="text-primary font-bold text-lg mb-1">{lab.title}</h4>
                  <p className="text-sm text-secondary leading-relaxed">{config.objective}</p>
                </div>
                
                <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
                  <p className="text-xs font-bold text-danger uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Symptom
                  </p>
                  <p className="text-sm text-primary">{config.symptom}</p>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="w-full flex items-center justify-between p-3 bg-elevated hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-sm">Investigation Log</span>
                    </div>
                    <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      {progress.investigationLog?.length || 0}
                    </span>
                  </button>
                  {showEvidence && (
                    <div className="p-3 bg-surface border-t border-border flex flex-col gap-3">
                      {!progress.investigationLog?.length ? (
                        <p className="text-xs text-muted text-center py-2">No evidence collected yet. Use Terminal tools.</p>
                      ) : (
                        progress.investigationLog.map(ev => (
                          <div key={ev.id} className="text-xs border-l-2 border-accent pl-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-primary">{ev.tool} &rarr; {ev.target}</span>
                            </div>
                            <p className="text-muted font-mono bg-elevated p-1 rounded whitespace-pre-wrap truncate max-h-20">{ev.result}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Need a Hint?
                  </button>
                </div>
                
                {showHint && lab.hints.length > 0 && (
                  <div className="mt-2 text-sm text-secondary bg-elevated p-3 rounded-lg border border-border border-dashed">
                    💡 {lab.hints[0].message}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
