import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { SimulationEventType, type SimulationEvent } from '../events/SimulationEvent';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';

describe('EventDispatcher & Replay Foundation', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();

    // Setup basic topology
    const iface1 = createNetworkInterface('if1', 'MAC1');
    const iface2 = createNetworkInterface('if2', 'MAC2');
    engine.addDevice(createHost('host1', 'H1', [iface1]));
    engine.addDevice(createHost('host2', 'H2', [iface2]));
    engine.addLink(createLink('link1', 'if1', 'if2'));

    // Register a proof-of-concept handler
    engine.getDispatcher().registerHandler(
      SimulationEventType.PACKET_IN_TRANSIT,
      (event, eng) => {
        // Enqueue a DELIVERED event 5 ticks into the future
        const receivedEvent: SimulationEvent = {
          id: `delivered-${event.id}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_DELIVERED,
          payload: { ...event.payload }
        };
        eng.enqueueEvent(receivedEvent, 5);
      }
    );

    // Dummy handler for DELIVERED so it doesn't throw
    engine.getDispatcher().registerHandler(
      SimulationEventType.PACKET_DELIVERED,
      () => {
        // No-op for now
      }
    );
  });

  it('should take a snapshot and restore it correctly, reverting engine state', () => {
    const packet = createPacket('pkt1', 'MAC1', 'MAC2', '10.0.0.1', '10.0.0.2', Protocol.TCP, {});
    
    const transitEvent: SimulationEvent = {
      id: 'transit-1',
      timestamp: 0,
      type: SimulationEventType.PACKET_IN_TRANSIT,
      payload: { packet }
    };

    // Initial event at tick 1
    engine.enqueueEvent(transitEvent, 1);

    // Tick to 5
    engine.tick(5);
    expect(engine.getCurrentTick()).toBe(5);

    // At T=1, transit-1 was processed. It scheduled delivered-transit-1 at T=6 (1 + 5).
    // So at T=5, eventHistory has 1 event. EventQueue has 1 event.
    expect(engine.getEventHistory()).toHaveLength(1);
    expect(engine.getEventHistory()[0].id).toBe('transit-1');

    // Create snapshot at T=5
    const snapshotAt5 = engine.createSnapshot();

    // Tick to 10
    engine.tick(5);
    expect(engine.getCurrentTick()).toBe(10);
    
    // At T=6, delivered-transit-1 was processed.
    expect(engine.getEventHistory()).toHaveLength(2);
    expect(engine.getEventHistory()[1].id).toBe('delivered-transit-1');

    // Now restore snapshot back to T=5
    engine.restoreSnapshot(snapshotAt5);

    expect(engine.getCurrentTick()).toBe(5);
    expect(engine.getEventHistory()).toHaveLength(1);
    expect(engine.getEventHistory()[0].id).toBe('transit-1');

    // If we tick to 10 again, it should re-process the exact same scheduled event
    engine.tick(5);
    expect(engine.getCurrentTick()).toBe(10);
    expect(engine.getEventHistory()).toHaveLength(2);
    expect(engine.getEventHistory()[1].id).toBe('delivered-transit-1');
  });
});
