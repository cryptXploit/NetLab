import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';
import { handleICMP } from '../protocols/ICMP';
import { SimulationEventType } from '../events/SimulationEvent';

describe('ICMP Protocol Handler', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should generate an ECHO_REPLY when receiving an ECHO_REQUEST targeted at its IP', () => {
    const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '192.168.1.2');
    const hostB = createHost('hostB', 'Host B', [ifaceB]);
    engine.addDevice(hostB);

    const requestPacket = createPacket(
      'pkt-req',
      'AA:AA:AA:AA:AA:AA',
      'BB:BB:BB:BB:BB:BB',
      '192.168.1.1',
      '192.168.1.2',
      Protocol.ICMP,
      { type: 'ECHO_REQUEST', sequence: 42 }
    );

    // Call the handler directly
    handleICMP(requestPacket, hostB, engine);

    // Should have enqueued a transmission event for the reply
    const queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(1);
    
    const event = queue[0];
    expect(event.type).toBe(SimulationEventType.PACKET_IN_TRANSIT);
    expect(event.explanation).toContain('Generated Echo Reply');

    const replyPacket = event.payload.packet;
    expect(replyPacket.sourceIp).toBe('192.168.1.2');
    expect(replyPacket.destinationIp).toBe('192.168.1.1');
    expect(replyPacket.sourceMac).toBe('BB:BB:BB:BB:BB:BB');
    expect(replyPacket.destinationMac).toBe('AA:AA:AA:AA:AA:AA');
    expect(replyPacket.protocol).toBe(Protocol.ICMP);
    expect(replyPacket.payload.type).toBe('ECHO_REPLY');
    expect(replyPacket.payload.sequence).toBe(42);
  });

  it('should ignore ECHO_REQUEST if not targeted at its IP', () => {
    const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '192.168.1.2');
    const hostB = createHost('hostB', 'Host B', [ifaceB]);
    engine.addDevice(hostB);

    const requestPacket = createPacket(
      'pkt-req',
      'AA:AA:AA:AA:AA:AA',
      'BB:BB:BB:BB:BB:BB',
      '192.168.1.1',
      '10.0.0.99', // Wrong IP
      Protocol.ICMP,
      { type: 'ECHO_REQUEST', sequence: 42 }
    );

    handleICMP(requestPacket, hostB, engine);

    const queue = engine.createSnapshot().eventQueue;
    expect(queue).toHaveLength(0); // Should not reply
  });
});
