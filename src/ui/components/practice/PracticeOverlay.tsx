import React, { useEffect, useState } from 'react';
import { usePracticeStore } from '../../../app/store/usePracticeStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { evaluateRules } from '../../../core/simulation/ScenarioEvaluator';
import { generateWrongGatewayPractice } from '../../../core/simulation/ScenarioGenerator';
import { CheckCircle2, HelpCircle, X, Maximize2, Minimize2, ShieldAlert } from 'lucide-react';

export const PracticeOverlay: React.FC = () => {
  const activeAttemptId = usePracticeStore(state => state.activeAttemptId);
  const history = usePracticeStore(state => state.history);
  const finishPractice = usePracticeStore(state => state.finishPractice);
  const exitPractice = usePracticeStore(state => state.exitPractice);
  const recordHintUsed = usePracticeStore(state => state.recordHintUsed);

  const eventHistory = useSimulationStore(state => state.eventHistory);
  const engine = useSimulationStore(state => state.engine);

  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const attempt = history.find(a => a.id === activeAttemptId);
  
  // Deterministic generation based on practice seed
  const template = attempt?.seed ? generateWrongGatewayPractice(parseInt(attempt.seed)) : null;

  useEffect(() => {
    if (!attempt || attempt.result || !template || !template.troubleshootingConfig) return;
    
    if (template.troubleshootingConfig.verificationRules && evaluateRules(template.troubleshootingConfig.verificationRules, engine)) {
      const hints = attempt.hintsUsed || 0;
      const mistakes = attempt.mistakes || 0;
      const score = Math.max(0, 1000 - (hints * 100) - (mistakes * 50));
      finishPractice('SUCCESS', score);
    }
  }, [eventHistory, attempt, engine, finishPractice, template]);

  if (!attempt || !template || !template.troubleshootingConfig) return null;

  const isCompleted = attempt.result === 'SUCCESS';
  const config = template.troubleshootingConfig;

  return (
    <div className={`absolute bottom-4 left-4 z-50 flex flex-col transition-all duration-300 ${minimized ? 'w-auto' : 'w-full max-w-sm'}`}>
      <div className={`bg-surface/95 backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden flex flex-col ${isCompleted ? 'border-success' : 'border-accent'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${isCompleted ? 'bg-success/10 border-success/20' : 'bg-accent/10 border-accent/20'}`}>
          <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Flame className="w-4 h-4 text-accent" />}
            <span className={`font-bold text-xs uppercase tracking-wider ${isCompleted ? 'text-success' : 'text-accent'}`}>
              {isCompleted ? 'PRACTICE COMPLETE' : 'PRACTICE MODE'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-black/10 rounded">
              {minimized ? <Maximize2 className="w-3 h-3 text-secondary" /> : <Minimize2 className="w-3 h-3 text-secondary" />}
            </button>
            <button onClick={exitPractice} className="p-1 hover:bg-danger/10 hover:text-danger rounded">
              <X className="w-3 h-3 text-secondary" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!minimized && (
          <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {!isCompleted ? (
              <>
                <div>
                  <h3 className="font-bold text-primary mb-1">{template.title}</h3>
                  <p className="text-sm text-secondary leading-snug">{config.objective}</p>
                </div>

                <div className="bg-danger/5 border border-danger/20 rounded p-3 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-danger uppercase block mb-1">Reported Symptom</span>
                    <p className="text-sm text-primary">{config.symptom}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs font-mono text-muted">
                    HINTS USED: {attempt.hintsUsed}
                  </div>
                  <button 
                    onClick={() => {
                      recordHintUsed();
                      setShowHint(true);
                    }}
                    disabled={showHint || template.hints.length === 0}
                    className="flex items-center gap-1.5 text-xs font-medium bg-elevated border border-border px-3 py-1.5 rounded hover:bg-surface-hover disabled:opacity-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Need Hint?
                  </button>
                </div>
                
                {showHint && template.hints.length > 0 && (
                  <div className="bg-elevated rounded p-3 text-sm text-primary border border-border">
                    <span className="font-bold mr-2 text-accent">Hint:</span>
                    {template.hints[0].message}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-primary mb-2">Issue Resolved</h3>
                  <p className="text-sm text-secondary">{config.solutionExplanation}</p>
                </div>
                <div className="bg-success/10 rounded-lg p-3 w-full border border-success/20">
                  <p className="text-sm font-bold text-success mb-1">PRACTICE SCORE</p>
                  <p className="text-3xl font-black text-success">{attempt.score}</p>
                </div>
                <button 
                  onClick={exitPractice}
                  className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
                >
                  Return to Practice
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Flame = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);
