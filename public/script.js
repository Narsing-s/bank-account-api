let chart

/* ---------- API STATUS ---------- */

async function checkAPI(){

const res = await fetch("/status")
const data = await res.json()

document.getElementById("apiStatus").innerText = data.status

}

checkAPI()



/* ---------- DOB FORMAT ---------- */

function convertDOB(d){

if(!d || d.length!==8){

toast("DOB must be YYYYMMDD")
return ""

}

const y=d.substring(0,4)
const m=d.substring(4,6)
const day=d.substring(6,8)

return `${y}-${m}-${day}`

}



/* ---------- TOAST ---------- */

function toast(msg){

const t=document.getElementById("toast")

t.innerText=msg
t.className="show"

setTimeout(()=>{

t.className=""

},3000)

}



/* ---------- TIMELINE ---------- */

function addTimeline(action){

const li=document.createElement("li")

li.innerText=new Date().toLocaleTimeString()+" - "+action

document.getElementById("timeline").prepend(li)

}



/* ---------- ACCOUNT CARD ---------- */

function renderCard(data){

const acc=data.account_data||{}

document.getElementById("bankCard").innerHTML=

`
<div class="bankCard">

<div class="chip"></div>

<h3>${acc.FULLNAME || ""}</h3>

<p>${data.accountNumber || ""}</p>

<span>${acc.MOBILENUMBER || ""}</span>

</div>
`

}



/* ---------- CHART ---------- */

function renderChart(data){

const acc=data.account_data||{}

const values=[

(data.accountNumber || "").length,
(acc.MOBILENUMBER || "").length,
(acc.EMAIL || "").length

]

const ctx=document.getElementById("accountChart")

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:"bar",
data:{
labels:["Account","Mobile","Email"],
datasets:[{
label:"Account Data",
data:values
}]
}
})

}



/* ---------- CREATE ACCOUNT ---------- */

async function createAccount(){

const payload={

FullName: document.getElementById("name").value,
dateOfBirth: convertDOB(document.getElementById("dob").value),
mobileNumber: document.getElementById("mobile").value,
email: document.getElementById("email").value,
address: document.getElementById("address").value,
adharNumber: document.getElementById("adhar").value,
bankName: document.getElementById("bank").value

}

if(!payload.FullName){

toast("FullName is required")
return

}

try{

const res = await fetch("/createAccount",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data = await res.json()

document.getElementById("createResult").innerText =
JSON.stringify(data,null,2)

addTimeline("Account created")

toast("Account Created")

}catch(e){

toast("Create failed")

}

}



/* ---------- GET ACCOUNT ---------- */

async function getAccount(){

const acc=document.getElementById("getAcc").value

if(acc.length!==12){

toast("Account must be 12 digits")
return

}

try{

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

renderCard(data)

renderChart(data)

addTimeline("Account searched "+acc)

toast("Account Loaded")

}catch(e){

toast("Search failed")

}

}



/* ---------- UPDATE ACCOUNT ---------- */

async function updateAccount(){

const acc=document.getElementById("updateAcc").value

const payload={

FullName: document.getElementById("updateName").value,
email: document.getElementById("updateAddress").value,
mobileNumber: document.getElementById("updateMobile").value

}

try{

const res=await fetch(`/updateAccount/${acc}`,{

method:"PATCH",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("updateResult").innerText=
JSON.stringify(data,null,2)

addTimeline("Account updated "+acc)

toast("Account Updated")

}catch(e){

toast("Update failed")

}

}



/* ---------- DELETE ACCOUNT ---------- */

async function deleteAccount(){

const acc=document.getElementById("deleteAcc").value

try{

const res=await fetch(`/deleteAccount/${acc}`,{

method:"DELETE"

})

const data=await res.json()

document.getElementById("deleteResult").innerText=
JSON.stringify(data,null,2)

addTimeline("Account deleted "+acc)

toast("Account Deleted")

}catch(e){

toast("Delete failed")

}

}
