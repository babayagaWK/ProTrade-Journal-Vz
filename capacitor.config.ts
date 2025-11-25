import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.protrade.journal',
  appName: 'ProTrade Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
