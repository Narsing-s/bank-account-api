const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL =
"https://bank-account-api-jik9pb.5sc6y6-1.usa-e2.cloudhub.io/api";

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.get("/health",(req,res)=>{
res.json({status:"ok"});
});

/* CREATE */
app.post("/accounts",async(req,res)=>{
try{

const {adharNumber,bankName,...body}=req.body;

const url=`${BASE_URL}/accounts?adharNumber=${adharNumber}&bankName=${bankName}`;

const api=await fetch(url,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(body)
});

const data=await api.text();

res.status(api.status).send(data);

}catch(e){
res.status(500).json({error:e.message});
}
});

/* GET */

app.get("/accounts/:id",async(req,res)=>{

const api=await fetch(`${BASE_URL}/accounts/${req.params.id}`);

const data=await api.text();

res.status(api.status).send(data);

});

/* UPDATE */

app.put("/accounts/:id",async(req,res)=>{

const api=await fetch(`${BASE_URL}/accounts/${req.params.id}`,{

method:"PUT",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(req.body)

});

const data=await api.text();

res.status(api.status).send(data);

});

/* DELETE */

app.delete("/accounts/:id",async(req,res)=>{

const api=await fetch(`${BASE_URL}/accounts/${req.params.id}`,{

method:"DELETE"

});

const data=await api.text();

res.status(api.status).send(data);

});

app.listen(PORT,()=>{

console.log("Server running on port "+PORT);

});
