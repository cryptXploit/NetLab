import re

path = 'src/core/simulation/SimulationEngine.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

remove_method = """  public removeDevice(id: string): void {
    // Remove links connected to this device
    for (const [linkId, link] of this.links.entries()) {
      if (link.sourceId === id || link.targetId === id) {
        this.links.delete(linkId);
      }
    }
    this.devices.delete(id);
    this.deviceStates.delete(id);
  }
"""

text = text.replace('  public addDevice(device: Device): void {\n    if (this.devices.has(device.id)) {\n      throw new Error(`Device with ID ${device.id} already exists`);\n    }\n    this.devices.set(device.id, device);\n  }', '  public addDevice(device: Device): void {\n    if (this.devices.has(device.id)) {\n      throw new Error(`Device with ID ${device.id} already exists`);\n    }\n    this.devices.set(device.id, device);\n  }\n\n' + remove_method)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
