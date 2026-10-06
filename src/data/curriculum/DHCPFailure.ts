import type { LabDefinition } from '../../core/domain/Lab';
import { createHost } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink } from '../../core/domain/Link';

export const TRBL_DHCP_FAILURE: LabDefinition = {
  id: 'trbl-dhcp-failure',
  title: 'Lost in the Void',
  subtitle: 'Diagnose a DHCP Service Failure',
  category: 'Troubleshooting',
  difficulty: 'Beginner',
  estimatedTime: 10,
  description: 'PC-1 is configured for DHCP, but it is not receiving an IP address. Investigate the DHCP server configuration.',
  learningObjectives: ['Understand DHCP DISCOVER/OFFER flow', 'Identify misconfigured DHCP scopes'],
  skills: ['DHCP', 'TROUBLESHOOTING', 'IPV4'],
  isProRequired: true,
  prerequisites: ['lab-dhcp-lease'],
  mode: 'troubleshooting',
  
  initialState: (() => {
    const engine: any = { devices: [], links: [], addDevice: (d: any) => engine.devices.push(d), addLink: (l: any) => engine.links.push(l) };
    
    // PC-1
    const pcIface = createNetworkInterface('pc1-if1', 'AA:AA', '0.0.0.0');
        const hostA = createHost('pc1', 'PC-1', [pcIface]);
    hostA.metadata = { x: 200, y: 300 };

    // DHCP Server (Intentionally misconfigured - wrong IP pool for this subnet)
    const dhcpIface = createNetworkInterface('dhcp-if1', 'DD:DD', '192.168.1.100');
    const dhcpServer = createHost('dhcp', 'DHCP Server', [dhcpIface], '192.168.1.1');
    dhcpServer.metadata = { x: 600, y: 300 };
    dhcpServer.routingTable = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'dhcp-if1' }
    ];
    // BAD CONFIGURATION: Pool is 10.0.0.x instead of 192.168.1.x
    dhcpServer.dhcpServerConfig = {
      poolNetwork: '10.0.0.0',
      prefix: 24,
      gateway: '10.0.0.1',
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
      title: 'Request DHCP Lease',
      instruction: 'Trigger a DHCP Discover from PC-1.',
      actionRequired: 'Request DHCP',
      observation: 'The DHCP Discover packet reaches the server, but the server either drops it or issues an invalid IP that PC-1 rejects or cannot use on this segment.',
      explanation: 'A DHCP server must have a pool that matches the network segment of its interface.',
    },
    {
      id: 'step2',
      title: 'Fix the Pool',
      instruction: 'Open the DHCP Server configuration and correct the IP Pool to match the 192.168.1.0/24 subnet (e.g. pool start 192.168.1.50). Then renew the lease on PC-1.',
      actionRequired: 'Fix DHCP pool and renew lease',
      verificationRules: [
        { type: 'INTERFACE_IP', deviceId: 'pc1', interfaceId: 'pc1-if1', expectedIp: '192.168.1.50' }
      ]
    }
  ],
  hints: [
    { id: 'h1', message: 'Check the DHCP Server Config in the Device Context menu.' },
    { id: 'h2', message: 'The interface IP of the server is 192.168.1.100. What should the pool be?' }
  ]
};
