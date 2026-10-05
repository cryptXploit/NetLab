import re

path = 'src/ui/components/context/DeviceContextSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add getLinks and removeLink
text = text.replace('const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);', 'const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);\n  const getLinks = useSimulationStore(state => state.engine.getLinks);\n  const removeLink = useSimulationStore(state => state.removeLink);')

# Add allLinks
text = text.replace('const availableIfaces = getAvailableInterfaces(device.id);', 'const availableIfaces = getAvailableInterfaces(device.id);\n            const allLinks = getLinks();')

# Add connectedLink
text = text.replace('const isAvailable = availableIfaces.some(i => i.id === iface.id);', 'const isAvailable = availableIfaces.some(i => i.id === iface.id);\n                const connectedLink = !isAvailable ? allLinks.find(l => l.interface1Id === iface.id || l.interface2Id === iface.id) : null;')

button_html = """                  <div className="text-xs text-secondary font-mono flex flex-col gap-1">
                    <div>MAC: {iface.macAddress}</div>
                    <div>IP: {iface.ipAddress ? iface.ipAddress : 'Unassigned'}</div>
                    {!isAvailable && connectedLink && (
                      <button 
                        onClick={() => removeLink(connectedLink.id)}
                        className="mt-2 py-1.5 px-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-md font-medium transition-colors text-center"
                      >
                        Disconnect Link
                      </button>
                    )}
                  </div>"""

text = text.replace("""                  <div className="text-xs text-secondary font-mono flex flex-col gap-1">
                    <div>MAC: {iface.macAddress}</div>
                    <div>IP: {iface.ipAddress ? iface.ipAddress : 'Unassigned'}</div>
                  </div>""", button_html)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
