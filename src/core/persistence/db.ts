import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  id: string; // usually 'me'
  totalXp: number;
  level: number;
  topicMastery: {
    subnetting: number;
    troubleshooting: number;
  };
  unlockedAchievements: string[];
}

export interface ActivityHistory {
  id?: number;
  type: 'subnetting' | 'troubleshooting' | string;
  description: string;
  xpEarned: number;
  timestamp: number;
}

export interface SavedLab {
  id: string;
  name: string;
  createdAt: number;
  snapshot: any;
}

export class NetLabDatabase extends Dexie {
  profile!: Table<UserProfile, string>;
  history!: Table<ActivityHistory, number>;
  savedLabs!: Table<SavedLab, string>;

  constructor() {
    super('NetLabDatabase');
    this.version(1).stores({
      profile: 'id',
      history: '++id, type, timestamp'
    });
    this.version(2).stores({
      profile: 'id',
      history: '++id, type, timestamp',
      savedLabs: 'id, createdAt'
    });
  }
}

export const db = new NetLabDatabase();
