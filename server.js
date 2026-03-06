const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const BASE_URL =
  "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";


// CREATE ACCOUNT
app.post("/accounts", async (req, res) => {
  try {
    const { adharNumber, bankName, ...body } = req.body;

    const response = await fetch(
      `${BASE_URL}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET ACCOUNT
app.get("/accounts/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE ACCOUNT
app.put("/accounts/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE ACCOUNT
app.delete("/accounts/:id", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/${req.params.id}`, {
      method: "DELETE",
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
