import { create } from 'zustand';
import { SimulationEngine, type ActivePacket } from '../../core/simulation/SimulationEngine';
import { createHost, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { SimulationEventType, type SimulationEvent } from '../../core/events/SimulationEvent';
import { createPacket } from '../../core/domain/Packet';
import { Protocol } from '../../core/domain/NetworkTypes';
import { handleICMP } from '../../core/protocols/ICMP';

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
      
      const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', '192.168.1.1');
      const hostA = createHost('hostA', 'Host A', [ifaceA]);
      hostA.metadata = { x: 200, y: 300 };

      const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '192.168.1.2');
      const hostB = createHost('hostB', 'Host B', [ifaceB]);
      hostB.metadata = { x: 600, y: 300 };

      const link1 = createLink('link1', 'if-hostA', 'if-hostB');

      newEngine.addDevice(hostA);
      newEngine.addDevice(hostB);
      newEngine.addLink(link1);

      // Register Handlers for Phase 8
      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
        const payload = event.payload;
        
        // Find link logic for activePacket coords (simplified)
        // Assume packet source MAC maps to device
        let srcId = 'hostA';
        let dstId = 'hostB';
        if (payload.packet.sourceMac === 'BB:BB:BB:BB:BB:BB') {
          srcId = 'hostB';
          dstId = 'hostA';
        }

        eng.addActivePacket({
          packet: payload.packet,
          sourceId: srcId,
          targetId: dstId,
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
        const packet = event.payload.packet;
        eng.removeActivePacket(packet.id);
        
        // Lookup receiving device by Destination IP
        const devices = eng.getDevices();
        const receivingDevice = devices.find(d => 
          d.interfaces.some(iface => iface.ipAddress === packet.destinationIp)
        );

        if (receivingDevice && packet.protocol === Protocol.ICMP) {
          handleICMP(packet, receivingDevice, eng);
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

      const pktId = Math.random().toString(36).substring(2, 9);
      const pkt = createPacket(
        `pkt-${pktId}`,
        srcIface.macAddress,
        dstIface.macAddress, // Phase 8: Assuming ARP is done and MAC is known
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
