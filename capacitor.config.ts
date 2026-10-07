import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartinnovations.netlab',
  appName: 'NETLAB',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#09090b",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#4f46e5"
    }
  }
};

export default config;
