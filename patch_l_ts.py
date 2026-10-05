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

# 1. Timeline Store
patch('src/app/store/useTimelineStore.ts', [
    ("import { SimulationState }", "import type { SimulationState }")
])

# 2. ReplayTimeline
patch('src/ui/components/timeline/ReplayTimeline.tsx', [
    ("Play, Pause, SkipBack, SkipForward, AlertTriangle, MessageSquare, ShieldAlert, FastForward, Rewind", "Play, Pause, SkipBack, SkipForward, ShieldAlert"),
    ("import { SimulationEvent, SimulationEventType }", "import type { SimulationEvent }"),
    ("const isPlaying = useSimulationStore(state => state.isRunning);", "const isPlaying = useSimulationStore(state => state.isPlaying);"),
    ("const setRunning = useSimulationStore(state => state.setRunning);", "const play = useSimulationStore(state => state.play);\n  const pause = useSimulationStore(state => state.pause);"),
    ("setRunning(false);", "pause();"),
    ("engine.step(stepsToTake);", "engine.tick(stepsToTake);"),
    ("onClick={() => setRunning(!isPlaying)}", "onClick={() => isPlaying ? pause() : play()}"),
    ("setReplayTick(targetTick);", ""),
    ("setFilter,", "")
])

# 3. EventDetailPanel
patch('src/ui/components/timeline/EventDetailPanel.tsx', [
    ("import { X, Network, ShieldAlert, CheckCircle2, Search, ArrowRight }", "import { X, Network, ShieldAlert, CheckCircle2, Search }"),
    ("(jEvt, idx)", "(jEvt)")
])

# 4. Overlays
patch('src/ui/components/context/LabOverlay.tsx', [
    ("HelpCircle, X, Maximize2, Minimize2, FastForward }", "HelpCircle, X, Maximize2, Minimize2, FastForward }"),
    ("import { useTimelineStore } from '../../../app/store/useTimelineStore';", "import { useTimelineStore } from '../../../app/store/useTimelineStore';")
])

patch('src/ui/components/practice/PracticeOverlay.tsx', [
    ("HelpCircle, X, Maximize2, Minimize2 }", "HelpCircle, X, Maximize2, Minimize2, FastForward }")
])

# Wait, `useTimelineStore` wasn't used in LabOverlay according to TS?
# That means `FastForward` and `useTimelineStore` in `LabOverlay` were reported as unused.
# Let's ensure they are used correctly.
