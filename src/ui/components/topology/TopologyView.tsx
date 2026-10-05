import React, { useState, useRef } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { DeviceNode } from './DeviceNode';
import { LinkLine } from './LinkLine';
import { PacketNode } from './PacketNode';

const StaticLinks = React.memo(({ }: { version: number }) => {
  const links = useSimulationStore.getState().links;
  return (
    <>
      {links.map(link => (
        <LinkLine key={link.id} link={link} />
      ))}
    </>
  );
});

const StaticDevices = React.memo(({ }: { version: number }) => {
  const devices = useSimulationStore.getState().devices;
  return (
    <>
      {devices.map(device => (
        <DeviceNode key={device.id} device={device} />
      ))}
    </>
  );
});

const ActivePackets = React.memo(() => {
  const activePackets = useSimulationStore(state => state.activePackets);
  return (
    <>
      {activePackets.map((ap, idx) => (
        <PacketNode 
          key={`${ap.packet.id}-${idx}`}
          packet={ap.packet}
          sourceId={ap.sourceId}
          targetId={ap.targetId}
          progress={ap.progress}
        />
      ))}
    </>
  );
});

export const TopologyView: React.FC = () => {
  // Subscribe ONLY to topologyVersion for structural changes
  const topologyVersion = useSimulationStore(state => state.topologyVersion);
  
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
    // We just get it from the store synchronously to avoid subscribing
    const srcDevice = useSimulationStore.getState().devices.find(d => d.id === pendingLinkSourceId);
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
      className="w-full h-full relative overflow-hidden bg-base"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <svg 
        ref={svgRef}
        className="w-full h-full absolute inset-0"
        style={{ minHeight: '100%', minWidth: '100%' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Links Layer */}
        <StaticLinks version={topologyVersion} />

        {/* Pending Line Layer */}
        {pendingLine}

        {/* Packets Layer */}
        <ActivePackets />
      </svg>
      
      {/* HTML Layer for Devices (Allows normal DOM tooltips/interactions) */}
      <div className="absolute inset-0 pointer-events-none">
        <StaticDevices version={topologyVersion} />
      </div>
    </div>
  );
};
