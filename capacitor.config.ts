// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.bankportal',
  appName: 'Bank Portal',
  webDir: 'public',                // <-- your current UI lives here
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',        // Required for fetch() in WebView
    // Optional: if you ever embed iframes or navigate to external origins:
    // allowNavigation: ['*.cloudhub.io']
  },
};

export default config;
