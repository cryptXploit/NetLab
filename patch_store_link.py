import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update signature
text = text.replace('  addLink: (sourceId: string, targetId: string) => void;', '  addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => { success: boolean, error?: string };\n  getAvailableInterfaces: (deviceId: string) => import("../../core/domain/NetworkInterface").NetworkInterface[];')

# 2. Add getAvailableInterfaces and modify addLink
new_methods = """    getAvailableInterfaces: (deviceId: string) => {
      const eng = get().engine;
      const device = eng.getDevice(deviceId);
      if (!device) return [];
      const links = eng.getLinks();
      const usedIds = new Set<string>();
      for (const l of links) {
        usedIds.add(l.interface1Id);
        usedIds.add(l.interface2Id);
      }
      return device.interfaces.filter(i => !usedIds.has(i.id));
    },

    addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => {
      const eng = get().engine;
      const src = eng.getDevice(sourceId);
      const tgt = eng.getDevice(targetId);
      
      if (!src) return { success: false, error: 'Source device not found' };
      if (!tgt) return { success: false, error: 'Target device not found' };
      if (sourceId === targetId) return { success: false, error: 'Cannot connect device to itself' };
      if (sourceIfaceId === targetIfaceId) return { success: false, error: 'Cannot connect interface to itself' };

      const links = eng.getLinks();
      // Check duplicate links on the exact same interfaces
      const existing = links.find(l => 
        (l.interface1Id === sourceIfaceId && l.interface2Id === targetIfaceId) ||
        (l.interface1Id === targetIfaceId && l.interface2Id === sourceIfaceId)
      );
      if (existing) return { success: false, error: 'These exact interfaces are already connected' };

      // Check if either interface is already occupied
      const occupied = links.find(l => 
        l.interface1Id === sourceIfaceId || l.interface2Id === sourceIfaceId ||
        l.interface1Id === targetIfaceId || l.interface2Id === targetIfaceId
      );
      if (occupied) return { success: false, error: 'One or both interfaces are already occupied' };

      const linkId = `link-${Math.random().toString(36).substring(2, 7)}`;
      eng.addLink(createLink(linkId, sourceIfaceId, targetIfaceId));
      
      set({ links: [...eng.getLinks()] });
      return { success: true };
    },"""

text = re.sub(r'    addLink: \(sourceId: string, targetId: string\) => \{.*?\n    \},', new_methods, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
