import { Protocol, type MACAddress, type IPv4Address } from './NetworkTypes';

export const PacketStatus = {
  CREATED: 'CREATED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  DROPPED: 'DROPPED',
} as const;

export type PacketStatus = typeof PacketStatus[keyof typeof PacketStatus];

export interface Packet {
  id: string;
  sourceMac: MACAddress;
  destinationMac: MACAddress;
  sourceIp: IPv4Address;
  destinationIp: IPv4Address;
  protocol: Protocol;
  ttl: number;
  payload: any;
  status: PacketStatus;
}

export function createPacket(
  id: string,
  sourceMac: MACAddress,
  destinationMac: MACAddress,
  sourceIp: IPv4Address,
  destinationIp: IPv4Address,
  protocol: Protocol,
  payload: any,
  ttl: number = 64
): Packet {
  return {
    id,
    sourceMac,
    destinationMac,
    sourceIp,
    destinationIp,
    protocol,
    ttl,
    payload,
    status: PacketStatus.CREATED,
  };
}
