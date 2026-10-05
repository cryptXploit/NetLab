import re

path = 'src/ui/components/controls/SimulationControls.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add isPredictionModeEnabled and setPendingPrediction
hooks = """  const isPredictionModeEnabled = useWorkspaceStore(state => state.isPredictionModeEnabled);
  const setPendingPrediction = useWorkspaceStore(state => state.setPendingPrediction);
"""
text = text.replace(
    "const mode = useWorkspaceStore(state => state.mode);",
    hooks + "  const mode = useWorkspaceStore(state => state.mode);"
)

# Replace the sendPing onClick
text = text.replace(
    "onClick={() => { HapticService.tap(); sendPing('hostA', 'server.netlab'); }}",
    "onClick={() => { HapticService.tap(); if (isPredictionModeEnabled) { setPendingPrediction({ sourceId: 'hostA', targetId: 'server.netlab' }); } else { sendPing('hostA', 'server.netlab'); } }}"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
