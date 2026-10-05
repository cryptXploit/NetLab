import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost, createSwitch } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';
import { SimulationEventType } from '../events/SimulationEvent';
import { handleSwitching } from '../protocols/Ethernet';

describe('Switching and MAC Learning', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should learn MAC address and flood unknown unicast', () => {
    // Setup Host A -> Switch S1 -> Host B
    const ifaceA = createNetworkInterface('if-A', 'AA:AA:AA:AA:AA:AA', '10.0.0.1');
    const hostA = createHost('A', 'A', [ifaceA]);

    const ifaceS1 = createNetworkInterface('if-S1', 'S1:01', '');
    const ifaceS2 = createNetworkInterface('if-S2', 'S1:02', '');
    const switch1 = createSwitch('S1', 'S1', [ifaceS1, ifaceS2]);

    const ifaceB = createNetworkInterface('if-B', 'BB:BB:BB:BB:BB:BB', '10.0.0.2');
    const hostB = createHost('B', 'B', [ifaceB]);

    const link1 = createLink('L1', 'if-A', 'if-S1');
    const link2 = createLink('L2', 'if-S2', 'if-B');

    engine.addDevice(hostA);
    engine.addDevice(switch1);
    engine.addDevice(hostB);
    engine.addLink(link1);
    engine.addLink(link2);

    // Initial state: S1 macTable is empty
    expect(Object.keys(switch1.macTable)).toHaveLength(0);

    // Simulate PACKET_DELIVERED to S1
    const packet = createPacket(
      'pkt-1',
      'AA:AA:AA:AA:AA:AA',
      'BB:BB:BB:BB:BB:BB',
      '10.0.0.1',
      '10.0.0.2',
      Protocol.ICMP,
      {}
    );
    const switchDevice = switch1 as any;
    
    // Simulate Host A sending packet to Host B
    handleSwitching(packet, switchDevice, 'if-S1', engine);

    const queue = engine.createSnapshot().eventQueue;
    
    // It should flood since it doesn't know BB:BB:BB:BB:BB:BB
    // There is only 1 other port (if-S2) connected to Host B
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe(SimulationEventType.PACKET_IN_TRANSIT);
    expect(queue[0].explanation).toContain('flood');
    
    // The switch should have learned Host A's MAC
    expect(switchDevice.macTable['AA:AA:AA:AA:AA:AA']).toBe('if-S1');

    // Simulate Reply from Host B to Host A
    const replyPacket = createPacket(
      'pkt-2',
      'BB:BB:BB:BB:BB:BB',
      'AA:AA:AA:AA:AA:AA',
      '10.0.0.2',
      '10.0.0.1',
      Protocol.ICMP,
      {}
    );

    // Call handleSwitching for the reply coming in on if-S2
    (engine as any).eventQueue.clear(); // Clear queue manually to avoid needing a handler
    handleSwitching(replyPacket, switchDevice, 'if-S2', engine);

    const queue2 = engine.createSnapshot().eventQueue;
    
    // It should forward directly, NOT flood, because it knows AA:AA:AA:AA:AA:AA is on if-S1
    expect(queue2).toHaveLength(1);
    expect(queue2[0].explanation).toContain('forwarded');
    
    // It should also learn Host B's MAC
    expect(switchDevice.macTable['BB:BB:BB:BB:BB:BB']).toBe('if-S2');
  });
});
