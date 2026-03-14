// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const API = (path) => `${window.API_PREFIX || ""}${path}`;

const statusDot = $("statusDot");
const statusText = $("statusText");
const loader = $("loader");

function toast(msg, type="ok"){
  const wrap = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(()=> wrap.removeChild(el), 250);
  }, 3000);
}

function showLoader(on){ loader.classList.toggle("hidden", !on); }

function convertDOB(d){
  if(!d) return "";
  const s = String(d).trim();
  if (!/^\d{8}$/.test(s)) return "";
  return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
}

function setOnline(online){
  statusDot.classList.toggle("online", online);
  statusDot.classList.toggle("offline", !online);
  statusText.textContent = online ? "Online" : "Offline";
}

// Simple heartbeat (optional). If you have a health endpoint, point to it.
// Here we just mark based on navigator and last successful call.
setOnline(navigator.onLine);
window.addEventListener("online", ()=> setOnline(true));
window.addEventListener("offline", ()=> setOnline(false));
let lastSuccess = 0;
setInterval(()=>{
  const online = navigator.onLine && (Date.now()-lastSuccess < 15000);
  setOnline(online);
}, 4000);

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  });
});

// ---------- CREATE ----------
$("btnCreate").addEventListener("click", async ()=>{
  const FullName = ($("name").value || "").trim();
  const dateOfBirth = convertDOB(($("dob").value || "").trim());
  const mobileNumber = ($("mobile").value || "").trim();
  const email = ($("email").value || "").trim();
  const address = ($("address").value || "").trim();
  const aadhaar = ($("aadhaar").value || "").trim(); // renamed to aadhaar in UI
  const bankName = ($("bank").value || "").trim();

  if(!FullName){
    toast("FullName is required", "err");
    $("name").focus();
    return;
  }

  // If your RAML expects 'aadhaarNumber' or 'adharNumber', map accordingly:
  const payload = {
    FullName,
    dateOfBirth,      // ensure RAML expects YYYY-MM-DD or change here
    mobileNumber,
    email,
    address,
    adharNumber: aadhaar, // change to aadhaarNumber if your API requires that exact key
    bankName
  };

  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(API("/createAccount"), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { raw: text }; }

    if(!res.ok){
      throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    }
    $("createResult").textContent = JSON.stringify(data, null, 2);
    toast("Account created successfully");
    lastSuccess = Date.now();
  }catch(e){
    $("createResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false);
  }
});

// ---------- SEARCH ----------
$("btnSearch").addEventListener("click", async ()=>{
  const id = ($("getAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const cardWrap = $("bankCard");
  cardWrap.classList.remove("placeholder");
  cardWrap.innerHTML = `<div class="skeleton title"></div><div class="skeleton line"></div><div class="skeleton line"></div>`;

  showLoader(true);
  try{
    const res = await fetch(API(`/getAccount/${encodeURIComponent(id)}`));
    const text = await res.text();
    let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { raw: text }; }

    if(!res.ok){
      throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    }
    const acc = data?.account_data || {};
    // Safe rendering (avoid innerHTML for user data)
    const card = document.createElement("div");
    card.className = "bankCard";
    const h3 = document.createElement("h3"); h3.textContent = acc.FullName || "(No Name)";
    const pAcc = document.createElement("p"); pAcc.textContent = `Account: ${data.accountNumber ?? "(unknown)"}`;
    const pMob = document.createElement("p"); pMob.textContent = `Mobile: ${acc.mobileNumber ?? "(unknown)"}`;
    const pEmail = document.createElement("p"); pEmail.textContent = `Email: ${acc.email ?? "(unknown)"}`;
    card.innerHTML = ""; card.appendChild(h3); card.appendChild(pAcc); card.appendChild(pMob); card.appendChild(pEmail);
    cardWrap.innerHTML = ""; cardWrap.appendChild(card);
    toast("Account fetched");
    lastSuccess = Date.now();
  }catch(e){
    cardWrap.textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    showLoader(false);
  }
});

// ---------- UPDATE ----------
$("btnUpdate").addEventListener("click", async ()=>{
  const id = ($("updateAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const payload = {
    FullName: ($("updateName").value || "").trim(),
    email: ($("updateEmail").value || "").trim(),
    mobileNumber: ($("updateMobile").value || "").trim()
  };
  // Remove empty fields to avoid overwriting with empty strings
  Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);
  if(Object.keys(payload).length === 0){
    toast("Provide at least one field to update", "err"); return;
  }

  const btn = $("btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(API(`/updateAccount/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { raw: text }; }

    if(!res.ok){
      throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    }
    $("updateResult").textContent = JSON.stringify(data, null, 2);
    toast("Account updated");
    lastSuccess = Date.now();
  }catch(e){
    $("updateResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false);
  }
});

// ---------- DELETE ----------
$("btnDelete").addEventListener("click", async ()=>{
  const id = ($("deleteAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(API(`/deleteAccount/${encodeURIComponent(id)}`), { method:"DELETE" });
    const text = await res.text();
    let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { raw: text }; }

    if(!res.ok){
      throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    }
    $("deleteResult").textContent = JSON.stringify(data, null, 2);
    toast("Account deleted");
    lastSuccess = Date.now();
  }catch(e){
    $("deleteResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false);
  }
});
