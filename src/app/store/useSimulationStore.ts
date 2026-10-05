import { create } from 'zustand';
import { SimulationEngine, type ActivePacket } from '../../core/simulation/SimulationEngine';
import { createHost, createRouter, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { SimulationEventType, type SimulationEvent } from '../../core/events/SimulationEvent';
import { createPacket } from '../../core/domain/Packet';
import { Protocol } from '../../core/domain/NetworkTypes';

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
  sendTestPacket: () => void;
  selectPacket: (id: string | null) => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => {
  const engine = new SimulationEngine();

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
      
      const iface1 = createNetworkInterface('if-host1', '00:00:00:00:00:01', '192.168.1.10');
      const host1 = createHost('host1', 'PC-1', [iface1]);
      host1.metadata = { x: 200, y: 300 };

      const iface2 = createNetworkInterface('if-router1', '00:00:00:00:00:02', '192.168.1.1');
      const router1 = createRouter('router1', 'R1', [iface2]);
      router1.metadata = { x: 600, y: 300 };

      const link1 = createLink('link1', 'if-host1', 'if-router1');

      newEngine.addDevice(host1);
      newEngine.addDevice(router1);
      newEngine.addLink(link1);

      // Register Handlers for Phase 6 & 7
      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
        const payload = event.payload;
        eng.addActivePacket({
          packet: payload.packet,
          sourceId: 'host1',
          targetId: 'router1',
          progress: 0,
        });
        
        // Enqueue DELIVERED event
        eng.enqueueEvent({
          id: `deliver-${event.id}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_DELIVERED,
          payload: { packet: payload.packet },
          explanation: `Packet arrived at destination MAC ${payload.packet.destinationMac} after traversing link.`,
        }, 5); // 5 ticks latency
      });

      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_DELIVERED, (event, eng) => {
        eng.removeActivePacket(event.payload.packet.id);
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

    sendTestPacket: () => {
      const currentEngine = get().engine;
      const pktId = Math.random().toString(36).substring(2, 9);
      const pkt = createPacket(
        `pkt-${pktId}`,
        '00:00:00:00:00:01',
        '00:00:00:00:00:02',
        '192.168.1.10',
        '192.168.1.1',
        Protocol.ICMP,
        { msg: 'hello' }
      );

      currentEngine.enqueueEvent({
        id: `send-${pkt.id}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: pkt },
        explanation: 'Packet transmitted directly via link.'
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
