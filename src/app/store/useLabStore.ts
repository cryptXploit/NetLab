import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabDefinition, LabProgress, EvidenceEntry } from '../../core/domain/Lab';
import { CURRICULUM } from '../../data/curriculum';
import { useToastStore } from './useToastStore';

interface LabStoreState {
  progress: Record<string, LabProgress>;
  activeLabId: string | null;
  
  startLab: (labId: string) => void;
  exitLab: () => void;
  advanceStep: () => void;
  markLabComplete: (labId: string) => void;
  getLabById: (id: string) => LabDefinition | undefined;
  addEvidence: (entry: Omit<EvidenceEntry, 'id' | 'timestamp'>) => void;
  resetEvidence: () => void;
}

export const useLabStore = create<LabStoreState>()(
  persist(
    (set, get) => ({
      progress: {},
      activeLabId: null,

      startLab: (labId) => {
        set((state) => {
          const prog = state.progress[labId] || {
            labId,
            status: 'Not Started',
            currentStepIndex: 0,
            hintsUsed: [],
            attempts: 0,
            investigationLog: []
          };
          
          return {
            activeLabId: labId,
            progress: {
              ...state.progress,
              [labId]: {
                ...prog,
                status: 'In Progress',
                attempts: prog.attempts + 1,
                lastAttemptAt: Date.now()
              }
            }
          };
        });
      },

      exitLab: () => set({ activeLabId: null }),

      advanceStep: () => {
        const { activeLabId, progress } = get();
        if (!activeLabId) return;
        
        const prog = progress[activeLabId];
        const lab = CURRICULUM.find(l => l.id === activeLabId);
        
        if (lab && prog.currentStepIndex < lab.steps.length - 1) {
          set({
            progress: {
              ...progress,
              [activeLabId]: {
                ...prog,
                currentStepIndex: prog.currentStepIndex + 1
              }
            }
          });
        } else if (lab) {
          get().markLabComplete(activeLabId);
        }
      },

      markLabComplete: (labId) => {
        const lab = CURRICULUM.find(l => l.id === labId);
        set((state) => ({
          progress: {
            ...state.progress,
            [labId]: {
              ...state.progress[labId],
              status: 'Completed',
              currentStepIndex: 0 // Reset for next time
            }
          }
        }));
        if (lab) {
          useToastStore.getState().addToast('Lab Completed', `Congratulations! You mastered "${lab.title}".`, 'success');
        }
      },

      getLabById: (id) => CURRICULUM.find(l => l.id === id),

      addEvidence: (entry) => {
        set((state) => {
          const { activeLabId, progress } = state;
          if (!activeLabId) return state;
          const prog = progress[activeLabId];
          if (!prog) return state;
          
          const newEntry: EvidenceEntry = {
            ...entry,
            id: `ev-${Math.random().toString(36).substring(2,9)}`,
            timestamp: Date.now()
          };

          return {
            progress: {
              ...progress,
              [activeLabId]: {
                ...prog,
                investigationLog: [...(prog.investigationLog || []), newEntry]
              }
            }
          };
        });
      },

      resetEvidence: () => {
        set((state) => {
          const { activeLabId, progress } = state;
          if (!activeLabId) return state;
          const prog = progress[activeLabId];
          if (!prog) return state;

          return {
            progress: {
              ...progress,
              [activeLabId]: {
                ...prog,
                investigationLog: []
              }
            }
          };
        });
      }
    }),
    {
      name: 'netlab-progress-storage'
    }
  )
);
