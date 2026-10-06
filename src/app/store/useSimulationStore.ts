import { create } from 'zustand';
import { SimulationEngine, type ActivePacket } from '../../core/simulation/SimulationEngine';
import { DeviceType, createHost, createRouter, createSwitch, createServer, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { SimulationEventType, type SimulationEvent } from '../../core/events/SimulationEvent';
import { createPacket, type Packet } from '../../core/domain/Packet';
import { Protocol } from '../../core/domain/NetworkTypes';
import { handleICMP } from '../../core/protocols/ICMP';
import { handleARP, type ARPPayload } from '../../core/protocols/ARP';
import { handleDNS, type DNSPayload } from '../../core/protocols/DNS';
import { handleDHCP, type DHCPPayload } from '../../core/protocols/DHCP';
import { handleSwitching } from '../../core/protocols/Ethernet';
import { findLongestPrefixMatch } from '../../core/network/Routing';
import { injectLinkFailure, injectWrongGateway } from '../../core/simulation/FaultInjector';
import { generateRandomPractice } from '../../core/simulation/PracticeDelegator';
import { LabShareService } from '../../core/sharing/LabShareService';

import { useProfileStore } from './useProfileStore';



interface SimulationStoreState {
  engine: SimulationEngine;
  devices: Device[];
  links: Link[];
  currentTick: number;
  topologyVersion: number;
  eventHistory: SimulationEvent[];
  activePackets: ActivePacket[];

  // Playback
  isPlaying: boolean;
  playbackSpeed: number;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;



  submitPrediction: (sourceId: string, targetHostname: string, packetId: string) => void;

  loadBasicLab: () => void;
  loadBrokenGatewayLab: () => void;
  loadRandomScenario: () => void;
  restoreSnapshot: (snapshot: any) => void;
  loadSharedLab: (hash: string) => boolean;
  stepForward: () => void;
  reset: () => void;
  sendPing: (sourceId: string, targetHostname: string) => void;
  requestDHCP: (deviceId: string) => void;
  updateDeviceInterface: (deviceId: string, interfaceId: string, ip: string) => void;
  updateDeviceRoute: (deviceId: string, network: string, prefix: number, nextHop: string) => void;
  injectFault: (type: 'LINK_DOWN' | 'BAD_GATEWAY') => void;

  updateDevicePosition: (id: string, x: number, y: number) => void;
  addDevice: (type: DeviceType, x: number, y: number) => void;
  removeDevice: (id: string) => void;
  addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => { success: boolean, error?: string };
  removeLink: (linkId: string) => void;
  getAvailableInterfaces: (deviceId: string) => import("../../core/domain/NetworkInterface").NetworkInterface[];
}



let playbackTimerId: any = null;

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
      const outIface = srcDevice.interfaces.find(i => i.id === route?.interfaceId);
        if (!outIface) {
          eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `Route interface not found.` }, 0);
          return;
        }

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


  const registerEngineHandlers = (eng: SimulationEngine) => {
    eng.getDispatcher().registerHandler(SimulationEventType.APP_PING_INTENT, (event, eng) => {
        const { sourceId, targetHostname } = event.payload;
        const srcDevice = eng.getDevice(sourceId);
        if (!srcDevice) return;
      
        const resolvedIp = srcDevice.dnsCache[targetHostname];
        if (resolvedIp) {
          const srcIface = srcDevice.interfaces[0];
          const route = findLongestPrefixMatch(resolvedIp, srcDevice.routingTable);
          if (!route) return;
      
          const pktId = event.payload.packetId || Math.random().toString(36).substring(2, 9);
          const pkt = createPacket(
            `pkt-${pktId}`,
            srcIface.macAddress,
            'FF:FF:FF:FF:FF:FF',
            srcIface.ipAddress || '',
            resolvedIp,
            Protocol.ICMP,
            { type: 'ECHO_REQUEST', sequence: 1 }
          );
          const nextHopIp = route.nextHop || resolvedIp;
          transmitOrARP(eng, srcDevice, pkt, nextHopIp);
        } else {
          srcDevice.dnsQueue.push({ targetHostname, pendingEvent: event });
          
          const dnsServerIp = srcDevice.dnsServerIp;
          if (!dnsServerIp) return;
      
          const srcIface = srcDevice.interfaces[0];
          const route = findLongestPrefixMatch(dnsServerIp, srcDevice.routingTable);
          if (!route) return;
      
          const dnsPktId = `dns-${Math.random().toString(36).substring(2, 9)}`;
          const dnsPayload: DNSPayload = { type: 'QUERY', hostname: targetHostname };
          
          const dnsPkt = createPacket(
            dnsPktId,
            srcIface.macAddress,
            'FF:FF:FF:FF:FF:FF',
            srcIface.ipAddress || '',
            dnsServerIp,
            Protocol.DNS,
            dnsPayload
          );
      
          const nextHopIp = route.nextHop || dnsServerIp;
          transmitOrARP(eng, srcDevice, dnsPkt, nextHopIp);
        }
      });

      eng.getDispatcher().registerHandler(SimulationEventType.APP_DHCP_INTENT, (event, eng) => {
        const { sourceId } = event.payload;
        const srcDevice = eng.getDevice(sourceId);
        if (!srcDevice) return;

        const srcIface = srcDevice.interfaces[0];
        const dhcpPayload: DHCPPayload = {
          type: 'DISCOVER',
          transactionId: `tx-${Math.random().toString(36).substring(2, 9)}`,
        };

        const dhcpPacket = createPacket(
          `dhcp-disc-${Math.random().toString(36).substring(2, 9)}`,
          srcIface.macAddress,
          'FF:FF:FF:FF:FF:FF', // Broadcast MAC
          '0.0.0.0',
          '255.255.255.255', // Broadcast IP
          Protocol.DHCP,
          dhcpPayload
        );

        eng.enqueueEvent({
          id: `send-${dhcpPacket.id}`,
          timestamp: 0,
          type: SimulationEventType.PACKET_IN_TRANSIT,
          payload: { packet: dhcpPacket, sourceDeviceId: srcDevice.id },
          explanation: `DHCP Discover Broadcasted by ${srcIface.macAddress}.`
        }, 0);
      });

      eng.getDispatcher().registerHandler(SimulationEventType.PACKET_IN_TRANSIT, (event, eng) => {
        const payload = event.payload;
        const packet = payload.packet;
        const srcDeviceId = payload.sourceDeviceId;

        if (!srcDeviceId) return;
        const srcDevice = eng.getDevice(srcDeviceId);
        if (!srcDevice) return;

        let targetDeviceId = payload.targetDeviceId;
        let activeLink = null;
        let outIface = null;

        if (!targetDeviceId) {
          let outboundIfaceId = payload.outboundInterfaceId;
          if (!outboundIfaceId) {
            outboundIfaceId = srcDevice.interfaces.find(i => i.macAddress === packet.sourceMac)?.id;
          }
          if (!outboundIfaceId) outboundIfaceId = srcDevice.interfaces[0].id;

          outIface = srcDevice.interfaces.find(i => i.id === outboundIfaceId);
          const link = eng.getLinkForInterface(outboundIfaceId);
          if (link) {
            activeLink = link;
            const otherIfaceId = link.interface1Id === outboundIfaceId ? link.interface2Id : link.interface1Id;
            const dstDev = getDeviceForInterface(eng, otherIfaceId);
            if (dstDev) targetDeviceId = dstDev.id;
          }
        }

        if (outIface?.status === 'DOWN' || activeLink?.status === 'DOWN') {
          eng.enqueueEvent({
            id: `drop-${packet.id}-${eng.getCurrentTick()}`,
            timestamp: 0,
            type: SimulationEventType.PACKET_DROPPED,
            payload: { packet },
            explanation: `Physical layer failure: Link or Interface is DOWN.`,
          }, 0);
          return;
          // dummy code to replace old return:
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

      eng.getDispatcher().registerHandler(SimulationEventType.PACKET_DELIVERED, (event, eng) => {
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
        // DHCP packets are handled if it's broadcast (255.255.255.255) or to me
        const isDhcpServerAccept = packet.protocol === Protocol.DHCP && (packet.destinationIp === '255.255.255.255' || receivingDevice.interfaces.some(i => i.ipAddress === packet.destinationIp));

        if (isForMe || isDhcpServerAccept) {
          if (packet.protocol === Protocol.ARP) {
            handleARP(packet, receivingDevice, eng);
          } else if (packet.protocol === Protocol.DNS) {
            handleDNS(packet, receivingDevice, eng);
          } else if (packet.protocol === Protocol.DHCP) {
            handleDHCP(packet, receivingDevice, eng);
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
              // dummy code to replace old return:
            }

            const nextHopIp = route.nextHop || packet.destinationIp;
            const outIface = receivingDevice.interfaces.find(i => i.id === route.interfaceId);
            if (!outIface) { eng.enqueueEvent({ id: `drop-${packet.id}-${eng.getCurrentTick()}`, timestamp: 0, type: SimulationEventType.PACKET_DROPPED, payload: { packet }, explanation: `Route interface not found.` }, 0); return; }
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

      
  };

  return {
    engine,
    devices: [],
    links: [],
    currentTick: 0,
      topologyVersion: 0,
    eventHistory: [],
    activePackets: [],
  
  isPlaying: false,
  playbackSpeed: 1,

    loadBasicLab: () => { get().pause();
      const newEngine = new SimulationEngine();
      
      const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
      const hostA = createHost('hostA', 'Host A', [ifaceA]);
      hostA.metadata = { x: 100, y: 200 };
      hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'if-hostA' }];
      hostA.dnsServerIp = '10.0.0.53';

      const ifaceC = createNetworkInterface('if-hostC', 'DD:DD:DD:DD:DD:DD', '0.0.0.0');
      const hostC = createHost('hostC', 'Host C', [ifaceC]);
      hostC.metadata = { x: 100, y: 100 };
      // Host C has no static routing, no DNS, IP is 0.0.0.0

      const ifaceS1_1 = createNetworkInterface('if-S1-1', 'S1:S1:S1:S1:S1:01', '');
      const ifaceS1_2 = createNetworkInterface('if-S1-2', 'S1:S1:S1:S1:S1:02', '');
      const ifaceS1_3 = createNetworkInterface('if-S1-3', 'S1:S1:S1:S1:S1:03', '');
      const switch1 = createSwitch('switch1', 'S1', [ifaceS1_1, ifaceS1_2, ifaceS1_3]);
      switch1.metadata = { x: 300, y: 200 };

      const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
      const ifaceR1_2 = createNetworkInterface('if-R1-2', 'R1:R1:R1:R1:R1:02', '10.0.0.1');
      const ifaceR1_3 = createNetworkInterface('if-R1-3', 'R1:R1:R1:R1:R1:03', '10.0.0.1');
      const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2, ifaceR1_3]);
      router1.metadata = { x: 500, y: 200 };
      router1.routingTable = [
        { network: '192.168.1.0', prefix: 24, interfaceId: 'if-R1-1' },
        { network: '10.0.0.53', prefix: 32, interfaceId: 'if-R1-3' },
        { network: '10.0.0.0', prefix: 24, interfaceId: 'if-R1-2' }
      ];
      router1.dhcpServerConfig = {
        poolNetwork: '192.168.1.0',
        prefix: 24,
        gateway: '192.168.1.1',
        dns: '10.0.0.53',
        nextIpSuffix: 100,
      };

      const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '10.0.0.10');
      const hostB = createHost('hostB', 'Host B', [ifaceB]);
      hostB.metadata = { x: 700, y: 200 };
      hostB.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.1', interfaceId: 'if-hostB' }];

      const ifaceServer = createNetworkInterface('if-server', 'CC:CC:CC:CC:CC:CC', '10.0.0.53');
      const server1 = createServer('server1', 'Server', [ifaceServer]);
      server1.metadata = { x: 700, y: 350 };
      server1.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.1', interfaceId: 'if-server' }];
      server1.dnsRecords = {
        'server.netlab': '10.0.0.10',
        'dns.netlab': '10.0.0.53'
      };

      const link1 = createLink('link1', 'if-hostA', 'if-S1-1');
      const linkC = createLink('linkC', 'if-hostC', 'if-S1-3');
      const link2 = createLink('link2', 'if-S1-2', 'if-R1-1');
      const link3 = createLink('link3', 'if-R1-2', 'if-hostB');
      const link4 = createLink('link4', 'if-R1-3', 'if-server');

      newEngine.addDevice(hostA);
      newEngine.addDevice(hostC);
      newEngine.addDevice(switch1);
      newEngine.addDevice(router1);
      newEngine.addDevice(hostB);
      newEngine.addDevice(server1);
      newEngine.addLink(link1);
      newEngine.addLink(linkC);
      newEngine.addLink(link2);
      newEngine.addLink(link3);
      newEngine.addLink(link4);

      registerEngineHandlers(newEngine);

      set({ engine: newEngine });
      
      set(state => ({
        topologyVersion: state.topologyVersion + 1,
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
        activePackets: newEngine.getActivePackets(),
      }));
    },


    updateDeviceInterface: (deviceId: string, interfaceId: string, ip: string) => {
      const eng = get().engine;
      const dev = eng.getDevice(deviceId);
      if (dev) {
        const iface = dev.interfaces.find(i => i.id === interfaceId);
        if (iface) {
          iface.ipAddress = ip;
          set(state => ({ devices: [...eng.getDevices()], topologyVersion: state.topologyVersion + 1 }));
        }
      }
    },

    updateDeviceRoute: (deviceId: string, network: string, prefix: number, nextHop: string) => {
      const eng = get().engine;
      const dev = eng.getDevice(deviceId);
      if (dev) {
        const route = dev.routingTable.find(r => r.network === network && r.prefix === prefix);
        if (route) {
          route.nextHop = nextHop;
          set(state => ({ devices: [...eng.getDevices()], topologyVersion: state.topologyVersion + 1 }));
        } else {
          dev.routingTable.push({ network, prefix, nextHop, interfaceId: dev.interfaces[0]?.id || "unknown" });
          set(state => ({ devices: [...eng.getDevices()], topologyVersion: state.topologyVersion + 1 }));
        }
      }
    },

    loadBrokenGatewayLab: () => { get().pause();
      const newEngine = new SimulationEngine();
      
      const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
      const hostA = createHost('hostA', 'Host A', [ifaceA]);
      hostA.metadata = { x: 200, y: 300 };
      hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.99', interfaceId: 'if-hostA' }];

      const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
      const ifaceR1_2 = createNetworkInterface('if-R1-2', 'R1:R1:R1:R1:R1:02', '10.0.0.1');
      const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2]);
      router1.metadata = { x: 500, y: 300 };
      router1.routingTable = [
        { network: '192.168.1.0', prefix: 24, interfaceId: 'if-R1-1' },
        { network: '10.0.0.0', prefix: 24, interfaceId: 'if-R1-2' }
      ];

      const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', '10.0.0.10');
      const hostB = createHost('hostB', 'Host B', [ifaceB]);
      hostB.metadata = { x: 800, y: 300 };
      hostB.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.1', interfaceId: 'if-hostB' }];

      const link1 = createLink('link1', 'if-hostA', 'if-R1-1');
      const link2 = createLink('link2', 'if-R1-2', 'if-hostB');

      newEngine.addDevice(hostA);
      newEngine.addDevice(router1);
      newEngine.addDevice(hostB);
      newEngine.addLink(link1);
      newEngine.addLink(link2);

      registerEngineHandlers(newEngine);

      set({ engine: newEngine });
      set(state => ({
        topologyVersion: state.topologyVersion + 1,
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
        activePackets: newEngine.getActivePackets(),
      }));
    },

    restoreSnapshot: (snapshot: any) => { get().pause();
      const newEngine = new SimulationEngine();
      newEngine.restoreSnapshot(snapshot);
      registerEngineHandlers(newEngine);

      set({ engine: newEngine });
      set(state => ({
        topologyVersion: state.topologyVersion + 1,
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
        activePackets: newEngine.getActivePackets(),
      }));
    },

    loadSharedLab: (hash: string) => { get().pause();
      try {
        const importedLab = LabShareService.importLabFromHash(hash);
        const newEngine = new SimulationEngine();
        newEngine.restoreSnapshot(importedLab);
        registerEngineHandlers(newEngine);

        set({ engine: newEngine });
        set(state => ({
        topologyVersion: state.topologyVersion + 1,
        devices: newEngine.getDevices(),
          links: newEngine.getLinks(),
          currentTick: newEngine.getCurrentTick(),
          eventHistory: newEngine.getEventHistory(),
          activePackets: newEngine.getActivePackets(),
      }));
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    loadRandomScenario: () => { get().pause();
      const newEngine = new SimulationEngine();
      
      const lab = generateRandomPractice(Math.floor(Math.random() * 1000));
      lab.initialState?.devices.forEach(d => newEngine.addDevice(d));
      lab.initialState?.links.forEach(l => newEngine.addLink(l));
      
      registerEngineHandlers(newEngine);

      set({ engine: newEngine });
      set(state => ({
        topologyVersion: state.topologyVersion + 1,
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
        activePackets: newEngine.getActivePackets(),
      }));
    },

    play: () => {
    if (get().isPlaying) return;
    set({ isPlaying: true });
      if (playbackTimerId) clearTimeout(playbackTimerId);
    
    const loop = () => {
      if (!get().isPlaying) return;
      get().stepForward();
      // Using setTimeout instead of interval for safer state access
      playbackTimerId = setTimeout(loop, 1000 / get().playbackSpeed) as any;
    };
    loop();
  },
  
  pause: () => {
    set({ isPlaying: false });
      if (playbackTimerId) { clearTimeout(playbackTimerId); playbackTimerId = null; }
  },
  
  setSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
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

    reset: () => { get().pause();
      get().loadBasicLab();
    },

    submitPrediction: (sourceId: string, targetHostname: string, packetId: string) => {
      const currentEngine = get().engine;
      currentEngine.enqueueEvent({
        id: `intent-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 0,
        type: SimulationEventType.APP_PING_INTENT,
        payload: { sourceId, targetHostname, packetId },
        explanation: `Application requested ping to ${targetHostname}.`
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },


    sendPing: (sourceId: string, targetHostname: string) => {
      const currentEngine = get().engine;
      
      useProfileStore.getState().unlockAchievement('FIRST_PING');

      currentEngine.enqueueEvent({
        id: `intent-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 0,
        type: SimulationEventType.APP_PING_INTENT,
        payload: { sourceId, targetHostname },
        explanation: `Application requested ping to ${targetHostname}.`
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },


    requestDHCP: (deviceId: string) => {
      const currentEngine = get().engine;
      
      currentEngine.enqueueEvent({
        id: `intent-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 0,
        type: SimulationEventType.APP_DHCP_INTENT,
        payload: { sourceId: deviceId },
        explanation: `Application requested DHCP configuration.`
      }, 0);

      set({
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
        activePackets: currentEngine.getActivePackets(),
      });
    },

    updateDevicePosition: (id: string, x: number, y: number) => {
      const eng = get().engine;
      const dev = eng.getDevice(id);
      if (dev) {
        if (!dev.metadata) dev.metadata = {};
        dev.metadata.x = x;
        dev.metadata.y = y;
        set(state => ({ devices: [...eng.getDevices()], topologyVersion: state.topologyVersion + 1 }));
      }
    },

    addDevice: (type: DeviceType, x: number, y: number) => {
      const eng = get().engine;
      const id = `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
      
      let newDevice;
      switch (type) {
        case DeviceType.HOST: {
          const iface = createNetworkInterface(`eth0-${id}`, `M:${id.substring(0,4)}`, '0.0.0.0');
          newDevice = createHost(id, 'New Host', [iface]);
          break;
        }
        case DeviceType.SERVER: {
          const iface = createNetworkInterface(`eth0-${id}`, `M:${id.substring(0,4)}`, '0.0.0.0');
          newDevice = createServer(id, 'New Server', [iface]);
          break;
        }
        case DeviceType.ROUTER: {
          const ifaces = [
            createNetworkInterface(`eth0-${id}`, `M:R0${id.substring(0,3)}`, '0.0.0.0'),
            createNetworkInterface(`eth1-${id}`, `M:R1${id.substring(0,3)}`, '0.0.0.0'),
            createNetworkInterface(`eth2-${id}`, `M:R2${id.substring(0,3)}`, '0.0.0.0')
          ];
          newDevice = createRouter(id, 'New Router', ifaces);
          break;
        }
        case DeviceType.SWITCH: {
          const ifaces = [
            createNetworkInterface(`fa0/1-${id}`, `M:S1${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/2-${id}`, `M:S2${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/3-${id}`, `M:S3${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/4-${id}`, `M:S4${id.substring(0,3)}`, '')
          ];
          newDevice = createSwitch(id, 'New Switch', ifaces);
          break;
        }
      }
      
      if (!newDevice) return;
      newDevice.metadata = { ...newDevice.metadata, x, y };
      eng.addDevice(newDevice);
      set(state => ({ devices: [...eng.getDevices()], topologyVersion: state.topologyVersion + 1 }));
    },
    removeDevice: (id: string) => {
      const eng = get().engine;
      eng.removeDevice(id);
      set({ devices: [...eng.getDevices()], links: [...eng.getLinks()] });
    },

    getAvailableInterfaces: (deviceId: string) => {
      const eng = get().engine;
      const device = eng.getDevice(deviceId);
      if (!device) return [];
      const links = eng.getLinks();
      const usedIds = new Set<string>();
      for (const l of links) {
        usedIds.add(l.interface1Id);
        usedIds.add(l.interface2Id);
      }
      return device.interfaces.filter(i => !usedIds.has(i.id));
    },

    addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => {
      const eng = get().engine;
      const src = eng.getDevice(sourceId);
      const tgt = eng.getDevice(targetId);
      
      if (!src) return { success: false, error: 'Source device not found' };
      if (!tgt) return { success: false, error: 'Target device not found' };
      if (sourceId === targetId) return { success: false, error: 'Cannot connect device to itself' };
      if (sourceIfaceId === targetIfaceId) return { success: false, error: 'Cannot connect interface to itself' };

      const links = eng.getLinks();
      // Check duplicate links on the exact same interfaces
      const existing = links.find(l => 
        (l.interface1Id === sourceIfaceId && l.interface2Id === targetIfaceId) ||
        (l.interface1Id === targetIfaceId && l.interface2Id === sourceIfaceId)
      );
      if (existing) return { success: false, error: 'These exact interfaces are already connected' };

      // Check if either interface is already occupied
      const occupied = links.find(l => 
        l.interface1Id === sourceIfaceId || l.interface2Id === sourceIfaceId ||
        l.interface1Id === targetIfaceId || l.interface2Id === targetIfaceId
      );
      if (occupied) return { success: false, error: 'One or both interfaces are already occupied' };

      const linkId = `link-${Math.random().toString(36).substring(2, 7)}`;
      eng.addLink(createLink(linkId, sourceIfaceId, targetIfaceId));
      
      set({ links: [...eng.getLinks()] });
      return { success: true };
    },

    removeLink: (linkId: string) => {
      const eng = get().engine;
      eng.removeLink(linkId);
      set({ links: [...eng.getLinks()] });
    },


    injectFault: (type: 'LINK_DOWN' | 'BAD_GATEWAY') => {
      const eng = get().engine;
      if (type === 'LINK_DOWN') {
        const link = eng.getLinks()[0]; // just target the first link for the demo
        if (link) {
          injectLinkFailure(eng, link.id);
        }
      } else if (type === 'BAD_GATEWAY') {
        const dev = eng.getDevices().find(d => d.type === 'HOST'); // target first host
        if (dev) {
          injectWrongGateway(eng, dev.id, '192.168.1.99');
        }
      }
      set({
        devices: [...eng.getDevices()],
        links: [...eng.getLinks()]
      });
    }
  };
});
