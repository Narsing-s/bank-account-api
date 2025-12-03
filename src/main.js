const apiBase = "http://localhost:8081/api";

// ---------- Helper to Handle API Calls ----------
async function apiRequest(url, options = {}) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      return { error: `API Error: ${res.status} ${res.statusText}` };
    }

    return await res.json();
  } catch (err) {
    return { error: "Server not responding. Check API URL or backend status." };
  }
}

// ---------- Create Account ----------
document.getElementById("createAccountForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const adharNumber = document.getElementById("adharNumber").value.trim();
  const bankName = document.getElementById("bankName").value.trim();

  if (!adharNumber || !bankName) {
    document.getElementById("createAccountResponse").innerText = "Adhar Number & Bank Name required!";
    return;
  }

  const payload = {
    FULLNAME: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    dateOfBirth: document.getElementById("dob").value,
    MOBILENUMBER: document.getElementById("mobileNumber").value,
    ADDRESS: document.getElementById("address").value
  };

  const queryParams = `?adharNumber=${adharNumber}&bankName=${bankName}`;

  const data = await apiRequest(`${apiBase}/accounts${queryParams}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  document.getElementById("createAccountResponse").innerText = JSON.stringify(data, null, 2);
});

// ---------- Get Account ----------
document.getElementById("getAccountBtn").addEventListener("click", async () => {
  const accountNumber = document.getElementById("getAccountNumber").value.trim();

  if (!accountNumber) {
    document.getElementById("getAccountResponse").innerText = "Enter Account Number!";
    return;
  }

  const data = await apiRequest(`${apiBase}/accounts/${accountNumber}`);
  document.getElementById("getAccountResponse").innerText = JSON.stringify(data, null, 2);
});

// ---------- Update Account ----------
document.getElementById("updateAccountBtn").addEventListener("click", async () => {
  const accountNumber = document.getElementById("updateAccountNumber").value.trim();

  if (!accountNumber) {
    document.getElementById("updateAccountResponse").innerText = "Enter Account Number!";
    return;
  }

  const payload = {
    FULLNAME: document.getElementById("updateFullName").value,
    ADDRESS: document.getElementById("updateAddress").value,
    MOBILENUMBER: document.getElementById("updateMobile").value
  };

  const data = await apiRequest(`${apiBase}/accounts/${accountNumber}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  document.getElementById("updateAccountResponse").innerText = JSON.stringify(data, null, 2);
});

// ---------- Delete Account ----------
document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
  const accountNumber = document.getElementById("deleteAccountNumber").value.trim();

  if (!accountNumber) {
    document.getElementById("deleteAccountResponse").innerText = "Enter Account Number!";
    return;
  }

  const data = await apiRequest(`${apiBase}/accounts/${accountNumber}`, {
    method: "DELETE"
  });

  document.getElementById("deleteAccountResponse").innerText = JSON.stringify(data, null, 2);
});
