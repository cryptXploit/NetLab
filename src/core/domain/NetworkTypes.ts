export type MACAddress = string; // Format: xx:xx:xx:xx:xx:xx
export type IPv4Address = string; // Format: xxx.xxx.xxx.xxx

export interface Subnet {
  networkAddress: IPv4Address;
  subnetMask: IPv4Address;
}

export interface Route {
  network: IPv4Address;
  prefix: number;
  nextHop?: IPv4Address;
  interfaceId: string;
}

export const Protocol = {
  TCP: 'TCP',
  UDP: 'UDP',
  ICMP: 'ICMP',
  ARP: 'ARP'
} as const;

export type Protocol = typeof Protocol[keyof typeof Protocol];
