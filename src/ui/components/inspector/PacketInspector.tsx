import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

export const PacketInspector: React.FC = () => {
  const selectedPacketId = useSimulationStore((state) => state.selectedPacketId);
  const activePackets = useSimulationStore((state) => state.activePackets);
  const eventHistory = useSimulationStore((state) => state.eventHistory);

  if (!selectedPacketId) return null;

  // Find the packet in active packets
  const activePacket = activePackets.find((ap) => ap.packet.id === selectedPacketId);
  
  if (!activePacket) {
    // Graceful fallback if it was delivered or dropped
    return (
      <div className="absolute top-6 right-6 w-80 bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-2xl text-zinc-200">
        <h3 className="text-lg font-bold text-zinc-50 mb-2">Packet Inspector</h3>
        <p className="text-sm text-zinc-400">Packet {selectedPacketId} is no longer active.</p>
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
    <div className="absolute top-6 right-6 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl text-zinc-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h3 className="font-bold text-zinc-50">Packet Inspector</h3>
        <span className="text-xs font-mono text-zinc-500">{packet.id}</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-zinc-500">Source IP</div>
          <div className="font-mono text-zinc-300">{packet.sourceIp}</div>
          
          <div className="text-zinc-500">Dest IP</div>
          <div className="font-mono text-zinc-300">{packet.destinationIp}</div>
          
          <div className="text-zinc-500">Protocol</div>
          <div className="font-bold text-blue-400">{packet.protocol}</div>
          
          <div className="text-zinc-500">TTL</div>
          <div className="font-mono text-zinc-300">{packet.ttl}</div>
          
          <div className="text-zinc-500">Status</div>
          <div className="font-mono text-emerald-400">{packet.status}</div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Explain Why</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {latestExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};
