import type { LabDefinition } from '../core/domain/Lab';
import { createHost, createRouter, createSwitch } from '../core/domain/Device';
import { createNetworkInterface } from '../core/domain/NetworkInterface';
import { createLink } from '../core/domain/Link';

export const TRBL_WRONG_GATEWAY: LabDefinition = {
  id: 'trbl-1-wrong-gateway',
  title: 'Lost in Translation',
  subtitle: 'Diagnose a Gateway Issue',
  category: 'Troubleshooting',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'PC-1 cannot reach the Server. Use the Terminal to investigate why the packet never leaves the local network.',
  learningObjectives: ['Verify Default Gateway', 'Understand Routing Tables', 'Read ARP Output'],
  skills: ['ROUTING', 'IPV4', 'TROUBLESHOOTING'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
    const hostA = createHost('hostA', 'PC-1', [ifaceA], '192.168.1.99'); 
    hostA.metadata = { x: 200, y: 300 };
    hostA.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'ifA' },
      { network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.99', interfaceId: 'ifA' }
    ];

    const ifaceR1 = createNetworkInterface('ifR1', 'R1:11', '192.168.1.1');
    const ifaceR2 = createNetworkInterface('ifR2', 'R1:22', '10.0.0.1');
    const router = createRouter('router1', 'Router', [ifaceR1, ifaceR2]);
    router.metadata = { x: 500, y: 300 };
    router.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'ifR1' },
      { network: '10.0.0.0', prefix: 24, interfaceId: 'ifR2' }
    ];

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '10.0.0.100');
    const server = createHost('hostB', 'Server-1', [ifaceB], '10.0.0.1');
    server.metadata = { x: 800, y: 300 };
    server.routingTable = [
      { network: '10.0.0.0', prefix: 24, interfaceId: 'ifB' },
      { network: '0.0.0.0', prefix: 0, nextHop: '10.0.0.1', interfaceId: 'ifB' }
    ];

    engine.addDevice(hostA);
    engine.addDevice(router);
    engine.addDevice(server);

    engine.addLink(createLink('l1', 'ifA', 'ifR1'));
    engine.addLink(createLink('l2', 'ifR2', 'ifB'));
    return { devices: engine.devices, links: engine.links };
  })(),

  troubleshootingConfig: {
    objective: 'Restore connectivity between PC-1 (192.168.1.10) and Server-1 (10.0.0.100).',
    symptom: 'Ping from PC-1 to Server-1 fails.',
    rootCause: 'PC-1 was configured with the wrong default gateway (192.168.1.99).',
    solutionExplanation: 'The default gateway must be the IP address of the local router interface (192.168.1.1). When PC-1 tried to reach 10.0.0.100, it sent an ARP request for the MAC of 192.168.1.99, but no device responded, dropping the packet.',
    verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', destinationIp: '10.0.0.100' }]
  },

  steps: [],
  hints: [
    { id: 'h1', message: 'Use the CLI to ping 10.0.0.100. Does it time out or fail immediately?' },
    { id: 'h2', message: 'Run `show ip route` on PC-1. What is the default gateway (0.0.0.0/0 next hop)?' },
    { id: 'h3', message: 'Look at the Router. What is its actual IP address on the 192.168.1.0/24 network?' }
  ]
};

export const TRBL_MISSING_ROUTE: LabDefinition = {
  id: 'trbl-2-missing-route',
  title: 'The Black Hole',
  subtitle: 'Diagnose a Routing Issue',
  category: 'Troubleshooting',
  difficulty: 'Intermediate',
  estimatedTime: 15,
  description: 'PC-1 can reach the Server, but the Server cannot reply. Use tools to find out where the packet gets dropped.',
  learningObjectives: ['Verify bidirectional routing', 'Inspect Router Tables'],
  skills: ['ROUTING', 'TROUBLESHOOTING'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
    const hostA = createHost('hostA', 'PC-1', [ifaceA], '192.168.1.1');
    hostA.metadata = { x: 100, y: 300 };
    hostA.routingTable = [{ network: '192.168.1.0', prefix: 24, interfaceId: 'ifA' }, { network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'ifA' }];

    const ifaceR1_1 = createNetworkInterface('ifR1_1', 'R1:11', '192.168.1.1');
    const ifaceR1_2 = createNetworkInterface('ifR1_2', 'R1:22', '10.0.0.1');
    const router1 = createRouter('router1', 'R1', [ifaceR1_1, ifaceR1_2]);
    router1.metadata = { x: 400, y: 300 };
    router1.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'ifR1_1' },
      { network: '10.0.0.0', prefix: 30, interfaceId: 'ifR1_2' },
      { network: '172.16.0.0', prefix: 24, nextHop: '10.0.0.2', interfaceId: 'ifR1_2' }
    ];

    const ifaceR2_1 = createNetworkInterface('ifR2_1', 'R2:11', '10.0.0.2');
    const ifaceR2_2 = createNetworkInterface('ifR2_2', 'R2:22', '172.16.0.1');
    const router2 = createRouter('router2', 'R2', [ifaceR2_1, ifaceR2_2]);
    router2.metadata = { x: 700, y: 300 };
    router2.routingTable = [
      { network: '10.0.0.0', prefix: 30, interfaceId: 'ifR2_1' },
      { network: '172.16.0.0', prefix: 24, interfaceId: 'ifR2_2' }
    ];

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '172.16.0.100');
    const server = createHost('server', 'Server', [ifaceB], '172.16.0.1');
    server.metadata = { x: 1000, y: 300 };
    server.routingTable = [{ network: '172.16.0.0', prefix: 24, interfaceId: 'ifB' }, { network: '0.0.0.0', prefix: 0, nextHop: '172.16.0.1', interfaceId: 'ifB' }];

    engine.addDevice(hostA);
    engine.addDevice(router1);
    engine.addDevice(router2);
    engine.addDevice(server);

    engine.addLink(createLink('l1', 'ifA', 'ifR1_1'));
    engine.addLink(createLink('l2', 'ifR1_2', 'ifR2_1'));
    engine.addLink(createLink('l3', 'ifR2_2', 'ifB'));
    return { devices: engine.devices, links: engine.links };
  })(),

  troubleshootingConfig: {
    objective: 'Restore ping connectivity between PC-1 (192.168.1.10) and Server (172.16.0.100).',
    symptom: 'Packets leave PC-1 but a reply never arrives.',
    rootCause: 'Router R2 lacks a route back to the 192.168.1.0/24 network.',
    solutionExplanation: 'Routing must be bidirectional. R1 knew how to send the packet to R2, and R2 to the Server. But when the Server replied, R2 received the packet destined for 192.168.1.10 and dropped it because its routing table was missing an entry for that network.',
    verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', sourceIp: '172.16.0.100', destinationIp: '192.168.1.10' }]
  },

  steps: [],
  hints: [
    { id: 'h1', message: 'Send a ping and watch the visual topology. How far does the packet get? How far does the reply get?' },
    { id: 'h2', message: 'Check R2\'s routing table using the CLI (`show ip route`). Does it know where `192.168.1.0/24` is?' },
    { id: 'h3', message: 'Add a route on R2 for network `192.168.1.0` prefix `24` via next hop `10.0.0.1`.' }
  ]
};

export const TRBL_WRONG_IP: LabDefinition = {
  id: 'trbl-3-wrong-ip',
  title: 'Identity Crisis',
  subtitle: 'Diagnose an IP Configuration Issue',
  category: 'Troubleshooting',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'PC-2 cannot communicate with PC-1 on the same switch. Diagnose and fix the configuration issue.',
  learningObjectives: ['Verify Subnetting', 'Inspect Interfaces', 'Understand L2 vs L3 boundaries'],
  skills: ['IPV4', 'SWITCHING', 'TROUBLESHOOTING'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.10');
    const hostA = createHost('hostA', 'PC-1', [ifaceA]);
    hostA.metadata = { x: 200, y: 200 };
    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '10.0.1.20'); 
    const hostB = createHost('hostB', 'PC-2', [ifaceB]);
    hostB.metadata = { x: 600, y: 200 };
    hostB.routingTable = [{ network: '10.0.1.0', prefix: 24, interfaceId: 'ifB' }];

    const switch1 = createSwitch('sw1', 'Switch', [
      createNetworkInterface('sw-if1', 'S1:11', ''),
      createNetworkInterface('sw-if2', 'S1:22', ''),
    ]);
    switch1.metadata = { x: 400, y: 350 };

    engine.addDevice(hostA);
    engine.addDevice(hostB);
    engine.addDevice(switch1);

    engine.addLink(createLink('l1', 'ifA', 'sw-if1'));
    engine.addLink(createLink('l2', 'ifB', 'sw-if2'));
    return { devices: engine.devices, links: engine.links };
  })(),

  troubleshootingConfig: {
    objective: 'Restore ping connectivity between PC-1 and PC-2.',
    symptom: 'PC-1 cannot ping 10.0.0.20.',
    rootCause: 'PC-2 was assigned an IP address (10.0.1.20) outside the local subnet (10.0.0.0/24).',
    solutionExplanation: 'Devices on the same switch must be in the same subnet to communicate without a router. By placing PC-2 in 10.0.1.0/24, PC-1 did not know how to reach it via ARP.',
    verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', destinationIp: '10.0.0.20' }]
  },

  steps: [],
  hints: [
    { id: 'h1', message: 'Use `ipconfig` on PC-2. Is its IP address what you expect?' },
    { id: 'h2', message: 'Change PC-2\'s interface IP to 10.0.0.20. Also update its routing table to use 10.0.0.0/24!' }
  ]
};

export const TRBL_LINK_DOWN: LabDefinition = {
  id: 'trbl-4-link-down',
  title: 'Cable Cut',
  subtitle: 'Diagnose a Physical Layer Issue',
  category: 'Troubleshooting',
  difficulty: 'Beginner',
  estimatedTime: 5,
  description: 'PC-1 is suddenly completely isolated from the network. Find out why.',
  learningObjectives: ['Check Link Status', 'Verify Interfaces'],
  skills: ['FOUNDATIONS', 'TROUBLESHOOTING'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.10');
    const hostA = createHost('hostA', 'PC-1', [ifaceA]);
    hostA.metadata = { x: 200, y: 300 };
    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];

    const switch1 = createSwitch('sw1', 'Switch', [
      createNetworkInterface('sw-if1', 'S1:11', ''),
      createNetworkInterface('sw-if2', 'S1:22', ''),
    ]);
    switch1.metadata = { x: 500, y: 300 };

    const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', '10.0.0.20');
    const hostB = createHost('hostB', 'PC-2', [ifaceB]);
    hostB.metadata = { x: 800, y: 300 };
    hostB.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifB' }];

    engine.addDevice(hostA);
    engine.addDevice(switch1);
    engine.addDevice(hostB);

    const l1 = createLink('l1', 'ifA', 'sw-if1');
    l1.status = 'DOWN'; // FAULT
    const l2 = createLink('l2', 'ifB', 'sw-if2');

    engine.addLink(l1);
    engine.addLink(l2);
    return { devices: engine.devices, links: engine.links };
  })(),

  troubleshootingConfig: {
    objective: 'Restore connectivity between PC-1 and PC-2.',
    symptom: 'PC-1 cannot ping PC-2. The network appears dead.',
    rootCause: 'The physical link connecting PC-1 to the Switch was DOWN.',
    solutionExplanation: 'Layer 1 (Physical) is the foundation of networking. If a cable is unplugged or broken, no higher-level protocols (IP, ARP, TCP) can function.',
    verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', destinationIp: '10.0.0.20' }]
  },

  steps: [],
  hints: [
    { id: 'h1', message: 'Check the visual topology. Do any lines look disconnected or red?' },
    { id: 'h2', message: 'Delete the broken link and draw a new one between PC-1 and the Switch!' }
  ]
};

export const TRBL_DNS_FAILURE: LabDefinition = {
  id: 'trbl-5-dns-failure',
  title: 'Cannot Resolve',
  subtitle: 'Diagnose a Name Resolution Issue',
  category: 'Troubleshooting',
  difficulty: 'Intermediate',
  estimatedTime: 10,
  description: 'The Client can ping web servers by their IP addresses, but cannot access them by name. Diagnose the problem.',
  learningObjectives: ['Differentiate IP vs DNS issues', 'Configure DNS Server IP'],
  skills: ['DNS', 'IPV4', 'TROUBLESHOOTING'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', '10.0.0.10');
    const hostA = createHost('hostA', 'Client', [ifaceA]);
    hostA.dnsServerIp = '10.0.0.99'; // Should be .53
    hostA.metadata = { x: 200, y: 300 };
    hostA.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifA' }];

    const ifaceD = createNetworkInterface('ifD', 'DD:DD:DD:DD:DD:DD', '10.0.0.53');
    const dnsServer = createHost('dnsServer', 'DNS', [ifaceD]);
    dnsServer.dnsRecords = { 'example.com': '10.0.0.80' };
    dnsServer.metadata = { x: 600, y: 150 };
    dnsServer.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifD' }];

    const ifaceW = createNetworkInterface('ifW', 'WW:WW:WW:WW:WW:WW', '10.0.0.80');
    const webServer = createHost('webServer', 'Web', [ifaceW]);
    webServer.metadata = { x: 600, y: 450 };
    webServer.routingTable = [{ network: '10.0.0.0', prefix: 24, interfaceId: 'ifW' }];

    const switch1 = createSwitch('sw1', 'Switch', [
      createNetworkInterface('sw-if1', 'S1:11', ''),
      createNetworkInterface('sw-if2', 'S1:22', ''),
      createNetworkInterface('sw-if3', 'S1:33', ''),
    ]);
    switch1.metadata = { x: 400, y: 300 };

    engine.addDevice(hostA);
    engine.addDevice(dnsServer);
    engine.addDevice(webServer);
    engine.addDevice(switch1);

    engine.addLink(createLink('l1', 'ifA', 'sw-if1'));
    engine.addLink(createLink('l2', 'ifD', 'sw-if2'));
    engine.addLink(createLink('l3', 'ifW', 'sw-if3'));
    return { devices: engine.devices, links: engine.links };
  })(),

  troubleshootingConfig: {
    objective: 'Ping "example.com" successfully from the Client.',
    symptom: 'Ping to "example.com" fails, but Ping to 10.0.0.80 directly succeeds.',
    rootCause: 'The Client was configured with the wrong DNS Server IP (10.0.0.99 instead of 10.0.0.53).',
    solutionExplanation: 'When you ping a hostname, the device must query its configured DNS server. If that IP is wrong, name resolution fails entirely, even if the destination web server is perfectly reachable by its IP address.',
    verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', destinationIp: '10.0.0.80' }]
  },

  steps: [],
  hints: [
    { id: 'h1', message: 'Try pinging "example.com" from the Terminal. Then try pinging "10.0.0.80". What is the difference?' },
    { id: 'h2', message: 'Open the Client configuration and check its DNS Server IP. Then click on the actual DNS Server to see its true IP address.' }
  ]
};

export const TROUBLESHOOTING_SCENARIOS = [
  TRBL_WRONG_GATEWAY,
  TRBL_MISSING_ROUTE,
  TRBL_WRONG_IP,
  TRBL_LINK_DOWN,
  TRBL_DNS_FAILURE
];
