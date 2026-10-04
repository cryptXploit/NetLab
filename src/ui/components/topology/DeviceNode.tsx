import React from 'react';
import { type Device, DeviceType } from '../../../core/domain/Device';

interface DeviceNodeProps {
  device: Device;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({ device }) => {
  const x = device.metadata?.x ?? 0;
  const y = device.metadata?.y ?? 0;

  // Render different shapes based on device type
  let shape;
  if (device.type === DeviceType.ROUTER) {
    // A circle for a router is typical in network diagrams, or a rectangle.
    // Let's use a circle for routers, rect for hosts for differentiation.
    shape = <circle cx={0} cy={0} r={30} className="fill-zinc-800 stroke-zinc-400 stroke-2" />;
  } else if (device.type === DeviceType.SWITCH) {
    shape = <rect x={-30} y={-20} width={60} height={40} className="fill-zinc-800 stroke-zinc-400 stroke-2" rx={4} />;
  } else {
    // HOST
    shape = <rect x={-25} y={-25} width={50} height={50} className="fill-zinc-800 stroke-zinc-400 stroke-2" rx={8} />;
  }

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer">
      {shape}
      <text
        y={45}
        textAnchor="middle"
        className="fill-zinc-300 text-sm font-semibold pointer-events-none select-none"
      >
        {device.name}
      </text>
    </g>
  );
};
