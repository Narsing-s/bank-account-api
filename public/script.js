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
<div class="bankCard">

<h3>${acc.FullName||""}</h3>

<p>Account: ${data.accountNumber||""}</p>

<p>${acc.mobileNumber||""}</p>

<p>${acc.email||""}</p>

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
(acc.email||"").length,
(acc.address||"").length

]

if(chart) chart.destroy()

chart=new Chart(document.getElementById("accountChart"),{

type:"doughnut",

data:{
labels:["Account","Mobile","Email","Address"],

datasets:[{data:values}]
}

})

}

async function createAccount(){

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

function setTheme(theme){

document.body.className="theme-"+theme

}
