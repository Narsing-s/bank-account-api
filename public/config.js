// android/app/src/main/assets/public/config.js
// This file overrides the web config for the Android build ONLY.
// DO NOT store any secrets here.

window.AppConfig = {
  mode: "android", // ensures your script uses ANDROID_BASE and not WEB_PREFIX
  WEB_PREFIX: "/api",  // unused in android mode, but safe to keep
  // TODO: Replace with your CloudHub base (must include /api)
  ANDROID_BASE: "https://<your-cloudhub-app>.cloudhub.io/api"
};
