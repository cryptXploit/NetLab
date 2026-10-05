import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# APP_PING_INTENT (DNS resolve branch)
text = re.sub(
    r'const resolvedIp = srcDevice\.dnsCache\[targetHostname\];\n          if \(resolvedIp\) \{\n            const srcIface = srcDevice\.interfaces\[0\];\n            const route = findLongestPrefixMatch\(resolvedIp, srcDevice\.routingTable\);\n            if \(\!route\) return;',
    r'''const resolvedIp = srcDevice.dnsCache[targetHostname];
          if (resolvedIp) {
            const route = findLongestPrefixMatch(resolvedIp, srcDevice.routingTable);
            if (!route) {
              eng.enqueueEvent({ id: `drop-ping-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet: { id: 'ping-intent-failed' } as any }, explanation: `No route to host ${resolvedIp}.` }, 0);
              return;
            }
            const srcIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!srcIface) return;''', text)

# APP_PING_INTENT (DNS lookup branch)
text = re.sub(
    r'const dnsServerIp = srcDevice\.dnsServerIp;\n            if \(\!dnsServerIp\) return;\n        \n            const srcIface = srcDevice\.interfaces\[0\];\n            const route = findLongestPrefixMatch\(dnsServerIp, srcDevice\.routingTable\);\n            if \(\!route\) return;',
    r'''const dnsServerIp = srcDevice.dnsServerIp;
            if (!dnsServerIp) return;
        
            const route = findLongestPrefixMatch(dnsServerIp, srcDevice.routingTable);
            if (!route) return;
            const srcIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!srcIface) return;''', text)

# APP_DHCP_INTENT
text = re.sub(
    r'eng\.getDispatcher\(\)\.registerHandler\(SimulationEventType\.APP_DHCP_INTENT, \(event, eng\) => \{\n          const \{ sourceId \} = event\.payload;\n          const srcDevice = eng\.getDevice\(sourceId\);\n          if \(\!srcDevice\) return;\n\n          const srcIface = srcDevice\.interfaces\[0\];\n          const dhcpPayload: DHCPPayload = \{\n            type: \'DISCOVER\',\n            transactionId: `tx-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,\n          \};\n\n          const dhcpPacket = createPacket\(\n            `dhcp-disc-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,\n            srcIface\.macAddress,\n            \'FF:FF:FF:FF:FF:FF\', // Broadcast MAC\n            \'0\.0\.0\.0\',\n            \'255\.255\.255\.255\', // Broadcast IP\n            Protocol\.DHCP,\n            dhcpPayload\n          \);\n\n          eng\.enqueueEvent\(\{\n            id: `send-\$\{dhcpPacket\.id\}-\$\{eng\.getCurrentTick\(\)\}`,\n            timestamp: 0,\n            type: SimulationEventType\.PACKET_IN_TRANSIT,\n            payload: \{ packet: dhcpPacket, sourceDeviceId: srcDevice\.id \},\n            explanation: `DHCP Discover broadcast\.`\n          \}, 0\);\n        \}\);',
    r'''eng.getDispatcher().registerHandler(SimulationEventType.APP_DHCP_INTENT, (event, eng) => {
          const { sourceId } = event.payload;
          const srcDevice = eng.getDevice(sourceId);
          if (!srcDevice) return;
          
          const unconfiguredIfaces = srcDevice.interfaces.filter(i => !i.ipAddress || i.ipAddress === '0.0.0.0');
          if (unconfiguredIfaces.length === 0) return;
          
          for (const srcIface of unconfiguredIfaces) {
            const dhcpPayload: DHCPPayload = {
              type: 'DISCOVER',
              transactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
            };
            const dhcpPacket = createPacket(`dhcp-disc-${Math.random().toString(36).substring(2, 9)}`, srcIface.macAddress, 'FF:FF:FF:FF:FF:FF', '0.0.0.0', '255.255.255.255', Protocol.DHCP, dhcpPayload);
            eng.enqueueEvent({ id: `send-${dhcpPacket.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_IN_TRANSIT, payload: { packet: dhcpPacket, sourceDeviceId: srcDevice.id, outboundInterfaceId: srcIface.id }, explanation: `DHCP Discover broadcast out ${srcIface.id}.` }, 0);
          }
        });''', text)

# PACKET_IN_TRANSIT
text = re.sub(
    r'if \(\!outboundIfaceId\) outboundIfaceId = srcDevice\.interfaces\[0\]\.id;\n\n            outIface = srcDevice\.interfaces\.find\(i => i\.id === outboundIfaceId\);',
    r'''if (!outboundIfaceId) {
              const route = findLongestPrefixMatch(packet.destinationIp, srcDevice.routingTable || []);
              if (route && route.interfaceId) outboundIfaceId = route.interfaceId;
            }
            if (!outboundIfaceId) {
                eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `No route to destination.` }, 0);
                return;
            }
            outIface = srcDevice.interfaces.find(i => i.id === outboundIfaceId);''', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
