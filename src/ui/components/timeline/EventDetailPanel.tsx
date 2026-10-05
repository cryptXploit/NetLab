import React from 'react';
import { useTimelineStore } from '../../../app/store/useTimelineStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { X, Network, ShieldAlert, CheckCircle2, Search } from 'lucide-react';

export const EventDetailPanel: React.FC = () => {
  const { isReplayMode, selectedEventId, setSelectedEvent } = useTimelineStore();
  const engine = useSimulationStore(state => state.engine);
  
  if (!isReplayMode || !selectedEventId) return null;

  const event = engine.getEventHistory().find(e => e.id === selectedEventId);
  if (!event) return null;

  const getEventIcon = (type: string) => {
    if (type === 'PACKET_DROPPED') return <ShieldAlert className="w-5 h-5 text-danger" />;
    if (type === 'PACKET_DELIVERED') return <CheckCircle2 className="w-5 h-5 text-success" />;
    return <Network className="w-5 h-5 text-accent" />;
  };

  // Find packet journey
  const history = engine.getEventHistory();
  const packetId = event.payload?.packet?.id;
  const journey = packetId ? history.filter(e => e.payload?.packet?.id === packetId) : [];

  return (
    <div className="absolute right-4 top-20 bottom-32 w-80 bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-4 z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          {getEventIcon(event.type)}
          <span className="font-bold text-sm text-primary">Event Detail</span>
        </div>
        <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-black/10 rounded">
          <X className="w-4 h-4 text-secondary" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar pr-2 flex flex-col gap-4">
        <div>
          <div className="text-xs font-mono text-muted mb-1">T={event.timestamp}</div>
          <h3 className="font-bold text-lg text-primary">{event.type.replace('PACKET_', '')}</h3>
        </div>

        {event.explanation && (
          <div className="bg-elevated border border-border rounded-lg p-3">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search className="w-3 h-3" /> Why did this happen?
            </h4>
            <p className="text-sm text-primary">{event.explanation}</p>
          </div>
        )}

        {event.payload?.reason && (
          <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
            <h4 className="text-xs font-bold text-danger uppercase tracking-wider mb-1">Failure Reason</h4>
            <p className="text-sm text-danger">{event.payload.reason}</p>
          </div>
        )}

        {event.payload?.packet && (
          <div className="bg-surface-hover rounded-lg p-3 border border-border">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Packet Data</h4>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="text-muted">Protocol:</div>
              <div className="font-bold text-accent">{event.payload.packet.protocol}</div>
              <div className="text-muted">Source:</div>
              <div className="font-mono text-primary truncate" title={event.payload.packet.sourceIp}>{event.payload.packet.sourceIp}</div>
              <div className="text-muted">Dest:</div>
              <div className="font-mono text-primary truncate" title={event.payload.packet.destinationIp}>{event.payload.packet.destinationIp}</div>
            </div>
          </div>
        )}

        {journey.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Packet Journey</h4>
            <div className="relative border-l-2 border-border ml-2 pl-3 pb-2 space-y-3">
              {journey.map((jEvt) => (
                <div key={jEvt.id} className="relative">
                  <div className={`absolute -left-[17px] top-1 w-2 h-2 rounded-full ${jEvt.id === event.id ? 'bg-accent' : 'bg-border'}`}></div>
                  <div className="text-[10px] font-mono text-muted">T={jEvt.timestamp}</div>
                  <div className={`text-xs ${jEvt.id === event.id ? 'font-bold text-primary' : 'text-secondary'}`}>
                    {jEvt.payload?.deviceId ? (
                      <span className="flex items-center gap-1">
                        At <span className="font-mono">{jEvt.payload.deviceId}</span>
                      </span>
                    ) : (
                      jEvt.type
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
