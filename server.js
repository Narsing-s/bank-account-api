const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const BASE_URL =
  "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io";

// CREATE ACCOUNT
app.post("/createAccount", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      details: error.message
    });
  }
});

// GET ACCOUNT
app.get("/accounts/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`);

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ACCOUNT
app.delete("/accounts/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
      method: "DELETE"
    });

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
