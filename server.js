// server.js
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());

// ---------- Config ----------
const PORT = process.env.PORT || 3000;

// Mule/Proxy base (CloudHub) — can be overridden via env
const BASE_URL =
  process.env.BASE_URL ||
  "https://bank-account-proxy-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io";

// Allow multiple frontends (GitHub Pages, custom domain, etc.)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// ---------- CORS (multi-origin) ----------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ---------- Diagnostics ----------
app.use((req, res, next) => {
  res.setHeader("X-App", "Bank-Account-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ---------- Static UI ----------
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// ---------- Health ----------
app.get("/health", async (req, res) => {
  try {
    // Optionally check upstream health if exposed; here respond local status.
    res.json({
      status: "ok",
      node: process.version,
      baseUrl: BASE_URL,
      allowedOrigins: ALLOWED_ORIGINS
    });
  } catch (e) {
    res.status(500).json({ status: "fail", error: e.message });
  }
});

// ---------- Proxy endpoints to Mule ----------
// CREATE account
// expects: POST /accounts?adharNumber=...&bankName=...  with JSON body
app.post("/accounts", async (req, res) => {
  try {
    const adharNumber = req.query.adharNumber;
    const bankName = req.query.bankName;
    const url = `${BASE_URL}/accounts?adharNumber=${encodeURIComponent(
      adharNumber || ""
    )}&bankName=${encodeURIComponent(bankName || "")}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(req.body || {})
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET account
app.get("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(`${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`, {
      headers: { "Accept": "application/json" }
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE account (PUT or PATCH if your Mule flow supports patch)
app.put("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(`${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE account
app.delete("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(`${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`, {
      method: "DELETE",
      headers: { "Accept": "application/json" }
    });
    const text = await upstream.text();
    // Could be plain text; return as-is
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Root serves UI ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- 404 ----------
app.use((req, res) => res.status(404).json({ error: "Not Found", path: req.path }));

app.listen(PORT, () => console.log(`Bank Account UI running on port ${PORT}`));
