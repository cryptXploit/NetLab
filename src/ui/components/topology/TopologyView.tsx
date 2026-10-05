import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { DeviceNode } from './DeviceNode';
import { LinkLine } from './LinkLine';
import { PacketNode } from './PacketNode';

export const TopologyView: React.FC = () => {
  const devices = useSimulationStore((state) => state.devices);
  const links = useSimulationStore((state) => state.links);
  const activePackets = useSimulationStore((state) => state.activePackets);

  const selectPacket = useSimulationStore((state) => state.selectPacket);

  return (
    <div 
      className="h-full w-full bg-zinc-950 overflow-hidden relative"
      onClick={() => selectPacket(null)}
    >
      <svg className="w-full h-full">
        {/* Draw Links first so they are behind devices */}
        {links.map((link) => (
          <LinkLine key={link.id} link={link} devices={devices} />
        ))}

        {/* Draw Packets */}
        {activePackets.map((ap) => (
          <PacketNode key={ap.packet.id} activePacket={ap} devices={devices} />
        ))}

        {/* Draw Devices */}
        {devices.map((device) => (
          <DeviceNode key={device.id} device={device} />
        ))}
      </svg>
    </div>
  );
};
