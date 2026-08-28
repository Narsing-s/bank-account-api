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
const PORT = Number(process.env.PORT || 8080);

// Default deployed MuleSoft API. Render API_BASE can override it.
const API_BASE = (process.env.API_BASE || "https://bank-account-api-tlpwq.5sc6y6-2.usa-e2.cloudhub.io/api").replace(/\/+$/, "");
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const APP_MODE = (process.env.APP_MODE || "web").toLowerCase();
const WEB_PREFIX = process.env.WEB_PREFIX || "/api";
const ANDROID_BASE = (process.env.ANDROID_BASE || "").replace(/\/$/, "");

// Force IPv4 for outbound CloudHub calls. This avoids occasional Render DNS/IPv6
// connection failures that otherwise surface as a generic 502 from the proxy.
const httpsAgent = new https.Agent({
  keepAlive: true,
  family: 4,
  rejectUnauthorized: true
});

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("tiny"));

app.get("/config.js", (req, res) => {
  const q = req.query || {};
  const qMode = String(q.mode || "").toLowerCase();
  const qsMode = qMode === "android" || qMode === "web" ? qMode : null;
  const ua = String(req.headers["user-agent"] || "").toLowerCase();
  let mode = qsMode || APP_MODE;
  if (!qsMode && APP_MODE === "web" && ua.includes("android") && ANDROID_BASE) mode = "android";
  const webPrefix = q.webPrefix || WEB_PREFIX;
  const androidBase = q.androidBase || ANDROID_BASE;
  res.type("application/javascript").send(`window.AppConfig = ${JSON.stringify({ mode, WEB_PREFIX: webPrefix, ANDROID_BASE: androidBase })};`);
});

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true, service: "bank-account-api-frontend" }));
app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "bank-account-api-frontend" }));

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Proxy /api/* -> MuleSoft CloudHub /api/*.
app.use("/api", async (req, res) => {
  const incomingPath = req.originalUrl.split("?")[0].replace(/^\/api/, "") || "/";
  const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  const upstreamUrl = `${API_BASE}${incomingPath}${query}`;

  const headers = {
    "Content-Type": req.get("Content-Type") || "application/json",
    Accept: req.get("Accept") || "application/json",
    "User-Agent": "NOVA-Bank-Account-Proxy/1.0"
  };
  if (CLIENT_ID) headers.client_id = CLIENT_ID;
  if (CLIENT_SECRET) headers.client_secret = CLIENT_SECRET;
  if (req.get("Authorization")) headers.Authorization = req.get("Authorization");

  console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${upstreamUrl}`);

  try {
    const ax = await axios({
      method: req.method,
      url: upstreamUrl,
      data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      headers,
      httpsAgent,
      timeout: 60000,
      maxRedirects: 5,
      validateStatus: () => true
    });

    console.log(`[PROXY] CloudHub responded ${ax.status} for ${req.method} ${upstreamUrl}`);
    const contentType = ax.headers["content-type"] || "application/json";
    res.status(ax.status).set("Content-Type", contentType);
    if (contentType.includes("application/json") && typeof ax.data === "object") return res.json(ax.data);
    return res.send(ax.data);
  } catch (e) {
    console.error("[PROXY ERROR]", {
      message: e.message,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
      hostname: e.hostname,
      upstreamUrl
    });

    return res.status(502).json({
      message: "Unable to reach MuleSoft CloudHub API",
      upstream: upstreamUrl,
      code: e.code || "UPSTREAM_CONNECTION_ERROR",
      detail: e.message
    });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UI server listening on port ${PORT}`);
  console.log(`MuleSoft API base: ${API_BASE}`);
});
