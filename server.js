const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Your CloudHub base (includes /api because listener path is /api/*)
const API_BASE =
  process.env.API_BASE ||
  "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

// Optional: API Manager credentials (if policies enforce them)
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

// Keep-alive agent (improves reliability)
const httpsAgent = new https.Agent({ keepAlive: true });

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Basic request logger
app.use((req, _res, next) => {
  console.log(`[UI <-] ${req.method} ${req.originalUrl}`);
  next();
});

// Generic proxy with query forwarding + optional client creds
async function proxy(method, pathSuffix, req, res) {
  try {
    const qs = new URLSearchParams(req.query || {}).toString();
    const url = `${API_BASE}${pathSuffix}${qs ? `?${qs}` : ""}`;

    const headers = {
      "Content-Type": "application/json",
    };

    if (CLIENT_ID) headers["client_id"] = CLIENT_ID;
    if (CLIENT_SECRET) headers["client_secret"] = CLIENT_SECRET;

    console.log(`[UP ->] ${method} ${url}`);
    if (["POST", "PUT", "PATCH"].includes(method)) {
      console.log(`[UP Body]`, JSON.stringify(req.body, null, 2));
    }

    const ax = await axios({
      method,
      url,
      headers,
      httpsAgent,
      data: ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined,
      timeout: 30000,
      validateStatus: () => true, // forward all statuses
    });

    console.log(`[<- UP] ${ax.status} ${url}`);

    // Return upstream payload as-is
    if (typeof ax.data === "object") {
      res.status(ax.status).json(ax.data);
    } else {
