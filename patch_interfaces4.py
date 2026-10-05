import re

path = 'src/ui/components/context/DeviceContextSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add getLinks and removeLink
text = text.replace('const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);', 'const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);\n  const getLinks = useSimulationStore(state => state.engine.getLinks);\n  const removeLink = useSimulationStore(state => state.removeLink);')

# Update rendering to include Disconnect button
new_render = """
          (() => {
            const availableIfaces = getAvailableInterfaces(device.id);
            const allLinks = getLinks();
            return (
            <div className="space-y-3">
              {device.interfaces.map(iface => {
                const isAvailable = availableIfaces.some(i => i.id === iface.id);
                const connectedLink = !isAvailable ? allLinks.find(l => l.interface1Id === iface.id || l.interface2Id === iface.id) : null;
                return (
                <div key={iface.id} className="bg-elevated border border-border-base rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm font-bold text-primary">{iface.id}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {isAvailable ? 'Available' : 'Connected'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${iface.status === 'UP' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {iface.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-secondary font-mono flex flex-col gap-2 mt-2">
                    <div className="flex justify-between">
                      <span>MAC: {iface.macAddress}</span>
                      <span>IP: {iface.ipAddress ? iface.ipAddress : 'Unassigned'}</span>
                    </div>
                    {!isAvailable && connectedLink && (
                      <button 
                        onClick={() => removeLink(connectedLink.id)}
                        className="mt-2 text-center py-1.5 px-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-md font-medium transition-colors w-full"
                      >
                        Disconnect Link
                      </button>
                    )}
                  </div>
                </div>
              )})}
              {device.interfaces.length === 0 && (
                <p className="text-sm text-muted">No interfaces configured.</p>
              )}
            </div>
            );
          })()
"""

# Splitting carefully like before
parts = text.split("{activeTab === 'interfaces' && ")
if len(parts) == 2:
    subparts = parts[1].split("{activeTab === 'routing' && (")
    if len(subparts) == 2:
        text = parts[0] + "{activeTab === 'interfaces' && " + new_render + "        {activeTab === 'routing' && (" + subparts[1]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
