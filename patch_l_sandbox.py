import re

path = 'src/ui/components/screens/SandboxView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { PracticeOverlay } from '../practice/PracticeOverlay';", "import { PracticeOverlay } from '../practice/PracticeOverlay';\nimport { ReplayTimeline } from '../timeline/ReplayTimeline';\nimport { EventDetailPanel } from '../timeline/EventDetailPanel';")

old_modals = """        <PredictionModal />
        <PredictionResultModal />
        
        {activePracticeId ? <PracticeOverlay /> : (activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : (activeLab ? <LabOverlay /> : null))}"""

new_modals = """        <PredictionModal />
        <PredictionResultModal />
        
        <ReplayTimeline />
        <EventDetailPanel />
        
        {activePracticeId ? <PracticeOverlay /> : (activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : (activeLab ? <LabOverlay /> : null))}"""

text = text.replace(old_modals, new_modals)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
