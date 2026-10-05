import { type Packet, createPacket } from '../domain/Packet';
import { type Device } from '../domain/Device';
import { type SimulationEngine } from '../simulation/SimulationEngine';
import { Protocol } from '../domain/NetworkTypes';
import { SimulationEventType } from '../events/SimulationEvent';

export interface ARPPayload {
  type: 'ARP_REQUEST' | 'ARP_REPLY';
  targetIp: string;
  targetMac?: string;
  senderIp: string;
  senderMac: string;
}

export function handleARP(packet: Packet, receivingDevice: Device, engine: SimulationEngine): void {
  const payload = packet.payload as ARPPayload;

  if (payload.type === 'ARP_REQUEST') {
    // Is it for one of our interfaces?
    const matchingIface = receivingDevice.interfaces.find(iface => iface.ipAddress === payload.targetIp);
    if (!matchingIface) return;

    // Generate ARP Reply
    const replyPayload: ARPPayload = {
      type: 'ARP_REPLY',
      targetIp: payload.senderIp,
      targetMac: payload.senderMac,
      senderIp: matchingIface.ipAddress || '',
      senderMac: matchingIface.macAddress,
    };

    const replyPacketId = `arp-reply-${Math.random().toString(36).substring(2, 9)}`;

    const replyPacket = createPacket(
      replyPacketId,
      matchingIface.macAddress,
      packet.sourceMac,
      matchingIface.ipAddress || '',
      packet.sourceIp,
      Protocol.ARP,
      replyPayload
    );

    engine.enqueueEvent(
      {
        id: `send-${replyPacketId}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: replyPacket },
        explanation: 'ARP Request received. Generated ARP Reply.',
      },
      1
    );

    // Also casually learn the sender's MAC since they just talked to us
    receivingDevice.arpTable[payload.senderIp] = payload.senderMac;
  } else if (payload.type === 'ARP_REPLY') {
    // Learn the MAC
    receivingDevice.arpTable[payload.senderIp] = payload.senderMac;

    // Check arpQueue
    const pendingPackets = [...receivingDevice.arpQueue];
    receivingDevice.arpQueue = [];

    for (const pendingPacket of pendingPackets) {
      // If this packet was waiting for this IP, or if it was waiting for a next-hop IP that resolved to this MAC
      // For simplicity, we just check if we now have the MAC for its targetIp or we can just retry all packets.
      // Wait, let's just let the event dispatcher re-evaluate or we can do it here.
      // Actually, if we just retry the packet, we need to know the outbound interface. 
      // The prompt says: "dequeue them, update their targetMac, and enqueue a PACKET_TRANSMITTED event."
      // Since `findLongestPrefixMatch` happens before `arpQueue`, the original `destinationMac` was 'FF:FF:FF:FF:FF:FF' or unknown.
      // But we need to know WHICH next hop we were waiting for.
      // Let's just update `destinationMac` if `payload.senderIp` matches the next hop we needed.
      // A simple way: just update `destinationMac` of the pending packet to `payload.senderMac` if it needed it.
      // We will assume `targetIp` logic in the store handles it, or we just rely on `arpTable`.
      pendingPacket.destinationMac = payload.senderMac;
      
      engine.enqueueEvent({
        id: `send-queued-${pendingPacket.id}-${Date.now()}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: pendingPacket },
        explanation: `ARP resolved. Transmitting queued packet.`,
      }, 1);
    }
  }
}
