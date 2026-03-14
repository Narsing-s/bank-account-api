const express=require("express")
const axios=require("axios")
const cors=require("cors")

const app=express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))

const API="https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api"


app.post("/createAccount",async(req,res)=>{

try{

const {FullName,dateOfBirth,mobileNumber,email,address,adharNumber,bankName}=req.body

const response=await axios.post(
`${API}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`,
{
FullName,
dateOfBirth,
mobileNumber,
email,
address
})

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})


app.get("/getAccount/:id",async(req,res)=>{

try{

const response=await axios.get(`${API}/accounts/${req.params.id}`)

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})


app.patch("/updateAccount/:id",async(req,res)=>{

try{

const {FullName,email,mobileNumber}=req.body

const response=await axios.patch(`${API}/accounts/${req.params.id}`,{

FullName,
ADDRESS:email,
MOBILENUMBER:mobileNumber

})

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})


app.delete("/deleteAccount/:id",async(req,res)=>{

try{

const response=await axios.delete(`${API}/accounts/${req.params.id}`)

res.json(response.data)

}catch(err){

res.status(500).json(err.response?.data||err.message)

}

})


app.listen(3000,()=>{

console.log("UI running at http://localhost:3000")

})
