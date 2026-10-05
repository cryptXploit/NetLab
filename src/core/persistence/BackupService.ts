import { z } from 'zod';
import { db } from './db';
import { SimulationEngine, type SimulationState } from '../simulation/SimulationEngine';
import { CryptoUtils } from '../security/CryptoUtils';

export const ProfileSchema = z.object({
  id: z.string(),
  totalXp: z.number(),
  level: z.number(),
  topicMastery: z.object({
    subnetting: z.number(),
    troubleshooting: z.number(),
  }),
  unlockedAchievements: z.array(z.string()),
});

export const HistorySchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  description: z.string(),
  xpEarned: z.number(),
  timestamp: z.number(),
});

export const LabStateSchema = z.any(); // Defer deep validation of topology for now

export const BackupPayloadSchema = z.object({
  version: z.number(),
  isEncrypted: z.literal(false).optional(),
  exportedAt: z.string(),
  profile: ProfileSchema,
  history: z.array(HistorySchema),
  currentLab: LabStateSchema,
});

export const EncryptedBackupSchema = z.object({
  version: z.number(),
  isEncrypted: z.literal(true),
  salt: z.string(),
  iv: z.string(),
  data: z.string(),
});

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export class BackupService {
  static async exportBackup(engine: SimulationEngine): Promise<string> {
    const profile = await db.profile.get('me');
    if (!profile) {
      throw new Error('Profile not found for export');
    }

    const history = await db.history.toArray();
    const currentLab = engine.createSnapshot();

    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      history,
      currentLab,
    };

    return JSON.stringify(payload, null, 2);
  }

  static async exportProtectedBackup(engine: SimulationEngine, password: string): Promise<string> {
    const jsonStr = await this.exportBackup(engine);
    const { ciphertext, salt, iv } = await CryptoUtils.encryptData(jsonStr, password);

    const payload = {
      version: 1,
      isEncrypted: true,
      salt,
      iv,
      data: ciphertext
    };

    return JSON.stringify(payload, null, 2);
  }

  static async importProtectedBackup(jsonString: string, password: string): Promise<SimulationState> {
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

  static async importBackup(jsonString: string): Promise<SimulationState> {
    const rawData = JSON.parse(jsonString);
    const parsedData = BackupPayloadSchema.parse(rawData);

    await db.transaction('rw', db.profile, db.history, async () => {
      await db.profile.clear();
      await db.history.clear();
      
      await db.profile.put(parsedData.profile);
      await db.history.bulkAdd(parsedData.history);
    });

    return parsedData.currentLab as SimulationState;
  }
}
