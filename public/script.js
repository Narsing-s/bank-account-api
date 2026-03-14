let chart


async function checkAPI(){

const res=await fetch("/status")
const data=await res.json()

document.getElementById("apiStatus").innerText=data.status

}

checkAPI()



function convertDOB(d){

return `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`

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

<div class="chip"></div>

<h3>${acc.FullName||""}</h3>

<p>${data.accountNumber||""}</p>

<span>${acc.mobileNumber||""}</span>

</div>
`

}



function renderTable(data){

const acc=data.account_data||{}

document.getElementById("getResult").innerHTML=`

<table>

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

chart=new Chart(accountChart,{
type:"bar",
data:{
labels:["Account","Mobile","Email"],
datasets:[{data:values}]
}
})

}



async function getAccount(){

const acc=getAcc.value

const res=await fetch(`/getAccount/${acc}`)
const data=await res.json()

renderCard(data)
renderTable(data)
renderChart(data)

addTimeline("Account searched "+acc)

}



async function createAccount(){

const payload={

FullName:name.value,
dateOfBirth:convertDOB(dob.value),
mobileNumber:mobile.value,
email:email.value,
address:address.value,
adharNumber:adhar.value,
bankName:bank.value

}

const res=await fetch("/createAccount",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

createResult.innerText=JSON.stringify(data,null,2)

addTimeline("Account created")

}



async function updateAccount(){

const payload={

FullName:updateName.value,
email:updateAddress.value,
mobileNumber:updateMobile.value

}

const res=await fetch(`/updateAccount/${updateAcc.value}`,{

method:"PATCH",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

updateResult.innerText=JSON.stringify(data,null,2)

addTimeline("Account updated")

}



async function deleteAccount(){

const res=await fetch(`/deleteAccount/${deleteAcc.value}`,{

method:"DELETE"

})

const data=await res.json()

deleteResult.innerText=JSON.stringify(data,null,2)

addTimeline("Account deleted")

}
