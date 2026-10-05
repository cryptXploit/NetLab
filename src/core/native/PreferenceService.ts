import { Preferences } from '@capacitor/preferences';

export class PreferenceService {
  static async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  static async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }
}
