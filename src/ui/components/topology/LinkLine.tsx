import React from 'react';
import { type Link } from '../../../core/domain/Link';
import { type Device } from '../../../core/domain/Device';

interface LinkLineProps {
  link: Link;
  devices: Device[];
}

export const LinkLine: React.FC<LinkLineProps> = ({ link, devices }) => {
  // Find the devices that own the interfaces in this link
  let sourceDevice: Device | undefined;
  let targetDevice: Device | undefined;

  for (const device of devices) {
    for (const iface of device.interfaces) {
      if (iface.id === link.interface1Id) sourceDevice = device;
      if (iface.id === link.interface2Id) targetDevice = device;
    }
  }

  if (!sourceDevice || !targetDevice) {
    return null;
  }

  const x1 = sourceDevice.metadata?.x ?? 0;
  const y1 = sourceDevice.metadata?.y ?? 0;
  const x2 = targetDevice.metadata?.x ?? 0;
  const y2 = targetDevice.metadata?.y ?? 0;

  const isDown = link.status === 'DOWN';
  const lineClass = isDown 
    ? "stroke-link-disabled stroke-2 border-dashed opacity-50"
    : "stroke-link-active stroke-2";

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={lineClass}
      strokeDasharray={isDown ? "4 4" : "none"}
    />
  );
};
