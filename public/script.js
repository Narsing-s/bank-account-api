// THEME SWITCH

document.getElementById("themeSelect").addEventListener("change",(e)=>{

document.body.className=e.target.value

})



// LANGUAGE SWITCH

const translations={

en:{
title:"Bank Account Dashboard",
create:"Create Account",
get:"Get Account",
update:"Update Account",
delete:"Delete Account"
},

hi:{
title:"बैंक खाता डैशबोर्ड",
create:"खाता बनाएं",
get:"खाता देखें",
update:"खाता अपडेट करें",
delete:"खाता हटाएं"
},

te:{
title:"బ్యాంక్ ఖాతా డ్యాష్‌బోర్డ్",
create:"ఖాతా సృష్టించండి",
get:"ఖాతా చూడండి",
update:"ఖాతా నవీకరించండి",
delete:"ఖాతా తొలగించండి"
}

}



document.getElementById("langSelect").addEventListener("change",(e)=>{

const lang=e.target.value

document.getElementById("title").innerText=translations[lang].title
document.getElementById("createLabel").innerText=translations[lang].create
document.getElementById("getLabel").innerText=translations[lang].get
document.getElementById("updateLabel").innerText=translations[lang].update
document.getElementById("deleteLabel").innerText=translations[lang].delete

})



// DOB FORMAT CONVERSION (YYYYMMDD -> yyyy-MM-dd)

function convertDOB(dob){

const y=dob.substring(0,4)
const m=dob.substring(4,6)
const d=dob.substring(6,8)

return `${y}-${m}-${d}`

}



// CREATE ACCOUNT

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

headers:{'Content-Type':'application/json'},

body:JSON.stringify(payload)

})

const data=await res.json()

document.getElementById("createResult").innerText=
JSON.stringify(data,null,2)

}



// GET ACCOUNT

async function getAccount(){

const acc=document.getElementById("getAcc").value

const res=await fetch(`/getAccount/${acc}`)

const data=await res.json()

document.getElementById("getResult").innerText=
JSON.stringify(data,null,2)

}



// UPDATE ACCOUNT

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



// DELETE ACCOUNT

async function deleteAccount(){

const acc=document.getElementById("deleteAcc").value

const res=await fetch(`/deleteAccount/${acc}`,{

method:"DELETE"

})

const data=await res.json()

document.getElementById("deleteResult").innerText=
JSON.stringify(data,null,2)

}
