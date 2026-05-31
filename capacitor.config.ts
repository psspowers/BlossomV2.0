import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rootandrenew.blossom',
  appName: 'Blossom PCOS',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Forces WKWebView to load under https:// rather than capacitor://
    // so localStorage is in the same storage partition as Supabase Auth tokens.
    iosScheme: 'https',
    allowNavigation: ['*.supabase.co'],
  },
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
