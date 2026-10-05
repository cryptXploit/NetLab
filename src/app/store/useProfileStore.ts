import { create } from 'zustand';
import { db, type UserProfile } from '../../core/persistence/db';
import { ACHIEVEMENTS } from '../../core/gamification/Achievements';
import { useToastStore } from './useToastStore';

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
  unlockedAchievements: string[];
  tutorialCompleted: boolean;

  initializeProfile: () => Promise<void>;
  completeTutorial: () => void;
  unlockAchievement: (id: string) => void;
  evaluateAchievements: () => void;
  addXp: (amount: number, topic: Topic, description: string) => void;
  toggleProfile: () => void;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  isLoaded: false,
  totalXp: 0,
  level: 1,
  topicMastery: {
    subnetting: 0,
    troubleshooting: 0,
  },
  isProfileOpen: false,
  unlockedAchievements: [],
  tutorialCompleted: false,

  initializeProfile: async () => {
    try {
      const profile = await db.profile.get('me');
      if (profile) {
        set({
          totalXp: profile.totalXp,
          level: profile.level,
          topicMastery: profile.topicMastery,
          unlockedAchievements: profile.unlockedAchievements || [],
          tutorialCompleted: profile.tutorialCompleted || false,
          isLoaded: true
        });
      } else {
        const defaultProfile: UserProfile = {
          id: 'me',
          totalXp: 0,
          level: 1,
          topicMastery: { subnetting: 0, troubleshooting: 0 },
          unlockedAchievements: [],
          tutorialCompleted: false
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
        topicMastery: newTopicMastery,
        unlockedAchievements: state.unlockedAchievements
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
    get().evaluateAchievements();
  },


  unlockAchievement: (id: string) => {
    const { unlockedAchievements, totalXp, level, topicMastery } = get();
    if (unlockedAchievements.includes(id)) return;

    const newUnlocked = [...unlockedAchievements, id];
    set({ unlockedAchievements: newUnlocked });

    const newProfile: UserProfile = {
      id: 'me',
      totalXp,
      level,
      topicMastery,
      unlockedAchievements: newUnlocked
    };
    db.profile.put(newProfile).catch(console.error);

    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (achievement) {
      useToastStore.getState().addToast('Achievement Unlocked!', achievement.title, 'success');
    }
  },

  evaluateAchievements: () => {
    const { topicMastery } = get();
    if (topicMastery.subnetting >= 50) {
      get().unlockAchievement('SUBNET_NOVICE');
    }
  },

  completeTutorial: async () => {
    set({ tutorialCompleted: true });
    try {
      const profile = await db.profile.get('me');
      if (profile) {
        profile.tutorialCompleted = true;
        await db.profile.put(profile);
      }
    } catch (e) {
      console.error(e);
    }
  },

  toggleProfile: () => {
    set((state) => ({ isProfileOpen: !state.isProfileOpen }));
  },
}));
