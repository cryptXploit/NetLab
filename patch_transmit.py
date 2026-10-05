import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

def repl_transmit(match):
    return """      } else {
        srcDevice.arpQueue.push(packet);
  
        const route = findLongestPrefixMatch(nextHopIp, srcDevice.routingTable);
        if (!route) {
          eng.enqueueEvent({
            id: `drop-${packet.id}-${eng.getCurrentTick()}`,
            timestamp: 0,
            type: SimulationEventType.PACKET_DROPPED,
            payload: { packet },
            explanation: `No route to destination.`,
          }, 0);
          return;
        }

        const outIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
        if (!outIface) return;
  
        const arpReqId = `arp-req-${Math.random().toString(36).substring(2, 9)}`;"""

text = re.sub(r'      \} else \{\n        srcDevice\.arpQueue\.push\(packet\);\n  \n        const route = findLongestPrefixMatch\(nextHopIp, srcDevice\.routingTable\);\n        const outIface = srcDevice\.interfaces\.find\(i => i\.id === route\?\.interfaceId\) \|\| srcDevice\.interfaces\[0\];\n  \n        const arpReqId = `arp-req-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`;\n', repl_transmit, text)

# Also fix PACKET_DELIVERED Router forwarding
def repl_forward(match):
    return """            if (route) {
              const nextHopIp = route.nextHop || packet.destinationIp;
              const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId);
              if (!outIface) {
                eng.enqueueEvent({
                  id: `drop-${packet.id}-${eng.getCurrentTick()}`,
                  timestamp: 0,
                  type: SimulationEventType.PACKET_DROPPED,
                  payload: { packet },
                  explanation: `Route interface not found.`,
                }, 0);
                return;
              }
              packet.sourceMac = outIface.macAddress;"""

text = re.sub(r'            if \(route\) \{\n              const nextHopIp = route\.nextHop \|\| packet\.destinationIp;\n              const outIface = receivingDevice\.interfaces\.find\(i => i\.id === route\.interfaceId\) \|\| \nreceivingDevice\.interfaces\[0\];\n              packet\.sourceMac = outIface\.macAddress;', repl_forward, text)

# Wait, the regex had \nreceivingDevice.interfaces[0]; which might be formatted differently, let's just use replace
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
