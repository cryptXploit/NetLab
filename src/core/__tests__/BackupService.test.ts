import { describe, it, expect } from 'vitest';
import { BackupService } from '../persistence/BackupService';

describe('BackupService', () => {
  it('should validate a correct backup envelope', () => {
    const validData = {
      version: 2,
      appVersion: '1.0.0',
      exportedAt: '2026-10-06T00:00:00Z',
      dexie: {
        profile: { id: 'me', totalXp: 100, level: 2, topicMastery: {}, unlockedAchievements: [] },
        history: [],
        savedLabs: []
      },
      zustand: {
        labProgress: {},
        practiceHistory: []
      },
      preferences: {
        theme: 'system',
        language: 'en',
        hapticsEnabled: true
      }
    };
    
    expect(() => BackupService.validateBackup(JSON.stringify(validData))).not.toThrow();
  });

  it('should reject a v1 backup envelope', () => {
    const invalidData = {
      version: 1, // V1 not supported
      appVersion: '1.0.0',
      exportedAt: '2026-10-06T00:00:00Z',
      profile: { id: 'me', totalXp: 100, level: 2 },
      history: [],
      currentLab: {}
    };
    
    expect(() => BackupService.validateBackup(JSON.stringify(invalidData))).toThrow('Version 1 backups are no longer supported');
  });

  it('should reject malformed structural JSON', () => {
    const invalidData = {
      version: 2,
      appVersion: '1.0.0',
      // missing dexie and zustand blocks
    };
    
    expect(() => BackupService.validateBackup(JSON.stringify(invalidData))).toThrow(); // Zod error
  });

  it('should reject file sizes over 50MB', () => {
    // We just test the size check by generating a huge string
    const hugeString = " ".repeat(51 * 1024 * 1024); // 51MB
    expect(() => BackupService.validateBackup(hugeString)).toThrow('Backup file is too large (max 50MB)');
  });
});
