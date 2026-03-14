async function createAccount(){

if(!name.value){

toast("Full Name required")
return

}

const payload={

FullName:name.value.trim(),
dateOfBirth:convertDOB(dob.value),
mobileNumber:mobile.value.trim(),
email:email.value.trim(),
address:address.value.trim(),
adharNumber:adhar.value.trim(),
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

addTimeline("Account created")

}
