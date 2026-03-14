const express=require("express")
const axios=require("axios")
const cors=require("cors")

const app=express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))

const API="https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api"


// CREATE ACCOUNT
app.post("/createAccount",async(req,res)=>{

try{

const response=await axios.post(
`${API}/accounts?adharNumber=${req.body.adharNumber}&bankName=${req.body.bankName}`,
{
FullName:req.body.FullName,
dateOfBirth:req.body.dateOfBirth,
mobileNumber:req.body.mobileNumber,
email:req.body.email,
address:req.body.address
})

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})



// GET ACCOUNT
app.get("/getAccount/:id",async(req,res)=>{

try{

const response=await axios.get(`${API}/accounts/${req.params.id}`)

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})



// UPDATE ACCOUNT (FIXED)
app.patch("/updateAccount/:id",async(req,res)=>{

try{

const id=req.params.id

// first fetch existing account
const existing=await axios.get(`${API}/accounts/${id}`)

const acc=existing.data.account_data

const payload={

FullName:req.body.FullName || acc.FullName,
email:req.body.email || acc.email,
mobileNumber:req.body.mobileNumber || acc.mobileNumber

}

const response=await axios.patch(
`${API}/accounts/${id}`,
payload
)

res.json(response.data)

}catch(err){

console.log(err.response?.data)

res.status(500).json(err.response?.data||err.message)

}

})



// DELETE ACCOUNT
app.delete("/deleteAccount/:id",async(req,res)=>{

try{

const response=await axios.delete(`${API}/accounts/${req.params.id}`)

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})



app.listen(3000,()=>{

console.log("🚀 Server running → http://localhost:3000")

})
