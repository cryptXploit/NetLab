import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

def repl_transit(match):
    return """          if (!targetDeviceId) {
            let outboundIfaceId = payload.outboundInterfaceId;
            if (!outboundIfaceId) {
              outboundIfaceId = srcDevice.interfaces.find(i => i.macAddress === packet.sourceMac)?.id;
            }
            if (!outboundIfaceId) {
              // Fallback to routing table if still no outbound interface
              const route = findLongestPrefixMatch(packet.destinationIp, srcDevice.routingTable || []);
              if (route && route.interfaceId) {
                outboundIfaceId = route.interfaceId;
              } else {
                // Cannot determine outbound interface
                eng.enqueueEvent({
                  id: `drop-${packet.id}-${eng.getCurrentTick()}`,
                  timestamp: 0,
                  type: SimulationEventType.PACKET_DROPPED,
                  payload: { packet },
                  explanation: `No route to destination.`,
                }, 0);
                return;
              }
            }
  
            outIface = srcDevice.interfaces.find(i => i.id === outboundIfaceId);"""

text = re.sub(r'          if \(\!targetDeviceId\) \{\n            let outboundIfaceId = payload\.outboundInterfaceId;\n            if \(\!outboundIfaceId\) \{\n              outboundIfaceId = srcDevice\.interfaces\.find\(i => i\.macAddress === packet\.sourceMac\)\?\.id;\n            \}\n            if \(\!outboundIfaceId\) outboundIfaceId = srcDevice\.interfaces\[0\]\.id;\n  \n            outIface = srcDevice\.interfaces\.find\(i => i\.id === outboundIfaceId\);', repl_transit, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
