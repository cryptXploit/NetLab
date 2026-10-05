import { type NetworkInterface } from './NetworkInterface';
import { type Route } from './NetworkTypes';

export const DeviceType = {
  HOST: 'HOST',
  SWITCH: 'SWITCH',
  ROUTER: 'ROUTER',
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  interfaces: NetworkInterface[];
  isPoweredOn: boolean;
  metadata?: Record<string, any>;
  routingTable: Route[];
}

export interface Host extends Device {
  type: typeof DeviceType.HOST;
  defaultGateway?: string;
}

export interface Switch extends Device {
  type: typeof DeviceType.SWITCH;
  macTable: Record<string, string>; // MAC address to Interface ID
}

export interface Router extends Device {
  type: typeof DeviceType.ROUTER;
}

export function createHost(
  id: string,
  name: string,
  interfaces: NetworkInterface[] = [],
  defaultGateway?: string
): Host {
  return {
    id,
    name,
    type: DeviceType.HOST,
    interfaces,
    defaultGateway,
    isPoweredOn: true,
    routingTable: [],
  };
}

export function createSwitch(
  id: string,
  name: string,
  interfaces: NetworkInterface[] = []
): Switch {
  return {
    id,
    name,
    type: DeviceType.SWITCH,
    interfaces,
    macTable: {},
    isPoweredOn: true,
    routingTable: [],
  };
}

export function createRouter(
  id: string,
  name: string,
  interfaces: NetworkInterface[] = []
): Router {
  return {
    id,
    name,
    type: DeviceType.ROUTER,
    interfaces,
    routingTable: [],
    isPoweredOn: true,
  };
}
