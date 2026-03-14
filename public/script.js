function showToast(message){

const toast=document.getElementById("toast")

toast.innerText=message
toast.className="show"

setTimeout(()=>{

toast.className=toast.className.replace("show","")

},3000)

}



function renderTable(data){

const container=document.getElementById("getResult")

if(!data){

container.innerHTML="No Data"
return
}

container.innerHTML=`

<table>

<tr>
<th>Account Number</th>
<th>Name</th>
<th>Mobile</th>
<th>Email</th>
<th>Address</th>
</tr>

<tr>
<td>${data.accountNumber || ""}</td>
<td>${data.FullName || data.FULLNAME || ""}</td>
<td>${data.mobileNumber || data.MOBILENUMBER || ""}</td>
<td>${data.email || data.EMAIL || ""}</td>
<td>${data.address || data.ADDRESS || ""}</td>
</tr>

</table>

<button onclick="copyAccount('${data.accountNumber}')">
Copy Account Number
</button>

`

}
