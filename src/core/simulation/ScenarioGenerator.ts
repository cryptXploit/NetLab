import type { LabDefinition } from '../domain/Lab';
import { createHost, createRouter } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';

// Simple deterministic PRNG based on Mulberry32
export function deterministicRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateWrongGatewayPractice(seed: number): LabDefinition {
  const rand = deterministicRandom(seed);
  
  // Deterministic octets for variety
  const thirdOctet = Math.floor(rand() * 200) + 1; // 1-200
  const serverOctet = Math.floor(rand() * 200) + 1;
  const faultHost = Math.floor(rand() * 200) + 50; // 50-250 (The wrong gateway IP)

  const hostIp = `192.168.${thirdOctet}.10`;
  const badGw = `192.168.${thirdOctet}.${faultHost}`;
  const correctGw = `192.168.${thirdOctet}.1`;

  const serverIp = `10.0.${serverOctet}.100`;
  const serverGw = `10.0.${serverOctet}.1`;

  return {
    id: `generated-gw-${seed}`,
    title: `Gateway Diagnosis #${seed}`,
    subtitle: `Generated Troubleshooting`,
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    estimatedTime: 10,
    description: `A network technician accidentally misconfigured PC-1. It cannot reach the Server at ${serverIp}. Find and fix the issue.`,
    learningObjectives: ['Verify Default Gateway', 'Understand ARP failures'],
    skills: ['ROUTING', 'IPV4', 'TROUBLESHOOTING'],
    mode: 'troubleshooting',
    
    initialState: (() => {
      const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
      
      const ifaceA = createNetworkInterface('ifA', 'AA:AA:AA:AA:AA:AA', hostIp);
      const hostA = createHost('hostA', 'PC-1', [ifaceA]);
      hostA.metadata = { x: 200, y: 300 };
      // FAULT
      hostA.routingTable = [
        { network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'ifA' },
        { network: '0.0.0.0', prefix: 0, nextHop: badGw, interfaceId: 'ifA' }
      ];
  
      const ifaceR1 = createNetworkInterface('ifR1', 'R1:11', correctGw);
      const ifaceR2 = createNetworkInterface('ifR2', 'R1:22', serverGw);
      const router = createRouter('router1', 'Router', [ifaceR1, ifaceR2]);
      router.metadata = { x: 500, y: 300 };
      router.routingTable = [
        { network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'ifR1' },
        { network: `10.0.${serverOctet}.0`, prefix: 24, interfaceId: 'ifR2' }
      ];
  
      const ifaceB = createNetworkInterface('ifB', 'BB:BB:BB:BB:BB:BB', serverIp);
      const server = createHost('hostB', 'Server', [ifaceB]);
      server.metadata = { x: 800, y: 300 };
      server.routingTable = [
        { network: `10.0.${serverOctet}.0`, prefix: 24, interfaceId: 'ifB' },
        { network: '0.0.0.0', prefix: 0, nextHop: serverGw, interfaceId: 'ifB' }
      ];
  
      engine.addDevice(hostA);
      engine.addDevice(router);
      engine.addDevice(server);
  
      engine.addLink(createLink('l1', 'ifA', 'ifR1'));
      engine.addLink(createLink('l2', 'ifR2', 'ifB'));
      return { devices: engine.devices, links: engine.links };
    })(),

    troubleshootingConfig: {
      objective: `Restore connectivity between PC-1 and the Server (${serverIp}).`,
      symptom: `Ping from PC-1 to Server fails.`,
      rootCause: `PC-1 was configured with the wrong default gateway (${badGw}).`,
      solutionExplanation: `The default gateway must be the IP address of the local router interface (${correctGw}).`,
      verificationRules: [{ type: 'PACKET_DELIVERED', protocol: 'ICMP', destinationIp: serverIp }]
    },
  
    steps: [],
    hints: [
      { id: 'h1', message: `Run \`show ip route\` on PC-1. Notice the default gateway (0.0.0.0/0). Is it ${correctGw}?` },
      { id: 'h2', message: `Look at the Router. Its interface on the left is ${correctGw}. PC-1 needs to point its default route there.` }
    ]
  };
}

export function generateDHCPFailurePractice(seed: number): LabDefinition {
  const rand = deterministicRandom(seed);
  const thirdOctet = Math.floor(rand() * 200) + 1;
  const badThirdOctet = thirdOctet + Math.floor(rand() * 10) + 1;

  return {
    id: `generated-dhcp-${seed}`,
    title: `DHCP Pool Diagnosis #${seed}`,
    subtitle: `Generated Troubleshooting`,
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    estimatedTime: 10,
    description: `PC-1 is set to DHCP but isn't getting an IP. Fix the DHCP server so it serves the correct 192.168.${thirdOctet}.0/24 subnet.`,
    learningObjectives: ['Verify DHCP scopes'],
    skills: ['DHCP', 'TROUBLESHOOTING', 'IPV4'],
    mode: 'troubleshooting',
    
    initialState: (() => {
      const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
      
      const pcIface = createNetworkInterface('pc1-if1', 'AA:AA', '0.0.0.0');
      
      const hostA = createHost('pc1', 'PC-1', [pcIface]);
      hostA.metadata = { x: 200, y: 300 };

      const dhcpIface = createNetworkInterface('dhcp-if1', 'DD:DD', `192.168.${thirdOctet}.1`);
      const dhcpServer = createHost('dhcp', 'DHCP Server', [dhcpIface], `192.168.${thirdOctet}.1`);
      dhcpServer.metadata = { x: 600, y: 300 };
      dhcpServer.routingTable = [{ network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'dhcp-if1' }];
      
      // FAULT
      dhcpServer.dhcpServerConfig = {
        poolNetwork: `192.168.${badThirdOctet}.0`,
        prefix: 24,
        gateway: `192.168.${badThirdOctet}.1`,
        dns: '8.8.8.8',
        nextIpSuffix: 50
      };

      engine.addDevice(hostA);
      engine.addDevice(dhcpServer);
      engine.addLink(createLink('l1', 'pc1-if1', 'dhcp-if1'));
      return { devices: engine.devices, links: engine.links };
    })(),

    steps: [
      {
        id: 'step1',
        title: 'Fix DHCP and Renew',
        instruction: `Correct the DHCP Pool to start at 192.168.${thirdOctet}.50 and renew PC-1 lease.`,
        actionRequired: 'Fix Pool and Renew',
        verificationRules: [{ type: 'INTERFACE_IP', deviceId: 'pc1', interfaceId: 'pc1-if1', expectedIp: `192.168.${thirdOctet}.50` }]
      }
    ],
    hints: [
      { id: 'h1', message: 'Check the DHCP Server Config pool start address.' }
    ]
  };
}

export function generateDNSFailurePractice(seed: number): LabDefinition {
  const rand = deterministicRandom(seed);
  const thirdOctet = Math.floor(rand() * 200) + 1;
  const webThirdOctet = Math.floor(rand() * 200) + 1;
  const webIp = `10.${webThirdOctet}.1.100`;

  return {
    id: `generated-dns-${seed}`,
    title: `DNS Resolution Diagnosis #${seed}`,
    subtitle: `Generated Troubleshooting`,
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    estimatedTime: 10,
    description: `PC-1 needs to ping test.server, but resolution fails. Fix the DNS server.`,
    learningObjectives: ['Verify DNS Records'],
    skills: ['DNS', 'TROUBLESHOOTING', 'IPV4'],
    mode: 'troubleshooting',
    
    initialState: (() => {
      const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
      
      const hostA = createHost('pc1', 'PC-1', [createNetworkInterface('if1', 'AA:AA', `192.168.${thirdOctet}.10`)], `192.168.${thirdOctet}.1`);
      hostA.metadata = { x: 200, y: 300 };
      hostA.routingTable = [
        { network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'if1' },
        { network: '0.0.0.0', prefix: 0, nextHop: `192.168.${thirdOctet}.1`, interfaceId: 'if1' }
      ];
      hostA.dnsServerIp = `192.168.${thirdOctet}.2`;

      const dnsServer = createHost('dns', 'DNS Server', [createNetworkInterface('if2', 'DD:DD', `192.168.${thirdOctet}.2`)], `192.168.${thirdOctet}.1`);
      dnsServer.metadata = { x: 600, y: 150 };
      dnsServer.routingTable = [{ network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'if2' }];
      // FAULT: No dns records

      const webServer = createHost('web', 'Web Server', [createNetworkInterface('if3', 'WW:WW', webIp)], `10.${webThirdOctet}.1.1`);
      webServer.metadata = { x: 600, y: 450 };
      webServer.routingTable = [
        { network: `10.${webThirdOctet}.1.0`, prefix: 24, interfaceId: 'if3' },
        { network: '0.0.0.0', prefix: 0, nextHop: `10.${webThirdOctet}.1.1`, interfaceId: 'if3' }
      ];

      const router = createRouter('r1', 'Router', [
        createNetworkInterface('r1-1', 'R1:1', `192.168.${thirdOctet}.1`),
        createNetworkInterface('r1-2', 'R1:2', `10.${webThirdOctet}.1.1`)
      ]);
      router.metadata = { x: 400, y: 300 };
      router.routingTable = [
        { network: `192.168.${thirdOctet}.0`, prefix: 24, interfaceId: 'r1-1' },
        { network: `10.${webThirdOctet}.1.0`, prefix: 24, interfaceId: 'r1-2' }
      ];

      engine.addDevice(hostA);
      engine.addDevice(dnsServer);
      engine.addDevice(webServer);
      engine.addDevice(router);
      engine.addLink(createLink('l1', 'if1', 'r1-1'));
      engine.addLink(createLink('l2', 'if2', 'r1-1'));
      engine.addLink(createLink('l3', 'if3', 'r1-2'));

      return { devices: engine.devices, links: engine.links };
    })(),

    steps: [
      {
        id: 'step1',
        title: 'Fix DNS',
        instruction: `Add a DNS record on the DNS Server for "test.server" pointing to ${webIp}. Then ping it from PC-1.`,
        actionRequired: 'Add DNS and Ping',
        verificationRules: [{ type: 'PACKET_DELIVERED', destinationIp: webIp, protocol: 'ICMP' }]
      }
    ],
    hints: [
      { id: 'h1', message: 'The DNS Server IP is 192.168.' + thirdOctet + '.2. Open its config.' }
    ]
  };
}
