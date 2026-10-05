import re

path = 'src/app/store/useLabStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { LabDefinition, LabProgress } from '../../core/domain/Lab';", "import { LabDefinition, LabProgress, EvidenceEntry } from '../../core/domain/Lab';")

interface_old = """  advanceStep: () => void;
  markLabComplete: (labId: string) => void;
  getLabById: (id: string) => LabDefinition | undefined;
}"""
interface_new = """  advanceStep: () => void;
  markLabComplete: (labId: string) => void;
  getLabById: (id: string) => LabDefinition | undefined;
  addEvidence: (entry: Omit<EvidenceEntry, 'id' | 'timestamp'>) => void;
  resetEvidence: () => void;
}"""
text = text.replace(interface_old, interface_new)

prog_old = """          const prog = state.progress[labId] || {
            labId,
            status: 'Not Started',
            currentStepIndex: 0,
            hintsUsed: [],
            attempts: 0
          };"""
prog_new = """          const prog = state.progress[labId] || {
            labId,
            status: 'Not Started',
            currentStepIndex: 0,
            hintsUsed: [],
            attempts: 0,
            investigationLog: []
          };"""
text = text.replace(prog_old, prog_new)

add_methods = """      getLabById: (id) => CURRICULUM.find(l => l.id === id),

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
      }"""
text = text.replace("      getLabById: (id) => CURRICULUM.find(l => l.id === id)", add_methods)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
