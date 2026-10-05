import React from 'react';
import { motion } from 'framer-motion';
import { type ActivePacket } from '../../../core/simulation/SimulationEngine';
import { type Device } from '../../../core/domain/Device';

interface PacketNodeProps {
  activePacket: ActivePacket;
  devices: Device[];
}

export const PacketNode: React.FC<PacketNodeProps> = ({ activePacket, devices }) => {
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
      r={6}
      className="fill-blue-500 stroke-blue-200 stroke-[1.5px]"
    />
  );
};
