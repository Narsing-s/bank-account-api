const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))

const API = "https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api"


// CREATE ACCOUNT
app.post("/createAccount", async (req, res) => {

  try {

    const { FullName, dateOfBirth, mobileNumber, email, address, adharNumber, bankName } = req.body

    console.log("Create request:", req.body)

    const response = await axios.post(
      `${API}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`,
      {
        FullName,
        dateOfBirth,
        mobileNumber,
        email,
        address
      }
    )

    res.json(response.data)

  } catch (err) {

    console.log("Create error:", err.response?.data)
    res.status(500).json(err.response?.data || err.message)

  }

})


// GET ACCOUNT
app.get("/getAccount/:id", async (req, res) => {

  try {

    console.log("Searching:", req.params.id)

    const response = await axios.get(`${API}/accounts/${req.params.id}`)

    res.json(response.data)

  } catch (err) {

    console.log("Get error:", err.response?.data)
    res.status(500).json(err.response?.data || err.message)

  }

})


// UPDATE ACCOUNT
app.patch("/updateAccount/:id", async (req, res) => {

  try {

    const id = req.params.id
    const { FullName, email, mobileNumber } = req.body

    console.log("Update request:", id, req.body)

    const payload = {}

    if (FullName) payload.FullName = FullName
    if (email) payload.email = email
    if (mobileNumber) payload.mobileNumber = mobileNumber

    const response = await axios.patch(
      `${API}/accounts/${id}`,
      payload
    )

    res.json(response.data)

  } catch (err) {

    console.log("Update error:", err.response?.data)
    res.status(500).json(err.response?.data || err.message)

  }

})


// DELETE ACCOUNT
app.delete("/deleteAccount/:id", async (req, res) => {

  try {

    console.log("Deleting:", req.params.id)

    const response = await axios.delete(`${API}/accounts/${req.params.id}`)

    res.json(response.data)

  } catch (err) {

    console.log("Delete error:", err.response?.data)
    res.status(500).json(err.response?.data || err.message)

  }

})


app.listen(3000, () => {
  console.log("Server running → http://localhost:3000")
})
