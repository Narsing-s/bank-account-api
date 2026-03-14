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

// Must include /api if Mule listener is /api/*
const API_BASE =
  process.env.API_BASE ||
  "https://bank-account-api-xxxxx.5sc6y6-1.usa-e2.cloudhub.io/api";

// Optional (if API Manager enforces)
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

const httpsAgent = new https.Agent({ keepAlive: true });

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api", async (req, res) => {
  const url = API_BASE + req.url;

  const headers = {
    "Content-Type": req.get("Content-Type") || "application/json",
    Accept: req.get("Accept") || "application/json",
  };
  if (CLIENT_ID) headers["client_id"] = CLIENT_ID;
  if (CLIENT_SECRET) headers["client_secret"] = CLIENT_SECRET;

  try {
    const ax = await axios({
      method: req.method,
      url,
      data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      headers,
      httpsAgent,
      timeout: 30000,
      validateStatus: () => true,
    });

    const ct = ax.headers["content-type"] || "application/json";
    res.status(ax.status).set("Content-Type", ct);
    if (ct.includes("application/json") && typeof ax.data === "object") {
      res.json(ax.data);
    } else {
      res.send(ax.data);
    }
  } catch (e) {
    res.status(502).json({ message: "Upstream unavailable", detail: e.message });
  }
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`UI server http://localhost:${PORT}`);
  console.log(`Proxy target: ${API_BASE}`);
});
``
