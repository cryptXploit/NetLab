import { create } from 'zustand';
import type { SimulationState } from '../../core/simulation/SimulationEngine';

export type TimelineFilter = 'ALL' | 'PACKET' | 'ERROR' | 'IMPORTANT';

interface TimelineState {
  isReplayMode: boolean;
  initialSnapshot: SimulationState | null;
  latestSnapshot: SimulationState | null; // The state before entering replay
  replayTick: number; // Current tick in replay
  maxTick: number;
  filter: TimelineFilter;
  selectedEventId: string | null;

  setReplayMode: (enabled: boolean, initial?: SimulationState, latest?: SimulationState) => void;
  setReplayTick: (tick: number) => void;
  setFilter: (filter: TimelineFilter) => void;
  setSelectedEvent: (id: string | null) => void;
}

export const useTimelineStore = create<TimelineState>()((set) => ({
  isReplayMode: false,
  initialSnapshot: null,
  latestSnapshot: null,
  replayTick: 0,
  maxTick: 0,
  filter: 'ALL',
  selectedEventId: null,

  setReplayMode: (enabled, initial, latest) => {
    set({ 
      isReplayMode: enabled,
      initialSnapshot: initial || null,
      latestSnapshot: latest || null,
      replayTick: initial ? initial.currentTick : 0,
      maxTick: latest ? latest.currentTick : 0,
      selectedEventId: null
    });
  },

  setReplayTick: (tick) => set({ replayTick: tick }),
  setFilter: (filter) => set({ filter }),
  setSelectedEvent: (id) => set({ selectedEventId: id })
}));
