let chart


function convertDOB(d){

if(!d || d.length!==8) return ""

return `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`

}


async function updateAccount(){

const acc=document.getElementById("updateAcc").value

const payload={}

const name=document.getElementById("updateName").value
const email=document.getElementById("updateEmail").value
const mobile=document.getElementById("updateMobile").value

if(name) payload.FullName=name
if(email) payload.email=email
if(mobile) payload.mobileNumber=mobile

const res=await fetch(`/updateAccount/${acc}`,{

method:"PATCH",
headers:{"Content-Type":"application/json"},
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


function setTheme(theme){

document.body.className="theme-"+theme

}
