import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace APP_PING_INTENT logic
def repl_ping(match):
    return """          const resolvedIp = srcDevice.dnsCache[targetHostname];
          if (resolvedIp) {
            const route = findLongestPrefixMatch(resolvedIp, srcDevice.routingTable);
            if (!route) {
              eng.enqueueEvent({
                id: `drop-ping-${eng.getCurrentTick()}`,
                timestamp: 0,
                type: SimulationEventType.PACKET_DROPPED,
                payload: { packet: { id: 'ping-intent-failed' } as any },
                explanation: `No route to host ${resolvedIp}.`,
              }, 0);
              return;
            }
            const srcIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!srcIface) return;
        
            const pktId = event.payload.packetId || Math.random().toString(36).substring(2, 9);
            const pkt = createPacket(
              `pkt-${pktId}`,
              srcIface.macAddress,
              'FF:FF:FF:FF:FF:FF',
              srcIface.ipAddress || '',
              resolvedIp,
              Protocol.ICMP,
              { type: 'ECHO_REQUEST', sequence: 1 }
            );
            const nextHopIp = route.nextHop || resolvedIp;
            transmitOrARP(eng, srcDevice, pkt, nextHopIp);
          } else {
            srcDevice.dnsQueue.push({ targetHostname, pendingEvent: event });
            
            const dnsServerIp = srcDevice.dnsServerIp;
            if (!dnsServerIp) return;
        
            const route = findLongestPrefixMatch(dnsServerIp, srcDevice.routingTable);
            if (!route) return;
            const srcIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!srcIface) return;
        
            const dnsPktId = `dns-${Math.random().toString(36).substring(2, 9)}`;"""

text = re.sub(r'          const resolvedIp = srcDevice\.dnsCache\[targetHostname\];\n          if \(resolvedIp\) \{\n            const srcIface = srcDevice\.interfaces\[0\];\n            const route = findLongestPrefixMatch\(resolvedIp, srcDevice\.routingTable\);\n            if \(\!route\) return;\n        \n            const pktId = event\.payload\.packetId \|\| Math\.random\(\)\.toString\(36\)\.substring\(2, 9\);\n            const pkt = createPacket\(\n              `pkt-\$\{pktId\}`,\n              srcIface\.macAddress,\n              \'FF:FF:FF:FF:FF:FF\',\n              srcIface\.ipAddress \|\| \'\',\n              resolvedIp,\n              Protocol\.ICMP,\n              \{ type: \'ECHO_REQUEST\', sequence: 1 \}\n            \);\n            const nextHopIp = route\.nextHop \|\| resolvedIp;\n            transmitOrARP\(eng, srcDevice, pkt, nextHopIp\);\n          \} else \{\n            srcDevice\.dnsQueue\.push\(\{ targetHostname, pendingEvent: event \}\);\n            \n            const dnsServerIp = srcDevice\.dnsServerIp;\n            if \(\!dnsServerIp\) return;\n        \n            const srcIface = srcDevice\.interfaces\[0\];\n            const route = findLongestPrefixMatch\(dnsServerIp, srcDevice\.routingTable\);\n            if \(\!route\) return;\n        \n            const dnsPktId = `dns-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`;', repl_ping, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
