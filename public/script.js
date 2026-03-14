let chart

function convertDOB(d){

if(!d || d.length!==8) return ""

return `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`

}

function toast(msg){

const t=document.getElementById("toast")

t.innerText=msg
t.style.display="block"

setTimeout(()=>t.style.display="none",3000)

}

function addTimeline(action){

const li=document.createElement("li")

li.innerText=new Date().toLocaleTimeString()+" - "+action

document.getElementById("timeline").prepend(li)

}

function renderCard(data){

const acc=data.account_data||{}

document.getElementById("bankCard").innerHTML=

`
<div style="padding:15px;background:linear-gradient(45deg,#ff4fa3,#0066ff);border-radius:10px">

<h3>${acc.FullName||""}</h3>

<p>Account: ${data.accountNumber||""}</p>

<p>${acc.mobileNumber||""}</p>

</div>
`

}

function renderTable(data){

const acc=data.account_data||{}

document.getElementById("getResult").innerHTML=

`
<table style="width:100%;background:white;color:black">

<tr>
<th>Account</th>
<th>Name</th>
<th>Mobile</th>
<th>Email</th>
<th>Address</th>
</tr>

<tr>

<td>${data.accountNumber||""}</td>
<td>${acc.FullName||""}</td>
<td>${acc.mobileNumber||""}</td>
<td>${acc.email||""}</td>
<td>${acc.address||""}</td>

</tr>

</table>
`

}

function renderChart(data){

const acc=data.account_data||{}

const values=[

(data.accountNumber||"").length,
(acc.mobileNumber||"").length,
(acc.email||"").length

]

if(chart) chart.destroy()

chart=new Chart(document.getElementById("accountChart"),{

type:"bar",

data:{

labels:["Account","Mobile","Email"],

datasets:[{data:values}]

}

})

}

async function createAccount(){

if(!document.getElementById("name").value){

toast("Full Name required")
return

}

const payload={

FullName:document.getElementById("name").value,
dateOfBirth:convertDOB(document.getElementById("dob").value),
mobileNumber:document.getElementById("mobile").value,
email:document.getElementById("email").value,
address:document.getElementById("address").value,
adharNumber:document.getElementById("adhar").value,
bankName:document.getElementById("bank").value

}

const res=await fetch("/createAccount",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("createResult").innerText=
JSON.stringify(data,null,2)

toast("Account Created")

addTimeline("Account created")

}

async function getAccount(){

const acc=document.getElementById("getAcc").value

if(acc.length!==12){

toast("Account must be 12 digits")
return

}

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

renderCard(data)
renderTable(data)
renderChart(data)

addTimeline("Account searched")

}

async function updateAccount(){

const acc=document.getElementById("updateAcc").value

const payload={

FullName:document.getElementById("updateName").value,
email:document.getElementById("updateAddress").value,
mobileNumber:document.getElementById("updateMobile").value

}

const res=await fetch(`/updateAccount/${acc}`,{

method:"PATCH",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("updateResult").innerText=
JSON.stringify(data,null,2)

toast("Account Updated")

addTimeline("Account updated")

}

async function deleteAccount(){

const acc=document.getElementById("deleteAcc").value

const res=await fetch(`/deleteAccount/${acc}`,{

method:"DELETE"

})

const data=await res.json()

document.getElementById("deleteResult").innerText=
JSON.stringify(data,null,2)

toast("Account Deleted")

addTimeline("Account deleted")

}

function toggleTheme(){

document.body.classList.toggle("dark")

}

function changeLanguage(){

const lang=document.getElementById("language").value

if(lang==="te") document.getElementById("title").innerText="బ్యాంక్ డాష్‌బోర్డ్"

if(lang==="hi") document.getElementById("title").innerText="बैंक डैशबोर्ड"

if(lang==="en") document.getElementById("title").innerText="🏦 Bank Dashboard"

}
