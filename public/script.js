// ========= Config & Utilities =========
const $ = (id) => document.getElementById(id);
const q = (sel) => document.querySelector(sel);
const qa = (sel) => Array.from(document.querySelectorAll(sel));

function getApiUrl(path){
  const mode = window.AppConfig?.mode || "web";
  if (mode === "android") return `${window.AppConfig.ANDROID_BASE}${path}`;
  return `${window.AppConfig.WEB_PREFIX || ""}${path}`;
}

const statusDot = $("statusDot");
const statusText = $("statusText");
const loader = $("loader");
const respOverlay = $("respOverlay");
const respBody = $("respBody");

// ===== I18N =====
const I18N = { en: null, te: null, hi: null };
let currentLang = localStorage.getItem("lang") || "en";

async function loadLang(lang){
  if (!I18N[lang]) {
    const res = await fetch(`/i18n/${lang}.json`);
    I18N[lang] = await res.json();
  }
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyLang();
}

function t(key){
  return (I18N[currentLang] && I18N[currentLang][key]) || key;
}

function applyLang(){
  qa("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
}

// ===== THEME & SETTINGS =====
function applyTheme(theme){
  const html = document.documentElement;
  if (theme === "system") {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
}
function applyMotion(reduce){
  document.documentElement.classList.toggle("rm", !!reduce);
  localStorage.setItem("reduceMotion", reduce ? "1" : "0");
}
function applyContrast(hc){
  document.documentElement.classList.toggle("hc", !!hc);
  localStorage.setItem("highContrast", hc ? "1" : "0");
}

// ===== UI Helpers =====
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

// Shimmer hover
document.addEventListener("pointermove", e => {
  document.querySelectorAll("button").forEach(btn=>{
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});

function convertDOB(d){
  if(!d) return "";
  const s = String(d).trim();
  if(!/^\d{8}$/.test(s)) return "";
  return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
}

// Sticky action bar height -> lift toasts
function updateStickyHeight(){
  const activePanel = document.querySelector(".panel.active");
  const bar = activePanel?.querySelector(".action-bar");
  let h = 0;
  if (bar) {
    const rect = bar.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (rect.bottom > viewportH - 4) h = Math.max(0, rect.height);
  }
  document.documentElement.style.setProperty("--stickyH", `${h}px`);
}
window.addEventListener("resize", updateStickyHeight);
window.addEventListener("scroll", updateStickyHeight);
setInterval(updateStickyHeight, 500);

// Tabs
qa(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    qa(".tab-btn").forEach(b=>b.classList.remove("active"));
    qa(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
    setTimeout(()=> $(btn.dataset.tab)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTimeout(updateStickyHeight, 150);
  });
});

// Confetti
function launchConfetti(count=60){
  const colors = ["#00c6ff","#2bd2ff","#ff61d2","#ff78e1"];
  const fx = $("fx");
  for(let i=0;i<count;i++){
    const c = document.createElement("div");
    c.className = "confetti";
    const size = 6 + Math.random()*8;
    c.style.width = `${size}px`;
    c.style.height = `${size*1.5}px`;
    c.style.left = `${Math.random()*100}vw`;
    c.style.top = `-10px`;
    c.style.position = "fixed";
    c.style.background = colors[(Math.random()*colors.length)|0];
    c.style.opacity = .95;
    c.style.transform = `translateY(-100px) rotate(${Math.random()*360}deg)`;
    c.style.borderRadius = "3px";
    c.style.zIndex = "2000";
    c.style.pointerEvents = "none";
    c.style.animation = `fall ${1.8 + Math.random()*1.6}s linear forwards`;
    fx.appendChild(c);
    setTimeout(()=> fx.removeChild(c), 2600);
  }
}
(function ensureConfettiKeyframes(){
  const style = document.createElement("style");
  style.textContent = `@keyframes fall { to { transform: translateY(110vh) rotate(360deg) } }`;
  document.head.appendChild(style);
})();

// Fetch wrapper
async function doFetch(url, options){
  const res = await fetch(url, options);
  const text = await res.text();
  let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; }
  return {res, data, text};
}

// Response Viewer
function showResponse(obj) {
  const pretty = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  respBody.textContent = pretty;
  respOverlay.classList.remove("hidden");
}
function hideResponse(){
  respOverlay.classList.add("hidden");
}
$("btnCloseResp").addEventListener("click", hideResponse);
$("btnCopyResp").addEventListener("click", async ()=>{
  try {
    await navigator.clipboard.writeText(respBody.textContent);
    toast("Copied");
  } catch {
    toast("Copy failed","err");
  }
});

// Settings
const settings = $("settings");
$("btnSettings").addEventListener("click", ()=> settings.classList.remove("hidden"));
$("btnCloseSettings").addEventListener("click", ()=> settings.classList.add("hidden"));
qa('[data-theme]').forEach(btn=>{
  btn.addEventListener("click", ()=> applyTheme(btn.dataset.theme));
});
qa('[data-lang]').forEach(btn=>{
  btn.addEventListener("click", ()=> loadLang(btn.dataset.lang));
});
$("toggleMotion").addEventListener("change", (e)=> applyMotion(e.target.checked));
$("toggleContrast").addEventListener("change", (e)=> applyContrast(e.target.checked));

// Init settings
(function initSettings(){
  const theme = localStorage.getItem("theme") || "system";
  const reduce = localStorage.getItem("reduceMotion") === "1";
  const hc = localStorage.getItem("highContrast") === "1";
  applyTheme(theme); applyMotion(reduce); applyContrast(hc);
  $("toggleMotion").checked = reduce;
  $("toggleContrast").checked = hc;
})();

// Load language and apply
loadLang(currentLang).catch(console.error);

// ---------- CREATE ----------
$("btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("name").value || "").trim();
  const dateOfBirth = convertDOB(($("dob").value || "").trim());
  const mobileNumber = ($("mobile").value || "").trim();
  const email = ($("email").value || "").trim();
  const address = ($("address").value || "").trim();
  const adharNumber = ($("aadhaar").value || "").trim();
  const bankName = ($("bank").value || "").trim();

  if(!FullName){ toast(t("toast.required.fullName"), "err"); $("name").focus(); return; }
  if(!dateOfBirth){ toast(t("toast.required.dob"), "err"); $("dob").focus(); return; }
  if(!mobileNumber){ toast(t("toast.required.mobile"), "err"); $("mobile").focus(); return; }
  if(!email){ toast(t("toast.required.email"), "err"); $("email").focus(); return; }
  if(!address){ toast(t("toast.required.address"), "err"); $("address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast(t("toast.invalid.aadhaar"), "err"); $("aadhaar").focus(); return; }
  if(!["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(bankName)){ toast(t("toast.invalid.bank"), "err"); $("bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };

  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const {res, data, text} = await doFetch(getApiUrl(`/accounts?${qs}`), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    if(!(res.status === 200 || res.status === 201)){
      showResponse(text || data);
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    showResponse(data);
    toast(t("toast.created"));
    launchConfetti(80);
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// ---------- SEARCH ----------
$("btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("getAcc").value || "").trim();
  if(!id){ toast(t("toast.required.acc"), "err"); return; }

  const cardWrap = $("bankCard");
  cardWrap.classList.remove("placeholder");
  cardWrap.innerHTML = `<div class="skeleton title"></div><div class="skeleton line"></div><div class="skeleton line"></div>`;

  showLoader(true);
  try{
    const {res, data, text} = await doFetch(getApiUrl(`/accounts/${encodeURIComponent(id)}`), { method:"GET" });
    if(!res.ok){
      showResponse(text || data);
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    const fullName = data.FullName || data.fullName || "(No Name)";
    const card = document.createElement("div"); card.className = "bankCard";
    const h3 = document.createElement("h3"); h3.textContent = fullName;
    const pAcc = document.createElement("p"); pAcc.textContent = `Account: ${data.accountNumber ?? "(unknown)"}`;
    const pMob = document.createElement("p"); pMob.textContent = `Mobile: ${data.mobileNumber ?? "(unknown)"}`;
    const pEmail = document.createElement("p"); pEmail.textContent = `Email: ${data.email ?? "(unknown)"}`;
    const pDob = document.createElement("p"); pDob.textContent = `DOB: ${data.dateOfBirth ?? "(unknown)"}`;
    const pAddr = document.createElement("p"); pAddr.textContent = `Address: ${data.address ?? "(unknown)"}`;
    card.append(h3,pAcc,pMob,pEmail,pDob,pAddr);
    cardWrap.innerHTML = ""; cardWrap.appendChild(card);
    showResponse(data);
    toast(t("toast.fetched"));
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
  }finally{
    showLoader(false); updateStickyHeight();
  }
});

// ---------- UPDATE ----------
$("btnUpdate").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("updateAcc").value || "").trim();
  if(!id){ toast(t("toast.required.acc"), "err"); return; }

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
    const {res, data, text} = await doFetch(getApiUrl(`/accounts/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      showResponse(text || data);
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    showResponse(data);
    toast(t("toast.updated"));
    launchConfetti(50);
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// ---------- DELETE ----------
$("btnDelete").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("deleteAcc").value || "").trim();
  if(!id){ toast(t("toast.required.acc"), "err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data, text} = await doFetch(getApiUrl(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
    if(!res.ok){
      showResponse(text || data);
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    showResponse(data);
    toast(t("toast.deleted"));
    launchConfetti(40);
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

window.addEventListener("load", updateStickyHeight);
``
