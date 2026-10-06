import type { LabDefinition } from '../../core/domain/Lab';
import { createHost, createRouter } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink } from '../../core/domain/Link';

export const TRBL_DNS_FAILURE_DEEP: LabDefinition = {
  id: 'trbl-dns-failure-deep',
  title: 'Ghost in the DNS',
  subtitle: 'Diagnose a DNS Service Failure',
  category: 'Troubleshooting',
  difficulty: 'Intermediate',
  estimatedTime: 10,
  description: 'PC-1 cannot reach example.com. Investigate whether the network is broken, or if the DNS server is failing to respond.',
  learningObjectives: ['Differentiate between ICMP connectivity and application resolution', 'Verify DNS service availability'],
  skills: ['DNS', 'TROUBLESHOOTING', 'IPV4'],
  isProRequired: true,
  prerequisites: ['lab-dns-resolution'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    
    // PC-1
    const hostA = createHost('pc1', 'PC-1', [createNetworkInterface('pc1-if1', 'AA:AA', '192.168.1.10')], '192.168.1.1');
    hostA.metadata = { x: 200, y: 300 };
    hostA.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'pc1-if1' },
      { network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'pc1-if1' }
    ];
    hostA.dnsServerIp = '8.8.8.8'; // DNS server IP

    // Router
    const router = createRouter('r1', 'Router', [
      createNetworkInterface('r1-if1', 'R1:1', '192.168.1.1'),
      createNetworkInterface('r1-if2', 'R1:2', '8.8.8.1')
    ]);
    router.metadata = { x: 500, y: 300 };
    router.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'r1-if1' },
      { network: '8.8.8.0', prefix: 24, interfaceId: 'r1-if2' }
    ];

    // DNS Server (Intentionally missing DNS table to cause resolution failure)
    const dnsServer = createHost('dns', 'DNS Server', [createNetworkInterface('dns-if1', 'DD:DD', '8.8.8.8')], '8.8.8.1');
    dnsServer.metadata = { x: 800, y: 300 };
    dnsServer.routingTable = [
      { network: '8.8.8.0', prefix: 24, interfaceId: 'dns-if1' },
      { network: '0.0.0.0', prefix: 0, nextHop: '8.8.8.1', interfaceId: 'dns-if1' }
    ];
    // IMPORTANT: It has NO dnsRecords, so it will drop queries or return empty.    // Web Server (93.184.216.34)
    const webServer = createHost('web', 'example.com', [createNetworkInterface('web-if1', 'WW:WW', '93.184.216.34')], '8.8.8.1');
    webServer.metadata = { x: 800, y: 150 };
    webServer.routingTable = [
      { network: '93.184.216.0', prefix: 24, interfaceId: 'web-if1' },
      { network: '0.0.0.0', prefix: 0, nextHop: '93.184.216.1', interfaceId: 'web-if1' }
    ];

    // Connect Web Server to router (router needs an interface for it)
    router.interfaces.push(createNetworkInterface('r1-if3', 'R1:3', '93.184.216.1'));
    router.routingTable.push({ network: '93.184.216.0', prefix: 24, interfaceId: 'r1-if3' });

    engine.addDevice(hostA);
    engine.addDevice(router);
    engine.addDevice(dnsServer);
    engine.addDevice(webServer);

    engine.addLink(createLink('l1', 'pc1-if1', 'r1-if1'));
    engine.addLink(createLink('l2', 'r1-if2', 'dns-if1'));
    engine.addLink(createLink('l3', 'r1-if3', 'web-if1'));

    return { devices: engine.devices, links: engine.links };
  })(),

  steps: [
    {
      id: 'step1',
      title: 'Investigate Ping',
      instruction: 'Ping example.com from PC-1.',
      actionRequired: 'Ping example.com',
      observation: 'The DNS packet reaches the DNS server, but no valid response resolves the IP. Ping fails.',
      explanation: 'Without a DNS record mapping "example.com" to an IP, the host cannot initiate the ICMP echo.',
    },
    {
      id: 'step2',
      title: 'Fix the DNS Server',
      instruction: 'Open the configuration for the DNS Server and add an A Record mapping "example.com" to an IP (e.g., 93.184.216.34).',
      actionRequired: 'Add DNS record to DNS Server',
      verificationRules: [
        { type: 'PACKET_DELIVERED', destinationIp: '93.184.216.34', protocol: 'ICMP' }
      ]
    }
  ],
  hints: [
    { id: 'h1', message: 'Check if PC-1 can ping 8.8.8.8 first. If yes, the network is fine.' },
    { id: 'h2', message: 'Check the DNS Server configuration and add a missing DNS Record.' }
  ]
};

// We will fix step2 in a moment when we modify the initial state to actually include the web server.
