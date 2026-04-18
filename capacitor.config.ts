import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rootandrenew.blossom',
  appName: 'Blossom PCOS',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FDFBF7',
      showSpinner: false,
      iosSpinnerStyle: 'small',
    },
  },
};

export default config;
