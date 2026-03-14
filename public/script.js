let chart

document.getElementById("theme").addEventListener("change",(e)=>{
document.body.className=e.target.value
})


function convertDOB(d){

const y=d.substring(0,4)
const m=d.substring(4,6)
const day=d.substring(6,8)

return `${y}-${m}-${day}`

}


function toast(msg){

const t=document.getElementById("toast")

t.innerText=msg
t.className="show"

setTimeout(()=>{

t.className=""

},3000)

}



let searchHistory=JSON.parse(localStorage.getItem("accounts"))||[]


function saveHistory(acc){

if(!searchHistory.includes(acc)){

searchHistory.unshift(acc)

if(searchHistory.length>5){

searchHistory.pop()

}

localStorage.setItem("accounts",JSON.stringify(searchHistory))

}

}



function showSuggestions(){

const input=document.getElementById("getAcc").value

const box=document.getElementById("suggestions")

box.innerHTML=""

searchHistory
.filter(a=>a.startsWith(input))
.forEach(acc=>{

const div=document.createElement("div")

div.innerText=acc

div.onclick=()=>{

document.getElementById("getAcc").value=acc
box.innerHTML=""

}

box.appendChild(div)

})

}



function renderChart(data){

const acc=data.account_data||{}

const values=[

data.accountNumber?.length||0,
acc.MOBILENUMBER?.length||0,
acc.EMAIL?.length||0

]

const ctx=document.getElementById("accountChart")

if(chart){

chart.destroy()

}

chart=new Chart(ctx,{

type:"bar",

data:{

labels:["Account","Mobile","Email"],

datasets:[{

label:"Account Data Stats",

data:values

}]

}

})

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
<td>${acc.FULLNAME||""}</td>
<td>${acc.MOBILENUMBER||""}</td>
<td>${acc.EMAIL||""}</td>
<td>${acc.ADDRESS||""}</td>

</tr>

</table>

<button onclick="copyAcc('${data.accountNumber}')">
Copy Account
</button>

`

renderChart(data)

}



async function getAccount(){

const acc=document.getElementById("getAcc").value

if(acc.length!==12){

toast("Account must be 12 digits")
return

}

saveHistory(acc)

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

renderTable(data)

toast("Account Loaded")

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

toast("Account Created")

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

toast("Account Updated")

}



async function deleteAccount(){

const res=await fetch(`/deleteAccount/${deleteAcc.value}`,{

method:"DELETE"

})

const data=await res.json()

deleteResult.innerText=JSON.stringify(data,null,2)

toast("Account Deleted")

}



function copyAcc(a){

navigator.clipboard.writeText(a)

toast("Account Copied")

}
