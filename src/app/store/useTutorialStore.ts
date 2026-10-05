import { create } from 'zustand';
import { useProfileStore } from './useProfileStore';

interface TutorialStoreState {
  isActive: boolean;
  currentStep: number;
  startTutorial: () => void;
  nextStep: (totalSteps: number) => void;
  skipTutorial: () => void;
}

export const useTutorialStore = create<TutorialStoreState>((set) => ({
  isActive: false,
  currentStep: 0,
  
  startTutorial: () => set({ isActive: true, currentStep: 0 }),
  
  nextStep: (totalSteps) => set((state) => {
    if (state.currentStep >= totalSteps - 1) {
      useProfileStore.getState().completeTutorial();
      return { isActive: false, currentStep: 0 };
    }
    return { currentStep: state.currentStep + 1 };
  }),
  
  skipTutorial: () => {
    useProfileStore.getState().completeTutorial();
    set({ isActive: false, currentStep: 0 });
  }
}));
