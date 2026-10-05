import React, { useEffect, useState } from 'react';
import { useLabStore } from '../../../app/store/useLabStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

import { evaluateRules } from '../../../core/simulation/ScenarioEvaluator';
import { CheckCircle2, ChevronRight, HelpCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LabOverlay: React.FC = () => {
  const activeLabId = useLabStore(state => state.activeLabId);
  const progress = useLabStore(state => state.progress[activeLabId || '']);
  const getLabById = useLabStore(state => state.getLabById);
  const exitLab = useLabStore(state => state.exitLab);
  const advanceStep = useLabStore(state => state.advanceStep);

  const eventHistory = useSimulationStore(state => state.eventHistory);
  const engine = useSimulationStore(state => state.engine);

  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!activeLabId || !progress) return;
    const lab = getLabById(activeLabId);
    if (!lab) return;

    if (progress.status === 'Completed') return;

    const currentStep = lab.steps[progress.currentStepIndex];
    if (currentStep.verificationRules) {
      const isSuccess = evaluateRules(currentStep.verificationRules, engine);
      if (isSuccess) {
        advanceStep();
      }
    }
  }, [eventHistory, activeLabId, progress, engine, advanceStep, getLabById]);

  if (!activeLabId || !progress) return null;
  const lab = getLabById(activeLabId);
  if (!lab) return null;

  const isCompleted = progress.status === 'Completed';
  const currentStep = lab.steps[progress.currentStepIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`absolute top-safe-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-surface/95 backdrop-blur border border-border shadow-2xl rounded-2xl z-40 overflow-hidden transition-all duration-300 ${minimized ? 'h-14' : ''}`}
      >
        <div className="flex items-center justify-between p-3 border-b border-border bg-elevated/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-xs font-bold">{progress.currentStepIndex + 1}/{lab.steps.length}</span>
            </div>
            <h3 className="font-semibold text-primary truncate max-w-[150px] text-sm">{lab.title}</h3>
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
          <div className="p-4 flex flex-col gap-4">
            {isCompleted ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <h4 className="text-lg font-bold text-primary mb-1">Lab Completed!</h4>
                <p className="text-sm text-secondary mb-4">You have successfully finished this lab.</p>
                <button 
                  onClick={exitLab}
                  className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm"
                >
                  Return to Sandbox
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="text-primary font-bold mb-1">{currentStep.title}</h4>
                  <p className="text-sm text-secondary leading-relaxed">{currentStep.instruction}</p>
                </div>
                
                {currentStep.actionRequired && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Action Required</p>
                    <p className="text-sm text-primary">{currentStep.actionRequired}</p>
                  </div>
                )}
                
                {currentStep.observation && (
                  <div className="bg-accent/5 border border-accent/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-accent uppercase mb-1">Observe</p>
                    <p className="text-sm text-secondary">{currentStep.observation}</p>
                  </div>
                )}
                
                {currentStep.explanation && (
                  <div className="bg-elevated border border-border rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted uppercase mb-1">Why?</p>
                    <p className="text-sm text-secondary">{currentStep.explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Need a Hint?
                  </button>
                  {!currentStep.verificationRules && (
                    <button 
                      onClick={advanceStep}
                      className="flex items-center gap-1 text-sm font-medium text-white bg-accent hover:bg-accent-hover px-4 py-1.5 rounded-full"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
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
