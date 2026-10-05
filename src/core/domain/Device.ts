import { type NetworkInterface } from './NetworkInterface';
import { type Route } from './NetworkTypes';
import { type Packet } from './Packet';

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
  arpTable: Record<string, string>;
  arpQueue: Packet[];
  macTable: Record<string, string>; // Used mainly by Switches
}

export interface Host extends Device {
  type: typeof DeviceType.HOST;
  defaultGateway?: string;
}

export interface Switch extends Device {
  type: typeof DeviceType.SWITCH;
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
    arpTable: {},
    arpQueue: [],
    macTable: {},
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
    isPoweredOn: true,
    routingTable: [],
    arpTable: {},
    arpQueue: [],
    macTable: {},
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
    isPoweredOn: true,
    routingTable: [],
    arpTable: {},
    arpQueue: [],
    macTable: {},
  };
}
