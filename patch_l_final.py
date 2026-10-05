import re
import os

def patch(path, ops):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for op in ops:
        text = text.replace(op[0], op[1])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

# Fix LabOverlay
patch('src/ui/components/context/LabOverlay.tsx', [
    ("""                  <button 
                    onClick={exitLab}
                    className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm"
                  >
                    Return to Sandbox
                  </button>""", """                  <button 
                    onClick={exitLab}
                    className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm"
                  >
                    Return to Sandbox
                  </button>
                  <button 
                    onClick={() => {
                      useTimelineStore.getState().setReplayMode(true, useTimelineStore.getState().initialSnapshot || undefined, engine.createSnapshot());
                    }}
                    className="w-full py-2 bg-elevated hover:bg-surface-hover text-secondary rounded-lg font-medium text-sm mt-1 flex items-center justify-center gap-2 transition-colors border border-border"
                  >
                    <FastForward className="w-4 h-4" /> Review Timeline
                  </button>""")
])

# Fix PracticeOverlay (import FastForward)
patch('src/ui/components/practice/PracticeOverlay.tsx', [
    ("import { CheckCircle2, FileText, HelpCircle, X, Maximize2, Minimize2, AlertTriangle, ShieldAlert } from 'lucide-react';", "import { CheckCircle2, FileText, HelpCircle, X, Maximize2, Minimize2, AlertTriangle, ShieldAlert, FastForward } from 'lucide-react';")
])

# Fix SandboxView
patch('src/ui/components/screens/SandboxView.tsx', [
    ("import { ReplayTimeline } from '../timeline/ReplayTimeline';", "import { ReplayTimeline } from '../timeline/ReplayTimeline';\nimport { EventDetailPanel } from '../timeline/EventDetailPanel';"),
    ("""        <ReplayTimeline />
        <EventDetailPanel />""", "") # Remove existing if there are duplicates
])

patch('src/ui/components/screens/SandboxView.tsx', [
    ("""        <PredictionResultModal />""", """        <PredictionResultModal />\n        <ReplayTimeline />\n        <EventDetailPanel />""")
])

patch('src/ui/components/timeline/ReplayTimeline.tsx', [
    ("import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport type { SimulationEvent } from '../../../core/events/SimulationEvent';")
])
