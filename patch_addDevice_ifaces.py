import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """    addDevice: (type: DeviceType, x: number, y: number) => {
      const eng = get().engine;
      const id = `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;
      
      let newDevice;
      switch (type) {
        case DeviceType.HOST: {
          const iface = createNetworkInterface(`eth0-${id}`, `M:${id.substring(0,4)}`, '0.0.0.0');
          newDevice = createHost(id, 'New Host', [iface]);
          break;
        }
        case DeviceType.SERVER: {
          const iface = createNetworkInterface(`eth0-${id}`, `M:${id.substring(0,4)}`, '0.0.0.0');
          newDevice = createServer(id, 'New Server', [iface]);
          break;
        }
        case DeviceType.ROUTER: {
          const ifaces = [
            createNetworkInterface(`eth0-${id}`, `M:R0${id.substring(0,3)}`, '0.0.0.0'),
            createNetworkInterface(`eth1-${id}`, `M:R1${id.substring(0,3)}`, '0.0.0.0'),
            createNetworkInterface(`eth2-${id}`, `M:R2${id.substring(0,3)}`, '0.0.0.0')
          ];
          newDevice = createRouter(id, 'New Router', ifaces);
          break;
        }
        case DeviceType.SWITCH: {
          const ifaces = [
            createNetworkInterface(`fa0/1-${id}`, `M:S1${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/2-${id}`, `M:S2${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/3-${id}`, `M:S3${id.substring(0,3)}`, ''),
            createNetworkInterface(`fa0/4-${id}`, `M:S4${id.substring(0,3)}`, '')
          ];
          newDevice = createSwitch(id, 'New Switch', ifaces);
          break;
        }
      }
      
      if (!newDevice) return;
      newDevice.metadata = { ...newDevice.metadata, x, y };
      eng.addDevice(newDevice);
      set({ devices: [...eng.getDevices()] });
    },"""

text = re.sub(r'    addDevice: \(type: DeviceType, x: number, y: number\) => \{.*?\n      set\(\{ devices: \[\.\.\.eng\.getDevices\(\)\] \}\);\n    \},', replacement, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
