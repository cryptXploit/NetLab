import { SimulationEngine } from './SimulationEngine';
import { createHost, createRouter } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { injectLinkFailure, injectWrongGateway } from './FaultInjector';

export function generateRandomTroubleshootingLab(engine: SimulationEngine): void {
  // We assume the engine is fresh, but just in case:
  // (In our current implementation, we just pass a newly instantiated engine)

  const net1 = Math.floor(Math.random() * 254) + 1;
  const net2 = Math.floor(Math.random() * 254) + 1;

  // Net 1: 192.168.${net1}.0 / 24
  const hostAIp = `192.168.${net1}.10`;
  const r1Iface1Ip = `192.168.${net1}.1`;
  
  // Net 2: 10.${net2}.0.0 / 24
  const hostBIp = `10.${net2}.0.10`;
  const r1Iface2Ip = `10.${net2}.0.1`;

  const ifaceA = createNetworkInterface('if-hostA', 'AA:AA:AA:AA:AA:AA', hostAIp);
  const hostA = createHost('hostA', 'Host A', [ifaceA]);
  hostA.metadata = { x: 200, y: 300 };
  hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: r1Iface1Ip, interfaceId: 'if-hostA' }];

  const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', r1Iface1Ip);
  const ifaceR1_2 = createNetworkInterface('if-R1-2', 'R1:R1:R1:R1:R1:02', r1Iface2Ip);
  const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2]);
  router1.metadata = { x: 500, y: 300 };
  router1.routingTable = [
    { network: `192.168.${net1}.0`, prefix: 24, interfaceId: 'if-R1-1' },
    { network: `10.${net2}.0.0`, prefix: 24, interfaceId: 'if-R1-2' }
  ];

  const ifaceB = createNetworkInterface('if-hostB', 'BB:BB:BB:BB:BB:BB', hostBIp);
  const hostB = createHost('hostB', 'Host B', [ifaceB]);
  hostB.metadata = { x: 800, y: 300 };
  hostB.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: r1Iface2Ip, interfaceId: 'if-hostB' }];

  const link1 = createLink('link1', 'if-hostA', 'if-R1-1');
  const link2 = createLink('link2', 'if-R1-2', 'if-hostB');

  engine.addDevice(hostA);
  engine.addDevice(router1);
  engine.addDevice(hostB);
  engine.addLink(link1);
  engine.addLink(link2);

  // Inject Fault
  const faultTypes = ['LINK_DOWN', 'BAD_GATEWAY'];
  const selectedFault = faultTypes[Math.floor(Math.random() * faultTypes.length)];

  if (selectedFault === 'LINK_DOWN') {
    const targetLink = Math.random() > 0.5 ? 'link1' : 'link2';
    injectLinkFailure(engine, targetLink);
  } else {
    // Bad Gateway for Host A
    const badGatewayIp = `192.168.${net1}.${Math.floor(Math.random() * 50) + 100}`; // Random IP in the same subnet
    injectWrongGateway(engine, 'hostA', badGatewayIp);
  }
}
