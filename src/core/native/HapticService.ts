import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class HapticService {
  private static isEnabled(): boolean {
    // Check global boolean mapped from settings
    return (window as any).NETLAB_HAPTICS_ENABLED !== false;
  }

  static async tap(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // web fallback no-op
    }
  }

  static async success(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // web fallback no-op
    }
  }

  static async error(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      // web fallback no-op
    }
  }

  static async warning(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      // web fallback no-op
    }
  }
}
