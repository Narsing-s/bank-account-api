let chart

function convertDOB(d){
if(!d || d.length!==8) return ""
return `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`
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

}


async function getAccount(){

const acc=getAcc.value

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

const accData=data.account_data||{}

bankCard.innerHTML=`

<div class="bankCard">

<h3>${accData.FullName}</h3>
<p>Account: ${data.accountNumber}</p>
<p>${accData.mobileNumber}</p>
<p>${accData.email}</p>

</div>
`

getResult.innerHTML=`<pre>${JSON.stringify(data,null,2)}</pre>`

renderChart(data)

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

type:"doughnut",

data:{
labels:["Account","Mobile","Email"],
datasets:[{data:values}]
}

})

}


async function updateAccount(){

const acc=updateAcc.value

const payload={}

if(updateName.value) payload.FullName=updateName.value
if(updateEmail.value) payload.email=updateEmail.value
if(updateMobile.value) payload.mobileNumber=updateMobile.value

const res=await fetch(`/updateAccount/${acc}`,{

method:"PATCH",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

const data=await res.json()

updateResult.innerText=JSON.stringify(data,null,2)

}


async function deleteAccount(){

const acc=deleteAcc.value

const res=await fetch(`/deleteAccount/${acc}`,{

method:"DELETE"

})

const data=await res.json()

deleteResult.innerText=JSON.stringify(data,null,2)

}


function setTheme(theme){

document.body.className="theme-"+theme

}
