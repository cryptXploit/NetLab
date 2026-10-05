import React from 'react';
import { motion } from 'framer-motion';
import { type ActivePacket } from '../../../core/simulation/SimulationEngine';
import { type Device } from '../../../core/domain/Device';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';

interface PacketNodeProps {
  activePacket: ActivePacket;
  devices: Device[];
}

export const PacketNode: React.FC<PacketNodeProps> = ({ activePacket, devices }) => {
  const selectedPacketId = useWorkspaceStore(state => state.selectedPacketId);
  const selectPacket = useWorkspaceStore(state => state.selectPacket);

  const isSelected = selectedPacketId === activePacket.packet.id;

  const sourceDevice = devices.find(d => d.id === activePacket.sourceId);
  const targetDevice = devices.find(d => d.id === activePacket.targetId);

  if (!sourceDevice || !targetDevice) return null;

  const startX = sourceDevice.metadata?.x ?? 0;
  const startY = sourceDevice.metadata?.y ?? 0;
  const endX = targetDevice.metadata?.x ?? 0;
  const endY = targetDevice.metadata?.y ?? 0;

  // Derive color based on protocol
  let packetColor = 'fill-accent';
  let strokeColor = 'stroke-accent-soft';
  if (activePacket.packet.protocol === 'ARP') {
    packetColor = 'fill-amber-500';
    strokeColor = 'stroke-amber-500/50';
  } else if (activePacket.packet.protocol === 'ICMP') {
    packetColor = 'fill-tech-accent';
    strokeColor = 'stroke-tech-accent/50';
  } else if (activePacket.packet.protocol === 'DNS') {
    packetColor = 'fill-purple-500';
    strokeColor = 'stroke-purple-500/50';
  } else if (activePacket.packet.protocol === 'DHCP') {
    packetColor = 'fill-emerald-500';
    strokeColor = 'stroke-emerald-500/50';
  }

  return (
    <g onClick={(e) => { e.stopPropagation(); selectPacket(activePacket.packet.id); }} className="cursor-pointer">
      <motion.circle
        initial={{ cx: startX, cy: startY }}
        animate={{ cx: endX, cy: endY }}
        transition={{ duration: 1, ease: 'linear' }}
        r={isSelected ? 10 : 7}
        className={`${packetColor} ${isSelected ? 'stroke-white stroke-[3px]' : `${strokeColor} stroke-[2px]`}`}
        style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
      />
      {isSelected && (
        <motion.text
          initial={{ x: startX, y: startY - 15 }}
          animate={{ x: endX, y: endY - 15 }}
          transition={{ duration: 1, ease: 'linear' }}
          textAnchor="middle"
          className="fill-white text-[10px] font-mono font-bold select-none pointer-events-none"
        >
          {activePacket.packet.protocol}
        </motion.text>
      )}
    </g>
  );
};
