import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PracticeType, Skill, LabDifficulty } from '../../core/domain/Lab';
import { useToastStore } from './useToastStore';

export interface PracticeAttempt {
  id: string;
  scenarioId: string;
  type: PracticeType;
  startTime: number;
  endTime?: number;
  hintsUsed: number;
  mistakes: number;
  score?: number;
  result?: 'SUCCESS' | 'FAILURE';
  seed?: string; // for generated scenarios
  skills?: Skill[];
  difficulty?: LabDifficulty;
}

interface PracticeState {
  activeAttemptId: string | null;
  history: PracticeAttempt[];
  
  startPractice: (scenarioId: string, type: PracticeType, seed?: string, skills?: Skill[], difficulty?: LabDifficulty) => void;
  recordMistake: () => void;
  recordHintUsed: () => void;
  finishPractice: (result: 'SUCCESS' | 'FAILURE', score: number) => void;
  exitPractice: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, _get) => ({
      activeAttemptId: null,
      history: [],
      
      startPractice: (scenarioId, type, seed, skills, difficulty) => {
        const attemptId = `prac_${Date.now()}`;
        const attempt: PracticeAttempt = {
          id: attemptId,
          scenarioId,
          type,
          startTime: Date.now(),
          hintsUsed: 0,
          mistakes: 0,
          seed,
          skills,
          difficulty
        };
        
        set((state) => ({
          activeAttemptId: attemptId,
          history: [...state.history, attempt]
        }));
      },
      
      recordMistake: () => {
        set((state) => {
          if (!state.activeAttemptId) return state;
          return {
            history: state.history.map(a => 
              a.id === state.activeAttemptId 
                ? { ...a, mistakes: a.mistakes + 1 }
                : a
            )
          };
        });
      },
      
      recordHintUsed: () => {
        set((state) => {
          if (!state.activeAttemptId) return state;
          return {
            history: state.history.map(a => 
              a.id === state.activeAttemptId 
                ? { ...a, hintsUsed: a.hintsUsed + 1 }
                : a
            )
          };
        });
      },
      
      finishPractice: (result, score) => {
        set((state) => {
          if (!state.activeAttemptId) return state;
          return {
            history: state.history.map(a => 
              a.id === state.activeAttemptId 
                ? { ...a, endTime: Date.now(), result, score }
                : a
            ),
            activeAttemptId: null // End session
          };
        });
        
        if (result === 'SUCCESS') {
          useToastStore.getState().addToast('Practice Complete', `Great job! You scored ${score} points.`, 'success');
        } else {
          useToastStore.getState().addToast('Practice Failed', `Don't worry, keep practicing!`, 'info');
        }
      },
      
      exitPractice: () => {
        set({ activeAttemptId: null });
      }
    }),
    {
      name: 'netlab-practice-storage'
    }
  )
);
