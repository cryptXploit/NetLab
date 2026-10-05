import { create } from 'zustand';
import { type DiagnosticReport, evaluateNetworkHealth } from '../../core/simulation/NetworkDoctor';
import { useSimulationStore } from './useSimulationStore';
import { SimulationEventType } from '../../core/events/SimulationEvent';

interface WorkspaceStoreState {
  currentTab: 'home' | 'labs' | 'sandbox' | 'practice' | 'profile';
  setTab: (tab: 'home' | 'labs' | 'sandbox' | 'practice' | 'profile') => void;

  mode: 'SIMULATE' | 'EDIT';
  setMode: (mode: 'SIMULATE' | 'EDIT') => void;

  selectedPacketId: string | null;
  selectPacket: (id: string | null) => void;

  pendingLinkSourceId: string | null;
  setPendingLinkSource: (id: string | null) => void;

  activeTerminalDeviceId: string | null;
  openTerminal: (deviceId: string | null) => void;

  selectedDeviceIdForConfig: string | null;
  selectDeviceForConfig: (id: string | null) => void;

  diagnosticReport: DiagnosticReport | null;
  runDiagnostics: () => void;
  clearDiagnostics: () => void;

  isPredictionModeEnabled: boolean;
  togglePredictionMode: () => void;
  
  pendingPrediction: { sourceId: string; targetId: string } | null;
  setPendingPrediction: (prediction: { sourceId: string; targetId: string } | null) => void;
  
  activePrediction: { packetId: string; expectedOutcome: 'DELIVERED' | 'DROPPED' } | null;
  setActivePrediction: (prediction: { packetId: string; expectedOutcome: 'DELIVERED' | 'DROPPED' } | null) => void;
  
  predictionResult: { success: boolean; actualOutcome: string; explanation: string } | null;
  setPredictionResult: (result: { success: boolean; actualOutcome: string; explanation: string } | null) => void;
  clearPredictionResult: () => void;
  
  submitPrediction: (expectedOutcome: 'DELIVERED' | 'DROPPED') => void;
  handleSimulationEvents: (newEvents: any[]) => void;

  isLabResolved: boolean;
  setIsLabResolved: (resolved: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  currentTab: 'home',
  setTab: (tab) => set({ currentTab: tab }),

  mode: 'SIMULATE',
  setMode: (mode) => set({ mode, pendingLinkSourceId: null }),

  selectedPacketId: null,
  selectPacket: (id) => set({ selectedPacketId: id }),

  pendingLinkSourceId: null,
  setPendingLinkSource: (id) => set({ pendingLinkSourceId: id }),

  activeTerminalDeviceId: null,
  openTerminal: (id) => set({ activeTerminalDeviceId: id }),

  selectedDeviceIdForConfig: null,
  selectDeviceForConfig: (id) => set({ selectedDeviceIdForConfig: id }),

  diagnosticReport: null,
  runDiagnostics: () => {
    const eng = useSimulationStore.getState().engine;
    const report = evaluateNetworkHealth(eng);
    set({ diagnosticReport: report });
  },
  clearDiagnostics: () => set({ diagnosticReport: null }),

  isPredictionModeEnabled: false,
  togglePredictionMode: () => set((state) => ({ 
    isPredictionModeEnabled: !state.isPredictionModeEnabled,
    pendingPrediction: null,
    activePrediction: null,
    predictionResult: null
  })),

  pendingPrediction: null,
  setPendingPrediction: (pred) => set({ pendingPrediction: pred }),

  activePrediction: null,
  setActivePrediction: (pred) => set({ activePrediction: pred }),

  predictionResult: null,
  setPredictionResult: (res) => set({ predictionResult: res }),
  clearPredictionResult: () => set({ predictionResult: null }),

  submitPrediction: (expectedOutcome) => {
    const pending = get().pendingPrediction;
    if (!pending) return;
    const packetId = `pkt-${Math.random().toString(36).substring(2, 9)}`;
    
    set({ 
      activePrediction: { packetId, expectedOutcome },
      pendingPrediction: null
    });
    
    useSimulationStore.getState().submitPrediction(pending.sourceId, pending.targetId, packetId);
  },

  handleSimulationEvents: (newEvents) => {
    const active = get().activePrediction;
    if (!active) return;
    
    for (const event of newEvents) {
      if ((event.type === SimulationEventType.PACKET_DROPPED || event.type === SimulationEventType.PACKET_DELIVERED) && 
           event.payload?.packet?.id === active.packetId) {
             
        const actualOutcome = event.type === SimulationEventType.PACKET_DROPPED ? 'DROPPED' : 'DELIVERED';
        const success = active.expectedOutcome === actualOutcome;
        
        set({
          predictionResult: { success, actualOutcome, explanation: event.explanation || '' },
          activePrediction: null
        });
        break;
      }
    }
  },

  isLabResolved: false,
  setIsLabResolved: (resolved) => set({ isLabResolved: resolved }),
}));

// Setup subscription to SimulationStore to process prediction results!
useSimulationStore.subscribe((state, prevState) => {
  if (state.eventHistory.length > prevState.eventHistory.length) {
    const newEvents = state.eventHistory.slice(prevState.eventHistory.length);
    useWorkspaceStore.getState().handleSimulationEvents(newEvents);
  }
});
