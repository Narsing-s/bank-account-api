// server.js
// A hardened Express proxy with proper CORS & preflight handling for CloudHub API.

const express = require("express");
const helmet = require("helmet");

// Prefer Node 18+ native fetch; fallback to node-fetch dynamic import if needed.
const getFetch = () => {
  if (typeof fetch === "function") return fetch;
  // eslint-disable-next-line no-shadow
  const fetchShim = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
  return fetchShim;
};
const f = getFetch();

const app = express();
app.use(helmet()); // sensible security headers (does NOT handle CORS)
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ==== Configuration (env driven) ====
const BASE_URL =
  process.env.BASE_URL ||
  "https://bank-account-proxy-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io";

// Set this to your front-end origin (e.g., GitHub Pages site)
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "https://narsing-s.github.io";

// Comma-separated list for allowed headers and methods if you need to extend
const ALLOWED_METHODS =
  process.env.ALLOWED_METHODS || "GET,POST,PUT,DELETE,OPTIONS";
const ALLOWED_HEADERS =
  process.env.ALLOWED_HEADERS ||
  "Content-Type, Authorization, X-Requested-With, X-Correlation-Id";
const EXPOSE_HEADERS =
  process.env.EXPOSE_HEADERS ||
  "Content-Type, X-Correlation-Id, X-Request-Id";
const ALLOW_CREDENTIALS =
  (process.env.ALLOW_CREDENTIALS || "false").toLowerCase() === "true";
const PREFLIGHT_MAX_AGE = process.env.PREFLIGHT_MAX_AGE || "86400";
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 15000);

// ===== CORS middleware (manual, fine-grained control) =====
app.use((req, res, next) => {
  // Always set CORS headers on all responses
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Vary", "Origin"); // good practice when origin is dynamic
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.setHeader("Access-Control-Expose-Headers", EXPOSE_HEADERS);
  res.setHeader("Access-Control-Max-Age", PREFLIGHT_MAX_AGE);
  if (ALLOW_CREDENTIALS) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Short-circuit preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  return next();
});

// ===== Utilities =====
const buildAbort = (ms) => {
  // AbortController is available in Node 18+
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timeout) };
};

// Safely parse JSON; fallback to text
async function parseUpstreamBody(response) {
  const contentType = response.headers.get("content-type") || "";
  // Try JSON if content-type hints at it
  if (contentType.includes("application/json")) {
    try {
      return { body: await response.json(), isJson: true, contentType };
    } catch (_) {
      // Fall through to text
    }
  }
  const text = await response.text();
  return { body: text, isJson: false, contentType };
}

// Forward select headers to upstream
function forwardHeaders(req) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Forward Authorization if present (avoids putting secrets on client)
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  // Pass correlation if present (helpful for tracing between proxy & CloudHub)
  if (req.headers["x-correlation-id"]) {
    headers["X-Correlation-Id"] = req.headers["x-correlation-id"];
  }

  return headers;
}

// ===== Health check =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", upstream: BASE_URL });
});

// ===== CREATE ACCOUNT =====
app.post("/accounts", async (req, res) => {
  const { adharNumber, bankName, ...body } = req.body || {};
  if (!adharNumber || !bankName) {
    return res
      .status(400)
      .json({ error: "adharNumber and bankName are required query fields." });
  }

  const url = `${BASE_URL}/accounts?adharNumber=${encodeURIComponent(
    adharNumber
  )}&bankName=${encodeURIComponent(bankName)}`;

  const { signal, cancel } = buildAbort(UPSTREAM_TIMEOUT_MS);
  try {
    const response = await (await f)(url, {
      method: "POST",
      headers: forwardHeaders(req),
      body: JSON.stringify(body ?? {}),
      signal,
    });

    // Bubble up correlation id if upstream provides one
    const corrId = response.headers.get("x-correlation-id");
    if (corrId) res.setHeader("X-Correlation-Id", corrId);

    const { body: upstreamBody, isJson, contentType } = await parseUpstreamBody(
      response
    );

    // mirror status and content-type
    res.status(response.status);
    res.setHeader("Content-Type", contentType || (isJson ? "application/json" : "text/plain"));

    return res.send(isJson ? upstreamBody : upstreamBody);
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 500;
    return res.status(status).json({ error: err.message || "Upstream error" });
  } finally {
    cancel();
  }
});

// ===== GET ACCOUNT =====
app.get("/accounts/:id", async (req, res) => {
  const url = `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`;

  const { signal, cancel } = buildAbort(UPSTREAM_TIMEOUT_MS);
  try {
    const response = await (await f)(url, {
      method: "GET",
      headers: forwardHeaders(req),
      signal,
    });

    const corrId = response.headers.get("x-correlation-id");
    if (corrId) res.setHeader("X-Correlation-Id", corrId);

    const { body: upstreamBody, isJson, contentType } = await parseUpstreamBody(
      response
    );
    res.status(response.status);
    res.setHeader("Content-Type", contentType || (isJson ? "application/json" : "text/plain"));
    return res.send(isJson ? upstreamBody : upstreamBody);
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 500;
    return res.status(status).json({ error: err.message || "Upstream error" });
  } finally {
    cancel();
  }
});

// ===== UPDATE ACCOUNT =====
app.put("/accounts/:id", async (req, res) => {
  const url = `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`;

  const { signal, cancel } = buildAbort(UPSTREAM_TIMEOUT_MS);
  try {
    const response = await (await f)(url, {
      method: "PUT",
      headers: forwardHeaders(req),
      body: JSON.stringify(req.body || {}),
      signal,
    });

    const corrId = response.headers.get("x-correlation-id");
    if (corrId) res.setHeader("X-Correlation-Id", corrId);

    const { body: upstreamBody, isJson, contentType } = await parseUpstreamBody(
      response
    );
    res.status(response.status);
    res.setHeader("Content-Type", contentType || (isJson ? "application/json" : "text/plain"));
    return res.send(isJson ? upstreamBody : upstreamBody);
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 500;
    return res.status(status).json({ error: err.message || "Upstream error" });
  } finally {
    cancel();
  }
});

// ===== DELETE ACCOUNT =====
app.delete("/accounts/:id", async (req, res) => {
  const url = `${BASE_URL}/accounts/${encodeURIComponent(req.params.id)}`;

  const { signal, cancel } = buildAbort(UPSTREAM_TIMEOUT_MS);
  try {
    const response = await (await f)(url, {
      method: "DELETE",
      headers: forwardHeaders(req),
      signal,
    });

    const corrId = response.headers.get("x-correlation-id");
    if (corrId) res.setHeader("X-Correlation-Id", corrId);

    // DELETE may return empty body
    const { body: upstreamBody, isJson, contentType } = await parseUpstreamBody(
      response
    );
    res.status(response.status);
    if (contentType) res.setHeader("Content-Type", contentType);
    return res.send(isJson ? upstreamBody : upstreamBody);
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 500;
    return res.status(status).json({ error: err.message || "Upstream error" });
  } finally {
    cancel();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upstream: ${BASE_URL}`);
  console.log(`Allowed Origin: ${ALLOWED_ORIGIN}`);
});
