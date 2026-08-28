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

// Render can override this with API_BASE. The default is the deployed MuleSoft API.
const API_BASE = (process.env.API_BASE || "https://bank-account-api-tlpwq.5sc6y6-2.usa-e2.cloudhub.io").replace(/\/$/, "");
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const APP_MODE = (process.env.APP_MODE || "web").toLowerCase();
const WEB_PREFIX = process.env.WEB_PREFIX || "/api";
const ANDROID_BASE = (process.env.ANDROID_BASE || "").replace(/\/$/, "");
const httpsAgent = new https.Agent({ keepAlive: true });

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

// Proxy /api/* -> MuleSoft CloudHub.
app.use("/api", async (req, res) => {
  const upstreamUrl = API_BASE + req.url;
  const headers = {
    "Content-Type": req.get("Content-Type") || "application/json",
    Accept: req.get("Accept") || "application/json"
  };
  if (CLIENT_ID) headers.client_id = CLIENT_ID;
  if (CLIENT_SECRET) headers.client_secret = CLIENT_SECRET;
  if (req.get("Authorization")) headers.Authorization = req.get("Authorization");

  try {
    const ax = await axios({
      method: req.method,
      url: upstreamUrl,
      data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      headers,
      httpsAgent,
      timeout: 30000,
      validateStatus: () => true
    });
    const contentType = ax.headers["content-type"] || "application/json";
    res.status(ax.status).set("Content-Type", contentType);
    if (contentType.includes("application/json") && typeof ax.data === "object") return res.json(ax.data);
    return res.send(ax.data);
  } catch (e) {
    console.error("Proxy error:", e.message);
    return res.status(502).json({ message: "Upstream unavailable", detail: e.message });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UI server listening on port ${PORT}`);
  console.log(`API_BASE: ${API_BASE}`);
});