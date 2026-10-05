import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost, createServer } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';
import { handleDNS } from '../protocols/DNS';
import { SimulationEventType } from '../events/SimulationEvent';

describe('DNS Protocol and Resolution', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should process QUERY and generate RESPONSE if records exist', () => {
    const ifaceServer = createNetworkInterface('if-server', 'CC:CC:CC:CC:CC:CC', '10.0.0.53');
    const server1 = createServer('server1', 'Server', [ifaceServer]);
    server1.dnsRecords = {
      'server.netlab': '10.0.0.10'
    };

    const queryPacket = createPacket(
      'dns-q',
      'AA:AA:AA:AA:AA:AA',
      'CC:CC:CC:CC:CC:CC',
      '10.0.0.1',
      '10.0.0.53',
      Protocol.DNS,
      { type: 'QUERY', hostname: 'server.netlab' }
    );

    engine.addDevice(server1);
    
    // Clear queue
    (engine as any).eventQueue.clear();

    handleDNS(queryPacket, server1, engine);

    const queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe(SimulationEventType.PACKET_IN_TRANSIT);
    
    const replyPacket = queue[0].payload.packet;
    expect(replyPacket.protocol).toBe(Protocol.DNS);
    expect(replyPacket.payload.type).toBe('RESPONSE');
    expect(replyPacket.payload.resolvedIp).toBe('10.0.0.10');
  });

  it('should cache resolved IP and resume pending intents on RESPONSE', () => {
    const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', '10.0.0.1');
    const hostA = createHost('hostA', 'Host A', [ifaceA]);

    // Add a pending intent
    hostA.dnsQueue.push({
      targetHostname: 'server.netlab',
      pendingEvent: {
        id: 'intent-1',
        timestamp: 0,
        type: SimulationEventType.APP_PING_INTENT,
        payload: { sourceId: 'hostA', targetHostname: 'server.netlab' }
      }
    });

    const responsePacket = createPacket(
      'dns-r',
      'CC:CC:CC:CC:CC:CC',
      'AA:AA:AA:AA:AA:AA',
      '10.0.0.53',
      '10.0.0.1',
      Protocol.DNS,
      { type: 'RESPONSE', hostname: 'server.netlab', resolvedIp: '10.0.0.10' }
    );

    engine.addDevice(hostA);
    (engine as any).eventQueue.clear();

    handleDNS(responsePacket, hostA, engine);

    expect(hostA.dnsCache['server.netlab']).toBe('10.0.0.10');
    expect(hostA.dnsQueue).toHaveLength(0);

    const queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe(SimulationEventType.APP_PING_INTENT);
    expect(queue[0].payload.targetHostname).toBe('server.netlab');
  });
});
