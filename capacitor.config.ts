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
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  plugins: {
    Browser: {
      windowName: '_self',
      presentationStyle: 'popover'
    },
    App: {
      launchUrl: 'com.memorygym.flashcards'
    }
  }
};

export default config;
