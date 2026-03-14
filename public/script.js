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



function toast(msg){

const t=document.getElementById("toast")

t.innerText=msg
t.className="show"

setTimeout(()=>{t.className=""},3000)

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

<h3>${acc.FULLNAME}</h3>

<p>${data.accountNumber}</p>

<span>${acc.MOBILENUMBER}</span>

</div>
`

}



function renderChart(data){

const acc=data.account_data||{}

const values=[

data.accountNumber.length,
acc.MOBILENUMBER.length,
acc.EMAIL.length

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

if(acc.length!==12){

toast("Account must be 12 digits")
return

}

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

renderCard(data)

renderChart(data)

addTimeline("Account searched "+acc)

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

await fetch("/createAccount",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

addTimeline("Account created")

toast("Account Created")

}
