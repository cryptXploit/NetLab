import { SimulationEngine } from './SimulationEngine';
import { type Device } from '../domain/Device';

export interface DiagnosticReport {
  isHealthy: boolean;
  issues: string[];
}

export function evaluateNetworkHealth(engine: SimulationEngine): DiagnosticReport {
  const issues: string[] = [];

  // L1 Check
  const links = engine.getLinks();
  for (const link of links) {
    if (link.status === 'DOWN') {
      issues.push(`Physical layer anomaly: Link ${link.id} is disconnected.`);
    }
  }

  // Helper to find all IPs reachable from an interface across L2 (ignoring DOWN links)
  const getReachableIps = (startIfaceId: string): Set<string> => {
    const ips = new Set<string>();
    const visitedIfaces = new Set<string>();
    const queue = [startIfaceId];

    while (queue.length > 0) {
      const currIfaceId = queue.shift()!;
      if (visitedIfaces.has(currIfaceId)) continue;
      visitedIfaces.add(currIfaceId);

      // Which device owns this interface?
      let ownerDev: Device | undefined;
      for (const dev of engine.getDevices()) {
        if (dev.interfaces.some(i => i.id === currIfaceId)) {
          ownerDev = dev;
          break;
        }
      }

      if (ownerDev) {
        const iface = ownerDev.interfaces.find(i => i.id === currIfaceId);
        if (iface?.ipAddress) {
          ips.add(iface.ipAddress);
        }

        if (ownerDev.type === 'SWITCH') {
          // If it's a switch, all its interfaces are on the same L2 domain
          for (const i of ownerDev.interfaces) {
            if (!visitedIfaces.has(i.id)) {
              queue.push(i.id);
            }
          }
        }
      }

      // Find links connected to this interface
      for (const link of links) {
        if (link.status === 'DOWN') continue;
        if (link.interface1Id === currIfaceId && !visitedIfaces.has(link.interface2Id)) {
          queue.push(link.interface2Id);
        } else if (link.interface2Id === currIfaceId && !visitedIfaces.has(link.interface1Id)) {
          queue.push(link.interface1Id);
        }
      }
    }

    return ips;
  };

  // L3 Check
  for (const dev of engine.getDevices()) {
    for (const route of dev.routingTable) {
      if (route.nextHop) {
        const outIface = dev.interfaces.find(i => i.id === route.interfaceId) || dev.interfaces[0];
        if (!outIface) continue;

        // Check if nextHop is reachable on L2 segment
        const reachableIps = getReachableIps(outIface.id);
        if (!reachableIps.has(route.nextHop)) {
          issues.push(`Routing anomaly on ${dev.name}: Invalid next-hop gateway (${route.nextHop}).`);
        }
      }
    }
  }

  return {
    isHealthy: issues.length === 0,
    issues
  };
}
