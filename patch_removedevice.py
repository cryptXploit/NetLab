import re
import os

path_engine = 'src/core/simulation/SimulationEngine.ts'
with open(path_engine, 'r', encoding='utf-8') as f:
    text = f.read()

remove_method = """  removeDevice(id: string): void {
    // Remove all links connected to this device
    this.state.links = this.state.links.filter(l => l.sourceId !== id && l.targetId !== id);
    // Remove the device itself
    this.state.devices = this.state.devices.filter(d => d.id !== id);
    // Option: could clean up event queue / active packets targeting it, 
    // but the engine will drop packets naturally if next hop is missing.
  }
"""
text = re.sub(r'  addDevice\(device: Device\): void \{.*?  \}', lambda m: m.group(0) + '\n\n' + remove_method, text, flags=re.DOTALL)

with open(path_engine, 'w', encoding='utf-8') as f:
    f.write(text)

path_store = 'src/app/store/useSimulationStore.ts'
with open(path_store, 'r', encoding='utf-8') as f:
    text_store = f.read()

store_interface_patch = """  addDevice: (type: 'HOST' | 'SWITCH' | 'ROUTER' | 'SERVER', x: number, y: number) => void;
  removeDevice: (id: string) => void;"""
text_store = text_store.replace("  addDevice: (type: 'HOST' | 'SWITCH' | 'ROUTER', x: number, y: number) => void;", store_interface_patch)

store_method_patch = """      addDevice: (type: 'HOST' | 'SWITCH' | 'ROUTER' | 'SERVER', x: number, y: number) => {
        const eng = get().engine;
        const id = `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
        let newDevice;
        switch (type) {
          case 'HOST': newDevice = createHost(id, 'New Host'); break;
          case 'SWITCH': newDevice = createSwitch(id, 'New Switch'); break;
          case 'ROUTER': newDevice = createRouter(id, 'New Router'); break;
          case 'SERVER': newDevice = createServer(id, 'New Server'); break;
        }
        if (!newDevice) return;
        newDevice.metadata = { ...newDevice.metadata, x, y };
        eng.addDevice(newDevice);
        set({ devices: [...eng.getDevices()] });
      },
      removeDevice: (id: string) => {
        const eng = get().engine;
        eng.removeDevice(id);
        set({ devices: [...eng.getDevices()], links: [...eng.getLinks()] });
      },"""
text_store = re.sub(r"      addDevice: \(type: 'HOST' \| 'SWITCH' \| 'ROUTER', x: number, y: number\) => \{.*?\n      \},", store_method_patch, text_store, flags=re.DOTALL)

with open(path_store, 'w', encoding='utf-8') as f:
    f.write(text_store)
