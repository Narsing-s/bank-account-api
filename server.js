// server.js
// Bank Account UI + Proxy + WebAuthn (Passkeys)
// Node 18+ (global fetch). Start: node server.js

const path = require("path");
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Config (env vars on Render/host) =====
const BASE_URL =
  process.env.BASE_URL ||
  "https://bank-account-proxy-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io"; // MuleSoft proxy or API gateway

// WebAuthn domain binding
const RP_ID = process.env.RP_ID || "narsing-s.github.io";          // domain used to run WebAuthn UI
const ORIGIN = process.env.ORIGIN || "https://narsing-s.github.io"; // exact origin of the UI

// CORS whitelist (if UI is hosted on a different domain)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ===== Middleware =====
app.use(express.json());

// CORS (multi-origin)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!ALLOWED_ORIGINS.length || (origin && ALLOWED_ORIGINS.includes(origin))) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// Diagnostics
app.use((req, res, next) => {
  res.setHeader("X-App", "Bank-Account-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static UI
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// ===== Health =====
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    baseUrl: BASE_URL,
    rpId: RP_ID,
    origin: ORIGIN,
    allowedOrigins: ALLOWED_ORIGINS,
  });
});

// ===== Bank Accounts Proxy =====

// CREATE (POST /accounts)
app.post("/accounts", async (req, res) => {
  try {
    const { adharNumber, bankName, ...body } = req.body || {};
    const url = `${BASE_URL}/accounts?adharNumber=${encodeURIComponent(
      adharNumber || ""
    )}&bankName=${encodeURIComponent(bankName || "")}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {}),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET (GET /accounts/:id)
app.get("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(
      `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`,
      { headers: { Accept: "application/json" } }
    );
    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (PUT /accounts/:id)
app.put("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(
      `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(req.body || {}),
      }
    );
    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (DELETE /accounts/:id)
app.delete("/accounts/:id", async (req, res) => {
  try {
    const upstream = await fetch(
      `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`,
      { method: "DELETE", headers: { Accept: "application/json" } }
    );
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== WebAuthn (Passkeys) =====
const session = require("cookie-session");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

// cookie-session for challenge state
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET || "dev-secret-change-me"],
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
);

// In-memory user store (replace with DB for prod)
const users = new Map(); // Map<username, { id, credentials: [{id, publicKey, counter, transports?}] }>
const toB64U = (buf) => Buffer.from(buf).toString("base64url");

// Start registration
app.post("/webauthn/register/start", async (req, res) => {
  try {
    const { username, displayName } = req.body || {};
    if (!username) return res.status(400).json({ error: "username required" });

    let user = users.get(username);
    if (!user) {
      user = { id: toB64U(crypto.randomBytes(16)), credentials: [] };
      users.set(username, user);
    }

    const options = await generateRegistrationOptions({
      rpName: "Bank Account UI",
      rpID: RP_ID,
      userID: user.id,
      userName: username,
      userDisplayName: displayName || username,
      authenticatorSelection: {
        authenticatorAttachment: "platform", // biometric on this device
        residentKey: "preferred",
        userVerification: "required",
      },
      attestationType: "none",
      excludeCredentials: user.credentials.map((c) => ({
        id: Buffer.from(c.id, "base64url"),
        type: "public-key",
        transports: c.transports || ["internal"],
      })),
    });

    req.session.currentChallenge = options.challenge;
    req.session.username = username;
    res.json(options);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Finish registration
app.post("/webauthn/register/finish", async (req, res) => {
  try {
    const { username, ...registrationResponse } = req.body || {};
    if (!username) return res.status(400).json({ error: "username required" });

    const expectedChallenge = req.session.currentChallenge;
    if (!expectedChallenge)
      return res.status(400).json({ error: "no challenge in session" });

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo)
      return res.status(400).json({ error: "registration not verified" });

    const {
      credentialPublicKey,
      credentialID,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    const user = users.get(username);
    const newCred = {
      id: toB64U(credentialID),
      publicKey: toB64U(credentialPublicKey),
      counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    };
    if (!user.credentials.find((c) => c.id === newCred.id)) {
      user.credentials.push(newCred);
    }

    req.session.currentChallenge = undefined;
    res.json({ verified: true, credentials: user.credentials.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start authentication
app.post("/webauthn/authenticate/start", async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ error: "username required" });

    const user = users.get(username);
    if (!user || !user.credentials.length)
      return res.status(404).json({ error: "user or credentials not found" });

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "required",
      allowCredentials: user.credentials.map((c) => ({
        id: Buffer.from(c.id, "base64url"),
        type: "public-key",
        transports: ["internal"],
      })),
    });

    req.session.currentChallenge = options.challenge;
    req.session.username = username;
    res.json(options);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Finish authentication
app.post("/webauthn/authenticate/finish", async (req, res) => {
  try {
    const { username, ...authenticationResponse } = req.body || {};
    if (!username) return res.status(400).json({ error: "username required" });

    const expectedChallenge = req.session.currentChallenge;
    const user = users.get(username);
    if (!expectedChallenge || !user)
      return res.status(400).json({ error: "bad session" });

    const credID = authenticationResponse.rawId || authenticationResponse.id;
    const cred = user.credentials.find((c) => c.id === credID);
    if (!cred) return res.status(404).json({ error: "credential not found" });

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialPublicKey: Buffer.from(cred.publicKey, "base64url"),
        credentialID: Buffer.from(cred.id, "base64url"),
        counter: cred.counter,
      },
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;
    if (!verified || !authenticationInfo)
      return res.status(401).json({ error: "authentication not verified" });

    cred.counter = authenticationInfo.newCounter;

    req.session.loggedIn = true;
    req.session.user = username;
    req.session.currentChallenge = undefined;

    res.json({ verified: true, user: username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Logout (clear session)
app.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// Root → UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not Found", path: req.path }));

app.listen(PORT, () => {
  console.log(`Bank Account UI running on port ${PORT}`);
});
``
