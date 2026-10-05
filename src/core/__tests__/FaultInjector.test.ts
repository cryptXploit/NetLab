import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { SimulationEventType } from '../events/SimulationEvent';
import { createPacket } from '../domain/Packet';
import { Protocol } from '../domain/NetworkTypes';
import { injectLinkFailure, injectWrongGateway } from '../simulation/FaultInjector';

describe('FaultInjector', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();

    const ifaceA = createNetworkInterface('if-A', 'AA:AA:AA:AA:AA:AA', '10.0.0.1');
    const hostA = createHost('hostA', 'Host A', [ifaceA]);
    hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.2', interfaceId: 'if-A' }];

    const ifaceB = createNetworkInterface('if-B', 'BB:BB:BB:BB:BB:BB', '10.0.0.2');
    const hostB = createHost('hostB', 'Host B', [ifaceB]);

    const link = createLink('link1', 'if-A', 'if-B');

    engine.addDevice(hostA);
    engine.addDevice(hostB);
    engine.addLink(link);
    
    // Minimal mock handler for testing PACKET_IN_TRANSIT
    engine.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
      const payload = event.payload;
      const packet = payload.packet;
      const srcDevice = eng.getDevice(payload.sourceDeviceId!);
      if (!srcDevice) return;

      const outIfaceId = payload.outboundInterfaceId || srcDevice.interfaces[0].id;
      const outIface = srcDevice.interfaces.find(i => i.id === outIfaceId);
      const activeLink = eng.getLinkForInterface(outIfaceId);

      if (outIface?.status === 'DOWN' || activeLink?.status === 'DOWN') {
        eng.enqueueEvent({
          id: `drop`,
          timestamp: 0,
          type: SimulationEventType.PACKET_DROPPED,
          payload: { packet },
          explanation: `Physical layer failure: Link or Interface is DOWN.`,
        }, 0);
        return;
      }
      
      // If healthy, it would deliver. For test, we just do nothing here to isolate DROP event count.
    });

    engine.getDispatcher().registerHandler(SimulationEventType.PACKET_DROPPED, () => {
      // no-op
    });
  });

  it('injectLinkFailure sets link status to DOWN and drops packets', () => {
    injectLinkFailure(engine, 'link1');
    const link = engine.getLinks()[0];
    expect(link.status).toBe('DOWN');

    const pkt = createPacket('p1', 'AA:AA:AA:AA:AA:AA', 'BB:BB:BB:BB:BB:BB', '10.0.0.1', '10.0.0.2', Protocol.ICMP, {});
    engine.enqueueEvent({
      id: 'send',
      timestamp: 0,
      type: SimulationEventType.PACKET_IN_TRANSIT,
      payload: { packet: pkt, sourceDeviceId: 'hostA' }
    }, 0);

    engine.tick(2);

    const history = engine.getEventHistory();
    const droppedEvent = history.find(e => e.type === SimulationEventType.PACKET_DROPPED);
    expect(droppedEvent).toBeDefined();
    expect(droppedEvent?.explanation).toContain('Physical layer failure');
    expect(droppedEvent?.explanation).toContain('Physical layer failure');
  });

  it('injectWrongGateway updates default route next hop', () => {
    injectWrongGateway(engine, 'hostA', '10.0.0.99');
    const hostA = engine.getDevice('hostA');
    const defaultRoute = hostA?.routingTable.find(r => r.network === '0.0.0.0');
    expect(defaultRoute?.nextHop).toBe('10.0.0.99');
  });
});
