const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Your CloudHub base (includes /api at the end)
const API_BASE = process.env.API_BASE || "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---- Proxy endpoints (map UI calls to Mule API) ----
// These map to: https://.../api/createAccount, /getAccount/:id, etc.
app.post("/api/createAccount", (req, res) => proxy("POST", "/createAccount", req, res));
app.get("/api/getAccount/:id", (req, res) => proxy("GET", `/getAccount/${encodeURIComponent(req.params.id)}`, req, res));
app.patch("/api/updateAccount/:id", (req, res) => proxy("PATCH", `/updateAccount/${encodeURIComponent(req.params.id)}`, req, res));
app.delete("/api/deleteAccount/:id", (req, res) => proxy("DELETE", `/deleteAccount/${encodeURIComponent(req.params.id)}`, req, res));

// If your RAML uses REST style (/accounts), comment the above and uncomment these:
// app.post("/api/accounts", (req, res) => proxy("POST", "/accounts", req, res));
// app.get("/api/accounts/:id", (req, res) => proxy("GET", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
// app.patch("/api/accounts/:id", (req, res) => proxy("PATCH", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));
// app.delete("/api/accounts/:id", (req, res) => proxy("DELETE", `/accounts/${encodeURIComponent(req.params.id)}`, req, res));

async function proxy(method, path, req, res) {
  try {
    const url = `${API_BASE}${path}`;

    // Forward headers safely; keep JSON content-type
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
      validateStatus: () => true // forward upstream status as-is
    });

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

app.listen(PORT, () => {
  console.log(`UI running on http://localhost:${PORT}`);
  console.log(`Proxying API to ${API_BASE}`);
});
``
