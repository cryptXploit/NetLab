import React from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { type Device, DeviceType } from '../../../core/domain/Device';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { Server, Monitor, Share2, Network,  } from 'lucide-react';

interface DeviceNodeProps {
  device: Device;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({ device }) => {
  const x = device.metadata?.x ?? 0;
  const y = device.metadata?.y ?? 0;

  const mode = useWorkspaceStore(state => state.mode);
  const updateDevicePosition = useSimulationStore((state) => state.updateDevicePosition);
  const pendingLinkSourceId = useWorkspaceStore(state => state.pendingLinkSourceId);
  const setPendingLinkSource = useWorkspaceStore(state => state.setPendingLinkSource);
  const addLink = useSimulationStore((state) => state.addLink);
  const selectDevice = useWorkspaceStore(state => state.selectDevice);
  const selectedDeviceId = useWorkspaceStore(state => state.selectedDeviceId);

  const isSelected = selectedDeviceId === device.id;
  const isPendingSource = pendingLinkSourceId === device.id;
  
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (mode !== 'EDIT') return;
    const snapSize = 20;
    const newX = Math.round((x + info.offset.x) / snapSize) * snapSize;
    const newY = Math.round((y + info.offset.y) / snapSize) * snapSize;
    updateDevicePosition(device.id, newX, newY);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectDevice(device.id);

    if (mode === 'EDIT') {
      if (!pendingLinkSourceId) {
        setPendingLinkSource(device.id);
      } else {
        if (pendingLinkSourceId !== device.id) {
          addLink(pendingLinkSourceId, device.id);
        } else {
          setPendingLinkSource(null); // toggle off
        }
      }
    }
  };

  // Coherent technical icon language
  let shape, icon;
  
  const baseRect = "fill-surface stroke-border-strong stroke-2 shadow-sm";
  const iconClass = "w-6 h-6 text-primary";
  
  if (device.type === DeviceType.ROUTER) {
    shape = <circle cx={0} cy={0} r={28} className={baseRect} />;
    icon = <Network className={iconClass} />;
  } else if (device.type === DeviceType.SWITCH) {
    shape = <rect x={-28} y={-24} width={56} height={48} className={baseRect} rx={8} />;
    icon = <Share2 className={iconClass} />;
  } else if (device.type === DeviceType.SERVER) {
    shape = <rect x={-24} y={-32} width={48} height={64} className={baseRect} rx={8} />;
    icon = <Server className={iconClass} />;
  } else {
    // HOST
    shape = <rect x={-28} y={-28} width={56} height={56} className={baseRect} rx={12} />;
    icon = <Monitor className={iconClass} />;
  }

  const statusColor = device.interfaces.some(i => i.status === 'DOWN') ? 'bg-danger' : 'bg-success';

  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag={mode === 'EDIT'}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`cursor-pointer ${mode === 'EDIT' ? 'cursor-move' : ''}`}
    >
      {shape}
      
      {/* Selected Indicator */}
      {isSelected && (
        <circle cx={0} cy={0} r={36} className="fill-transparent stroke-accent stroke-[3px]" strokeDasharray="6 4" />
      )}
      
      {/* Pending Connection Indicator */}
      {isPendingSource && (
        <circle cx={0} cy={0} r={40} className="fill-accent/10 stroke-accent stroke-2" />
      )}

      {/* ForeignObject for Lucide Icons & HTML Labels */}
      <foreignObject x={-40} y={-40} width={80} height={80} className="pointer-events-none">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className={`p-1.5 rounded-full ${isSelected ? 'bg-accent/10' : ''}`}>
            {icon}
          </div>
        </div>
      </foreignObject>
      
      {/* Label and Status */}
      <foreignObject x={-60} y={32} width={120} height={40} className="pointer-events-none overflow-visible">
        <div className="w-full h-full flex flex-col items-center pt-1">
          <div className="flex items-center gap-1.5 bg-surface/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-border-base shadow-sm">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-[10px] font-bold text-primary truncate max-w-[80px]">
              {device.name}
            </span>
          </div>
        </div>
      </foreignObject>
    </motion.g>
  );
};
