import re

path_store = 'src/app/store/useSimulationStore.ts'
with open(path_store, 'r', encoding='utf-8') as f:
    text_store = f.read()

store_method_patch = """    addDevice: (type: DeviceType, x: number, y: number) => {
      const eng = get().engine;
      const id = `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
      let newDevice;
      switch (type) {
        case DeviceType.HOST: newDevice = createHost(id, 'New Host'); break;
        case DeviceType.SWITCH: newDevice = createSwitch(id, 'New Switch'); break;
        case DeviceType.ROUTER: newDevice = createRouter(id, 'New Router'); break;
        case DeviceType.SERVER: newDevice = createServer(id, 'New Server'); break;
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

text_store = re.sub(r"    addDevice: \(type: 'HOST' \| 'SWITCH' \| 'ROUTER', x: number, y: number\) => \{.*?\n    \},", store_method_patch, text_store, flags=re.DOTALL)

with open(path_store, 'w', encoding='utf-8') as f:
    f.write(text_store)
