import { SimulationEngine } from './SimulationEngine';

export class InvariantChecker {
  public static checkInvariants(engine: SimulationEngine): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const devices = engine.getDevices();
    const links = engine.getLinks();

    const deviceIds = new Set<string>();
    const interfaceIds = new Set<string>();
    
    // 1. No duplicate device IDs
    for (const dev of devices) {
      if (deviceIds.has(dev.id)) {
        errors.push(`Duplicate device ID found: ${dev.id}`);
      }
      deviceIds.add(dev.id);

      // 2. No duplicate interface IDs
      for (const iface of dev.interfaces) {
        if (interfaceIds.has(iface.id)) {
          errors.push(`Duplicate interface ID found: ${iface.id} on device ${dev.id}`);
        }
        interfaceIds.add(iface.id);
      }
    }

    const occupiedInterfaces = new Set<string>();
    const linkIds = new Set<string>();

    for (const link of links) {
      // 3. No duplicate link identity
      if (linkIds.has(link.id)) {
        errors.push(`Duplicate link ID found: ${link.id}`);
      }
      linkIds.add(link.id);

      // 4. Every link endpoint refers to an existing device interface
      if (!interfaceIds.has(link.interface1Id)) {
        errors.push(`Link ${link.id} references non-existent interface1Id: ${link.interface1Id}`);
      }
      if (!interfaceIds.has(link.interface2Id)) {
        errors.push(`Link ${link.id} references non-existent interface2Id: ${link.interface2Id}`);
      }

      // 5. An occupied interface belongs to exactly one valid link
      if (occupiedInterfaces.has(link.interface1Id)) {
        errors.push(`Interface ${link.interface1Id} is occupied by multiple links`);
      }
      occupiedInterfaces.add(link.interface1Id);

      if (occupiedInterfaces.has(link.interface2Id)) {
        errors.push(`Interface ${link.interface2Id} is occupied by multiple links`);
      }
      occupiedInterfaces.add(link.interface2Id);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
