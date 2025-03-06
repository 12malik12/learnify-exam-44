
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
      launchShowDuration: 2000,
      backgroundColor: "#14532d", // ethiopia-green 
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#eab308", // ethiopia-yellow
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
