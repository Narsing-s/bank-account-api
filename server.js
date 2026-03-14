// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const https = require("https");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// IMPORTANT: Include /api at the end if Mule listener is /api/*
const API_BASE =
  process.env.API_BASE ||
  "https://bank-account-api-xxxxx.5sc6y6-1.usa-e2.cloudhub.io/api";

// Optional (only if API Manager client ID enforcement is enabled)
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

// Android/web mode & base configuration (no secrets here)
const APP_MODE = (process.env.APP_MODE || "web").toLowerCase(); // "web" or "android"
const WEB_PREFIX = process.env.WEB_PREFIX || "/api";
const ANDROID_BASE = process.env.ANDROID_BASE || ""; // e.g., https://<cloudhub-app>.cloudhub.io/api

// Keep-alive improves upstream reliability
const httpsAgent = new https.Agent({ keepAlive: true });

// Core middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("tiny"));

/**
 * Serve a dynamic /config.js so window.AppConfig is ALWAYS defined
 * Provides android/web mode without changing UI files.
 *
 * You can control values with environment variables:
 *   APP_MODE=android
 *   WEB_PREFIX=/api
 *   ANDROID_BASE=https://<cloudhub-app>.cloudhub.io/api
 *
 * Also supports per-request override (useful for testing):
 *   /config.js?mode=android&androidBase=https://.../api
 */
app.get("/config.js", (req, res) => {
  // Allow optional override via querystring (for quick tests)
  const q = req.query || {};
  const qMode = (q.mode || "").toLowerCase();
  const qsMode = qMode === "android" || qMode === "web" ? qMode : null;

  // Basic Android UA detection as a fallback (WebView or Chrome on Android)
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const uaLooksAndroid = ua.includes("android");

  // Priority: querystring > env > UA detection (only if ANDROID_BASE is set)
  let mode = qsMode || APP_MODE;
  if (!qsMode && APP_MODE === "web" && uaLooksAndroid && ANDROID_BASE) {
    mode = "android";
  }

  const webPrefix = q.webPrefix || WEB_PREFIX;
  const androidBase = q.androidBase || ANDROID_BASE;

  const js = `
    // Provided by server to ensure window.AppConfig exists.
    // DO NOT put secrets here.
    window.AppConfig = window.AppConfig || {
      mode: ${JSON.stringify(mode)},            // "web" uses WEB_PREFIX; "android" uses ANDROID_BASE
      WEB_PREFIX: ${JSON.stringify(webPrefix)}, // e.g., "/api" when using Node proxy
      ANDROID_BASE: ${JSON.stringify(androidBase)} // e.g., "https://<cloudhub-app>.cloudhub.io/api"
    };
  `;
  res.type("application/javascript").send(js);
});

// Health check
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

// Static files (your current UI in /public)
app.use(express.static(path.join(__dirname, "public")));

/**
 * Proxy: /api/* -> CloudHub (API_BASE)
 * - Forwards method, headers, body, query string.
 * - Passes through status codes and content-type.
 * - Optionally injects client_id/client_secret if provided via env.
 */
app.use("/api", async (req, res) => {
  const upstreamUrl = API_BASE + req.url; // req.url includes /accounts...

  const headers = {
    "Content-Type": req.get("Content-Type") || "application/json",
    Accept: req.get("Accept") || "application/json",
  };
  if (CLIENT_ID) headers["client_id"] = CLIENT_ID;
  if (CLIENT_SECRET) headers["client_secret"] = CLIENT_SECRET;

  try {
    const ax = await axios({
      method: req.method,
      url: upstreamUrl,
      data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      headers,
      httpsAgent,
      timeout: 30000,
      validateStatus: () => true, // forward all statuses
    });

    const ct = ax.headers["content-type"] || "application/json";
    res.status(ax.status).set("Content-Type", ct);
    if (ct.includes("application/json") && typeof ax.data === "object") {
      res.json(ax.data);
    } else {
      res.send(ax.data);
    }
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(502).json({ message: "Upstream unavailable", detail: e.message });
  }
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`UI server running on http://localhost:${PORT}`);
  console.log(`Proxy target (API_BASE): ${API_BASE}`);
  console.log(`App mode (APP_MODE): ${APP_MODE}`);
  if (APP_MODE === "android" || ANDROID_BASE) {
    console.log(`Android base (ANDROID_BASE): ${ANDROID_BASE || "(not set)"}`);
  }
});
