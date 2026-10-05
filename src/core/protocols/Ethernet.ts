import { type Packet } from '../domain/Packet';
import { type Switch } from '../domain/Device';
import { type SimulationEngine } from '../simulation/SimulationEngine';
import { SimulationEventType } from '../events/SimulationEvent';

export function handleSwitching(
  packet: Packet,
  switchDevice: Switch,
  inboundInterfaceId: string,
  engine: SimulationEngine
): void {
  // 1. Learn MAC
  switchDevice.macTable[packet.sourceMac] = inboundInterfaceId;

  // 2. Forward
  if (packet.destinationMac === 'FF:FF:FF:FF:FF:FF' || !switchDevice.macTable[packet.destinationMac]) {
    // Flood
    for (const iface of switchDevice.interfaces) {
      if (iface.id !== inboundInterfaceId) {
        // Find the device connected to this interface
        const link = engine.getLinkForInterface(iface.id);
        if (link) {
          const targetIfaceId = link.interface1Id === iface.id ? link.interface2Id : link.interface1Id;
          const targetDev = engine.getDevices().find(d => d.interfaces.some(i => i.id === targetIfaceId));
          
          if (targetDev) {
            engine.enqueueEvent({
              id: `flood-${packet.id}-${Math.random().toString(36).substring(2,7)}`,
              timestamp: 0,
              type: SimulationEventType.PACKET_IN_TRANSIT,
              payload: { packet: { ...packet }, sourceDeviceId: switchDevice.id, targetDeviceId: targetDev.id },
              explanation: 'Switch flooded frame (Unknown Unicast / Broadcast).',
            }, 1);
          }
        }
      }
    }
  } else {
    // Forward out specific port
    const outIfaceId = switchDevice.macTable[packet.destinationMac];
    const link = engine.getLinkForInterface(outIfaceId);
    if (link) {
      const targetIfaceId = link.interface1Id === outIfaceId ? link.interface2Id : link.interface1Id;
      const targetDev = engine.getDevices().find(d => d.interfaces.some(i => i.id === targetIfaceId));
      if (targetDev) {
        engine.enqueueEvent({
          id: `fwd-${packet.id}-${Math.random().toString(36).substring(2,7)}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_IN_TRANSIT,
          payload: { packet: { ...packet }, sourceDeviceId: switchDevice.id, targetDeviceId: targetDev.id },
          explanation: `Switch forwarded frame to known MAC.`,
        }, 1);
      }
    }
  }
}
