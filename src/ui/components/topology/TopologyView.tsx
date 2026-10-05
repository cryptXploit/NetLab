import React, { useState, useRef } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { DeviceNode } from './DeviceNode';
import { LinkLine } from './LinkLine';
import { PacketNode } from './PacketNode';

export const TopologyView: React.FC = () => {
  const devices = useSimulationStore((state) => state.devices);
  const links = useSimulationStore((state) => state.links);
  const activePackets = useSimulationStore((state) => state.activePackets);
  const mode = useSimulationStore((state) => state.mode);
  const pendingLinkSourceId = useSimulationStore((state) => state.pendingLinkSourceId);
  
  const selectPacket = useSimulationStore((state) => state.selectPacket);
  const setPendingLinkSource = useSimulationStore((state) => state.setPendingLinkSource);
  const selectDeviceForConfig = useSimulationStore((state) => state.selectDeviceForConfig);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'EDIT' && pendingLinkSourceId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = () => {
    if (mode === 'SIMULATE') {
      selectPacket(null);
    } else {
      setPendingLinkSource(null);
      selectDeviceForConfig(null);
    }
  };

  let pendingLine = null;
  if (mode === 'EDIT' && pendingLinkSourceId) {
    const srcDevice = devices.find(d => d.id === pendingLinkSourceId);
    if (srcDevice) {
      pendingLine = (
        <line
          x1={srcDevice.metadata?.x || 0}
          y1={srcDevice.metadata?.y || 0}
          x2={mousePos.x}
          y2={mousePos.y}
          className="stroke-blue-500 stroke-2 border-dashed opacity-50"
          strokeDasharray="4 4"
        />
      );
    }
  }

  return (
    <div 
      className="h-full w-full bg-zinc-950 overflow-hidden relative"
      onClick={handleClick}
    >
      <svg 
        ref={svgRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
      >
        {/* Draw Links first so they are behind devices */}
        {links.map((link) => (
          <LinkLine key={link.id} link={link} devices={devices} />
        ))}

        {pendingLine}

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
