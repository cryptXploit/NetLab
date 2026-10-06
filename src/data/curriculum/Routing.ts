import type { LabDefinition } from '../../core/domain/Lab';
import { createHost, createRouter } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink } from '../../core/domain/Link';

export const LAB_TWO_ROUTER_PATH: LabDefinition = {
  id: 'lab-routing-two-router',
  title: 'Two-Router Path',
  subtitle: 'Mastering Inter-Network Routing',
  category: 'Routing',
  difficulty: 'Intermediate',
  estimatedTime: 15,
  description: 'Connect three subnets using two routers. Learn how routers use routing tables to forward packets to non-local networks.',
  learningObjectives: [
    'Understand multi-router topologies',
    'Configure static routes to remote subnets',
    'Observe packet hops across routers'
  ],
  skills: ['ROUTING', 'STATIC_ROUTES', 'IPV4'],
  isProRequired: true,
  prerequisites: ['lab-1-first-network'],
  practiceMapping: ['practice-routing'],

  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    
    // Subnet 1: 192.168.1.0/24
    const hostA = createHost('hostA', 'PC-Left', [createNetworkInterface('ifA', 'AA:AA', '192.168.1.10')], '192.168.1.1');
    hostA.metadata = { x: 100, y: 300 };
    hostA.routingTable = [{ network: '192.168.1.0', prefix: 24, interfaceId: 'ifA' }, { network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'ifA' }];

    // Router 1
    const router1 = createRouter('r1', 'Router-Left', [
      createNetworkInterface('r1-if1', 'R1:1', '192.168.1.1'), // Facing Subnet 1
      createNetworkInterface('r1-if2', 'R1:2', '10.0.0.1')     // Facing Transit Subnet
    ]);
    router1.metadata = { x: 400, y: 300 };
    router1.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'r1-if1' },
      { network: '10.0.0.0', prefix: 24, interfaceId: 'r1-if2' },
      // Static route to Subnet 2 via R2
      { network: '172.16.1.0', prefix: 24, nextHop: '10.0.0.2', interfaceId: 'r1-if2' }
    ];

    // Router 2
    const router2 = createRouter('r2', 'Router-Right', [
      createNetworkInterface('r2-if1', 'R2:1', '10.0.0.2'),    // Facing Transit Subnet
      createNetworkInterface('r2-if2', 'R2:2', '172.16.1.1')   // Facing Subnet 2
    ]);
    router2.metadata = { x: 700, y: 300 };
    router2.routingTable = [
      { network: '10.0.0.0', prefix: 24, interfaceId: 'r2-if1' },
      { network: '172.16.1.0', prefix: 24, interfaceId: 'r2-if2' },
      // Static route to Subnet 1 via R1
      { network: '192.168.1.0', prefix: 24, nextHop: '10.0.0.1', interfaceId: 'r2-if1' }
    ];

    // Subnet 2: 172.16.1.0/24
    const hostB = createHost('hostB', 'PC-Right', [createNetworkInterface('ifB', 'BB:BB', '172.16.1.20')], '172.16.1.1');
    hostB.metadata = { x: 1000, y: 300 };
    hostB.routingTable = [{ network: '172.16.1.0', prefix: 24, interfaceId: 'ifB' }, { network: '0.0.0.0', prefix: 0, nextHop: '172.16.1.1', interfaceId: 'ifB' }];

    engine.addDevice(hostA);
    engine.addDevice(router1);
    engine.addDevice(router2);
    engine.addDevice(hostB);

    engine.addLink(createLink('l1', 'ifA', 'r1-if1'));
    engine.addLink(createLink('l2', 'r1-if2', 'r2-if1'));
    engine.addLink(createLink('l3', 'r2-if2', 'ifB'));

    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 'step1',
      title: 'Analyze the Topology',
      instruction: 'Observe the three distinct networks. PC-Left is on 192.168.1.x, the transit link between routers is 10.0.0.x, and PC-Right is on 172.16.1.x.',
      actionRequired: 'Open the Device Configuration for Router-Left and inspect its Routing Table.',
      explanation: 'For a packet to traverse multiple routers, each router must have a route to the final destination network.'
    },
    {
      id: 'step2',
      title: 'Send a Ping',
      instruction: 'Send a ping from PC-Left to PC-Right (172.16.1.20).',
      actionRequired: 'Ping 172.16.1.20',
      observation: 'Watch the packet cross Router-Left, then Router-Right, before reaching PC-Right.',
      explanation: 'PC-Left sends the packet to its default gateway (Router-Left). Router-Left uses its static route to forward the packet to Router-Right. Finally, Router-Right delivers it directly to PC-Right.',
      verificationRules: [{ type: 'PACKET_DELIVERED', destinationIp: '172.16.1.20' }]
    }
  ],
  hints: [
    { id: 'h1', message: 'Tap PC-Left, select Terminal, and type "ping 172.16.1.20".' }
  ]
};
