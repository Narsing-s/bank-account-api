// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const API = (path) => `${window.API_PREFIX || ""}${path}`;

const statusDot = $("statusDot");
const statusText = $("statusText");
const loader = $("loader");
const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");

// Toasts
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
function blurActive(){ if (document.activeElement?.blur) document.activeElement.blur(); }

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

let lastSuccess = 0;
setOnline(navigator.onLine);
window.addEventListener("online", ()=> setOnline(true));
window.addEventListener("offline", ()=> setOnline(false));
setInterval(()=>{
  const online = navigator.onLine && (Date.now()-lastSuccess < 15000);
  setOnline(online);
}, 4000);

// ---------- Sticky action bar height ----------
function updateStickyHeight(){
  const activePanel = document.querySelector(".panel.active");
  const bar = activePanel?.querySelector(".action-bar");
  let h = 0;
  if (bar) {
    const rect = bar.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (rect.bottom > viewportH - 4) {
      h = Math.max(0, rect.height);
    }
  }
  document.documentElement.style.setProperty("--stickyH", `${h}px`);
}
window.addEventListener("resize", updateStickyHeight);
window.addEventListener("scroll", updateStickyHeight);
setInterval(updateStickyHeight, 500);

// ---------- Theme handling ----------
const THEME_KEY = "nb_theme";
function getSystemTheme(){
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(mode){
  const html = document.documentElement;
  if (mode === "auto") {
    const sys = getSystemTheme();
    html.setAttribute("data-theme", "auto");
    html.setAttribute("data-theme-active", sys);
    if (sys === "light") html.setAttribute("data-theme","light"); else html.setAttribute("data-theme","dark");
  } else {
    html.setAttribute("data-theme", mode);
    html.setAttribute("data-theme-active", mode);
  }
  const active = html.getAttribute("data-theme-active");
  themeIcon.textContent = active === "light" ? "🌙" : "☀️";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", active === "light" ? "#f6f7fb" : "#0f1020");
}
function loadTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "auto";
  applyTheme(saved);
}
function cycleTheme(){
  const current = localStorage.getItem(THEME_KEY) || "auto";
  const next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  toast(`Theme: ${next}`, "ok");
}
$("themeToggle").addEventListener("click", cycleTheme);
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", ()=>{
  const saved = localStorage.getItem(THEME_KEY) || "auto";
  if (saved === "auto") applyTheme("auto");
});
loadTheme();

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
    setTimeout(()=> $(btn.dataset.tab)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTimeout(updateStickyHeight, 150);
  });
});

// ---------- CREATE (POST /api/accounts?adharNumber=&bankName=) ----------
$("btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("name").value || "").trim();
  const dateOfBirth = convertDOB(($("dob").value || "").trim());
  const mobileNumber = ($("mobile").value || "").trim();
  const email = ($("email").value || "").trim();
  const address = ($("address").value || "").trim();
  const adharNumber = ($("aadhaar").value || "").trim(); // RAML key is "adharNumber"
  const bankName = ($("bank").value || "").trim();

  // RAML-required validations
  if(!FullName){ toast("FullName is required", "err"); $("name").focus(); return; }
  if(!dateOfBirth){ toast("dateOfBirth must be YYYYMMDD", "err"); $("dob").focus(); return; }
  if(!mobileNumber){ toast("mobileNumber is required", "err"); $("mobile").focus(); return; }
  if(!email){ toast("email is required", "err"); $("email").focus(); return; }
  if(!address){ toast("address is required", "err"); $("address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast("Aadhaar (adharNumber) must be 12 digits", "err"); $("aadhaar").focus(); return; }
  if(!["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(bankName)){ toast("Select a valid bank", "err"); $("bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };

  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const res = await fetch(API(`/accounts?${qs}`), {
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
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// ---------- SEARCH (GET /api/accounts/{id}) ----------
$("btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("getAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const cardWrap = $("bankCard");
  cardWrap.classList.remove("placeholder");
  cardWrap.innerHTML = `<div class="skeleton title"></div><div class="skeleton line"></div><div class="skeleton line"></div>`;

  showLoader(true);
  try{
    const res = await fetch(API(`/accounts/${encodeURIComponent(id)}`));
    const text = await res.text();
    let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { raw: text }; }

    if(!res.ok){
      throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
    }

    // Mule GET returns a flat object; fullName is lowercased in your transform.
    const fullName = data.FullName || data.fullName || "(No Name)";

    const card = document.createElement("div");
    card.className = "bankCard";
    const h3 = document.createElement("h3"); h3.textContent = fullName;
    const pAcc = document.createElement("p"); pAcc.textContent = `Account: ${data.accountNumber ?? "(unknown)"}`;
    const pMob = document.createElement("p"); pMob.textContent = `Mobile: ${data.mobileNumber ?? "(unknown)"}`;
    const pEmail = document.createElement("p"); pEmail.textContent = `Email: ${data.email ?? "(unknown)"}`;
    const pDob = document.createElement("p"); pDob.textContent = `DOB: ${data.dateOfBirth ?? "(unknown)"}`;
    const pAddr = document.createElement("p"); pAddr.textContent = `Address: ${data.address ?? "(unknown)"}`;
    card.innerHTML = ""; card.appendChild(h3); card.appendChild(pAcc); card.appendChild(pMob); card.appendChild(pEmail); card.appendChild(pDob); card.appendChild(pAddr);
    cardWrap.innerHTML = ""; cardWrap.appendChild(card);
    toast("Account fetched");
    lastSuccess = Date.now();
  }catch(e){
    cardWrap.textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    showLoader(false); updateStickyHeight();
  }
});

// ---------- UPDATE (PATCH /api/accounts/{id}) ----------
$("btnUpdate").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("updateAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const payload = {
    FullName: ($("updateName").value || "").trim(),
    email: ($("updateEmail").value || "").trim(),
    mobileNumber: ($("updateMobile").value || "").trim()
  };
  Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);
  if(Object.keys(payload).length === 0){
    toast("Provide at least one field to update", "err"); return;
  }

  const btn = $("btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(API(`/accounts/${encodeURIComponent(id)}`), {
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
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// ---------- DELETE (DELETE /api/accounts/{id}) ----------
$("btnDelete").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("deleteAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
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
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// Initial compute of sticky area
window.addEventListener("load", updateStickyHeight);
