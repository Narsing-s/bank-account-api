async function createAccount() {

    const fullName = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const dob = document.getElementById("dob").value;
    const mobile = document.getElementById("mobile").value;
    const address = document.getElementById("address").value;
    const adhar = document.getElementById("adhar").value;

    const url = `https://your-cloudhub-url/accounts?adharNumber=${adhar}&bankName=SBI`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            FullName: fullName,
            dateOfBirth: dob,
            mobileNumber: mobile,
            email: email,
            address: address
        })
    });

    const text = await response.text();

    let result;

    try {
        result = JSON.parse(text);
    } catch {
        result = { message: text };
    }

    document.getElementById("result").innerText =
        result.message || "Account Created";
}
