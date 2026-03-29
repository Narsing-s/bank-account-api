// ========= Shortcuts & Config =========
const $  = (id) => document.getElementById(id);
const qa = (sel) => Array.from(document.querySelectorAll(sel));

function API(path) {
  const cfg = window.AppConfig || { mode: "web", WEB_PREFIX: "/api", ANDROID_BASE: "" };
  if (cfg.mode === "android" && cfg.ANDROID_BASE) return `${cfg.ANDROID_BASE}${path}`;
  const prefix = window.API_PREFIX || cfg.WEB_PREFIX || "/api";
  return `${prefix}${path}`;
}

const statusDot   = $("statusDot");
const statusText  = $("statusText");
const loader      = $("loader");
const respOverlay = $("respOverlay");
const respBody    = $("respBody");

function toast(msg, type="ok"){
  const wrap = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; setTimeout(()=> wrap.removeChild(el), 220); }, 2800);
}

function showLoader(on){ loader.classList.toggle("hidden", !on); }
function blurActive(){ if (document.activeElement?.blur) document.activeElement.blur(); }

// Online indicator
function setOnline(online){
  statusDot.classList.toggle("online", online);
  statusDot.classList.toggle("offline", !online);
  statusText.textContent = online ? "Online" : "Offline";
}
let lastSuccess = 0;
setOnline(navigator.onLine);
window.addEventListener("online", ()=> setOnline(true));
window.addEventListener("offline", ()=> setOnline(false));
setInterval(()=>{ const online = navigator.onLine && (Date.now()-lastSuccess < 15000); setOnline(online); }, 4000);

// Ripple origin localization
document.addEventListener("pointerdown", e => {
  const el = e.target.closest(".md-ripple, .nav-item, .btn, .icon-btn");
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--x", `${e.clientX - rect.left}px`);
  el.style.setProperty("--y", `${e.clientY - rect.top}px`);
});

// Helpers
function convertDOB(d){
  if(!d) return "";
  const s = String(d).trim();
  if(!/^\d{8}$/.test(s)) return "";
  return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
}
async function doFetch(url, options){ const res = await fetch(url, options); const text = await res.text(); let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; } return { res, data, text }; }
function showResponse(obj) { const pretty = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2); respBody.textContent = pretty; respOverlay.classList.remove("hidden"); }
function hideResponse(){ respOverlay.classList.add("hidden"); }
$("btnCloseResp").addEventListener("click", hideResponse);
$("btnCopyResp").addEventListener("click", async ()=>{ try { await navigator.clipboard.writeText(respBody.textContent); toast("Copied"); } catch { toast("Copy failed","err"); } });

// ========= i18n =========
const I18N = {
  en: {
    'app.title':'Bank','app.subtitle':'Android Material',
    'login.title':'Secure Login','login.button.register':'Register with biometrics','login.button.login':'Login with biometrics',
    'txns.title':'Transactions','txns.hint':'Your recent activity','txns.refresh':'Refresh','txns.noAcc':'Enter account number first',
    'settings.language':'Language'
  },
  hi: {
    'app.title':'बैंक','app.subtitle':'एंड्रॉइड मटेरियल',
    'login.title':'सुरक्षित लॉगिन','login.button.register':'बायोमेट्रिक से रजिस्टर','login.button.login':'बायोमेट्रिक से लॉगिन',
    'txns.title':'लेनदेन','txns.hint':'आपकी हाल की गतिविधि','txns.refresh':'रिफ्रेश','txns.noAcc':'पहले खाता संख्या दर्ज करें',
    'settings.language':'भाषा'
  },
  te: {
    'app.title':'బ్యాంక్','app.subtitle':'ఆండ్రాయిడ్ మెటీరియల్',
    'login.title':'సురక్షిత లాగిన్','login.button.register':'బయోమెట్రిక్‌తో నమోదు','login.button.login':'బయోమెట్రిక్‌తో లాగిన్',
    'txns.title':'ట్రాన్సాక్షన్స్','txns.hint':'మీ తాజా క్రియలు','txns.refresh':'రీఫ్రెష్','txns.noAcc':'ముందు ఖాతా సంఖ్య ఇవ్వండి',
    'settings.language':'భాష'
  }
};
function t(key){ return (I18N[window.LANG||'en']||{})[key] || I18N.en[key] || key; }
function applyI18N(){ document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); el.textContent = t(k); }); }
(function initLang(){
  const stored = localStorage.getItem('lang') || 'en';
  window.LANG = stored; applyI18N();
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', ()=> { window.LANG = btn.dataset.lang; localStorage.setItem('lang', window.LANG); applyI18N(); toast('Language changed'); });
  });
})();

// ========= Navigation =========
function activateTab(tabId){
  qa(".screen").forEach(s => s.classList.toggle("active", s.id === tabId));
  qa(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.tab === tabId));
  $("efab").style.display = tabId === "create" ? "inline-flex" : "none";
  setTimeout(()=> $(tabId)?.scrollIntoView({behavior:"smooth", block:"start"}), 40);
}
qa(".nav-item").forEach(btn => btn.addEventListener("click", ()=> activateTab(btn.dataset.tab)));
$("efab").addEventListener("click", ()=> { activateTab("create"); $("#name")?.focus(); });

// ========= Settings =========
const settings = $("settings");
$("btnSettings").addEventListener("click", () => settings.classList.remove("hidden"));
$("btnCloseSettings").addEventListener("click", () => settings.classList.add("hidden"));
function applyTheme(theme){ const html = document.documentElement; if (theme === "system") html.removeAttribute("data-theme"); else html.setAttribute("data-theme", theme); localStorage.setItem("theme", theme); }
function applyMotion(reduce){ document.documentElement.classList.toggle("rm", !!reduce); localStorage.setItem("reduceMotion", reduce ? "1" : "0"); }
function applyContrast(hc){ document.documentElement.classList.toggle("hc", !!hc); localStorage.setItem("highContrast", hc ? "1" : "0"); }
document.querySelectorAll('[data-theme]').forEach(btn=> btn.addEventListener("click", ()=> applyTheme(btn.dataset.theme)));
$("toggleMotion").addEventListener("change", (e)=> applyMotion(e.target.checked));
$("toggleContrast").addEventListener("change", (e)=> applyContrast(e.target.checked));
(function initSettings(){
  const theme = localStorage.getItem("theme") || "system";
  const reduce = localStorage.getItem("reduceMotion") === "1";
  const hc = localStorage.getItem("highContrast") === "1";
  applyTheme(theme); applyMotion(reduce); applyContrast(hc);
  $("toggleMotion").checked = reduce; $("toggleContrast").checked = hc;
})();

// ========= WebAuthn / Passkeys (client) =========
const loginSheet = $("loginSheet");
function unlocked(){ return localStorage.getItem("unlocked") === "1"; }
function requireUnlock(){ if (!unlocked()) loginSheet.classList.remove("hidden"); }
function setUnlocked(on){ localStorage.setItem("unlocked", on ? "1" : "0"); loginSheet.classList.toggle("hidden", on); }
requireUnlock();

$("btnPasskeyRegister").addEventListener("click", async ()=>{
  const username = ($("#loginUser").value||"").trim();
  if(!username) return toast("Enter email/mobile", "err");
  try{
    showLoader(true);
    const opts = await (await fetch(`/webauthn/register/options?username=${encodeURIComponent(username)}`)).json();
    normalizeCreationOptions(opts);
    const cred = await navigator.credentials.create({ publicKey: opts });
    const attResp = publicKeyCredentialToJSON(cred);
    const ok = await fetch(`/webauthn/register/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, attResp }) }).then(r=>r.json());
    if(ok?.ok){ setUnlocked(true); toast("Registered & logged in"); }
    else toast("Registration failed","err");
  } catch(e){ console.error(e); toast(e.message||"Failed","err"); }
  finally{ showLoader(false); }
});

$("btnPasskeyLogin").addEventListener("click", async ()=>{
  const username = ($("#loginUser").value||"").trim();
  if(!username) return toast("Enter email/mobile", "err");
  try{
    showLoader(true);
    const opts = await (await fetch(`/webauthn/login/options?username=${encodeURIComponent(username)}`)).json();
    normalizeRequestOptions(opts);
    const asse = await navigator.credentials.get({ publicKey: opts });
    const assertion = publicKeyCredentialToJSON(asse);
    const ok = await fetch(`/webauthn/login/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, assertion }) }).then(r=>r.json());
    if(ok?.ok){ setUnlocked(true); toast("Logged in"); }
    else toast("Login failed","err");
  } catch(e){ console.error(e); toast(e.message||"Failed","err"); }
  finally{ showLoader(false); }
});

// Utilities from SimpleWebAuthn docs (adapted)
function bufferDecode(value){ return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0)); }
function normalizeCreationOptions(opts){
  opts.challenge = bufferDecode(opts.challenge);
  opts.user.id = bufferDecode(opts.user.id);
  if (opts.excludeCredentials) opts.excludeCredentials = opts.excludeCredentials.map(c => ({ ...c, id: bufferDecode(c.id) }));
}
function normalizeRequestOptions(opts){
  opts.challenge = bufferDecode(opts.challenge);
  if (opts.allowCredentials) opts.allowCredentials = opts.allowCredentials.map(c => ({ ...c, id: bufferDecode(c.id) }));
}
function publicKeyCredentialToJSON(pubKeyCred){
  if(pubKeyCred instanceof Array) return pubKeyCred.map(publicKeyCredentialToJSON);
  if(pubKeyCred instanceof ArrayBuffer) return btoa(String.fromCharCode(...new Uint8Array(pubKeyCred))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  if(pubKeyCred && typeof pubKeyCred === 'object'){
    const obj = {};
    for (const key in pubKeyCred){
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  }
  return pubKeyCred;
}

// ========= CRUD Buttons =========
$("btnCreate").addEventListener("click", async ()=>{
  if(!unlocked()) return requireUnlock();
  blurActive();
  const FullName     = ($("#name").value || "").trim();
  const dateOfBirth  = convertDOB(($("#dob").value || "").trim());
  const mobileNumber = ($("#mobile").value || "").trim();
  const email        = ($("#email").value || "").trim();
  const address      = ($("#address").value || "").trim();
  const adharNumber  = ($("#aadhaar").value || "").trim();
  const bankName     = ($("#bank").value || "").trim();

  if(!FullName){ toast("Full Name is required", "err"); $("#name").focus(); return; }
  if(!dateOfBirth){ toast("DOB must be YYYYMMDD", "err"); $("#dob").focus(); return; }
  if(!mobileNumber){ toast("Mobile is required", "err"); $("#mobile").focus(); return; }
  if(!email){ toast("Email is required", "err"); $("#email").focus(); return; }
  if(!address){ toast("Address is required", "err"); $("#address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast("Aadhaar must be 12 digits", "err"); $("#aadhaar").focus(); return; }
  if(!["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(bankName)){ toast("Select a valid bank", "err"); $("#bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };
  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const { res, data, text } = await doFetch(API(`/accounts?${qs}`), {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    if(!(res.status === 200 || res.status === 201)){ showResponse(text || data); throw new Error((data && data.message) || `HTTP ${res.status}`); }
    showResponse(data);
    toast("Account created");
    lastSuccess = Date.now();
  }catch(e){ toast(e.message, "err"); }
  finally{ btn.disabled = false; showLoader(false); }
});

$("btnSearch").addEventListener("click", async ()=>{
  if(!unlocked()) return requireUnlock();
  blurActive();
  const id = ($("#getAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const cardWrap = $("bankCard");
  cardWrap.classList.remove("placeholder");
  cardWrap.setAttribute("aria-busy", "true");
  cardWrap.innerHTML = `<div class="skeleton title"></div><div class="skeleton line"></div><div class="skeleton line"></div>`;

  showLoader(true);
  try{
    const { res, data, text } = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"GET" });
    if(!res.ok){ showResponse(text || data); throw new Error((data && data.message) || `HTTP ${res.status}`); }
    const d = (data && data.bankDetails && data.bankDetails.account_data) ? data.bankDetails.account_data : data;
    const fullName = d.FullName || d.fullName || d.FULLNAME || "(No Name)";
    const accountNumber = d.accountNumber || d.ACCOUNTNUMBER;
    const mobile = d.mobileNumber || d.MOBILENUMBER;
    const dob = d.dateOfBirth || d.DATEOFBIRTH;
    const email = d.email || d.EMAIL;
    const address = d.address || d.ADDRESS;

    const inner = `
      <h3>${fullName}</h3>
      <p><b>Account:</b> ${accountNumber ?? "(unknown)"}</p>
      <p><b>Mobile:</b> ${mobile ?? "(unknown)"}</p>
      <p><b>Email:</b> ${email ?? "(unknown)"}</p>
      <p><b>DOB:</b> ${dob ?? "(unknown)"}</p>
      <p><b>Address:</b> ${address ?? "(unknown)"}</p>
    `;
    cardWrap.classList.remove("placeholder");
    cardWrap.innerHTML = inner;
    cardWrap.setAttribute("aria-busy", "false");

    // also load recent transactions if user navigates there
    txCursor = null;
    lastAcc = accountNumber || id;
    lastSuccess = Date.now();
  }catch(e){ toast(e.message, "err"); }
  finally{ showLoader(false); }
});

$("btnUpdate").addEventListener("click", async ()=>{
  if(!unlocked()) return requireUnlock();
  blurActive();
  const id = ($("#updateAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const payload = {
    FullName: ($("#updateName").value || "").trim(),
    email: ($("#updateEmail").value || "").trim(),
    mobileNumber: ($("#updateMobile").value || "").trim()
  };
  Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);
  if(Object.keys(payload).length === 0){ toast("Provide at least one field to update", "err"); return; }

  const btn = $("btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const { res, data, text } = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    if(!res.ok){ showResponse(text || data); throw new Error((data && data.message) || `HTTP ${res.status}`); }
    showResponse(data);
    toast("Account updated");
    lastSuccess = Date.now();
  }catch(e){ toast(e.message, "err"); }
  finally{ btn.disabled = false; showLoader(false); }
});

$("btnDelete").addEventListener("click", async ()=>{
  if(!unlocked()) return requireUnlock();
  blurActive();
  const id = ($("#deleteAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const { res, data, text } = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
    if(!res.ok){ showResponse(text || data); throw new Error((data && data.message) || `HTTP ${res.status}`); }
    showResponse(data);
    toast("Account deleted");
    lastSuccess = Date.now();
  }catch(e){ toast(e.message, "err"); }
  finally{ btn.disabled = false; showLoader(false); }
});

// ========= Transactions =========
let txCursor = null, txLoading = false, lastAcc = "";
async function loadTxns(acc, reset=false){
  if (txLoading) return; txLoading=true;
  const wrap = $("txList");
  if (reset){ wrap.classList.add("loading"); wrap.innerHTML = `<div class="skeleton line"></div><div class="skeleton line"></div>`; txCursor=null; }
  try{
    const qs = new URLSearchParams({ limit: 50 }); if (txCursor) qs.set('cursor', txCursor);
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(acc)}/transactions?`+qs.toString()), { method:'GET' });
    if(!res.ok){ showResponse(data); throw new Error((data && data.message)||`HTTP ${res.status}`); }
    const items = data.items || [];
    if (reset) wrap.innerHTML = '';
    wrap.classList.remove('loading');
    for(const it of items){
      const row = document.createElement('div'); row.className = 'txn-row';
      const left = document.createElement('div'); left.className='left';
      const dt = new Date(it.ts); left.innerHTML = `<div>${it.desc||'-'}</div><small>${dt.toLocaleString()}</small>`;
      const amt = document.createElement('div'); amt.className='amt '+(it.amount>=0?'cred':'deb');
      amt.textContent = (it.amount>=0?'+':'') + Number(it.amount).toLocaleString(undefined,{style:'currency',currency:'INR'});
      row.append(left, amt); wrap.append(row);
    }
    txCursor = data.nextCursor || null;
  } catch(e){ toast(e.message,'err'); }
  finally { txLoading=false; }
}
$("btnTxRefresh").addEventListener("click", ()=> {
  const acc = ($("#getAcc").value||$("#updateAcc").value||$("#deleteAcc").value||lastAcc||"").trim();
  if(!acc){ toast(t('txns.noAcc'), 'err'); return; }
  lastAcc = acc; loadTxns(acc, true);
});
document.addEventListener("scroll", ()=>{
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
    if(lastAcc && txCursor) loadTxns(lastAcc, false);
  }
});

// On first view of txns tab, try loading using lastAcc if present
document.querySelector('[data-tab="txns"]').addEventListener('click', ()=>{
  if (lastAcc) loadTxns(lastAcc, !txCursor);
});

// ========= End =========
