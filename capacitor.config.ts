import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.protrade.journal',
  appName: 'ProTrade Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      signingConfig: 'debug'
    }
  }
};

export default config;
