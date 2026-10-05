import { type Packet, createPacket } from '../domain/Packet';
import { type Device } from '../domain/Device';
import { type SimulationEngine } from '../simulation/SimulationEngine';
import { Protocol } from '../domain/NetworkTypes';
import { SimulationEventType } from '../events/SimulationEvent';

export interface DNSPayload {
  type: 'QUERY' | 'RESPONSE';
  hostname: string;
  resolvedIp?: string;
}

export function handleDNS(packet: Packet, receivingDevice: Device, engine: SimulationEngine): void {
  const payload = packet.payload as DNSPayload;

  if (payload.type === 'QUERY') {
    if (receivingDevice.dnsRecords && receivingDevice.dnsRecords[payload.hostname]) {
      const resolvedIp = receivingDevice.dnsRecords[payload.hostname];
      
      const responsePayload: DNSPayload = {
        type: 'RESPONSE',
        hostname: payload.hostname,
        resolvedIp,
      };

      const responsePacketId = `dns-res-${Math.random().toString(36).substring(2, 9)}`;

      const responsePacket = createPacket(
        responsePacketId,
        packet.destinationMac,
        packet.sourceMac,
        packet.destinationIp,
        packet.sourceIp,
        Protocol.DNS,
        responsePayload
      );

      engine.enqueueEvent(
        {
          id: `send-${responsePacketId}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_IN_TRANSIT,
          payload: { packet: responsePacket, sourceDeviceId: receivingDevice.id },
          explanation: `DNS Query received for ${payload.hostname}. Responding with ${resolvedIp}.`,
        },
        1
      );
    } else {
      // Unresolved (could send NXDOMAIN, but omitted for simplicity)
    }
  } else if (payload.type === 'RESPONSE' && payload.resolvedIp) {
    receivingDevice.dnsCache[payload.hostname] = payload.resolvedIp;

    const pendingIntents = [...receivingDevice.dnsQueue];
    receivingDevice.dnsQueue = [];

    for (const intent of pendingIntents) {
      if (intent.targetHostname === payload.hostname) {
        engine.enqueueEvent({
          id: `resumed-intent-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: 0,
          type: SimulationEventType.APP_PING_INTENT,
          payload: intent.pendingEvent.payload,
          explanation: `DNS resolved ${payload.hostname} to ${payload.resolvedIp}. Resuming ping.`,
        }, 1);
      } else {
        receivingDevice.dnsQueue.push(intent);
      }
    }
  }
}
