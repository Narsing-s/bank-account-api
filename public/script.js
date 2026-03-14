function renderTable(data){

const acc=data.account_data || {}

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

<td>${data.accountNumber || ""}</td>
<td>${acc.FULLNAME || ""}</td>
<td>${acc.MOBILENUMBER || ""}</td>
<td>${acc.EMAIL || ""}</td>
<td>${acc.ADDRESS || ""}</td>

</tr>

</table>

<button onclick="copyAcc('${data.accountNumber}')">
Copy Account
</button>

`

}
