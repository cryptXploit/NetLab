import re

path = 'src/ui/components/context/LabOverlay.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
text = text.replace("import { CheckCircle2, ChevronRight, HelpCircle, X, Maximize2, Minimize2 } from 'lucide-react';", "import { CheckCircle2, ChevronRight, HelpCircle, X, Maximize2, Minimize2, FastForward } from 'lucide-react';")

replay_btn = """              <button 
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
              </button>"""

text = text.replace("""              <button 
                onClick={exitLab}
                className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
              >
                Return to Home
              </button>""", replay_btn)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/ui/components/practice/PracticeOverlay.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
text = text.replace("import { CheckCircle2, HelpCircle, X, Maximize2, Minimize2 } from 'lucide-react';", "import { CheckCircle2, HelpCircle, X, Maximize2, Minimize2, FastForward } from 'lucide-react';")

replay_btn_prac = """                <button 
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
                  <FastForward className="w-4 h-4" /> Review Attempt
                </button>"""

text = text.replace("""                <button 
                  onClick={exitPractice}
                  className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
                >
                  Return to Practice
                </button>""", replay_btn_prac)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
