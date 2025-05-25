import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memorygym.flashcards',
  appName: '암기훈련소',
  webDir: 'out',
  server: {
    url: 'https://memorygym2.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'none',
    backgroundColor: '#ffffff'
  },
  plugins: {
    App: {
      launchUrl: 'com.memorygym.flashcards'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
