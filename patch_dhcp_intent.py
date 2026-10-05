import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

def repl_dhcp(match):
    return """          if (!srcDevice) return;
  
          // Send out of all interfaces that have no IP configured
          const unconfiguredIfaces = srcDevice.interfaces.filter(i => !i.ipAddress || i.ipAddress === '0.0.0.0');
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
          }
        });"""

text = re.sub(r'          if \(\!srcDevice\) return;\n  \n          const srcIface = srcDevice\.interfaces\[0\];\n          const dhcpPayload: DHCPPayload = \{\n            type: \'DISCOVER\',\n            transactionId: `tx-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,\n          \};\n  \n          const dhcpPacket = createPacket\(\n            `dhcp-disc-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\}`,\n            srcIface\.macAddress,\n            \'FF:FF:FF:FF:FF:FF\', // Broadcast MAC\n            \'0\.0\.0\.0\',\n            \'255\.255\.255\.255\', // Broadcast IP\n            Protocol\.DHCP,\n            dhcpPayload\n          \);\n  \n          eng\.enqueueEvent\(\{\n            id: `send-\$\{dhcpPacket\.id\}-\$\{eng\.getCurrentTick\(\)\}`,\n            timestamp: 0,\n            type: SimulationEventType\.PACKET_IN_TRANSIT,\n            payload: \{ packet: dhcpPacket, sourceDeviceId: srcDevice\.id \},\n            explanation: `DHCP Discover broadcast\.`\n          \}, 0\);\n        \}\);', repl_dhcp, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
