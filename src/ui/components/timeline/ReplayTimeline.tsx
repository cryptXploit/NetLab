import React, { useMemo } from 'react';
import { useTimelineStore } from '../../../app/store/useTimelineStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { Play, Pause, SkipBack, SkipForward, ShieldAlert } from 'lucide-react';

export const ReplayTimeline: React.FC = () => {
  const { isReplayMode, maxTick, filter, selectedEventId, setSelectedEvent, setReplayMode, initialSnapshot, latestSnapshot } = useTimelineStore();
  const engine = useSimulationStore(state => state.engine);
  const isPlaying = useSimulationStore(state => state.isPlaying);
  const play = useSimulationStore(state => state.play);
  const pause = useSimulationStore(state => state.pause);
  
  const history = engine.getEventHistory();

  const filteredHistory = useMemo(() => {
    return history.filter(e => {
      if (filter === 'ALL') return true;
      if (filter === 'PACKET') return e.type.includes('PACKET');
      if (filter === 'ERROR') return e.type === 'PACKET_DROPPED' || e.type === 'LINK_STATE_CHANGED';
      if (filter === 'IMPORTANT') return e.type === 'PACKET_DELIVERED' || e.type === 'PACKET_DROPPED';
      return true;
    });
  }, [history, filter]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTick = parseInt(e.target.value);
    
    if (initialSnapshot) {
      pause();
      engine.restoreSnapshot(initialSnapshot);
      const stepsToTake = targetTick - engine.getCurrentTick();
      if (stepsToTake > 0) {
        engine.tick(stepsToTake);
      }
      
      useSimulationStore.setState({
        devices: engine.getDevices(),
        links: engine.getLinks(),
        activePackets: engine.getActivePackets()
      });
    }
  };

  const exitReplay = () => {
    pause();
    if (latestSnapshot) {
      engine.restoreSnapshot(latestSnapshot);
      useSimulationStore.setState({
        devices: engine.getDevices(),
        links: engine.getLinks(),
        activePackets: engine.getActivePackets()
      });
    }
    setReplayMode(false);
  };

  if (!isReplayMode) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 z-50 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 px-2 py-1 rounded border border-accent/20">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Replay Mode</span>
          </div>
          <span className="font-mono text-sm text-secondary">
            Tick: <span className="text-primary font-bold">{engine.getCurrentTick()}</span> / {maxTick}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-hover rounded text-secondary hover:text-primary transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={() => isPlaying ? pause() : play()}
            className="p-2 bg-primary text-base hover:bg-primary/90 rounded transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-surface-hover rounded text-secondary hover:text-primary transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={exitReplay}
          className="text-xs font-bold bg-danger/10 text-danger hover:bg-danger hover:text-white px-3 py-1.5 rounded transition-colors"
        >
          Exit Replay
        </button>
      </div>

      <div className="flex items-center gap-3 w-full">
        <input 
          type="range" 
          min={0} 
          max={maxTick} 
          value={engine.getCurrentTick()}
          onChange={handleScrub}
          className="flex-1 accent-accent"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {filteredHistory.map(evt => (
          <div 
            key={evt.id}
            onClick={() => setSelectedEvent(evt.id)}
            className={`min-w-[140px] shrink-0 border rounded-lg p-2 cursor-pointer transition-colors ${
              selectedEventId === evt.id 
                ? 'bg-accent/10 border-accent text-accent' 
                : 'bg-elevated border-border text-secondary hover:bg-surface-hover hover:border-primary/30'
            } ${evt.timestamp > engine.getCurrentTick() ? 'opacity-50 grayscale' : ''}`}
          >
            <div className="text-[10px] font-mono mb-1">T={evt.timestamp}</div>
            <div className="text-xs font-bold truncate">
              {evt.type.replace('PACKET_', '').replace('APP_', '')}
            </div>
            {evt.type === 'PACKET_DROPPED' && <ShieldAlert className="w-3 h-3 text-danger mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};
