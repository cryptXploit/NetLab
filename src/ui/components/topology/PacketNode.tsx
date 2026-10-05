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

  return (
    <motion.circle
      initial={{ cx: startX, cy: startY }}
      animate={{ cx: endX, cy: endY }}
      transition={{ duration: 1, ease: 'linear' }}
      r={isSelected ? 8 : 6}
      onClick={(e) => {
        e.stopPropagation(); // don't bubble to svg
        selectPacket(activePacket.packet.id);
      }}
      className={`fill-accent cursor-pointer transition-all ${
        isSelected ? 'stroke-warning stroke-4' : 'stroke-accent-soft stroke-[1.5px]'
      }`}
    />
  );
};
