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

patch('src/ui/components/context/LabOverlay.tsx', [
    ("""              <button 
                onClick={exitLab}
                className="w-full py-2 bg-success hover:bg-success/90 text-white rounded font-medium mt-2 transition-colors"
              >
                Return to Home
              </button>""", """              <button 
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
])
