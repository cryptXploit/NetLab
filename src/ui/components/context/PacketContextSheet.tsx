import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { X, Search, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { SimulationEventType } from '../../../core/events/SimulationEvent';

export const PacketContextSheet: React.FC = () => {
  const selectedPacketId = useWorkspaceStore(state => state.selectedPacketId);
  const selectPacket = useWorkspaceStore(state => state.selectPacket);
  const activePackets = useSimulationStore((state) => state.activePackets);
  const eventHistory = useSimulationStore((state) => state.eventHistory);

  if (!selectedPacketId) return null;

  // Find the packet in active packets
  const activePacket = activePackets.find((ap) => ap.packet.id === selectedPacketId);
  
  // Also find its delivery/drop events
  const dropEvent = eventHistory.find(e => e.type === SimulationEventType.PACKET_DROPPED && e.payload?.packet?.id === selectedPacketId);
  const deliverEvent = eventHistory.find(e => e.type === SimulationEventType.PACKET_DELIVERED && e.payload?.packet?.id === selectedPacketId);

  // If no longer active and no known end state, it might just be deleted or stale
  if (!activePacket && !dropEvent && !deliverEvent) {
    return (
      <div className="absolute bottom-0 left-0 w-full md:left-4 md:bottom-4 md:w-96 bg-surface border-t md:border border-border-strong md:rounded-2xl shadow-2xl z-50 flex flex-col pointer-events-auto">
        <div className="flex justify-between items-center p-4 border-b border-border-base">
          <h2 className="text-lg font-bold text-primary">Packet {selectedPacketId}</h2>
          <button onClick={() => selectPacket(null)} className="p-2 text-muted hover:text-primary transition-colors bg-elevated rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 text-sm text-secondary">Packet is no longer active in the simulation.</div>
      </div>
    );
  }

  // Get the core packet object from whatever state is available
  const packet = activePacket?.packet || dropEvent?.payload?.packet || deliverEvent?.payload?.packet;
  if (!packet) return null;

  // Find the latest explanation
  let latestExplanation = 'No explanation available.';
  for (let i = eventHistory.length - 1; i >= 0; i--) {
    const evt = eventHistory[i];
    if (evt.payload?.packet?.id === packet.id && evt.explanation) {
      latestExplanation = evt.explanation;
      break;
    }
  }

  return (
    <div className="absolute bottom-0 left-0 w-full md:left-4 md:bottom-4 md:w-96 bg-surface border-t md:border border-border-strong md:rounded-2xl shadow-2xl z-50 flex flex-col pointer-events-auto max-h-[60vh] overflow-y-auto">
      
      <div className="flex justify-between items-center p-4 border-b border-border-base sticky top-0 bg-surface">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-elevated rounded-lg text-accent">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-primary leading-tight">Packet {packet.id}</h2>
            <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">{packet.protocol}</p>
          </div>
        </div>
        <button onClick={() => selectPacket(null)} className="p-2 text-muted hover:text-primary transition-colors bg-elevated rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border-base text-sm font-medium bg-elevated">
          {dropEvent ? (
            <><AlertTriangle className="w-5 h-5 text-danger" /> <span className="text-danger">Packet Dropped</span></>
          ) : deliverEvent ? (
            <><CheckCircle className="w-5 h-5 text-success" /> <span className="text-success">Packet Delivered</span></>
          ) : (
            <><Info className="w-5 h-5 text-tech-accent" /> <span className="text-primary">In Transit</span></>
          )}
        </div>

        {/* WHY Block */}
        {(dropEvent || deliverEvent || latestExplanation !== 'No explanation available.') && (
          <div className={`p-4 rounded-xl border ${dropEvent ? 'border-danger/30 bg-danger/5' : deliverEvent ? 'border-success/30 bg-success/5' : 'border-border-strong bg-surface'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className={dropEvent ? 'text-danger' : deliverEvent ? 'text-success' : 'text-tech-accent'}>WHY?</span>
            </h4>
            <p className="text-sm text-primary font-medium leading-relaxed">{latestExplanation}</p>
          </div>
        )}

        {/* Technical Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Details</h4>
          <div className="bg-surface border border-border-base rounded-xl overflow-hidden text-sm">
            <div className="grid grid-cols-3 border-b border-border-base">
              <div className="p-3 text-muted">Source</div>
              <div className="p-3 col-span-2 font-mono text-primary border-l border-border-base">{packet.sourceIp}</div>
            </div>
            <div className="grid grid-cols-3 border-b border-border-base">
              <div className="p-3 text-muted">Destination</div>
              <div className="p-3 col-span-2 font-mono text-primary border-l border-border-base">{packet.destinationIp}</div>
            </div>
            <div className="grid grid-cols-3 border-b border-border-base">
              <div className="p-3 text-muted">TTL</div>
              <div className="p-3 col-span-2 font-mono text-primary border-l border-border-base">{packet.ttl}</div>
            </div>
            {activePacket && (
              <div className="grid grid-cols-3 border-b border-border-base">
                <div className="p-3 text-muted">Location</div>
                <div className="p-3 col-span-2 font-mono text-tech-accent border-l border-border-base">{activePacket.sourceId} -&gt; {activePacket.targetId}</div>
              </div>
            )}
            <div className="grid grid-cols-3">
              <div className="p-3 text-muted">Layer</div>
              <div className="p-3 col-span-2 font-mono text-primary border-l border-border-base">L3 (Network)</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
