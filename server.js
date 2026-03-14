const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

// Change this to your Mule base URL
// e.g. http://localhost:8081  or  https://your-domain/mule
const API_BASE = process.env.API_BASE || "http://localhost:8081";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---- Proxy endpoints (map UI calls to Mule API) ----
// If your RAML uses REST routes, adjust here.
// Option A (your current UI semantics):
app.post("/api/createAccount", (req, res) => proxy("POST", "/createAccount", req, res));
app.get("/api/getAccount/:id", (req, res) => proxy("GET", `/getAccount/${encodeURIComponent(req.params.id)}`, req, res));
app.patch("/api/updateAccount/:id", (req, res) => proxy("PATCH", `/updateAccount/${encodeURIComponent(req.params.id)}`, req, res));
app.delete("/api/deleteAccount/:id", (req, res) => proxy("DELETE", `/deleteAccount/${encodeURIComponent(req.params.id)}`, req, res));

// Option B (if RAML is RESTy — uncomment and use these instead):
// app.post("/api/accounts", (req, res) => proxy("POST", "/accounts", req, res));
// app.get("/api/accounts/:id", (req, res) => proxy("GET", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
// app.patch("/api/accounts/:id", (req, res) => proxy("PATCH", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
// app.delete("/api/accounts/:id", (req, res) => proxy("DELETE", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));

async function proxy(method, path, req, res) {
  try {
    const url = `${API_BASE}${path}`;
    const ax = await axios({
      method,
      url,
      headers: { "Content-Type": "application/json", ...(req.headers || {}) },
      data: ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined,
      validateStatus: () => true // forward status as-is
    });
    res.status(ax.status).json(ax.data);
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(502).json({ error: "Bad Gateway", message: e.message });
    return;
  }
}

app.listen(PORT, () => {
  console.log(`UI running on http://localhost:${PORT}`);
  console.log(`Proxying API to ${API_BASE}`);
});
