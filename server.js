const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const BASE_URL = "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

app.post("/createAccount", async (req, res) => {
  try {

    const response = await fetch(`${BASE_URL}/accounts?adharNumber=${req.body.adharNumber}&bankName=${req.body.bankName}`, {
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

app.get("/", (req,res)=>{
  res.send("Bank API Proxy Running 🚀")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
