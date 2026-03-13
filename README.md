# Bank Account API — Android‑Style Web UI
A modern, mobile‑first, Android‑inspired Web UI for managing bank accounts.  
Supports **Create, Get, Update, Delete** operations with **voice input/output**, **passkey login**, **multiple languages**, and **full PWA support**.

This project provides:
- 🟢 **Node.js Express backend** acting as a proxy to the MuleSoft Bank‑Account‑API  
- 🟢 **Beautiful Android‑style frontend** with gradients, rounded surfaces & responsive 12‑column layout  
- 🟢 **Languages:** English • हिन्दी • తెలుగు  
- 🟢 **Voice features:** STT (mic) + TTS (speaker)  
- 🟢 **Passkey authentication (WebAuthn):** Windows Hello / Touch ID / Face ID  
- 🟢 **Settings panel:** theme, accent colors, density, font size, reduce motion, API networking  
- 🟢 **PWA:** installable on Chrome (Android + Desktop)  
- 🟢 **Offline app-shell caching**

---

## 🚀 Features

### ✔ Android‑Style Responsive UI  
- Smooth gradients using dual accent colors  
- Adaptive grid (no overlapping boxes)  
- Dark/light/system themes  
- Compact/Comfortable density  

### ✔ Multi‑Language  
The UI instantly switches across:
- **English**  
- **हिन्दी (Hindi)**  
- **తెలుగు (Telugu)**  

### ✔ Voice Input & Output  
- 🎤 **STT** (Speech to Text) for all major inputs  
- 🔊 **TTS** (Text to Speech) to read API responses  

### ✔ Passkey Login (WebAuthn)  
- Register passkey  
- Login using biometrics  
- Works on **HTTPS** with **RP_ID** + **ORIGIN** configured  
- Works in Chrome (mobile + desktop)

### ✔ Bank Account CRUD  
All operations proxy through the Node server to your MuleSoft API:
- **POST /accounts** — Create  
- **GET /accounts/:id** — Fetch  
- **PUT /accounts/:id** — Update  
- **DELETE /accounts/:id** — Delete  

### ✔ Settings Panel  
- Language  
- Theme  
- Accent & Accent‑2  
- High contrast  
- Font scaling  
- Motion reduction  
- API Base URL  
- Timeout, retries  
- Custom headers (Client‑ID / Client‑Secret)  
- Bearer Token  
- `/health` test button  
- Install PWA button  

### ✔ PWA Support  
- Installable on Android and PC  
- Offline shell caching  
- Fast boot and caching via Service Worker  

