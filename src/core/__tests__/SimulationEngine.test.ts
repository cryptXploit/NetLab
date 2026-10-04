import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { SimulationEventType, type SimulationEvent } from '../events/SimulationEvent';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';

describe('SimulationEngine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('should initialize with correct default state', () => {
    expect(engine.getCurrentTick()).toBe(0);
    expect(engine.getDevices()).toHaveLength(0);
    expect(engine.getLinks()).toHaveLength(0);
    expect(engine.getEventHistory()).toHaveLength(0);
  });

  it('should add devices and verify link endpoints', () => {
    const iface1 = createNetworkInterface('iface-1', '00:00:00:00:00:01');
    const iface2 = createNetworkInterface('iface-2', '00:00:00:00:00:02');

    const host1 = createHost('host-1', 'PC-1', [iface1]);
    const host2 = createHost('host-2', 'PC-2', [iface2]);

    engine.addDevice(host1);
    engine.addDevice(host2);

    expect(engine.getDevices()).toHaveLength(2);

    const link = createLink('link-1', 'iface-1', 'iface-2');
    engine.addLink(link);

    expect(engine.getLinks()).toHaveLength(1);
  });

  it('should throw error when adding link with non-existent endpoints', () => {
    const link = createLink('link-invalid', 'iface-foo', 'iface-bar');
    expect(() => engine.addLink(link)).toThrow(/not found in topology/);
  });

  it('should process events deterministically by tick order', () => {
    const packet1 = createPacket(
      'pkt-1',
      '00:00:00:00:00:01',
      '00:00:00:00:00:02',
      '10.0.0.1',
      '10.0.0.2',
      Protocol.ICMP,
      { msg: 'ping' }
    );

    const event1: SimulationEvent = {
      id: 'evt-1',
      timestamp: 0,
      type: SimulationEventType.PACKET_CREATED,
      payload: { packet: packet1 }
    };

    const event2: SimulationEvent = {
      id: 'evt-2',
      timestamp: 0,
      type: SimulationEventType.PACKET_DELIVERED,
      payload: { packet: packet1 }
    };

    // Enqueue event1 at tick + 2
    engine.enqueueEvent(event1, 2);
    // Enqueue event2 at tick + 1 (should process before event1 despite enqueue order)
    engine.enqueueEvent(event2, 1);

    // Advance 1 tick
    engine.tick(1);
    expect(engine.getCurrentTick()).toBe(1);
    expect(engine.getEventHistory()).toHaveLength(1);
    expect(engine.getEventHistory()[0].id).toBe('evt-2');

    // Advance another tick
    engine.tick(1);
    expect(engine.getCurrentTick()).toBe(2);
    expect(engine.getEventHistory()).toHaveLength(2);
    expect(engine.getEventHistory()[1].id).toBe('evt-1');
  });

  it('should prevent scheduling events in the past', () => {
    const event: SimulationEvent = {
      id: 'evt-1',
      timestamp: 0,
      type: SimulationEventType.DEVICE_POWER_CHANGED,
      payload: {}
    };

    expect(() => engine.enqueueEvent(event, -1)).toThrow(/negative delayTicks/);
  });
});
