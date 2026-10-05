import re

path = 'src/core/simulation/SimulationEngine.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

remove_method_new = """  public removeDevice(id: string): void {
    const device = this.devices.get(id);
    if (!device) return;
    const ifaceIds = device.interfaces.map(i => i.id);
    for (const [linkId, link] of this.links.entries()) {
      if (ifaceIds.includes(link.interface1Id) || ifaceIds.includes(link.interface2Id)) {
        this.links.delete(linkId);
      }
    }
    this.devices.delete(id);
  }"""

text = re.sub(r'  public removeDevice\(id: string\): void \{.*?\n  \}\n', remove_method_new + '\n', text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
