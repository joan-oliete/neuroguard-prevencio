import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.neuroguard.app',
  appName: 'NeuroGuard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
