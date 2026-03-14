// public/config.js (static)
// If you add this file, you can remove the /config.js route from server.js.
// Do NOT put secrets here; it's shipped to the browser.
window.AppConfig = {
  mode: "web",         // "web" uses the proxy (/api), "android" would use ANDROID_BASE
  WEB_PREFIX: "/api",  // proxy prefix for the web UI
  ANDROID_BASE: ""     // set this only for Android builds
};
