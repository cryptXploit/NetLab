import { create } from 'zustand';
import { SimulationEngine, type ActivePacket } from '../../core/simulation/SimulationEngine';
import { createHost, createRouter, createSwitch, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { SimulationEventType, type SimulationEvent } from '../../core/events/SimulationEvent';
import { createPacket, type Packet } from '../../core/domain/Packet';
import { Protocol } from '../../core/domain/NetworkTypes';
import { handleICMP } from '../../core/protocols/ICMP';
import { handleARP, type ARPPayload } from '../../core/protocols/ARP';
import { handleSwitching } from '../../core/protocols/Ethernet';
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

  const getLinkBetween = (eng: SimulationEngine, devAId: string, devBId: string): Link | undefined => {
    const devA = eng.getDevice(devAId);
    const devB = eng.getDevice(devBId);
    if (!devA || !devB) return undefined;

    for (const link of eng.getLinks()) {
      const isA1 = devA.interfaces.some(i => i.id === link.interface1Id);
      const isA2 = devA.interfaces.some(i => i.id === link.interface2Id);
      const isB1 = devB.interfaces.some(i => i.id === link.interface1Id);
      const isB2 = devB.interfaces.some(i => i.id === link.interface2Id);
      
      if ((isA1 && isB2) || (isA2 && isB1)) {
        return link;
      }
    }
    return undefined;
  };

  const getDeviceForInterface = (eng: SimulationEngine, ifaceId: string): Device | undefined => {
    return eng.getDevices().find(d => d.interfaces.some(i => i.id === ifaceId));
  };

  const transmitOrARP = (eng: SimulationEngine, srcDevice: Device, packet: Packet, nextHopIp: string) => {
    const knownMac = srcDevice.arpTable[nextHopIp];
    
    if (knownMac) {
      packet.destinationMac = knownMac;
      eng.enqueueEvent({
        id: `send-${packet.id}-${eng.getCurrentTick()}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet, sourceDeviceId: srcDevice.id },
        explanation: `Routed/Sent directly (MAC known: ${knownMac}).`
      }, 0);
    } else {
      srcDevice.arpQueue.push(packet);

      const route = findLongestPrefixMatch(nextHopIp, srcDevice.routingTable);
      const outIface = srcDevice.interfaces.find(i => i.id === route?.interfaceId) || srcDevice.interfaces[0];

      const arpReqId = `arp-req-${Math.random().toString(36).substring(2, 9)}`;
      const arpPayload: ARPPayload = {
        type: 'ARP_REQUEST',
        targetIp: nextHopIp,
        senderIp: outIface.ipAddress || '',
        senderMac: outIface.macAddress,
      };

      const arpPacket = createPacket(
        arpReqId,
        outIface.macAddress,
        'FF:FF:FF:FF:FF:FF',
        outIface.ipAddress || '',
        nextHopIp,
        Protocol.ARP,
        arpPayload
      );

      eng.enqueueEvent({
        id: `send-${arpReqId}-${eng.getCurrentTick()}`,
        timestamp: 0,
        type: SimulationEventType.PACKET_IN_TRANSIT,
        payload: { packet: arpPacket, sourceDeviceId: srcDevice.id },
        explanation: `ARP Request broadcasted for ${nextHopIp}.`
      }, 0);
    }
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
      hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'if-hostA' }];

      const ifaceS1_1 = createNetworkInterface('if-S1-1', 'S1:S1:S1:S1:S1:01', '');
      const ifaceS1_2 = createNetworkInterface('if-S1-2', 'S1:S1:S1:S1:S1:02', '');
      const switch1 = createSwitch('switch1', 'S1', [ifaceS1_1, ifaceS1_2]);
      switch1.metadata = { x: 300, y: 200 };

      const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
      const ifaceR1_2 = createNetworkInterface('if-R1-2', 'R1:R1:R1:R1:R1:02', '10.0.0.1');
      const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2]);
      router1.metadata = { x: 500, y: 200 };
      router1.routingTable = [
        { network: '192.168.1.0', prefix: 24, interfaceId: 'if-R1-1' },
        { network: '10.0.0.0', prefix: 24, interfaceId: 'if-R1-2' }
      ];

      const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '10.0.0.10');
      const hostB = createHost('hostB', 'Host B', [ifaceB]);
      hostB.metadata = { x: 700, y: 200 };
      hostB.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.1', interfaceId: 'if-hostB' }];

      const link1 = createLink('link1', 'if-hostA', 'if-S1-1');
      const link2 = createLink('link2', 'if-S1-2', 'if-R1-1');
      const link3 = createLink('link3', 'if-R1-2', 'if-hostB');

      newEngine.addDevice(hostA);
      newEngine.addDevice(switch1);
      newEngine.addDevice(router1);
      newEngine.addDevice(hostB);
      newEngine.addLink(link1);
      newEngine.addLink(link2);
      newEngine.addLink(link3);

      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
        const payload = event.payload;
        const packet = payload.packet;
        const srcDeviceId = payload.sourceDeviceId;

        if (!srcDeviceId) return;
        const srcDevice = eng.getDevice(srcDeviceId);
        if (!srcDevice) return;

        let targetDeviceId = payload.targetDeviceId;

        if (!targetDeviceId) {
          let outboundIfaceId = payload.outboundInterfaceId;
          if (!outboundIfaceId) {
            outboundIfaceId = srcDevice.interfaces.find(i => i.macAddress === packet.sourceMac)?.id;
          }
          if (!outboundIfaceId) outboundIfaceId = srcDevice.interfaces[0].id;

          const link = eng.getLinkForInterface(outboundIfaceId);
          if (link) {
            const otherIfaceId = link.interface1Id === outboundIfaceId ? link.interface2Id : link.interface1Id;
            const dstDev = getDeviceForInterface(eng, otherIfaceId);
            if (dstDev) targetDeviceId = dstDev.id;
          }
        }

        if (targetDeviceId) {
          eng.addActivePacket({
            packet,
            sourceId: srcDeviceId,
            targetId: targetDeviceId,
            progress: 0,
          });

          eng.enqueueEvent({
            id: `deliver-${packet.id}-${Math.random().toString(36).substring(2,7)}`,
            timestamp: 0,
            type: SimulationEventType.PACKET_DELIVERED,
            payload: { packet, receivingDeviceId: targetDeviceId, inboundDeviceId: srcDeviceId },
            explanation: `Packet arrived at ${targetDeviceId}.`,
          }, 5);
        }
      });

      newEngine.getDispatcher().registerHandler(SimulationEventType.PACKET_DELIVERED, (event, eng) => {
        const payload = event.payload;
        const packet = payload.packet;
        eng.removeActivePacket(packet.id);
        
        const receivingDevice = eng.getDevice(payload.receivingDeviceId);
        if (!receivingDevice) return;

        if (receivingDevice.type === 'SWITCH') {
          const inboundLink = getLinkBetween(eng, payload.inboundDeviceId, receivingDevice.id);
          if (inboundLink) {
            const inboundIfaceId = receivingDevice.interfaces.find(i => i.id === inboundLink.interface1Id || i.id === inboundLink.interface2Id)?.id;
            if (inboundIfaceId) {
              handleSwitching(packet, receivingDevice as any, inboundIfaceId, eng);
            }
          }
          return;
        }

        const isForMe = receivingDevice.interfaces.some(iface => iface.ipAddress === packet.destinationIp || packet.destinationMac === 'FF:FF:FF:FF:FF:FF');

        if (isForMe) {
          if (packet.protocol === Protocol.ARP) {
            handleARP(packet, receivingDevice, eng);
          } else if (packet.protocol === Protocol.ICMP && receivingDevice.interfaces.some(i => i.ipAddress === packet.destinationIp)) {
            handleICMP(packet, receivingDevice, eng);
          }
        } else if (receivingDevice.type === 'ROUTER') {
          const route = findLongestPrefixMatch(packet.destinationIp, receivingDevice.routingTable);
          if (route) {
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

            const nextHopIp = route.nextHop || packet.destinationIp;
            const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId) || receivingDevice.interfaces[0];
            packet.sourceMac = outIface.macAddress;

            transmitOrARP(eng, receivingDevice, packet, nextHopIp);
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

      const pktId = Math.random().toString(36).substring(2, 9);
      const pkt = createPacket(
        `pkt-${pktId}`,
        srcIface.macAddress,
        'FF:FF:FF:FF:FF:FF',
        srcIface.ipAddress,
        dstIface.ipAddress,
        Protocol.ICMP,
        { type: 'ECHO_REQUEST', sequence: 1 }
      );

      const nextHopIp = route.nextHop || dstIface.ipAddress;
      transmitOrARP(currentEngine, srcDevice, pkt, nextHopIp);

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
