import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';

export const PacketInspector: React.FC = () => {
  const selectedPacketId = useWorkspaceStore(state => state.selectedPacketId);
  const activePackets = useSimulationStore((state) => state.activePackets);
  const eventHistory = useSimulationStore((state) => state.eventHistory);

  if (!selectedPacketId) return null;

  // Find the packet in active packets
  const activePacket = activePackets.find((ap) => ap.packet.id === selectedPacketId);
  
  if (!activePacket) {
    // Graceful fallback if it was delivered or dropped
    return (
      <div className="absolute top-6 right-6 w-80 bg-surface border border-border-strong rounded-xl p-6 shadow-2xl text-primary">
        <h3 className="text-lg font-bold text-primary mb-2">Packet Inspector</h3>
        <p className="text-sm text-secondary">Packet {selectedPacketId} is no longer active.</p>
      </div>
    );
  }

  const { packet } = activePacket;

  // Find the latest event for this packet that has an explanation
  // Iterate backwards from event history
  let latestExplanation = 'No explanation available.';
  for (let i = eventHistory.length - 1; i >= 0; i--) {
    const evt = eventHistory[i];
    if (evt.payload?.packet?.id === packet.id && evt.explanation) {
      latestExplanation = evt.explanation;
      break;
    }
  }

  return (
    <div className="absolute top-6 right-6 w-80 bg-surface border border-border-strong rounded-xl shadow-2xl text-primary overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border-base bg-base/50 flex justify-between items-center">
        <h3 className="font-bold text-primary">Packet Inspector</h3>
        <span className="text-xs font-mono text-muted">{packet.id}</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted">Source IP</div>
          <div className="font-mono text-secondary">{packet.sourceIp}</div>
          
          <div className="text-muted">Dest IP</div>
          <div className="font-mono text-secondary">{packet.destinationIp}</div>
          
          <div className="text-muted">Protocol</div>
          <div className="font-bold text-accent">{packet.protocol}</div>
          
          <div className="text-muted">TTL</div>
          <div className="font-mono text-secondary">{packet.ttl}</div>
          
          <div className="text-muted">Status</div>
          <div className="font-mono text-emerald-400">{packet.status}</div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-base">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Explain Why</h4>
          <p className="text-sm text-secondary leading-relaxed">
            {latestExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};
