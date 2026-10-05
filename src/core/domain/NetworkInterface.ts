import { type MACAddress, type IPv4Address, type Subnet } from './NetworkTypes';
import { type Link } from './Link';

export interface NetworkInterface {
  id: string;
  macAddress: MACAddress;
  ipAddress?: IPv4Address;
  subnet?: Subnet;
  connectedLink?: Link;
  isEnabled: boolean;
  status: 'UP' | 'DOWN';
}

export function createNetworkInterface(
  id: string,
  macAddress: MACAddress,
  ipAddress?: IPv4Address,
  subnet?: Subnet
): NetworkInterface {
  return {
    id,
    macAddress,
    ipAddress,
    subnet,
    isEnabled: true,
    status: 'UP',
  };
}
