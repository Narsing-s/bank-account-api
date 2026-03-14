const result=document.getElementById("result")

async function createAccount(){

const body={

adharNumber:document.getElementById("aadhaar").value,

bankName:document.getElementById("bank").value,

FullName:document.getElementById("name").value,

email:document.getElementById("email").value,

dateOfBirth:document.getElementById("dob").value,

mobileNumber:document.getElementById("mobile").value

}

const res=await fetch("/accounts",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(body)

})

const data=await res.text()

result.innerText=data

}

async function getAccount(){

const id=document.getElementById("getAcct").value

const res=await fetch(`/accounts/${id}`)

const data=await res.text()

result.innerText=data

}

async function updateAccount(){

const id=document.getElementById("updAcct").value

const body={

FullName:document.getElementById("updName").value

}

const res=await fetch(`/accounts/${id}`,{

method:"PUT",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(body)

})

const data=await res.text()

result.innerText=data

}

async function deleteAccount(){

const id=document.getElementById("delAcct").value

const res=await fetch(`/accounts/${id}`,{

method:"DELETE"

})

const data=await res.text()

result.innerText=data

}
