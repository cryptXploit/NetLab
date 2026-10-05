import { type Packet, createPacket } from '../domain/Packet';
import { type Device } from '../domain/Device';
import { type SimulationEngine } from '../simulation/SimulationEngine';
import { Protocol } from '../domain/NetworkTypes';
import { SimulationEventType } from '../events/SimulationEvent';

export interface ICMPPayload {
  type: 'ECHO_REQUEST' | 'ECHO_REPLY';
  sequence?: number;
  data?: any;
}

export function handleICMP(packet: Packet, receivingDevice: Device, engine: SimulationEngine): void {
  const payload = packet.payload as ICMPPayload;

  // We only care if the packet is destined for one of our interfaces
  const isForUs = receivingDevice.interfaces.some(iface => iface.ipAddress === packet.destinationIp);

  if (!isForUs) {
    // Drop or forward (routing logic for later phases)
    return;
  }

  if (payload.type === 'ECHO_REQUEST') {
    // Generate Echo Reply
    const replyPayload: ICMPPayload = {
      type: 'ECHO_REPLY',
      sequence: payload.sequence,
      data: payload.data,
    };

    const replyPacketId = `icmp-reply-${Math.random().toString(36).substring(2, 9)}`;

    const replyPacket = createPacket(
      replyPacketId,
      packet.destinationMac, // Swap MAC
      packet.sourceMac,
      packet.destinationIp, // Swap IP
      packet.sourceIp,
      Protocol.ICMP,
      replyPayload
    );

    engine.enqueueEvent(
      {
        id: `send-${replyPacketId}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: replyPacket },
        explanation: 'ICMP Echo Request received. Generated Echo Reply.',
      },
      1 // Delay 1 tick for processing
    );
  }
}
