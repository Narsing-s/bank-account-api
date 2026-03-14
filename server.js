const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

/* FIXED BASE URL */
const BASE_URL =
  process.env.BASE_URL ||
  "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* CREATE */
app.post("/accounts", async (req, res) => {
  try {
    const { adharNumber, bankName, ...body } = req.body;

    const url =
      `${BASE_URL}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await upstream.text();
    res.status(upstream.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET */
app.get("/accounts/:id", async (req, res) => {
  const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`);
  const data = await response.text();
  res.status(response.status).send(data);
});

/* UPDATE */
app.put("/accounts/:id", async (req, res) => {
  const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });

  const data = await response.text();
  res.status(response.status).send(data);
});

/* DELETE */
app.delete("/accounts/:id", async (req, res) => {
  const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
    method: "DELETE"
  });

  const data = await response.text();
  res.status(response.status).send(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
