import React from 'react';
import { type Packet } from '../../../core/domain/Packet';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

interface PacketNodeProps {
  packet: Packet;
  sourceId: string;
  targetId: string;
  progress: number;
}

export const PacketNode: React.FC<PacketNodeProps> = ({ packet, sourceId, targetId, progress }) => {
  const selectedPacketId = useWorkspaceStore(state => state.selectedPacketId);
  const selectPacket = useWorkspaceStore(state => state.selectPacket);

  const isSelected = selectedPacketId === packet.id;

  // We fetch devices from store directly instead of mapping all devices down, 
  // keeping the packet renderer highly independent.
  const devices = useSimulationStore.getState().devices;
  const sourceDevice = devices.find(d => d.id === sourceId);
  const targetDevice = devices.find(d => d.id === targetId);

  if (!sourceDevice || !targetDevice) return null;

  const startX = sourceDevice.metadata?.x ?? 0;
  const startY = sourceDevice.metadata?.y ?? 0;
  const endX = targetDevice.metadata?.x ?? 0;
  const endY = targetDevice.metadata?.y ?? 0;

  // Calculate deterministic position based on actual engine progress
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress;

  // Derive color based on protocol
  let packetColor = 'fill-accent';
  let strokeColor = 'stroke-accent/30';
  
  if (packet.protocol === 'ARP') {
    packetColor = 'fill-amber-500';
    strokeColor = 'stroke-amber-500/30';
  } else if (packet.protocol === 'ICMP') {
    packetColor = 'fill-tech-accent';
    strokeColor = 'stroke-tech-accent/30';
  } else if (packet.protocol === 'DNS') {
    packetColor = 'fill-purple-500';
    strokeColor = 'stroke-purple-500/30';
  } else if (packet.protocol === 'DHCP') {
    packetColor = 'fill-emerald-500';
    strokeColor = 'stroke-emerald-500/30';
  }

  return (
    <g onClick={(e) => { e.stopPropagation(); selectPacket(packet.id); }} className="cursor-pointer">
      <circle
        cx={currentX}
        cy={currentY}
        r={isSelected ? 10 : 6}
        className={`${packetColor} ${strokeColor} stroke-[4px] transition-all duration-75`}
        style={isSelected ? { filter: 'url(#glow)' } : undefined}
      />
      {isSelected && (
        <circle
          cx={currentX}
          cy={currentY}
          r={14}
          className="fill-none stroke-accent stroke-[2px] border-dashed"
          strokeDasharray="4 4"
        />
      )}
    </g>
  );
};
