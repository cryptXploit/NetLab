import { create } from 'zustand';
import { db, type UserProfile } from '../../core/persistence/db';

export type Topic = 'subnetting' | 'troubleshooting';

interface ProfileStoreState {
  isLoaded: boolean;
  totalXp: number;
  level: number;
  topicMastery: {
    subnetting: number;
    troubleshooting: number;
  };
  isProfileOpen: boolean;

  initializeProfile: () => Promise<void>;
  addXp: (amount: number, topic: Topic, description: string) => void;
  toggleProfile: () => void;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const useProfileStore = create<ProfileStoreState>((set) => ({
  isLoaded: false,
  totalXp: 0,
  level: 1,
  topicMastery: {
    subnetting: 0,
    troubleshooting: 0,
  },
  isProfileOpen: false,

  initializeProfile: async () => {
    try {
      const profile = await db.profile.get('me');
      if (profile) {
        set({
          totalXp: profile.totalXp,
          level: profile.level,
          topicMastery: profile.topicMastery,
          isLoaded: true
        });
      } else {
        const defaultProfile: UserProfile = {
          id: 'me',
          totalXp: 0,
          level: 1,
          topicMastery: { subnetting: 0, troubleshooting: 0 }
        };
        await db.profile.add(defaultProfile);
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to initialize profile', error);
      set({ isLoaded: true });
    }
  },

  addXp: (amount: number, topic: Topic, description: string) => {
    set((state) => {
      const newTotalXp = state.totalXp + amount;
      const newLevel = calculateLevel(newTotalXp);
      const newTopicMastery = {
        ...state.topicMastery,
        [topic]: state.topicMastery[topic] + amount,
      };

      const newProfile: UserProfile = {
        id: 'me',
        totalXp: newTotalXp,
        level: newLevel,
        topicMastery: newTopicMastery
      };
      
      // Async DB write (fire and forget as side effect)
      db.profile.put(newProfile).catch(console.error);
      db.history.add({
        type: topic,
        description,
        xpEarned: amount,
        timestamp: Date.now()
      }).catch(console.error);

      return {
        totalXp: newTotalXp,
        level: newLevel,
        topicMastery: newTopicMastery,
      };
    });
  },

  toggleProfile: () => {
    set((state) => ({ isProfileOpen: !state.isProfileOpen }));
  },
}));
