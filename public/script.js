document.getElementById("themeSelect").addEventListener("change",(e)=>{
document.body.className=e.target.value
})


function convertDOB(dob){

const y=dob.substring(0,4)
const m=dob.substring(4,6)
const d=dob.substring(6,8)

return `${y}-${m}-${d}`

}


async function createAccount(){

const bank=document.getElementById("bank").value

if(!bank){
alert("Select bank")
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
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("createResult").innerText=
JSON.stringify(data,null,2)

}



async function getAccount(){

const acc=document.getElementById("getAcc").value

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

document.getElementById("getResult").innerText=
JSON.stringify(data,null,2)

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
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("updateResult").innerText=
JSON.stringify(data,null,2)

}



async function deleteAccount(){

const acc=document.getElementById("deleteAcc").value

const res=await fetch(`/deleteAccount/${acc}`,{

method:"DELETE"

})

const data=await res.json()

document.getElementById("deleteResult").innerText=
JSON.stringify(data,null,2)

}
