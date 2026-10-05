import { type Packet, createPacket } from '../domain/Packet';
import { type Device } from '../domain/Device';
import { type SimulationEngine } from '../simulation/SimulationEngine';
import { Protocol } from '../domain/NetworkTypes';
import { SimulationEventType } from '../events/SimulationEvent';

export interface DHCPPayload {
  type: 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK';
  offeredIp?: string;
  prefix?: number;
  gateway?: string;
  dns?: string;
  transactionId: string;
}

export function handleDHCP(packet: Packet, receivingDevice: Device, engine: SimulationEngine): void {
  const payload = packet.payload as DHCPPayload;

  if (payload.type === 'DISCOVER') {
    if (!receivingDevice.dhcpServerConfig) return; // Not a DHCP Server

    const config = receivingDevice.dhcpServerConfig;
    const baseIpParts = config.poolNetwork.split('.');
    baseIpParts[3] = config.nextIpSuffix.toString();
    const offeredIp = baseIpParts.join('.');
    
    // We increment suffix directly to ensure no two hosts get same IP during session
    config.nextIpSuffix++; 

    const offerPayload: DHCPPayload = {
      type: 'OFFER',
      offeredIp,
      prefix: config.prefix,
      gateway: config.gateway,
      dns: config.dns,
      transactionId: payload.transactionId,
    };

    const replyIface = receivingDevice.interfaces.find(i => i.ipAddress === config.gateway) || receivingDevice.interfaces[0];

    const offerPacket = createPacket(
      `dhcp-offer-${Math.random().toString(36).substring(2, 9)}`,
      replyIface.macAddress,
      packet.sourceMac,
      replyIface.ipAddress || '',
      '255.255.255.255',
      Protocol.DHCP,
      offerPayload
    );

    engine.enqueueEvent({
      id: `send-${offerPacket.id}`,
      timestamp: 0,
      type: SimulationEventType.PACKET_IN_TRANSIT,
      payload: { packet: offerPacket, sourceDeviceId: receivingDevice.id },
      explanation: `DHCP Offer Generated for ${packet.sourceMac}: ${offeredIp}`
    }, 1);

  } else if (payload.type === 'OFFER') {
    // Client receives OFFER, replies with REQUEST
    const requestPayload: DHCPPayload = {
      type: 'REQUEST',
      offeredIp: payload.offeredIp,
      transactionId: payload.transactionId,
    };

    const reqIface = receivingDevice.interfaces[0];

    const requestPacket = createPacket(
      `dhcp-req-${Math.random().toString(36).substring(2, 9)}`,
      reqIface.macAddress,
      'FF:FF:FF:FF:FF:FF', // Broadcast
      '0.0.0.0',
      '255.255.255.255',
      Protocol.DHCP,
      requestPayload
    );

    engine.enqueueEvent({
      id: `send-${requestPacket.id}`,
      timestamp: 0,
      type: SimulationEventType.PACKET_IN_TRANSIT,
      payload: { packet: requestPacket, sourceDeviceId: receivingDevice.id },
      explanation: `DHCP Request Broadcasted for ${payload.offeredIp}`
    }, 1);

  } else if (payload.type === 'REQUEST') {
    if (!receivingDevice.dhcpServerConfig) return;

    const config = receivingDevice.dhcpServerConfig;

    const ackPayload: DHCPPayload = {
      type: 'ACK',
      offeredIp: payload.offeredIp,
      prefix: config.prefix,
      gateway: config.gateway,
      dns: config.dns,
      transactionId: payload.transactionId,
    };

    const replyIface = receivingDevice.interfaces.find(i => i.ipAddress === config.gateway) || receivingDevice.interfaces[0];

    const ackPacket = createPacket(
      `dhcp-ack-${Math.random().toString(36).substring(2, 9)}`,
      replyIface.macAddress,
      packet.sourceMac,
      replyIface.ipAddress || '',
      '255.255.255.255',
      Protocol.DHCP,
      ackPayload
    );

    engine.enqueueEvent({
      id: `send-${ackPacket.id}`,
      timestamp: 0,
      type: SimulationEventType.PACKET_IN_TRANSIT,
      payload: { packet: ackPacket, sourceDeviceId: receivingDevice.id },
      explanation: `DHCP Ack Sent to ${packet.sourceMac}: ${payload.offeredIp}`
    }, 1);

  } else if (payload.type === 'ACK') {
    // Client receives ACK and permanently mutates its configuration
    const iface = receivingDevice.interfaces[0];
    iface.ipAddress = payload.offeredIp;
    
    if (payload.dns) {
      receivingDevice.dnsServerIp = payload.dns;
    }

    if (payload.gateway) {
      receivingDevice.routingTable.push({
        network: '0.0.0.0',
        prefix: 0,
        nextHop: payload.gateway,
        interfaceId: iface.id,
      });
    }

    // Engine notification purely for explainability without dispatching a packet
    engine.enqueueEvent({
      id: `dhcp-done-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: 0,
      type: SimulationEventType.DEVICE_POWER_CHANGED, // Using existing event type for generic logging, or add custom
      payload: { deviceId: receivingDevice.id },
      explanation: `DHCP Ack Received. IP Assigned: ${payload.offeredIp}/${payload.prefix}, Gateway: ${payload.gateway}, DNS: ${payload.dns}`
    }, 1);
  }
}
