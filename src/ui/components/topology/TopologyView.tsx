import React from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { DeviceNode } from './DeviceNode';
import { LinkLine } from './LinkLine';

export const TopologyView: React.FC = () => {
  const devices = useSimulationStore((state) => state.devices);
  const links = useSimulationStore((state) => state.links);

  return (
    <div className="h-full w-full bg-zinc-950 overflow-hidden relative">
      <svg className="w-full h-full">
        {/* Draw Links first so they are behind devices */}
        {links.map((link) => (
          <LinkLine key={link.id} link={link} devices={devices} />
        ))}

        {/* Draw Devices */}
        {devices.map((device) => (
          <DeviceNode key={device.id} device={device} />
        ))}
      </svg>
    </div>
  );
};
