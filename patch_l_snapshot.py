import re

path = 'src/ui/components/screens/LabsView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
text = text.replace("startLab(labId);", "startLab(labId);\n      useTimelineStore.getState().setReplayMode(false, engine.createSnapshot());")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/ui/components/practice/PracticeView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useSimulationStore } from '../../../app/store/useSimulationStore';", "import { useSimulationStore } from '../../../app/store/useSimulationStore';\nimport { useTimelineStore } from '../../../app/store/useTimelineStore';")
text = text.replace("setTab('sandbox');", "setTab('sandbox');\n    useTimelineStore.getState().setReplayMode(false, engine.createSnapshot());")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
