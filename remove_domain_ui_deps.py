import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove useWorkspaceStore import
text = re.sub(r'import \{ useWorkspaceStore \}.*?;\n', '', text)

# Remove prediction check in sendPing
sendPingCode = """
    sendPing: (sourceId: string, targetHostname: string) => {
      const currentEngine = get().engine;
      
      useProfileStore.getState().unlockAchievement('FIRST_PING');

      currentEngine.enqueueEvent({
        id: `intent-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 0,
        type: SimulationEventType.APP_PING_INTENT,
        payload: { sourceId, targetHostname },
        explanation: `Application requested ping to ${targetHostname}.`
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },
"""
text = re.sub(r'    sendPing: \(sourceId: string, targetHostname: string\) => \{.*?    \},\n', sendPingCode.lstrip('\n') + '\n', text, flags=re.DOTALL)

# Remove prediction logic from submitPrediction (it shouldn't be in SimulationStore at all, but let's just make it a pure intent dispatcher if it's there, OR move it to WorkspaceStore)
# Actually, submitPrediction is just a wrapper around APP_PING_INTENT with a packetId.
submitPredictionCode = """
    submitPrediction: (sourceId: string, targetHostname: string, packetId: string) => {
      const currentEngine = get().engine;
      currentEngine.enqueueEvent({
        id: `intent-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 0,
        type: SimulationEventType.APP_PING_INTENT,
        payload: { sourceId, targetHostname, packetId },
        explanation: `Application requested ping to ${targetHostname}.`
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },
"""
# Note: we need to update the interface for submitPrediction!
text = re.sub(r'    submitPrediction: \([^)]*\) => \{.*?    \},\n', submitPredictionCode.lstrip('\n') + '\n', text, flags=re.DOTALL)

# Interface update
text = text.replace(
    "submitPrediction: (expectedOutcome: 'DELIVERED' | 'DROPPED') => void;",
    "submitPrediction: (sourceId: string, targetHostname: string, packetId: string) => void;"
)

# Remove pendingLinkSourceId logic from addLink
addLinkCode = """
    addLink: (sourceId: string, targetId: string) => {
      const eng = get().engine;
      const src = eng.getDevice(sourceId);
      const tgt = eng.getDevice(targetId);
      if (!src || !tgt || sourceId === targetId) {
        return;
      }
      
      const srcIface = src.interfaces[0]; // just bind to first interface for edit
      const tgtIface = tgt.interfaces[0];
      const linkId = `link-${Math.random().toString(36).substring(2, 7)}`;
      eng.addLink(createLink(linkId, srcIface.id, tgtIface.id));
      
      set({ links: eng.getLinks() });
    },
"""
text = re.sub(r'    addLink: \(sourceId: string, targetId: string\) => \{.*?    \},\n', addLinkCode.lstrip('\n') + '\n', text, flags=re.DOTALL)


# Remove WorkspaceStore activePrediction update from Handlers!
# The handlers currently do:
# const ws = useWorkspaceStore.getState();
# if (ws.activePrediction && ws.activePrediction.packetId === packet.id) { ... }

text = re.sub(r'\s*const ws = useWorkspaceStore\.getState\(\);.*?\s*ws\.setActivePrediction\(null\);\s*\}', '', text, flags=re.DOTALL)


with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
