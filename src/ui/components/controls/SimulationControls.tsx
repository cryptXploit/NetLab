import React, { useState } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { HapticService } from '../../../core/native/HapticService';
import { Play, Square, SkipForward, RotateCcw, FastForward, Plus } from 'lucide-react';
import { DeviceType } from '../../../core/domain/Device';

export const SimulationControls: React.FC = () => {
  const currentTick = useSimulationStore(state => state.currentTick);
  const stepForward = useSimulationStore(state => state.stepForward);
  const reset = useSimulationStore(state => state.reset);
  const isPlaying = useSimulationStore(state => state.isPlaying);
  const play = useSimulationStore(state => state.play);
  const pause = useSimulationStore(state => state.pause);
  const playbackSpeed = useSimulationStore(state => state.playbackSpeed);
  const setSpeed = useSimulationStore(state => state.setSpeed);
  const addDevice = useSimulationStore(state => state.addDevice);
  
  const mode = useWorkspaceStore(state => state.mode);
  const setMode = useWorkspaceStore(state => state.setMode);
  
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handlePlayPause = () => {
    HapticService.tap();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleStep = () => {
    HapticService.tap();
    pause();
    stepForward();
  };

  const handleReset = () => {
    HapticService.heavy();
    pause();
    reset();
  };
  
  const handleAddDevice = (type: DeviceType) => {
    HapticService.tap();
    addDevice(type, 100, 100);
    setShowAddMenu(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-40 pointer-events-none">
      
      {/* Speed Menu Overlay */}
      {showSpeedMenu && (
        <div className="flex bg-surface border border-border-strong rounded-xl shadow-lg p-1 pointer-events-auto">
          {[0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => { setSpeed(speed); setShowSpeedMenu(false); HapticService.selection(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${playbackSpeed === speed ? 'bg-accent text-white' : 'text-secondary hover:text-primary'}`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}

      {/* Add Device Menu */}
      {showAddMenu && (
        <div className="flex flex-col bg-surface border border-border-strong rounded-xl shadow-lg p-2 pointer-events-auto w-48 mb-2">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 px-2 pt-1">Add Device</div>
          {[DeviceType.HOST, DeviceType.SWITCH, DeviceType.ROUTER, DeviceType.SERVER].map(type => (
            <button
              key={type}
              onClick={() => handleAddDevice(type)}
              className="text-left px-3 py-2 text-sm font-medium text-primary hover:bg-elevated rounded-lg transition-colors"
            >
              + {type}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pointer-events-auto">
        
        {/* Mode Toggle */}
        <div className="flex bg-elevated border border-border-strong rounded-full p-1 shadow-lg mr-2">
          <button
            onClick={() => { setMode('EDIT'); HapticService.selection(); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'EDIT' ? 'bg-warning text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
          >
            BUILD
          </button>
          <button
            onClick={() => { setMode('SIMULATE'); HapticService.selection(); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'SIMULATE' ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
          >
            RUN
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center bg-surface border border-border-strong rounded-full p-1.5 shadow-lg">
          
          {mode === 'EDIT' ? (
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-elevated hover:bg-border-strong text-primary transition-colors"
              title="Add Device"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={handlePlayPause}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm ${isPlaying ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-accent text-white hover:scale-105'}`}
              >
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <button
                onClick={handleStep}
                className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-elevated transition-colors"
                title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-elevated transition-colors"
                title="Playback Speed"
              >
                <FastForward className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-border-strong mx-1" />

              <button
                onClick={handleReset}
                className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 flex flex-col justify-center min-w-[3rem] text-center">
                <span className="text-[9px] font-bold text-muted uppercase">Tick</span>
                <span className="text-xs font-mono font-bold text-primary">{currentTick}</span>
              </div>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};
