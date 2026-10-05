import React, { useState, useRef } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { DeviceNode } from './DeviceNode';
import { LinkLine } from './LinkLine';
import { PacketNode } from './PacketNode';

export const TopologyView: React.FC = () => {
  const devices = useSimulationStore((state) => state.devices);
  const links = useSimulationStore((state) => state.links);
  const activePackets = useSimulationStore((state) => state.activePackets);
  const mode = useWorkspaceStore(state => state.mode);
  const pendingLinkSourceId = useWorkspaceStore(state => state.pendingLinkSourceId);
  
  const selectPacket = useWorkspaceStore(state => state.selectPacket);
  const setPendingLinkSource = useWorkspaceStore(state => state.setPendingLinkSource);
  const selectDevice = useWorkspaceStore(state => state.selectDevice);

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
    selectPacket(null);
    setPendingLinkSource(null);
    selectDevice(null);
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
          className="stroke-accent stroke-2 border-dashed opacity-50"
          strokeDasharray="4 4"
        />
      );
    }
  }

  return (
    <div 
      className="h-full w-full bg-base overflow-hidden relative"
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
