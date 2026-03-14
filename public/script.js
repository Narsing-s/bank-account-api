// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const API = (path) => `${window.API_PREFIX || ""}${path}`;

const statusDot = $("statusDot");
const statusText = $("statusText");
const loader = $("loader");

// ---- Toasts ----
function toast(msg, type="ok"){
  const wrap = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  // Also speak toast if TTS on
  speak(msg, { priority: "toast" });
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
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
    setTimeout(()=> $(btn.dataset.tab)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTimeout(updateStickyHeight, 150);
    speak(`${btn.dataset.tab} tab selected`);
  });
});

// Hover shimmer — cursor glow
document.addEventListener("pointermove", e => {
  document.querySelectorAll("button").forEach(btn=>{
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});

// Magnetic buttons
function initMagnetic(){
  const magnets = document.querySelectorAll(".magnetic");
  const strength = 0.25;
  const maxShift = 16;
  magnets.forEach(el=>{
    let raf = null;
    function onMove(e){
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (mx - cx) / cx;
      const dy = (my - cy) / cy;
      const tx = Math.max(-1, Math.min(1, dx)) * maxShift;
      const ty = Math.max(-1, Math.min(1, dy)) * maxShift;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{ el.style.transform = `translate(${tx*strength}px, ${ty*strength}px)`; });
    }
    function onLeave(){ if (raf) cancelAnimationFrame(raf); el.style.transform = `translate(0,0)`; }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", ()=> el.style.transform = "scale(0.98)");
    el.addEventListener("touchend", ()=> el.style.transform = "scale(1)");
  });
}
initMagnetic();

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
// Keyframes (once)
(function(){ const s=document.createElement("style"); s.textContent='@keyframes fall { to { transform: translateY(110vh) rotate(360deg) } }'; document.head.appendChild(s); })();

// Common fetch
async function doFetch(url, options){
  const res = await fetch(url, options);
  const text = await res.text();
  let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; }
  return {res, data};
}

/* ====================== CAROUSEL ====================== */
const carTrack = $("carTrack");
const carPrev = $("carPrev");
const carNext = $("carNext");
let carItems = [];
let carIndex = 0;
let carCardWidth = 0;

function renderCarousel(){
  carTrack.innerHTML = carItems.map(item => {
    const fullName = item.FullName || item.fullName || "(No Name)";
    return `
      <div class="gcard" tabindex="0" aria-label="Account card for ${fullName}">
        <h3>${fullName}</h3>
        <p><strong>Account:</strong> ${item.accountNumber ?? "(unknown)"}</p>
        <p><strong>Mobile:</strong> ${item.mobileNumber ?? "(unknown)"}</p>
        <p><strong>Email:</strong> ${item.email ?? "(unknown)"}</p>
        <p><strong>DOB:</strong> ${item.dateOfBirth ?? "(unknown)"}</p>
        <p><strong>Address:</strong> ${item.address ?? "(unknown)"}</p>
        <p><strong>Bank:</strong> ${item.bankName ?? "(unknown)"}</p>
      </div>`;
  }).join("");

  const first = carTrack.querySelector(".gcard");
  if (first) {
    const style = getComputedStyle(carTrack);
    const gap = parseFloat(style.columnGap || style.gap || 16);
    carCardWidth = first.getBoundingClientRect().width + gap;
  } else {
    carCardWidth = 0;
  }
  updateCarousel();
}
function updateCarousel(){
  if (carItems.length === 0 || carCardWidth === 0){
    carTrack.style.transform = `translateX(0px)`;
    return;
  }
  carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1));
  const offset = -carIndex * carCardWidth;
  carTrack.style.transform = `translateX(${offset}px)`;

  // Speak the current card summary
  const cur = carItems[carIndex];
  if (cur) {
    const fullName = cur.FullName || cur.fullName || "No Name";
    speak(`Showing account card. Name ${fullName}, account ${cur.accountNumber ?? "unknown"}.`);
  }
}
carPrev?.addEventListener("click", ()=>{ carIndex = Math.max(0, carIndex - 1); updateCarousel(); });
carNext?.addEventListener("click", ()=>{ carIndex = Math.min(carItems.length - 1, carIndex + 1); updateCarousel(); });
window.addEventListener("resize", ()=> renderCarousel());

// Drag / Swipe
(function initCarouselDrag(){
  let isDown = false, startX = 0, startOffset = 0;
  const viewport = document.querySelector(".carousel-viewport");
  if (!viewport) return;

  function curOffset(){
    const m = /translateX\((-?\d+(\.\d+)?)px\)/.exec(carTrack.style.transform || "");
    return m ? parseFloat(m[1]) : 0;
  }
  const onDown = (e)=>{ isDown = true; startX = (e.touches?.[0]?.clientX ?? e.clientX); startOffset = curOffset(); carTrack.style.transition = "none"; };
  const onMove = (e)=>{
    if(!isDown) return;
    const x = (e.touches?.[0]?.clientX ?? e.clientX);
    const dx = x - startX;
    carTrack.style.transform = `translateX(${startOffset + dx}px)`;
    e.preventDefault();
  };
  const onUp = (e)=>{
    if(!isDown) return; isDown = false; carTrack.style.transition = "transform .35s ease";
    const endX = (e.changedTouches?.[0]?.clientX ?? e.clientX ?? startX);
    const dx = endX - startX; const threshold = 60;
    if (dx > threshold) carIndex = Math.max(0, carIndex - 1);
    else if (dx < -threshold) carIndex = Math.min(carItems.length - 1, carIndex + 1);
    updateCarousel();
  };

  viewport.addEventListener("mousedown", onDown);
  viewport.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  viewport.addEventListener("touchstart", onDown, {passive:false});
  viewport.addEventListener("touchmove", onMove, {passive:false});
  viewport.addEventListener("touchend", onUp);
})();

/* ====================== VOICE: TTS + STT ====================== */
const ttsToggle = $("ttsToggle");
const voiceSelect = $("voiceSelect");
const langSelect = $("langSelect");
const micBtn = $("micBtn");

let voices = [];
function loadVoices(){
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voiceSelect.innerHTML = `<option value="">Auto Voice</option>` + voices.map(v =>
    `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("");
}
if ('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function speak(text, opts={}){
  if (!ttsToggle.checked) return;
  if (!('speechSynthesis' in window)) return;
  if (!text) return;

  // Prioritize stopping previous long utterances if a toast needs to be read
  if (opts.priority === "toast") {
    window.speechSynthesis.cancel();
  }

  const u = new SpeechSynthesisUtterance(text);
  const sel = voiceSelect.value;
  if (sel){
    const v = voices.find(x => x.name === sel);
    if (v) { u.voice = v; u.lang = v.lang; }
  }
  u.rate = 1.0; u.pitch = 1.0; u.volume = 1;
  window.speechSynthesis.speak(u);
}

// STT
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
let isListening = false;

function startListen(){
  if (!SR){ toast("Speech recognition not supported in this browser", "err"); return; }
  if (isListening) return;
  rec = new SR();
  rec.lang = langSelect.value || "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onstart = ()=>{ isListening = true; micBtn.classList.add("listening"); toast("Listening…"); };
  rec.onerror = (e)=>{ isListening = false; micBtn.classList.remove("listening"); toast(`Voice error: ${e.error}`, "err"); };
  rec.onend = ()=>{ isListening = false; micBtn.classList.remove("listening"); };
  rec.onresult = (e)=>{
    const transcript = (e.results?.[0]?.[0]?.transcript || "").trim();
    if (!transcript) { toast("Didn’t catch that"); return; }
    handleVoiceCommand(transcript);
  };
  rec.start();
}
function stopListen(){
  if (rec && isListening) rec.stop();
}

micBtn.addEventListener("click", ()=>{
  if (isListening) { stopListen(); }
  else { startListen(); }
});

// Voice intents (simple keywords; supports en-IN pronunciations well)
function digitsOnly(s){ return s.replace(/\D/g,''); }
function handleVoiceCommand(raw){
  const q = raw.toLowerCase();
  speak(`You said: ${raw}`);

  // Tab navigation
  if (q.includes("create")) { document.querySelector('[data-tab="create"]').click(); return; }
  if (q.includes("search")) { document.querySelector('[data-tab="search"]').click(); return; }
  if (q.includes("update")) { document.querySelector('[data-tab="update"]').click(); return; }
  if (q.includes("delete")) { document.querySelector('[data-tab="delete"]').click(); return; }

  // Create field filling
  if (q.startsWith("name ") || q.startsWith("full name ")) {
    const val = raw.replace(/^(name|full name)\s+/i,''); $("name").value = val; toast(`Name set to ${val}`); return;
  }
  if (q.startsWith("mobile ")) {
    const val = digitsOnly(raw); $("mobile").value = val.slice(-15); toast(`Mobile set`); return;
  }
  if (q.startsWith("email ")) {
    const val = raw.replace(/^email\s+/i,'').replace(/\s+at\s+/i,'@').replace(/\s+dot\s+/ig,'.');
    $("email").value = val; toast(`Email set`); return;
  }
  if (q.startsWith("address ")) {
    const val = raw.replace(/^address\s+/i,''); $("address").value = val; toast(`Address set`); return;
  }
  if (q.startsWith("dob ")) {
    const digits = digitsOnly(raw);
    // accept 8 digits or try ddmmyyyy → yyyymmdd
    let yyyymmdd = digits.length===8 ? digits : "";
    if (!yyyymmdd && digits.length===8) yyyymmdd = digits;
    $("dob").value = yyyymmdd; toast(`DOB set`); return;
  }
  if (q.includes("aadhaar") || q.includes("aadhar") || q.includes("adhar")) {
    const val = digitsOnly(raw); $("aadhaar").value = val.slice(-12); toast(`Aadhaar set`); return;
  }
  if (q.includes("bank ")) {
    const b = raw.split("bank")[1]?.trim().toUpperCase();
    const valid = ["SBI","HDFC","APGIVB","AXIS","ICICI"];
    const pick = valid.find(x => b?.includes(x));
    if (pick){ $("bank").value = pick; toast(`Bank set to ${pick}`); return; }
  }

  // Commands
  if (q.startsWith("create account")) { $("btnCreate").click(); return; }
  if (q.startsWith("search account")) {
    const num = digitsOnly(raw);
    if (num) { $("getAcc").value = num; $("btnSearch").click(); }
    else toast("Say: Search account and the number");
    return;
  }
  if (q.startsWith("update account")) {
    const num = digitsOnly(raw);
    if (num) { $("updateAcc").value = num; }
    $("btnUpdate").click(); return;
  }
  if (q.startsWith("delete account")) {
    const num = digitsOnly(raw);
    if (num) { $("deleteAcc").value = num; $("btnDelete").click(); }
    else toast("Say: Delete account and the number");
    return;
  }

  toast("Voice command not recognized");
}

/* ====================== API actions ====================== */
// CREATE
$("btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("name").value || "").trim();
  const dateOfBirth = convertDOB(($("dob").value || "").trim());
  const mobileNumber = ($("mobile").value || "").trim();
  const email = ($("email").value || "").trim();
  const address = ($("address").value || "").trim();
  const adharNumber = ($("aadhaar").value || "").trim(); // RAML key 'adharNumber'
  const bankName = ($("bank").value || "").trim();

  if(!FullName){ toast("FullName is required", "err"); $("name").focus(); return; }
  if(!dateOfBirth){ toast("dateOfBirth must be YYYYMMDD", "err"); $("dob").focus(); return; }
  if(!mobileNumber){ toast("mobileNumber is required", "err"); $("mobile").focus(); return; }
  if(!email){ toast("email is required", "err"); $("email").focus(); return; }
  if(!address){ toast("address is required", "err"); $("address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast("Aadhaar must be 12 digits", "err"); $("aadhaar").focus(); return; }
  if(!["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(bankName)){ toast("Select a valid bank", "err"); $("bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };
  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const {res, data} = await doFetch(API(`/accounts?${qs}`), {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("createResult").textContent = JSON.stringify(data, null, 2);
    toast("Account created successfully");
    speak(`Account created. Your account number is ${data.accountNumber ?? "not available"}.`);
    launchConfetti(80);
    lastSuccess = Date.now();
  }catch(e){
    $("createResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(`Create failed. ${e.message}`);
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// SEARCH → add to carousel and speak details
$("btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("getAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  if (carItems.length === 0){
    carTrack.innerHTML = `
      <div class="gcard">
        <div class="skeleton title"></div>
        <div class="skeleton line"></div>
        <div class="skeleton line"></div>
      </div>`;
  }

  showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"GET" });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }

    const normalized = {
      accountNumber: data.accountNumber,
      FullName: data.FullName,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      mobileNumber: data.mobileNumber,
      email: data.email,
      address: data.address,
      bankName: data.bankName
    };

    const existsIdx = carItems.findIndex(x => x.accountNumber === normalized.accountNumber);
    if (existsIdx === -1) { carItems.push(normalized); carIndex = carItems.length - 1; }
    else { carItems[existsIdx] = normalized; carIndex = existsIdx; }

    renderCarousel();
    toast("Account fetched");
    const n = normalized;
    const fn = n.FullName || n.fullName || "No Name";
    speak(`Account found. Name ${fn}. Mobile ${n.mobileNumber ?? "unknown"}. Email ${n.email ?? "unknown"}.`);
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
    speak(`Search failed. ${e.message}`);
  }finally{
    showLoader(false); updateStickyHeight();
  }
});

// UPDATE
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
  if(Object.keys(payload).length === 0){ toast("Provide at least one field to update", "err"); return; }

  const btn = $("btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), {
      method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("updateResult").textContent = JSON.stringify(data, null, 2);
    toast("Account updated");
    speak(`Account ${id} updated successfully.`);
    launchConfetti(50);
    lastSuccess = Date.now();
  }catch(e){
    $("updateResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(`Update failed. ${e.message}`);
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// DELETE
$("btnDelete").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("deleteAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("deleteResult").textContent = JSON.stringify(data, null, 2);
    toast("Account deleted");
    speak(`Account ${id} deleted.`);
    launchConfetti(40);

    const idx = carItems.findIndex(x => String(x.accountNumber) === id);
    if (idx !== -1){ carItems.splice(idx, 1); carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1)); renderCarousel(); }
    lastSuccess = Date.now();
  }catch(e){
    $("deleteResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(`Delete failed. ${e.message}`);
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// Initial
window.addEventListener("load", ()=>{
  updateStickyHeight();
  renderCarousel();
  speak("NeoBank voice enabled. Use the microphone for commands. For example: Create account. Search account 123456.");
});
