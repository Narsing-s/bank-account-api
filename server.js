const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MuleSoft CloudHub API
const BASE_URL = "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api/";

// Root route
app.get("/", (req, res) => {
  res.send("Bank Account Proxy API Running 🚀");
});

// Create Account
app.post("/createAccount", async (req, res) => {
  try {
    const requestBody = req.body;

    if (!requestBody) {
      return res.status(400).json({
        error: "Request body is required"
      });
    }

    const response = await fetch(`${BASE_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json().catch(() => null);

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
