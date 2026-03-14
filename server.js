const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Your CloudHub base (already includes /api from your Mule listener path)
const API_BASE = process.env.API_BASE || "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

async function proxy(method, path, req, res) {
  try {
    const qs = new URLSearchParams(req.query || {}).toString();
    const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

    const fwdHeaders = { ...req.headers };
    delete fwdHeaders.host;
    delete fwdHeaders["content-length"];
    fwdHeaders["content-type"] = "application/json";

    const ax = await axios({
      method,
      url,
      headers: fwdHeaders,
      data: ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined,
      timeout: 30000,
      validateStatus: () => true
    });

    console.log(`[UPSTREAM] ${method} ${url} -> ${ax.status}`);

    if (typeof ax.data === "object") {
      res.status(ax.status).json(ax.data);
    } else {
      res.status(ax.status).send(ax.data);
    }
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(502).json({ error: "Bad Gateway", message: e.message });
  }
}

/** === RESTful routes (align with RAML) === */
app.post("/api/accounts", (req, res) => proxy("POST", "/accounts", req, res));
app.get("/api/accounts/:id", (req, res) => proxy("GET", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
app.patch("/api/accounts/:id", (req, res) => proxy("PATCH", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
app.delete("/api/accounts/:id", (req, res) => proxy("DELETE", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));

// Local health
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now(), target: API_BASE }));

app.listen(PORT, () => {
  console.log(`UI running on http://localhost:${PORT}`);
  console.log(`Proxying API to ${API_BASE}`);
});
