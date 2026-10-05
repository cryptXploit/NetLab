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

export class NetLabDatabase extends Dexie {
  profile!: Table<UserProfile, string>;
  history!: Table<ActivityHistory, number>;

  constructor() {
    super('NetLabDatabase');
    this.version(1).stores({
      profile: 'id', // Primary key is id
      history: '++id, type, timestamp' // Auto-increment id, index on type and timestamp
    });
  }
}

export const db = new NetLabDatabase();
