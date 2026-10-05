import re

path = 'src/ui/components/context/DeviceContextSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# First add the import
text = text.replace('  const removeDevice = useSimulationStore(state => state.removeDevice);', '  const removeDevice = useSimulationStore(state => state.removeDevice);\n  const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);')

# Now find the exact block using string splitting
parts = text.split("{activeTab === 'interfaces' && (")
if len(parts) == 2:
    subparts = parts[1].split("{activeTab === 'routing' && (")
    if len(subparts) == 2:
        replacement = """
          (() => {
            const availableIfaces = getAvailableInterfaces(device.id);
            return (
            <div className="space-y-3">
              {device.interfaces.map(iface => {
                const isAvailable = availableIfaces.some(i => i.id === iface.id);
                return (
                <div key={iface.id} className="bg-elevated border border-border-base rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm font-bold text-primary">{iface.id}</span>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {isAvailable ? 'Available' : 'Connected'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${iface.status === 'UP' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {iface.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-secondary font-mono flex flex-col gap-1">
                    <div>MAC: {iface.macAddress}</div>
                    <div>IP: {iface.ipAddress ? iface.ipAddress : 'Unassigned'}</div>
                  </div>
                </div>
              )})}
              {device.interfaces.length === 0 && (
                <p className="text-sm text-muted">No interfaces configured.</p>
              )}
            </div>
            );
          })()}
        """
        text = parts[0] + "{activeTab === 'interfaces' && " + replacement + "        {activeTab === 'routing' && (" + subparts[1]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
