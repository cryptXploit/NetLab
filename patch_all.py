import sys

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix updateDeviceRoute
text = text.replace('dev.routingTable.push({ network, prefix, nextHop, interfaceId: dev.interfaces[0].id });', 'dev.routingTable.push({ network, prefix, nextHop, interfaceId: dev.interfaces[0]?.id || "unknown" });')

# Fix PACKET_DELIVERED routing forward
text = text.replace('const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId) || \nreceivingDevice.interfaces[0];', 'const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId);\n            if (!outIface) { eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `Route interface not found.` }, 0); return; }')
text = text.replace('const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId) || receivingDevice.interfaces[0];', 'const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId);\n            if (!outIface) { eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `Route interface not found.` }, 0); return; }')

# Fix transmitOrARP
text = text.replace('const outIface = srcDevice.interfaces.find(i => i.id === route?.interfaceId) || srcDevice.interfaces[0];', 'const outIface = srcDevice.interfaces.find(i => i.id === route?.interfaceId);\n        if (!outIface) {\n          eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `Route interface not found.` }, 0);\n          return;\n        }')

# Fix APP_DHCP_INTENT
dhcp_old = """        const srcIface = srcDevice.interfaces[0];
        const dhcpPayload: DHCPPayload = {
          type: 'DISCOVER',
          transactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
        };

        const dhcpPacket = createPacket(
          `dhcp-disc-${Math.random().toString(36).substring(2, 9)}`,
          srcIface.macAddress,
          'FF:FF:FF:FF:FF:FF', // Broadcast MAC
          '0.0.0.0',
          '255.255.255.255', // Broadcast IP
          Protocol.DHCP,
          dhcpPayload
        );

        eng.enqueueEvent({
          id: `send-${dhcpPacket.id}-${eng.getCurrentTick()}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_IN_TRANSIT,
          payload: { packet: dhcpPacket, sourceDeviceId: srcDevice.id },
          explanation: `DHCP Discover broadcast.`
        }, 0);"""
dhcp_new = """        const unconfiguredIfaces = srcDevice.interfaces.filter(i => !i.ipAddress || i.ipAddress === '0.0.0.0');
        if (unconfiguredIfaces.length === 0) return;
        for (const srcIface of unconfiguredIfaces) {
          const dhcpPayload: DHCPPayload = {
            type: 'DISCOVER',
            transactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
          };
  
          const dhcpPacket = createPacket(
            `dhcp-disc-${Math.random().toString(36).substring(2, 9)}`,
            srcIface.macAddress,
            'FF:FF:FF:FF:FF:FF', // Broadcast MAC
            '0.0.0.0',
            '255.255.255.255', // Broadcast IP
            Protocol.DHCP,
            dhcpPayload
          );
  
          eng.enqueueEvent({
            id: `send-${dhcpPacket.id}-${eng.getCurrentTick()}`,
            timestamp: 0,
            type: SimulationEventType.PACKET_IN_TRANSIT,
            payload: { packet: dhcpPacket, sourceDeviceId: srcDevice.id, outboundInterfaceId: srcIface.id },
            explanation: `DHCP Discover broadcast out ${srcIface.id}.`
          }, 0);
        }"""
text = text.replace(dhcp_old, dhcp_new)

# Fix APP_PING_INTENT resolvedIp
ping_res_old = """          if (resolvedIp) {
            const srcIface = srcDevice.interfaces[0];
            const route = findLongestPrefixMatch(resolvedIp, srcDevice.routingTable);
            if (!route) return;
        
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
            transmitOrARP(eng, srcDevice, pkt, nextHopIp);"""
ping_res_new = """          if (resolvedIp) {
            const route = findLongestPrefixMatch(resolvedIp, srcDevice.routingTable);
            if (!route) {
              eng.enqueueEvent({ id: `drop-ping-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet: { id: 'ping-intent-failed' } as any }, explanation: `No route to host ${resolvedIp}.` }, 0);
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
            transmitOrARP(eng, srcDevice, pkt, nextHopIp);"""
text = text.replace(ping_res_old, ping_res_new)

# Fix APP_PING_INTENT dnsServerIp
ping_dns_old = """            const dnsServerIp = srcDevice.dnsServerIp;
            if (!dnsServerIp) return;
        
            const srcIface = srcDevice.interfaces[0];
            const route = findLongestPrefixMatch(dnsServerIp, srcDevice.routingTable);
            if (!route) return;"""
ping_dns_new = """            const dnsServerIp = srcDevice.dnsServerIp;
            if (!dnsServerIp) return;
        
            const route = findLongestPrefixMatch(dnsServerIp, srcDevice.routingTable);
            if (!route) return;
            const srcIface = srcDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!srcIface) return;"""
text = text.replace(ping_dns_old, ping_dns_new)

# Fix PACKET_IN_TRANSIT
transit_old = """          if (!targetDeviceId) {
            let outboundIfaceId = payload.outboundInterfaceId;
            if (!outboundIfaceId) {
              outboundIfaceId = srcDevice.interfaces.find(i => i.macAddress === packet.sourceMac)?.id;
            }
            if (!outboundIfaceId) outboundIfaceId = srcDevice.interfaces[0].id;
  
            outIface = srcDevice.interfaces.find(i => i.id === outboundIfaceId);"""
transit_new = """          if (!targetDeviceId) {
            let outboundIfaceId = payload.outboundInterfaceId;
            if (!outboundIfaceId) {
              outboundIfaceId = srcDevice.interfaces.find(i => i.macAddress === packet.sourceMac)?.id;
            }
            if (!outboundIfaceId) {
              const route = findLongestPrefixMatch(packet.destinationIp, srcDevice.routingTable || []);
              if (route && route.interfaceId) outboundIfaceId = route.interfaceId;
            }
            
            if (!outboundIfaceId) {
                eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `No route to destination.` }, 0);
                return;
            }
  
            outIface = srcDevice.interfaces.find(i => i.id === outboundIfaceId);"""
text = text.replace(transit_old, transit_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
