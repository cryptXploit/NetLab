import { create } from 'zustand';
import { type DiagnosticReport, evaluateNetworkHealth } from '../../core/simulation/NetworkDoctor';
import { useSimulationStore } from './useSimulationStore';

interface WorkspaceStoreState {
  currentView: 'LAB' | 'PRACTICE';
  setView: (view: 'LAB' | 'PRACTICE') => void;

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

  isLabResolved: boolean;
  setIsLabResolved: (resolved: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
  currentView: 'LAB',
  setView: (view) => set({ currentView: view }),

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

  isLabResolved: false,
  setIsLabResolved: (resolved) => set({ isLabResolved: resolved }),
}));
