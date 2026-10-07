export class TopologyValidator {
  
  static validate(payload: any): void {
    if (!payload.dexie || !payload.dexie.savedLabs) return;

    for (const savedLab of payload.dexie.savedLabs) {
      this.validateSnapshot(savedLab.snapshot);
    }
  }

  static validateSnapshot(snapshot: any): void {
    if (!snapshot) return; // Allow empty
    if (typeof snapshot !== 'object') throw new Error("Snapshot must be an object");
    
    const devices = snapshot.devices || [];
    const links = snapshot.links || [];
    
    if (!Array.isArray(devices)) throw new Error("devices must be an array");
    if (!Array.isArray(links)) throw new Error("links must be an array");
    
    if (devices.length > 500) throw new Error("Too many devices (max 500)");
    if (links.length > 1000) throw new Error("Too many links (max 1000)");

    const deviceIds = new Set<string>();
    const interfaceIds = new Set<string>();
    const interfaceMap = new Map<string, string>(); // ifaceId -> deviceId

    // Validate Devices
    for (const device of devices) {
      if (!device.id || typeof device.id !== 'string') throw new Error("Device missing valid ID");
      if (deviceIds.has(device.id)) throw new Error(`Duplicate device ID: ${device.id}`);
      deviceIds.add(device.id);

      if (!Array.isArray(device.interfaces)) throw new Error(`Device ${device.id} interfaces must be array`);
      
      for (const iface of device.interfaces) {
        if (!iface.id || typeof iface.id !== 'string') throw new Error(`Device ${device.id} has invalid interface ID`);
        if (interfaceIds.has(iface.id)) throw new Error(`Duplicate interface ID: ${iface.id}`);
        interfaceIds.add(iface.id);
        interfaceMap.set(iface.id, device.id);
      }
    }

    const linkIds = new Set<string>();
    // Validate Links
    for (const link of links) {
      if (!link.id || typeof link.id !== 'string') throw new Error("Link missing valid ID");
      if (linkIds.has(link.id)) throw new Error(`Duplicate link ID: ${link.id}`);
      linkIds.add(link.id);

      if (!interfaceIds.has(link.sourceInterfaceId)) {
        throw new Error(`Link ${link.id} references invalid source interface: ${link.sourceInterfaceId}`);
      }
      if (!interfaceIds.has(link.targetInterfaceId)) {
        throw new Error(`Link ${link.id} references invalid target interface: ${link.targetInterfaceId}`);
      }
      
      if (link.sourceInterfaceId === link.targetInterfaceId) {
        throw new Error(`Link ${link.id} connects interface to itself: ${link.sourceInterfaceId}`);
      }
    }
  }
}
