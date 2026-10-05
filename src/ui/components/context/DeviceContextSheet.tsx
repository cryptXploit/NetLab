import React, { useState } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { Terminal, Activity, Send, Trash2, X } from 'lucide-react';
import { DeviceType } from '../../../core/domain/Device';

export const DeviceContextSheet: React.FC = () => {
  const mode = useWorkspaceStore(state => state.mode);
  const selectedDeviceId = useWorkspaceStore(state => state.selectedDeviceId);
  const selectDevice = useWorkspaceStore(state => state.selectDevice);
  const openTerminal = useWorkspaceStore(state => state.openTerminal);
  const devices = useSimulationStore(state => state.devices);
  const removeDevice = useSimulationStore(state => state.removeDevice);
  const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);
  const getLinks = useSimulationStore(state => state.engine.getLinks);
  const removeLink = useSimulationStore(state => state.removeLink);
  const setPendingPrediction = useWorkspaceStore(state => state.setPendingPrediction);

  const [activeTab, setActiveTab] = useState<'overview' | 'interfaces' | 'routing'>('overview');

  if (!selectedDeviceId) return null;

  const device = devices.find(d => d.id === selectedDeviceId);
  if (!device) return null;

  const handlePing = () => {
    // We prompt for a target for now, later we can have a proper target selector UI
    const target = window.prompt(`Send ping from ${device.name} to:`, '');
    if (target) {
      if (useWorkspaceStore.getState().isPredictionModeEnabled) { setPendingPrediction({ sourceId: device.id, targetId: target }); } else { useSimulationStore.getState().sendPing(device.id, target); }
    }
  };

  const handleTerminal = () => {
    openTerminal(device.id);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete device ${device.name}?`)) {
      removeDevice(device.id);
      selectDevice(null);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full md:left-4 md:bottom-4 md:w-96 bg-surface border-t md:border border-border-strong md:rounded-2xl shadow-2xl z-50 flex flex-col pointer-events-auto max-h-[60vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border-base shrink-0">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            {device.name}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent uppercase">
              {device.type}
            </span>
          </h2>
        </div>
        <button 
          onClick={() => selectDevice(null)}
          className="p-2 text-muted hover:text-primary transition-colors bg-elevated rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar (Contextual) */}
      <div className="flex gap-2 p-3 bg-elevated shrink-0 overflow-x-auto hide-scrollbar">
        {mode === 'SIMULATE' ? (
          <>
            <button 
              onClick={handlePing}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Send className="w-4 h-4" /> Send Ping
            </button>
            <button 
              onClick={handleTerminal}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-strong hover:bg-border-strong text-primary text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Terminal className="w-4 h-4 text-tech-accent" /> Terminal
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" /> Delete Node
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-base shrink-0">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'overview' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('interfaces')}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'interfaces' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary'}`}
        >
          Interfaces
        </button>
        {(device.type === DeviceType.ROUTER || device.type === DeviceType.HOST) && (
          <button 
            onClick={() => setActiveTab('routing')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'routing' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            Routing
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-1">Status</p>
              <div className="flex items-center gap-2 text-success font-medium text-sm">
                <Activity className="w-4 h-4" /> Online
              </div>
            </div>
            {device.metadata?.role && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase mb-1">Role</p>
                <p className="text-sm text-primary">{device.metadata.role}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'interfaces' && 
          (() => {
            const availableIfaces = getAvailableInterfaces(device.id);
            const allLinks = getLinks();
            return (
            <div className="space-y-3">
              {device.interfaces.map(iface => {
                const isAvailable = availableIfaces.some(i => i.id === iface.id);
                const connectedLink = !isAvailable ? allLinks.find(l => l.interface1Id === iface.id || l.interface2Id === iface.id) : null;
                return (
                <div key={iface.id} className="bg-elevated border border-border-base rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm font-bold text-primary">{iface.id}</span>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {isAvailable ? 'Available' : 'Connected'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${iface.status === 'UP' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {iface.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-secondary font-mono flex flex-col gap-1">
                    <div>MAC: {iface.macAddress}</div>
                    <div>IP: {iface.ipAddress ? iface.ipAddress : 'Unassigned'}</div>
                    {!isAvailable && connectedLink && (
                      <button 
                        onClick={() => removeLink(connectedLink.id)}
                        className="mt-2 py-1.5 px-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-md font-medium transition-colors text-center"
                      >
                        Disconnect Link
                      </button>
                    )}
                  </div>
                </div>
              )})}
              {device.interfaces.length === 0 && (
                <p className="text-sm text-muted">No interfaces configured.</p>
              )}
            </div>
            );
          })()}
                {activeTab === 'routing' && (
          <div className="space-y-3">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="text-[10px] uppercase text-muted border-b border-border-base">
                <tr>
                  <th className="pb-2">Destination</th>
                  <th className="pb-2">Gateway</th>
                  <th className="pb-2">Interface</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {device.routingTable?.map((route, i) => (
                  <tr key={i} className="border-b border-border-base/50 last:border-0">
                    <td className="py-2 text-primary">{route.network}/{route.prefix}</td>
                    <td className="py-2">{route.nextHop || '-'}</td>
                    <td className="py-2">{route.interfaceId}</td>
                  </tr>
                ))}
                {!device.routingTable?.length && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted">Empty routing table</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
