import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export class AppBootService {
  static async initializeNativeApp(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#09090b' });
        await SplashScreen.hide();
      } catch (err) {
        console.error('Failed to initialize native plugins:', err);
      }
    }
  }
}
