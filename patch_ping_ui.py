import re

path = 'src/ui/components/context/DeviceContextSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';", "import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';\nimport { useLabStore } from '../../../app/store/useLabStore';")

old_ping = """      const target = window.prompt(`Send ping from ${device.name} to:`, '');
      if (target) {
        if (useWorkspaceStore.getState().isPredictionModeEnabled) { setPendingPrediction({ sourceId: device.id, targetId: target }); } else { useSimulationStore.getState().sendPing(device.id, target); }
      }"""

new_ping = """      const target = window.prompt(`Send ping from ${device.name} to:`, '');
      if (target) {
        if (useWorkspaceStore.getState().isPredictionModeEnabled) { 
          setPendingPrediction({ sourceId: device.id, targetId: target }); 
        } else { 
          useSimulationStore.getState().sendPing(device.id, target); 
          if (useLabStore.getState().activeLabId) {
            useLabStore.getState().addEvidence({
              tool: 'PING',
              target: target,
              result: `Ping intent dispatched to ${target}. Watch the topology for ICMP packets.`,
              observation: `Pinged ${target} from UI`
            });
          }
        }
      }"""

text = text.replace(old_ping, new_ping)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
