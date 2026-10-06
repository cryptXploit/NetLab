import type { LabDefinition } from '../core/domain/Lab';
import { createHost, createRouter, createSwitch } from '../core/domain/Device';
import { createNetworkInterface } from '../core/domain/NetworkInterface';
import { createLink } from '../core/domain/Link';

export const LAB_YOUR_FIRST_NETWORK: LabDefinition = {
  id: 'lab-1-first-network',
  title: 'Your First Network',
  subtitle: 'Understand Devices & Links',
  category: 'Foundations',
  difficulty: 'Beginner',
  estimatedTime: 5,
  description: 'Learn the basic building blocks of a network by connecting two computers together.',
  learningObjectives: ['Understand devices', 'Understand links', 'Send a packet'],
  skills: ['FOUNDATIONS'],
  
  initialState: (() => {
    const engine: any = {
      devices: [],
      links: [],
      addDevice: (d: any) => engine.devices.push(d),
      addLink: (l: any) => engine.links.push(l)
    };

    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
    const hostA = createHost('hostA', 'Host A', [ifaceA]);
    hostA.metadata = { x: 200, y: 300 };

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '192.168.1.20');
    const hostB = createHost('hostB', 'Host B', [ifaceB]);
    hostB.metadata = { x: 600, y: 300 };

    hostA.routingTable = [{ network: '192.168.1.0', prefix: 24, interfaceId: 'ifA' }];
    hostB.routingTable = [{ network: '192.168.1.0', prefix: 24, interfaceId: 'ifB' }];

    engine.addDevice(hostA);
    engine.addDevice(hostB);
    engine.addLink(createLink('link1', 'ifA', 'ifB'));
  
    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 'step1',
      title: 'Send a Ping',
      instruction: 'Tap Host A, choose "Ping", and enter Host B IP (192.168.1.20).',
      actionRequired: 'Ping from Host A to Host B',
      observation: 'Watch the ICMP packet travel from Host A to Host B across the link.',
      explanation: 'Computers communicate by sending packets of data over physical or logical links.',
      verificationRules: [{ type: 'PACKET_DELIVERED', destinationIp: '192.168.1.20' }]
    }
  ],
  hints: [
    { id: 'h1', message: 'Tap on Host A, then tap the Terminal or Ping button.' },
    { id: 'h2', message: 'The IP of Host B is 192.168.1.20.' }
  ]
};

export const LAB_ARP_DISCOVERY: LabDefinition = {
  id: 'lab-2-arp-discovery',
  title: 'ARP Discovery',
  subtitle: 'How devices find MAC addresses',
  category: 'Foundations',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'Before a packet can be sent, the sender must know the physical (MAC) address of the target. Learn how ARP solves this.',
  learningObjectives: ['Understand ARP Requests', 'Understand ARP Replies', 'Inspect MAC Tables'],
  skills: ['ARP', 'FOUNDATIONS'],
  
  initialState: (() => {
    const engine: any = {
      devices: [],
      links: [],
      addDevice: (d: any) => engine.devices.push(d),
      addLink: (l: any) => engine.links.push(l)
    };

    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.1');
    const hostA = createHost('hostA', 'PC1', [ifaceA]);
    hostA.metadata = { x: 200, y: 300 };

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '10.0.0.2');
    const hostB = createHost('hostB', 'PC2', [ifaceB]);
    hostB.metadata = { x: 600, y: 300 };

    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];
    hostB.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifB' }];

    engine.addDevice(hostA);
    engine.addDevice(hostB);
    engine.addLink(createLink('link1', 'ifA', 'ifB'));
  
    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 's1',
      title: 'Generate ARP Request',
      instruction: 'Ping PC2 (10.0.0.2) from PC1. Watch closely.',
      observation: 'PC1 first sends a broadcast ARP packet. PC2 replies with its MAC address. Only then does the actual Ping travel.',
      explanation: 'ARP (Address Resolution Protocol) broadcasts "Who has this IP?" to the local network.',
      verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ARP' }]
    }
  ],
  hints: []
};

export const LAB_SWITCHING_BASICS: LabDefinition = {
  id: 'lab-3-switching',
  title: 'Switching Basics',
  subtitle: 'How switches forward packets',
  category: 'Switching',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'Switches connect multiple devices on the same network. Watch how they learn MAC addresses and forward packets to the correct port.',
  learningObjectives: ['Understand switches', 'Observe MAC learning', 'Observe broadcast behavior'],
  skills: ['SWITCHING', 'ARP'],
  
  initialState: (() => {
    const engine: any = {
      devices: [],
      links: [],
      addDevice: (d: any) => engine.devices.push(d),
      addLink: (l: any) => engine.links.push(l)
    };

    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.1');
    const hostA = createHost('hostA', 'PC1', [ifaceA]);
    hostA.metadata = { x: 200, y: 200 };

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '10.0.0.2');
    const hostB = createHost('hostB', 'PC2', [ifaceB]);
    hostB.metadata = { x: 600, y: 200 };

    const ifaceC = createNetworkInterface('ifC', 'CC:CC:CC:CC:CC:CC', '10.0.0.3');
    const hostC = createHost('hostC', 'PC3', [ifaceC]);
    hostC.metadata = { x: 400, y: 500 };

    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];
    hostB.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifB' }];
    hostC.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifC' }];

    const switch1 = createSwitch('sw1', 'Switch 1', [
      createNetworkInterface('sw-if1', 'S1:11', ''),
      createNetworkInterface('sw-if2', 'S1:22', ''),
      createNetworkInterface('sw-if3', 'S1:33', ''),
    ]);
    switch1.metadata = { x: 400, y: 350 };

    engine.addDevice(hostA);
    engine.addDevice(hostB);
    engine.addDevice(hostC);
    engine.addDevice(switch1);

    engine.addLink(createLink('l1', 'ifA', 'sw-if1'));
    engine.addLink(createLink('l2', 'ifB', 'sw-if2'));
    engine.addLink(createLink('l3', 'ifC', 'sw-if3'));
  
    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 's1',
      title: 'Broadcast vs Unicast',
      instruction: 'Ping PC3 (10.0.0.3) from PC1. Observe how the switch handles the initial ARP (broadcast) vs the Ping (unicast).',
      observation: 'The switch floods the ARP broadcast to all ports. It then learns PC3\'s MAC address and only forwards the Ping reply directly to PC1.',
      explanation: 'Switches maintain a MAC table mapping physical addresses to switch ports to efficiently route traffic.',
      verificationRules: [{ type: 'PACKET_DELIVERED', destinationIp: '10.0.0.3', protocol: 'ICMP' }]
    }
  ],
  hints: []
};

export const LAB_DHCP_LEASE: LabDefinition = {
  id: 'lab-4-dhcp',
  title: 'DHCP Autoconfiguration',
  subtitle: 'How devices get IP addresses',
  category: 'Services',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'DHCP automatically assigns IP addresses to devices. Observe the DORA process (Discover, Offer, Request, Acknowledge).',
  learningObjectives: ['Understand DHCP', 'Observe DORA process', 'Configure a client'],
  skills: ['DHCP', 'IPV4'],
  
  initialState: (() => {
    const engine: any = {
      devices: [],
      links: [],
      addDevice: (d: any) => engine.devices.push(d),
      addLink: (l: any) => engine.links.push(l)
    };

    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', ''); // No IP!
    const hostA = createHost('hostA', 'Laptop', [ifaceA]);
    hostA.metadata = { x: 200, y: 300 };

    const ifaceR = createNetworkInterface('ifR', 'RR:RR:RR:RR:RR:RR', '192.168.1.1');
    const router = createRouter('router1', 'Router', [ifaceR]);
    router.metadata = { x: 600, y: 300 };
    router.dhcpServerConfig = {
      poolNetwork: '192.168.1.0',
      prefix: 24,
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
      nextIpSuffix: 100
    };

    engine.addDevice(hostA);
    engine.addDevice(router);
    engine.addLink(createLink('l1', 'ifA', 'ifR'));
  
    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 's1',
      title: 'Request an IP',
      instruction: 'Open the Laptop context menu and choose "DHCP Request".',
      observation: 'The Laptop broadcasts a DHCP Discover packet. The Router replies with an Offer. The Laptop then formally Requests the IP, and the Router Acknowledges it.',
      explanation: 'Without DHCP, network administrators would have to manually type IP addresses into every single device.',
      verificationRules: [{ type: 'INTERFACE_IP', deviceId: 'hostA', interfaceId: 'ifA', expectedIp: '192.168.1.100' }]
    }
  ],
  hints: []
};

export const LAB_DNS_RESOLUTION: LabDefinition = {
  id: 'lab-5-dns',
  title: 'DNS Resolution',
  subtitle: 'The Internet Phonebook',
  category: 'Services',
  difficulty: 'Intermediate',
  estimatedTime: 10,
  description: 'Computers route by IP addresses, but humans use names (like google.com). Learn how DNS translates names to numbers.',
  learningObjectives: ['Understand DNS', 'Observe DNS Queries'],
  skills: ['DNS'],
  
  initialState: (() => {
    const engine: any = {
      devices: [],
      links: [],
      addDevice: (d: any) => engine.devices.push(d),
      addLink: (l: any) => engine.links.push(l)
    };

    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.10');
    const hostA = createHost('hostA', 'Client', [ifaceA]);
    hostA.dnsServerIp = '10.0.0.53';
    hostA.metadata = { x: 200, y: 300 };

    const ifaceD = createNetworkInterface('ifD', 'DD:DD:DD:DD:DD:DD', '10.0.0.53');
    const dnsServer = createHost('dnsServer', 'DNS', [ifaceD]);
    dnsServer.dnsRecords = { 'example.com': '10.0.0.99' };
    dnsServer.metadata = { x: 600, y: 200 };

    const ifaceW = createNetworkInterface('ifW', 'WW:WW:WW:WW:WW:WW', '10.0.0.99');
    const webServer = createHost('webServer', 'Web', [ifaceW]);
    webServer.metadata = { x: 600, y: 450 };

    const swIface1 = createNetworkInterface('sw-if1', 'S1:11', '');
    const swIface2 = createNetworkInterface('sw-if2', 'S1:22', '');
    const swIface3 = createNetworkInterface('sw-if3', 'S1:33', '');
    const switch1 = createSwitch('sw1', 'Switch', [swIface1, swIface2, swIface3]);
    switch1.metadata = { x: 400, y: 300 };

    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];
    dnsServer.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifD' }];
    webServer.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifW' }];

    engine.addDevice(hostA);
    engine.addDevice(dnsServer);
    engine.addDevice(webServer);
    engine.addDevice(switch1);

    engine.addLink(createLink('l1', 'ifA', 'sw-if1'));
    engine.addLink(createLink('l2', 'ifD', 'sw-if2'));
    engine.addLink(createLink('l3', 'ifW', 'sw-if3'));
  
    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 's1',
      title: 'Ping a Domain Name',
      instruction: 'Ping "example.com" from the Client.',
      observation: 'The Client first queries the DNS Server for "example.com". The DNS Server responds with "10.0.0.99". The Client then sends the actual ICMP Ping to 10.0.0.99.',
      explanation: 'DNS makes the Internet usable by replacing raw IP addresses with memorable domain names.',
      verificationRules: [{ type: 'PACKET_DELIVERED', destinationIp: '10.0.0.99', protocol: 'ICMP' }]
    }
  ],
  hints: []
};

import { TRBL_WRONG_GATEWAY, TRBL_MISSING_ROUTE, TRBL_WRONG_IP, TRBL_LINK_DOWN, TRBL_DNS_FAILURE } from './troubleshootingScenarios';
import { LAB_TWO_ROUTER_PATH } from './curriculum/Routing';
import { TRBL_DHCP_FAILURE } from './curriculum/DHCPFailure';
import { TRBL_DNS_FAILURE_DEEP } from './curriculum/Troubleshooting';


export const CURRICULUM = [
  LAB_YOUR_FIRST_NETWORK,
  LAB_ARP_DISCOVERY,
  LAB_SWITCHING_BASICS,
  LAB_DHCP_LEASE,
  LAB_DNS_RESOLUTION,
  LAB_TWO_ROUTER_PATH,
  TRBL_WRONG_GATEWAY,
  TRBL_MISSING_ROUTE,
  TRBL_WRONG_IP,
  TRBL_LINK_DOWN,
  TRBL_DNS_FAILURE,
  TRBL_DHCP_FAILURE,
  TRBL_DNS_FAILURE_DEEP
];
