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



async function createAccount(){

const bank=document.getElementById("bank").value

if(!bank){

toast("Select bank")

return

}

const payload={

FullName:document.getElementById("name").value,

dateOfBirth:convertDOB(document.getElementById("dob").value),

mobileNumber:document.getElementById("mobile").value,

email:document.getElementById("email").value,

address:document.getElementById("address").value,

adharNumber:document.getElementById("adhar").value,

bankName:bank

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

}



function renderTable(d){

document.getElementById("getResult").innerHTML=

`
<table>

<tr>
<th>Account</th>
<th>Name</th>
<th>Mobile</th>
<th>Email</th>
<th>Address</th>
</tr>

<tr>

<td>${d.accountNumber}</td>
<td>${d.FULLNAME||d.FullName}</td>
<td>${d.MOBILENUMBER}</td>
<td>${d.EMAIL}</td>
<td>${d.ADDRESS}</td>

</tr>

</table>

<button onclick="copyAcc('${d.accountNumber}')">Copy Account</button>

`

}


async function getAccount(){

const acc=document.getElementById("getAcc").value

if(acc.length!==12){

toast("Account must be 12 digits")

return

}

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

renderTable(data)

toast("Account Loaded")

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

}



function copyAcc(a){

navigator.clipboard.writeText(a)

toast("Account Copied")

}
