const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Your Mule API URL
const BASE_URL = "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io";

app.post("/createAccount", async (req, res) => {
  try {

    const response = await fetch(`${BASE_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
