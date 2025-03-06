
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ce0cb2f32de2488796648bbc5c08f261',
  appName: 'learnify-exam',
  webDir: 'dist',
  server: {
    url: 'https://ce0cb2f3-2de2-4887-9664-8bbc5c08f261.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000
    }
  }
};

export default config;
