import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost, createRouter } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';
import { handleDHCP, type DHCPPayload } from '../protocols/DHCP';

describe('DHCP Protocol (DORA)', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should complete DORA sequence and assign IP', () => {
    // 1. Setup Server
    const ifaceR1 = createNetworkInterface('if-R1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
    const router = createRouter('R1', 'R1', [ifaceR1]);
    router.dhcpServerConfig = {
      poolNetwork: '192.168.1.0',
      prefix: 24,
      gateway: '192.168.1.1',
      dns: '10.0.0.53',
      nextIpSuffix: 100,
    };
    engine.addDevice(router);

    // 2. Setup Client
    const ifaceC = createNetworkInterface('if-C', 'CC:CC:CC:CC:CC:CC', '0.0.0.0');
    const hostC = createHost('C', 'C', [ifaceC]);
    engine.addDevice(hostC);

    // D: DISCOVER
    const discoverPayload: DHCPPayload = { type: 'DISCOVER', transactionId: 'tx-1' };
    const discoverPacket = createPacket('p-1', 'CC:CC:CC:CC:CC:CC', 'FF:FF:FF:FF:FF:FF', '0.0.0.0', '255.255.255.255', Protocol.DHCP, discoverPayload);
    
    (engine as any).eventQueue.clear();
    handleDHCP(discoverPacket, router, engine);

    let queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    const offerPacket = queue[0].payload.packet;
    expect(offerPacket.payload.type).toBe('OFFER');
    expect(offerPacket.payload.offeredIp).toBe('192.168.1.100');
    expect(router.dhcpServerConfig.nextIpSuffix).toBe(101);

    // O: OFFER (Client receives)
    (engine as any).eventQueue.clear();
    handleDHCP(offerPacket, hostC, engine);

    queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    const requestPacket = queue[0].payload.packet;
    expect(requestPacket.payload.type).toBe('REQUEST');
    expect(requestPacket.payload.offeredIp).toBe('192.168.1.100');

    // R: REQUEST (Server receives)
    (engine as any).eventQueue.clear();
    handleDHCP(requestPacket, router, engine);

    queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    const ackPacket = queue[0].payload.packet;
    expect(ackPacket.payload.type).toBe('ACK');
    expect(ackPacket.payload.offeredIp).toBe('192.168.1.100');
    expect(ackPacket.payload.gateway).toBe('192.168.1.1');
    expect(ackPacket.payload.dns).toBe('10.0.0.53');

    // A: ACK (Client receives)
    (engine as any).eventQueue.clear();
    handleDHCP(ackPacket, hostC, engine);

    // Assert final configuration
    expect(hostC.interfaces[0].ipAddress).toBe('192.168.1.100');
    expect(hostC.dnsServerIp).toBe('10.0.0.53');
    expect(hostC.routingTable).toHaveLength(1);
    expect(hostC.routingTable[0].nextHop).toBe('192.168.1.1');
  });
});
