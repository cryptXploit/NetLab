import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { X, ArrowRight } from 'lucide-react';

export const ConnectionSheet: React.FC = () => {
  const pendingSourceId = useWorkspaceStore(state => state.pendingLinkSourceId);
  const pendingTargetId = useWorkspaceStore(state => state.pendingConnectionTargetId);
  const setPendingLinkSource = useWorkspaceStore(state => state.setPendingLinkSource);
  const setPendingConnectionTarget = useWorkspaceStore(state => state.setPendingConnectionTarget);
  
  const getAvailableInterfaces = useSimulationStore(state => state.getAvailableInterfaces);
  const addLink = useSimulationStore(state => state.addLink);
  const devices = useSimulationStore(state => state.devices);

  const [selectedSourceIface, setSelectedSourceIface] = useState<string | null>(null);
  const [selectedTargetIface, setSelectedTargetIface] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!pendingSourceId || !pendingTargetId) return null;

  const srcDevice = devices.find(d => d.id === pendingSourceId);
  const tgtDevice = devices.find(d => d.id === pendingTargetId);
  if (!srcDevice || !tgtDevice) return null;

  const srcIfaces = getAvailableInterfaces(pendingSourceId);
  const tgtIfaces = getAvailableInterfaces(pendingTargetId);

  const handleCancel = () => {
    setPendingLinkSource(null);
    setPendingConnectionTarget(null);
    setSelectedSourceIface(null);
    setSelectedTargetIface(null);
    setError(null);
  };

  const handleConnect = () => {
    if (!selectedSourceIface || !selectedTargetIface) return;
    const res = addLink(pendingSourceId, selectedSourceIface, pendingTargetId, selectedTargetIface);
    if (!res.success) {
      setError(res.error || 'Connection failed');
    } else {
      handleCancel();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-surface border-t border-border shadow-2xl z-50 rounded-t-2xl flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-primary">Connect Devices</h3>
        <button onClick={handleCancel} className="p-2 -mr-2 text-secondary hover:text-primary rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="font-medium text-primary mb-2">{srcDevice.name}</div>
            <div className="text-sm text-secondary mb-3">
              {srcIfaces.length} available {srcIfaces.length === 1 ? 'interface' : 'interfaces'}
            </div>
            <div className="space-y-2">
              {srcIfaces.map(i => (
                <button
                  key={i.id}
                  onClick={() => setSelectedSourceIface(i.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-sm ${selectedSourceIface === i.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-primary hover:bg-elevated'}`}
                >
                  {i.id}
                </button>
              ))}
              {srcIfaces.length === 0 && <div className="text-sm text-secondary">No interfaces available</div>}
            </div>
          </div>

          <div className="flex-shrink-0 pt-8 text-secondary">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="font-medium text-primary mb-2">{tgtDevice.name}</div>
            <div className="text-sm text-secondary mb-3">
              {tgtIfaces.length} available {tgtIfaces.length === 1 ? 'interface' : 'interfaces'}
            </div>
            <div className="space-y-2">
              {tgtIfaces.map(i => (
                <button
                  key={i.id}
                  onClick={() => setSelectedTargetIface(i.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-sm ${selectedTargetIface === i.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-primary hover:bg-elevated'}`}
                >
                  {i.id}
                </button>
              ))}
              {tgtIfaces.length === 0 && <div className="text-sm text-secondary">No interfaces available</div>}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 text-sm font-medium bg-elevated hover:bg-border text-primary rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!selectedSourceIface || !selectedTargetIface}
            className="flex-1 py-3 text-sm font-medium bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};
