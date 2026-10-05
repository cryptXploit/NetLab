import { type Packet } from '../domain/Packet';

export const SimulationEventType = {
  PACKET_CREATED: 'PACKET_CREATED',
  PACKET_IN_TRANSIT: 'PACKET_IN_TRANSIT',
  PACKET_DELIVERED: 'PACKET_DELIVERED',
  PACKET_DROPPED: 'PACKET_DROPPED',
  LINK_STATE_CHANGED: 'LINK_STATE_CHANGED',
  DEVICE_POWER_CHANGED: 'DEVICE_POWER_CHANGED',
} as const;

export type SimulationEventType = typeof SimulationEventType[keyof typeof SimulationEventType];

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: SimulationEventType;
  payload: any;
  explanation?: string;
}

export interface PacketEventPayload {
  packet: Packet;
  deviceId?: string;
  interfaceId?: string;
  reason?: string;
}
