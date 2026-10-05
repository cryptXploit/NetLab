import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

export const DeviceConfigPanel: React.FC = () => {
  const mode = useSimulationStore(state => state.mode);
  const selectedDeviceId = useSimulationStore(state => state.selectedDeviceIdForConfig);
  const selectDevice = useSimulationStore(state => state.selectDeviceForConfig);
  const devices = useSimulationStore(state => state.devices);
  const updateDeviceInterface = useSimulationStore(state => state.updateDeviceInterface);
  const updateDeviceRoute = useSimulationStore(state => state.updateDeviceRoute);

  if (mode !== 'EDIT' || !selectedDeviceId) return null;

  const device = devices.find(d => d.id === selectedDeviceId);
  if (!device) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col z-40 text-zinc-200">
      <div className="flex justify-between items-center p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold">{device.name} Config</h2>
        <button 
          onClick={() => selectDevice(null)}
          className="text-zinc-500 hover:text-zinc-300"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Interfaces</h3>
          {device.interfaces.map(iface => (
            <div key={iface.id} className="mb-4 bg-zinc-800 p-3 rounded">
              <div className="text-sm font-medium mb-2">{iface.id}</div>
              <label className="block text-xs text-zinc-400 mb-1">IP Address</label>
              <input
                type="text"
                value={iface.ipAddress || ''}
                onChange={(e) => updateDeviceInterface(device.id, iface.id, e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="text-xs text-zinc-500 mt-1">MAC: {iface.macAddress}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Routing (Default Gateway)</h3>
          {(() => {
            const defaultRoute = device.routingTable.find(r => r.network === '0.0.0.0' && r.prefix === 0);
            return (
              <div className="bg-zinc-800 p-3 rounded">
                <label className="block text-xs text-zinc-400 mb-1">Next Hop IP</label>
                <input
                  type="text"
                  value={defaultRoute?.nextHop || ''}
                  onChange={(e) => updateDeviceRoute(device.id, '0.0.0.0', 0, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 192.168.1.1"
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
