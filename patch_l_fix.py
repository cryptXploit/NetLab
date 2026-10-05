import re

def safe_replace(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if old in text:
        text = text.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)

path = 'src/ui/components/context/LabOverlay.tsx'
safe_replace(path, "import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
safe_replace(path, "CheckCircle2, ChevronRight, HelpCircle, X, Maximize2, Minimize2", "CheckCircle2, ChevronRight, HelpCircle, X, Maximize2, Minimize2, FastForward")
safe_replace(path, 
"""              <button 
                onClick={exitLab}
                className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
              >
                Return to Home
              </button>""",
"""              <button 
                onClick={exitLab}
                className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
              >
                Return to Home
              </button>
              
              <button 
                onClick={() => {
                  useTimelineStore.getState().setReplayMode(true, useTimelineStore.getState().initialSnapshot || undefined, engine.createSnapshot());
                }}
                className="w-full py-2 bg-elevated hover:bg-surface-hover text-secondary rounded font-medium mt-1 flex items-center justify-center gap-2 transition-colors border border-border"
              >
                <FastForward className="w-4 h-4" /> Review Timeline
              </button>""")


path = 'src/ui/components/practice/PracticeOverlay.tsx'
safe_replace(path, "import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
safe_replace(path, "CheckCircle2, FileText, HelpCircle, X, Maximize2, Minimize2, AlertTriangle, ShieldAlert", "CheckCircle2, FileText, HelpCircle, X, Maximize2, Minimize2, AlertTriangle, ShieldAlert, FastForward")
safe_replace(path, 
"""                <button 
                  onClick={exitPractice}
                  className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
                >
                  Return to Practice
                </button>""",
"""                <button 
                  onClick={exitPractice}
                  className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
                >
                  Return to Practice
                </button>
                
                <button 
                  onClick={() => {
                    useTimelineStore.getState().setReplayMode(true, useTimelineStore.getState().initialSnapshot || undefined, engine.createSnapshot());
                  }}
                  className="w-full py-2 bg-elevated hover:bg-surface-hover text-secondary rounded font-medium mt-1 flex items-center justify-center gap-2 transition-colors border border-border"
                >
                  <FastForward className="w-4 h-4" /> Review Timeline
                </button>""")

path = 'src/ui/components/screens/SandboxView.tsx'
safe_replace(path, "import { PredictionResultModal } from '../prediction/PredictionResultModal';", "import { PredictionResultModal } from '../prediction/PredictionResultModal';\nimport { ReplayTimeline } from '../timeline/ReplayTimeline';\nimport { EventDetailPanel } from '../timeline/EventDetailPanel';")
safe_replace(path,
"""        <PredictionResultModal />
        
        {activePracticeId ? <PracticeOverlay /> : (activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : (activeLab ? <LabOverlay /> : null))}""",
"""        <PredictionResultModal />
        
        <ReplayTimeline />
        <EventDetailPanel />
        
        {activePracticeId ? <PracticeOverlay /> : (activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : (activeLab ? <LabOverlay /> : null))}""")


path = 'src/ui/components/timeline/ReplayTimeline.tsx'
safe_replace(path, "import type { SimulationEvent } from '../../../core/events/SimulationEvent';", "")
safe_replace(path, "const { isReplayMode, replayTick, maxTick, filter, selectedEventId, setReplayTick, setFilter, setSelectedEvent, setReplayMode, initialSnapshot, latestSnapshot } = useTimelineStore();", "const { isReplayMode, maxTick, filter, selectedEventId, setSelectedEvent, setReplayMode, initialSnapshot, latestSnapshot } = useTimelineStore();")
safe_replace(path, "setReplayTick(targetTick);", "")
