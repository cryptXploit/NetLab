import { z } from 'zod';
import { db } from './db';
import { useLabStore } from '../../app/store/useLabStore';
import { usePracticeStore } from '../../app/store/usePracticeStore';
import { useSettingsStore } from '../../app/store/useSettingsStore';
import { CryptoUtils } from '../security/CryptoUtils';
import { TopologyValidator } from './TopologyValidator';

// ==========================================
// 1. SCHEMAS (N2 - OFFLINE DATA MODEL)
// ==========================================

export const ProfileSchema = z.object({
  id: z.string(),
  totalXp: z.number().min(0),
  level: z.number().min(1),
  topicMastery: z.record(z.string(), z.number().min(0).max(100)).default({}),
  unlockedAchievements: z.array(z.string()).max(1000).default([]),
  tutorialCompleted: z.boolean().optional()
});

export const HistorySchema = z.object({
  id: z.number().optional(),
  type: z.string().max(50),
  description: z.string().max(500),
  xpEarned: z.number(),
  timestamp: z.number(),
});

export const SavedLabSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  createdAt: z.number(),
  snapshot: z.any(), // The topological state will be validated dynamically by SimulationEngine upon restore
});

export const LabProgressSchema = z.object({
  labId: z.string(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Failed']),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  score: z.number().optional(),
  evidence: z.array(z.any()).max(1000).optional(),
});

export const PracticeAttemptSchema = z.object({
  id: z.string(),
  scenarioId: z.string(),
  type: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  hintsUsed: z.number().min(0),
  mistakes: z.number().min(0),
  score: z.number().optional(),
  result: z.enum(['SUCCESS', 'FAILURE']).optional(),
  seed: z.string().optional(),
  skills: z.array(z.string()).optional(),
  difficulty: z.string().optional()
});

export const PreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  language: z.enum(['en', 'bn']),
  hapticsEnabled: z.boolean(),
});

export const BackupPayloadSchema = z.object({
  version: z.literal(2),
  appVersion: z.string(),
  exportedAt: z.string(),
  dexie: z.object({
    profile: ProfileSchema,
    history: z.array(HistorySchema).max(10000),
    savedLabs: z.array(SavedLabSchema).max(500),
  }),
  zustand: z.object({
    labProgress: z.record(z.string(), LabProgressSchema).optional(),
    practiceHistory: z.array(PracticeAttemptSchema).max(5000).optional(),
  }),
  preferences: PreferencesSchema,
});

export const EncryptedBackupSchema = z.object({
  version: z.literal(2),
  isEncrypted: z.literal(true),
  salt: z.string(),
  iv: z.string(),
  data: z.string(),
});

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export class BackupService {
  static async createPayload(): Promise<BackupPayload> {
    const profile = await db.profile.get('me');
    if (!profile) throw new Error('Profile not found for export');

    const history = await db.history.toArray();
    const savedLabs = await db.savedLabs.toArray();

    const labProgress = useLabStore.getState().progress;
    const practiceHistory = usePracticeStore.getState().history;

    const { theme, language, hapticsEnabled } = useSettingsStore.getState();

    return {
      version: 2,
      appVersion: '1.0.0', // Could be dynamic
      exportedAt: new Date().toISOString(),
      dexie: {
        profile: profile as any,
        history,
        savedLabs,
      },
      zustand: {
        labProgress,
        practiceHistory,
      },
      preferences: {
        theme,
        language,
        hapticsEnabled,
      }
    };
  }

  static async exportBackup(): Promise<string> {
    const payload = await this.createPayload();
    return JSON.stringify(payload, null, 2);
  }

  static async exportProtectedBackup(password: string): Promise<string> {
    const jsonStr = await this.exportBackup();
    const { ciphertext, salt, iv } = await CryptoUtils.encryptData(jsonStr, password);

    const payload = {
      version: 2,
      isEncrypted: true,
      salt,
      iv,
      data: ciphertext
    };

    return JSON.stringify(payload, null, 2);
  }

  static async importProtectedBackup(jsonString: string, password: string): Promise<void> {
    const rawData = JSON.parse(jsonString);
    const parsedData = EncryptedBackupSchema.parse(rawData);

    const decryptedJson = await CryptoUtils.decryptData(
      parsedData.data,
      parsedData.salt,
      parsedData.iv,
      password
    );

    return this.importBackup(decryptedJson);
  }

  // N4 - IMPORT VALIDATION
  // Validates the JSON without modifying state
  static validateBackup(jsonString: string): BackupPayload {
    if (jsonString.length > 50 * 1024 * 1024) {
      throw new Error("Backup file is too large (max 50MB)");
    }
    
    const rawData = JSON.parse(jsonString);
    
    if (rawData.version === 1) {
       throw new Error("Version 1 backups are no longer supported. Please migrate via external tool.");
    }

    TopologyValidator.validate(rawData);

    return BackupPayloadSchema.parse(rawData);
  }

  // N5 - RESTORE SAFETY
  static async importBackup(jsonString: string): Promise<void> {
    // 1. VALIDATE - Throw error if invalid before touching ANY state
    const parsedData = this.validateBackup(jsonString);

    // 2. STAGE & MERGE
    // For Dexie, we use a single transaction to ensure atomicity
    await db.transaction('rw', db.profile, db.history, db.savedLabs, async () => {
      await db.profile.clear();
      await db.history.clear();
      await db.savedLabs.clear();
      
      await db.profile.put(parsedData.dexie.profile as any);
      if (parsedData.dexie.history.length > 0) {
        await db.history.bulkAdd(parsedData.dexie.history as any);
      }
      if (parsedData.dexie.savedLabs.length > 0) {
        await db.savedLabs.bulkAdd(parsedData.dexie.savedLabs as any);
      }
    });

    // 3. RESTORE ZUSTAND STORES
    if (parsedData.zustand.labProgress) {
       useLabStore.setState({ progress: parsedData.zustand.labProgress as any });
    }
    if (parsedData.zustand.practiceHistory) {
       usePracticeStore.setState({ history: parsedData.zustand.practiceHistory as any });
    }

    // 4. RESTORE PREFERENCES
    const { setTheme, setLanguage, setHaptics } = useSettingsStore.getState();
    setTheme(parsedData.preferences.theme);
    setLanguage(parsedData.preferences.language);
    setHaptics(parsedData.preferences.hapticsEnabled);
  }

  static async resetAllData(): Promise<void> {
    await db.transaction('rw', db.profile, db.history, db.savedLabs, async () => {
      await db.profile.clear();
      await db.history.clear();
      await db.savedLabs.clear();
      
      // Seed default profile
      await db.profile.put({
        id: 'me',
        totalXp: 0,
        level: 1,
        topicMastery: { subnetting: 0, troubleshooting: 0 },
        unlockedAchievements: []
      });
    });

    useLabStore.setState({ progress: {}, activeLabId: null });
    usePracticeStore.setState({ history: [] });
    
    const { setTheme, setLanguage, setHaptics } = useSettingsStore.getState();
    setTheme('system');
    setLanguage('en');
    setHaptics(true);
  }
}
