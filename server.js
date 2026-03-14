const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))

const MULE_API = "http://localhost:8081/api"


// CREATE ACCOUNT
app.post("/createAccount", async (req,res)=>{

try{

const {FullName,dateOfBirth,mobileNumber,email,address,adharNumber,bankName}=req.body

const response=await axios.post(
`${MULE_API}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`,
{
FullName,
dateOfBirth,
mobileNumber,
email,
address
})

res.json(response.data)

}catch(err){
res.status(500).json(err.response?.data || err.message)
}

})



// GET ACCOUNT
app.get("/getAccount/:accountNumber", async (req,res)=>{

try{

const response=await axios.get(
`${MULE_API}/accounts/${req.params.accountNumber}`
)

res.json(response.data)

}catch(err){
res.status(500).json(err.response?.data || err.message)
}

})



// UPDATE ACCOUNT
app.patch("/updateAccount/:accountNumber", async (req,res)=>{

try{

const {FullName,email,mobileNumber}=req.body

const response=await axios.patch(
`${MULE_API}/accounts/${req.params.accountNumber}`,
{
FullName,
ADDRESS:email,
MOBILENUMBER:mobileNumber
})

res.json(response.data)

}catch(err){
res.status(500).json(err.response?.data || err.message)
}

})



// DELETE ACCOUNT
app.delete("/deleteAccount/:accountNumber", async (req,res)=>{

try{

const response=await axios.delete(
`${MULE_API}/accounts/${req.params.accountNumber}`
)

res.json(response.data)

}catch(err){
res.status(500).json(err.response?.data || err.message)
}

})


app.listen(3000,()=>{
console.log("Server running at http://localhost:3000")
})
