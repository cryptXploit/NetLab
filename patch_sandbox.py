import re

path = 'src/ui/components/screens/SandboxView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("  const isPredictionModeEnabled = useWorkspaceStore(state => state.isPredictionModeEnabled);", "  const isPredictionModeEnabled = useWorkspaceStore(state => state.isPredictionModeEnabled);\n  const activeLabId = useLabStore(state => state.activeLabId);\n  const activeLab = useLabStore(state => state.getLabById(activeLabId || ''));")
text = text.replace("{useLabStore.getState().getLabById(useLabStore.getState().activeLabId || '')?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : <LabOverlay />}", "{activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : <LabOverlay />}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
