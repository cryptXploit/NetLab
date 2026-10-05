import React from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { type Device, DeviceType } from '../../../core/domain/Device';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

interface DeviceNodeProps {
  device: Device;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({ device }) => {
  const x = device.metadata?.x ?? 0;
  const y = device.metadata?.y ?? 0;

  const mode = useSimulationStore((state) => state.mode);
  const updateDevicePosition = useSimulationStore((state) => state.updateDevicePosition);
  const pendingLinkSourceId = useSimulationStore((state) => state.pendingLinkSourceId);
  const setPendingLinkSource = useSimulationStore((state) => state.setPendingLinkSource);
  const addLink = useSimulationStore((state) => state.addLink);
  const selectDeviceForConfig = useSimulationStore((state) => state.selectDeviceForConfig);

  let shape;
  if (device.type === DeviceType.ROUTER) {
    shape = <circle cx={0} cy={0} r={30} className="fill-zinc-800 stroke-zinc-400 stroke-2" />;
  } else if (device.type === DeviceType.SWITCH) {
    shape = <rect x={-30} y={-20} width={60} height={40} className="fill-zinc-800 stroke-zinc-400 stroke-2" rx={4} />;
  } else if (device.type === DeviceType.SERVER) {
    shape = <rect x={-20} y={-30} width={40} height={60} className="fill-zinc-800 stroke-zinc-400 stroke-2" rx={4} />;
  } else {
    // HOST
    shape = <rect x={-25} y={-25} width={50} height={50} className="fill-zinc-800 stroke-zinc-400 stroke-2" rx={8} />;
  }

  const isPendingSource = pendingLinkSourceId === device.id;
  const strokeClass = isPendingSource ? 'stroke-blue-500' : 'stroke-zinc-400';

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (mode !== 'EDIT') return;
    const snapSize = 20;
    const newX = Math.round((x + info.offset.x) / snapSize) * snapSize;
    const newY = Math.round((y + info.offset.y) / snapSize) * snapSize;
    updateDevicePosition(device.id, newX, newY);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (mode !== 'EDIT') return;
    e.stopPropagation();

    // Select for config
    selectDeviceForConfig(device.id);

    // Link logic
    if (!pendingLinkSourceId) {
      setPendingLinkSource(device.id);
    } else {
      if (pendingLinkSourceId !== device.id) {
        addLink(pendingLinkSourceId, device.id);
      } else {
        setPendingLinkSource(null); // toggle off
      }
    }
  };

  const shapeElement = shape as React.ReactElement<{ className: string }>;
  const clonedShape = React.cloneElement(shapeElement, {
    className: shapeElement.props.className.replace('stroke-zinc-400', strokeClass)
  });

  return (
    <motion.g
      drag={mode === 'EDIT'}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDoubleClick={() => {
        if (mode === 'SIMULATE') {
          useSimulationStore.getState().openTerminal(device.id);
        }
      }}
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{ duration: 0 }}
      className={`cursor-pointer ${isPendingSource ? 'opacity-80' : ''}`}
    >
      {clonedShape}
      <text
        y={45}
        textAnchor="middle"
        className="fill-zinc-300 text-sm font-semibold pointer-events-none select-none"
      >
        {device.name}
      </text>
      {mode === 'SIMULATE' && (
        <text
          y={60}
          textAnchor="middle"
          className="fill-zinc-500 text-[10px] pointer-events-none select-none"
        >
          (dbl-click for CLI)
        </text>
      )}
    </motion.g>
  );
};
