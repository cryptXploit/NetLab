import { describe, it, expect } from 'vitest';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createPacket, PacketStatus } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';

describe('Networking Domain Models', () => {
  it('should deterministically create a host, interface, and packet', () => {
    // 1. Create an interface
    const eth0 = createNetworkInterface(
      'iface-1',
      '00:1A:2B:3C:4D:5E',
      '192.168.1.10',
      { networkAddress: '192.168.1.0', subnetMask: '255.255.255.0' }
    );

    expect(eth0.id).toBe('iface-1');
    expect(eth0.macAddress).toBe('00:1A:2B:3C:4D:5E');
    expect(eth0.ipAddress).toBe('192.168.1.10');
    expect(eth0.isEnabled).toBe(true);

    // 2. Create a Host and assign the interface
    const hostA = createHost('host-a', 'PC-1', [eth0], '192.168.1.1');

    expect(hostA.id).toBe('host-a');
    expect(hostA.type).toBe('HOST');
    expect(hostA.interfaces).toHaveLength(1);
    expect(hostA.interfaces[0].macAddress).toBe('00:1A:2B:3C:4D:5E');

    // 3. Create a Packet from this host to another
    const packet = createPacket(
      'pkt-1',
      eth0.macAddress,
      '00:1A:2B:3C:4D:5F', // Destination MAC
      eth0.ipAddress!,
      '192.168.1.20', // Destination IP
      Protocol.ICMP,
      { message: 'ping' }
    );

    expect(packet.id).toBe('pkt-1');
    expect(packet.sourceMac).toBe('00:1A:2B:3C:4D:5E');
    expect(packet.destinationIp).toBe('192.168.1.20');
    expect(packet.protocol).toBe(Protocol.ICMP);
    expect(packet.status).toBe(PacketStatus.CREATED);
    expect(packet.ttl).toBe(64);
  });
});
