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

// IMPORTANT: API_BASE should include /api because your Mule listener path is /api/*
// Example: https://bank-account-api-xxxxx.5sc6y6-1.usa-e2.cloudhub.io/api
const API_BASE = process.env.API_BASE || "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

// Optional API Manager credentials (if enforced by policies)
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

// Keep-alive for reliability
const httpsAgent = new https.Agent({ keepAlive: true });

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));

// Health endpoint
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

// Generic proxy for /api/* -> API_BASE + path + query
app.use("/api", async (req, res) => {
  const upstreamUrl = API_BASE + req.url; // req.url starts at /accounts...
  const headers = {
    "Content-Type": req.get("Content-Type") || "application/json",
    Accept: req.get("Accept") || "application/json",
  };
  if (CLIENT_ID) headers["client_id"] = CLIENT_ID;
  if (CLIENT_SECRET) headers["client_secret"] = CLIENT_SECRET;

  console.log(`[UP ->] ${req.method} ${upstreamUrl}`);

  try {
    const ax = await axios({
      method: req.method,
      url: upstreamUrl,
      headers,
      data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      timeout: 30000,
      httpsAgent,
      validateStatus: () => true, // forward all statuses
    });

    console.log(`[<- UP] ${ax.status} ${upstreamUrl}`);

    // Pass through content-type and status; send data as-is
    const ct = ax.headers["content-type"] || "application/json";
    res.status(ax.status);
    res.set("Content-Type", ct);
    if (ct.includes("application/json") && typeof ax.data === "object") {
      res.json(ax.data);
    } else {
      res.send(ax.data);
    }
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ message: "Upstream unavailable", detail: err.message });
  }
});

// SPA fallback (optional)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`UI server running on http://localhost:${PORT}`);
  console.log(`Proxy target: ${API_BASE}`);
});
