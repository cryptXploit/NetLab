import { create } from 'zustand';
import { SimulationEngine, type ActivePacket } from '../../core/simulation/SimulationEngine';
import { createHost, createRouter, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { SimulationEventType, type SimulationEvent } from '../../core/events/SimulationEvent';
import { createPacket } from '../../core/domain/Packet';
import { Protocol } from '../../core/domain/NetworkTypes';
import { handleICMP } from '../../core/protocols/ICMP';
import { findLongestPrefixMatch } from '../../core/network/Routing';

interface SimulationStoreState {
  engine: SimulationEngine;
  devices: Device[];
  links: Link[];
  currentTick: number;
  eventHistory: SimulationEvent[];
  activePackets: ActivePacket[];
  selectedPacketId: string | null;
  
  initLab: () => void;
  stepForward: () => void;
  reset: () => void;
  sendPing: (sourceId: string, targetId: string) => void;
  selectPacket: (id: string | null) => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => {
  const engine = new SimulationEngine();

  // Helper to find MAC address of connected interface (bypassing ARP for now)
  const getNextHopMac = (eng: SimulationEngine, outIfaceId: string): string => {
    const link = eng.getLinkForInterface(outIfaceId);
    if (!link) return 'FF:FF:FF:FF:FF:FF';
    const otherIfaceId = link.interface1Id === outIfaceId ? link.interface2Id : link.interface1Id;
    
    for (const dev of eng.getDevices()) {
      for (const iface of dev.interfaces) {
        if (iface.id === otherIfaceId) return iface.macAddress;
      }
    }
    return 'FF:FF:FF:FF:FF:FF';
  };

  return {
    engine,
    devices: [],
    links: [],
    currentTick: 0,
    eventHistory: [],
    activePackets: [],
    selectedPacketId: null,

    initLab: () => {
      const newEngine = new SimulationEngine();
      
      const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
      const hostA = createHost('hostA', 'Host A', [ifaceA]);
      hostA.metadata = { x: 100, y: 200 };
      hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, interfaceId: 'if-hostA' }];

      const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
      const ifaceR1_2 = createNetworkInterface('if-R1-2', 'R1:R1:R1:R1:R1:02', '10.0.0.1');
      const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2]);
      router1.metadata = { x: 400, y: 200 };
      router1.routingTable = [
        { network: '192.168.1.0', prefix: 24, interfaceId: 'if-R1-1' },
        { network: '10.0.0.0', prefix: 24, interfaceId: 'if-R1-2' }
      ];

      const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '10.0.0.10');
      const hostB = createHost('hostB', 'Host B', [ifaceB]);
      hostB.metadata = { x: 700, y: 200 };
      hostB.routingTable = [{ network: '0.0.0.0', prefix: 0, interfaceId: 'if-hostB' }];

      const link1 = createLink('link1', 'if-hostA', 'if-R1-1');
      const link2 = createLink('link2', 'if-R1-2', 'if-hostB');

      newEngine.addDevice(hostA);
      newEngine.addDevice(router1);
      newEngine.addDevice(hostB);
      newEngine.addLink(link1);
      newEngine.addLink(link2);

      // Register Handlers for Phase 10
      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
        const payload = event.payload;
        
        // Find source and target devices by looking up the link based on packet source MAC
        // Wait, for activePackets animation we need the UI nodes.
        let srcDevice = eng.getDevices().find(d => d.interfaces.some(i => i.macAddress === payload.packet.sourceMac));
        let dstDevice = eng.getDevices().find(d => d.interfaces.some(i => i.macAddress === payload.packet.destinationMac));
        
        if (srcDevice && dstDevice) {
          eng.addActivePacket({
            packet: payload.packet,
            sourceId: srcDevice.id,
            targetId: dstDevice.id,
            progress: 0,
          });
        }
        
        eng.enqueueEvent({
          id: `deliver-${event.id}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_DELIVERED,
          payload: { packet: payload.packet },
          explanation: `Packet arrived at destination MAC ${payload.packet.destinationMac} after traversing link.`,
        }, 5);
      });

      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_DELIVERED, (event, eng) => {
        const packet = event.payload.packet;
        eng.removeActivePacket(packet.id);
        
        // Lookup receiving device by Destination MAC
        const receivingDevice = eng.getDevices().find(d => 
          d.interfaces.some(iface => iface.macAddress === packet.destinationMac)
        );

        if (!receivingDevice) return;

        const isForMe = receivingDevice.interfaces.some(iface => iface.ipAddress === packet.destinationIp);

        if (isForMe) {
          if (packet.protocol === Protocol.ICMP) {
            handleICMP(packet, receivingDevice, eng);
          }
        } else if (receivingDevice.type === 'ROUTER') {
          // Routing
          const route = findLongestPrefixMatch(packet.destinationIp, receivingDevice.routingTable);
          if (route) {
            const outLink = eng.getLinkForInterface(route.interfaceId);
            if (outLink) {
              const nextHopMac = getNextHopMac(eng, route.interfaceId);
              // Update MACs for next hop
              packet.sourceMac = receivingDevice.interfaces.find(i => i.id === route.interfaceId)?.macAddress || packet.sourceMac;
              packet.destinationMac = nextHopMac;
              packet.ttl -= 1;
              
              if (packet.ttl <= 0) {
                eng.enqueueEvent({
                  id: `drop-${packet.id}-${eng.getCurrentTick()}`,
                  timestamp: 0,
                  type: SimulationEventType.PACKET_DROPPED,
                  payload: { packet },
                  explanation: `TTL expired in transit.`,
                }, 0);
                return;
              }

              eng.enqueueEvent({
                id: `route-${packet.id}-${eng.getCurrentTick()}`,
                timestamp: 0,
                type: SimulationEventType.PACKET_IN_TRANSIT,
                payload: { packet },
                explanation: `Routed via LPM: ${route.network}/${route.prefix}`,
              }, 1);
            }
          } else {
            eng.enqueueEvent({
              id: `drop-${packet.id}-${eng.getCurrentTick()}`,
              timestamp: 0,
              type: SimulationEventType.PACKET_DROPPED,
              payload: { packet },
              explanation: `No route to destination.`,
            }, 0);
          }
        }
      });

      set({ engine: newEngine });
      
      set({
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
        activePackets: newEngine.getActivePackets(),
        selectedPacketId: null,
      });
    },

    stepForward: () => {
      const currentEngine = get().engine;
      currentEngine.tick(1);
      set({
        devices: currentEngine.getDevices(),
        links: currentEngine.getLinks(),
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },

    reset: () => {
      get().initLab();
    },

    sendPing: (sourceId: string, targetId: string) => {
      const currentEngine = get().engine;
      const srcDevice = currentEngine.getDevice(sourceId);
      const dstDevice = currentEngine.getDevice(targetId);

      if (!srcDevice || !dstDevice) return;

      const srcIface = srcDevice.interfaces[0];
      const dstIface = dstDevice.interfaces[0];

      if (!srcIface.ipAddress || !dstIface.ipAddress) return;

      const route = findLongestPrefixMatch(dstIface.ipAddress, srcDevice.routingTable);
      if (!route) {
        console.warn('No route to host');
        return;
      }

      const nextHopMac = getNextHopMac(currentEngine, route.interfaceId);

      const pktId = Math.random().toString(36).substring(2, 9);
      const pkt = createPacket(
        `pkt-${pktId}`,
        srcIface.macAddress,
        nextHopMac,
        srcIface.ipAddress,
        dstIface.ipAddress,
        Protocol.ICMP,
        { type: 'ECHO_REQUEST', sequence: 1 }
      );

      currentEngine.enqueueEvent({
        id: `send-${pkt.id}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: pkt },
        explanation: 'ICMP Echo Request initiated.'
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },

    selectPacket: (id: string | null) => {
      set({ selectedPacketId: id });
    }
  };
});
