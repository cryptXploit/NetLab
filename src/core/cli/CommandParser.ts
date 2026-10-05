import { type SimulationEngine } from '../simulation/SimulationEngine';
import { SimulationEventType } from '../events/SimulationEvent';

export function executeCommand(command: string, deviceId: string, engine: SimulationEngine): string[] {
  const device = engine.getDevice(deviceId);
  if (!device) {
    return [`Error: Device ${deviceId} not found.`];
  }

  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'ipconfig' || lower === 'ifconfig') {
    const lines: string[] = [];
    lines.push(`Configuration for ${device.name}:`);
    for (const iface of device.interfaces) {
      lines.push(`  Interface: ${iface.id}`);
      lines.push(`    MAC Address: ${iface.macAddress}`);
      lines.push(`    IP Address:  ${iface.ipAddress || 'unassigned'}`);
    }
    return lines;
  }

  if (lower === 'show arp') {
    const entries = Object.entries(device.arpTable);
    if (entries.length === 0) {
      return ['ARP cache is empty.'];
    }
    const lines: string[] = ['Address                  HWaddress'];
    for (const [ip, mac] of entries) {
      lines.push(`${ip.padEnd(24)} ${mac}`);
    }
    return lines;
  }

  if (lower === 'show ip route') {
    if (device.routingTable.length === 0) {
      return ['Routing table is empty.'];
    }
    const lines: string[] = ['Destination        Next Hop        Interface'];
    for (const route of device.routingTable) {
      const dest = `${route.network}/${route.prefix}`;
      const nextHop = route.nextHop || 'Connected';
      lines.push(`${dest.padEnd(18)} ${nextHop.padEnd(15)} ${route.interfaceId}`);
    }
    return lines;
  }

  if (lower.startsWith('ping ')) {
    const target = trimmed.slice(5).trim();
    if (!target) {
      return ['Usage: ping <target>'];
    }

    engine.enqueueEvent({
      id: `intent-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: 0,
      type: SimulationEventType.APP_PING_INTENT,
      payload: { sourceId: device.id, targetHostname: target },
      explanation: `Terminal requested ping to ${target}.`
    }, 0);

    return [`Ping intent dispatched. Check visual topology for simulation output.`];
  }

  return [`Command not found: ${command}`, `Available: ipconfig, show arp, show ip route, ping <ip>`];
}
