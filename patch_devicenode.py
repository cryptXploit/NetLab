import re

path = 'src/ui/components/topology/DeviceNode.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('  const addLink = useSimulationStore(state => state.addLink);', '  const addLink = useSimulationStore(state => state.addLink);\n  const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);')
text = text.replace('  const setPendingLinkSource = useWorkspaceStore(state => state.setPendingLinkSource);', '  const setPendingLinkSource = useWorkspaceStore(state => state.setPendingLinkSource);\n  const setPendingConnectionTarget = useWorkspaceStore(state => state.setPendingConnectionTarget);')

logic = """        if (pendingLinkSourceId !== device.id) {
          const sourceIfaces = getAvailableInterfaces(pendingLinkSourceId);
          const targetIfaces = getAvailableInterfaces(device.id);

          if (sourceIfaces.length === 1 && targetIfaces.length === 1) {
            addLink(pendingLinkSourceId, sourceIfaces[0].id, device.id, targetIfaces[0].id);
            setPendingLinkSource(null);
          } else if (sourceIfaces.length === 0 || targetIfaces.length === 0) {
            // Toast would be good here, but for now just clear
            setPendingLinkSource(null);
          } else {
            setPendingConnectionTarget(device.id);
          }
        } else {"""

text = re.sub(r'        if \(pendingLinkSourceId !== device\.id\) \{\n          addLink\(pendingLinkSourceId, device\.id\);\n          setPendingLinkSource\(null\);\n        \} else \{', logic, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
