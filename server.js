const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// MuleSoft API Base URL
const BASE_URL =
  "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

// CREATE ACCOUNT
app.post("/createAccount", async (req, res) => {
  try {
    const { adharNumber, bankName, body } = req.body;

    const response = await fetch(
      `${BASE_URL}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ACCOUNT
app.get("/getAccount/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ACCOUNT
app.put("/updateAccount/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
