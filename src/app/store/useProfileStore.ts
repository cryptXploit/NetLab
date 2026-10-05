import { create } from 'zustand';

export type Topic = 'subnetting' | 'troubleshooting';

interface ProfileStoreState {
  totalXp: number;
  level: number;
  topicMastery: {
    subnetting: number;
    troubleshooting: number;
  };
  isProfileOpen: boolean;

  addXp: (amount: number, topic: Topic) => void;
  toggleProfile: () => void;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const useProfileStore = create<ProfileStoreState>((set) => ({
  totalXp: 0,
  level: 1,
  topicMastery: {
    subnetting: 0,
    troubleshooting: 0,
  },
  isProfileOpen: false,

  addXp: (amount: number, topic: Topic) => {
    set((state) => {
      const newTotalXp = state.totalXp + amount;
      const newLevel = calculateLevel(newTotalXp);
      return {
        totalXp: newTotalXp,
        level: newLevel,
        topicMastery: {
          ...state.topicMastery,
          [topic]: state.topicMastery[topic] + amount,
        },
      };
    });
  },

  toggleProfile: () => {
    set((state) => ({ isProfileOpen: !state.isProfileOpen }));
  },
}));
