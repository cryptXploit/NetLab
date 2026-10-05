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
