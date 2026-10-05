import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';

export const DeviceConfigPanel: React.FC = () => {
  const mode = useWorkspaceStore(state => state.mode);
  const selectedDeviceId = useWorkspaceStore(state => state.selectedDeviceIdForConfig);
  const selectDevice = useWorkspaceStore(state => state.selectDeviceForConfig);
  const devices = useSimulationStore(state => state.devices);
  const updateDeviceInterface = useSimulationStore(state => state.updateDeviceInterface);
  const updateDeviceRoute = useSimulationStore(state => state.updateDeviceRoute);

  if (mode !== 'EDIT' || !selectedDeviceId) return null;

  const device = devices.find(d => d.id === selectedDeviceId);
  if (!device) return null;

  return (
    <div className="fixed inset-0 bottom-14 md:bottom-0 bg-base/95 backdrop-blur z-[60] overflow-y-auto flex flex-col md:absolute md:inset-auto md:right-0 md:top-0 md:w-80 md:bg-surface md:border-l md:border-border-base text-primary pointer-events-auto">
      <div className="flex justify-between items-center p-4 border-b border-border-base shrink-0 sticky top-0 bg-surface z-10">
        <h2 className="text-lg font-semibold">{device.name} Config</h2>
        <button 
          onClick={() => selectDevice(null)}
          className="text-muted hover:text-secondary p-2 text-xl"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Interfaces</h3>
          {device.interfaces.map(iface => (
            <div key={iface.id} className="mb-4 bg-elevated p-3 rounded">
              <div className="text-sm font-medium mb-2">{iface.id}</div>
              <label className="block text-xs text-secondary mb-1">IP Address</label>
              <input
                type="text"
                value={iface.ipAddress || ''}
                onChange={(e) => updateDeviceInterface(device.id, iface.id, e.target.value)}
                className="w-full bg-base border border-border-strong rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
              />
              <div className="text-xs text-muted mt-1">MAC: {iface.macAddress}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Routing (Default Gateway)</h3>
          {(() => {
            const defaultRoute = device.routingTable.find(r => r.network === '0.0.0.0' && r.prefix === 0);
            return (
              <div className="bg-elevated p-3 rounded">
                <label className="block text-xs text-secondary mb-1">Next Hop IP</label>
                <input
                  type="text"
                  value={defaultRoute?.nextHop || ''}
                  onChange={(e) => updateDeviceRoute(device.id, '0.0.0.0', 0, e.target.value)}
                  className="w-full bg-base border border-border-strong rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
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
