const $ = (id) => document.getElementById(id);
const API = (p) => `${window.API_PREFIX || ""}${p}`;

const statusDot = $("statusDot");
const statusText = $("statusText");
let lastSuccess = 0;
function setOnline(online){
  statusDot.classList.toggle("online", online);
  statusDot.classList.toggle("offline", !online);
  statusText.textContent = online ? "Online" : "Offline";
}
setOnline(navigator.onLine);
window.addEventListener("online", ()=> setOnline(true));
window.addEventListener("offline", ()=> setOnline(false));
setInterval(()=> setOnline(navigator.onLine && (Date.now()-lastSuccess<15000)), 4000);

function toast(msg, type="ok"){
  const wrap = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; setTimeout(()=> wrap.removeChild(el), 250); }, 3000);
}
function showLoader(on){ $("loader").classList.toggle("hidden", !on); }
function blurActive(){ if (document.activeElement?.blur) document.activeElement.blur(); }

// Magnetic hover shimmer
document.addEventListener("pointermove", e => {
  document.querySelectorAll("button").forEach(btn=>{
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${e.clientX - r.left}px`);
    btn.style.setProperty("--y", `${e.clientY - r.top}px`);
  });
});
// Simple magnetic movement
(function initMagnetic(){
  const magnets = document.querySelectorAll(".magnetic");
  const strength = 0.25, maxShift = 16;
  magnets.forEach(el=>{
    let raf;
    function onMove(e){
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - r.left) - r.width/2) / (r.width/2);
      const dy = ((e.clientY - r.top) - r.height/2) / (r.height/2);
      const tx = Math.max(-1, Math.min(1, dx)) * maxShift;
      const ty = Math.max(-1, Math.min(1, dy)) * maxShift;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=> el.style.transform=`translate(${tx*strength}px, ${ty*strength}px)`);
    }
    function onLeave(){ if (raf) cancelAnimationFrame(raf); el.style.transform="translate(0,0)"; }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  });
})();

// Sticky action bar lift
function updateStickyHeight(){
  const active = document.querySelector(".panel.active");
  const bar = active?.querySelector(".action-bar");
  let h = 0;
  if (bar) {
    const rect = bar.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 4) h = Math.max(0, rect.height);
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
  });
});

// Diagnostics
$("btnWhoAmI").addEventListener("click", async ()=>{
  try {
    const r = await fetch(API("/__whoami"));
    const d = await r.json();
    toast(`Upstream: ${d.apiBase} | creds: ${d.hasClientCreds ? "yes" : "no"}`);
    console.log("WHOAMI:", d);
  } catch(e){ toast(`WhoAmI error: ${e.message}`, "err"); }
});

$("btnUpstream").addEventListener("click", async ()=>{
  showLoader(true);
  try {
    const r = await fetch(API("/__upstream"));
    const d = await r.json();
    if (d.reachable) {
      toast(`Upstream reachable (status ${d.upstreamStatus})`);
    } else {
      toast(`Upstream NOT reachable: ${d.error}`, "err");
    }
    console.log("UPSTREAM TEST:", d);
  } catch(e){ toast(`Upstream test error: ${e.message}`, "err"); }
  finally { showLoader(false); }
});

// Fetch helper
async function doFetch(url, options){
  const res = await fetch(url, options);
  const text = await res.text();
  let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; }
  return {res, data};
}
function convertDOB8to10(s){ return /^\d{8}$/.test(s) ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : ""; }
function bankIsValid(b){ return ["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(b); }

// CREATE
$("btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("name").value||"").trim();
  const dateOfBirth = convertDOB8to10(($("dob").value||"").trim());
  const mobileNumber = ($("mobile").value||"").trim();
  const email = ($("email").value||"").trim();
  const address = ($("address").value||"").trim();
  const adharNumber = ($("aadhaar").value||"").trim();
  const bankName = ($("bank").value||"").trim();

  if(!FullName){ toast("FullName is required","err"); $("name").focus(); return; }
  if(!dateOfBirth){ toast("dateOfBirth must be YYYYMMDD","err"); $("dob").focus(); return; }
  if(!mobileNumber){ toast("mobileNumber is required","err"); $("mobile").focus(); return; }
  if(!email){ toast("email is required","err"); $("email").focus(); return; }
  if(!address){ toast("address is required","err"); $("address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast("Aadhaar must be 12 digits","err"); $("aadhaar").focus(); return; }
  if(!bankIsValid(bankName)){ toast("Select a valid bank","err"); $("bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };
  const btn = $("btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const {res, data} = await doFetch(API(`/accounts?${qs}`), {
      method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("createResult").textContent = JSON.stringify(data, null, 2);
    toast("Account created successfully");
    lastSuccess = Date.now();
  }catch(e){
    $("createResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled=false; showLoader(false); updateStickyHeight();
  }
});

// SEARCH → fill carousel
const carTrack = $("carTrack");
const carPrev = $("carPrev");
const carNext = $("carNext");
let carItems = [], carIndex = 0, carCardWidth = 0;

function renderCarousel(){
  carTrack.innerHTML = carItems.map(item => {
    const fullName = item.FullName || item.fullName || "(No Name)";
    return `
      <div class="gcard" tabindex="0" aria-label="Account card">
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
  } else carCardWidth = 0;
  updateCarousel();
}
function updateCarousel(){
  if (carItems.length === 0 || carCardWidth === 0){ carTrack.style.transform = `translateX(0px)`; return; }
  carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1));
  carTrack.style.transform = `translateX(${-carIndex*carCardWidth}px)`;
}
carPrev?.addEventListener("click", ()=>{ carIndex = Math.max(0, carIndex - 1); updateCarousel(); });
carNext?.addEventListener("click", ()=>{ carIndex = Math.min(carItems.length - 1, carIndex + 1); updateCarousel(); });
(function initCarouselDrag(){
  let isDown=false, startX=0, startOffset=0;
  const viewport = document.querySelector(".carousel-viewport");
  if (!viewport) return;
  const curOffset = ()=> {
    const m = /translateX\((-?\d+(\.\d+)?)px\)/.exec(carTrack.style.transform||"");
    return m ? parseFloat(m[1]) : 0;
  };
  const onDown = e=>{ isDown=true; startX=(e.touches?.[0]?.clientX ?? e.clientX); startOffset=curOffset(); carTrack.style.transition="none"; };
  const onMove = e=>{ if(!isDown) return; const x=(e.touches?.[0]?.clientX ?? e.clientX); carTrack.style.transform=`translateX(${startOffset + (x-startX)}px)`; e.preventDefault(); };
  const onUp = e=>{ if(!isDown) return; isDown=false; carTrack.style.transition="transform .35s ease";
    const endX=(e.changedTouches?.[0]?.clientX ?? e.clientX ?? startX); const dx=endX-startX; const threshold=60;
    if (dx > threshold) carIndex = Math.max(0, carIndex - 1); else if (dx < -threshold) carIndex = Math.min(carItems.length - 1, carIndex + 1);
    updateCarousel();
  };
  viewport.addEventListener("mousedown", onDown);
  viewport.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  viewport.addEventListener("touchstart", onDown, {passive:false});
  viewport.addEventListener("touchmove", onMove, {passive:false});
  viewport.addEventListener("touchend", onUp);
})();

$("btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("getAcc").value||"").trim();
  if(!id){ toast("Account number is required","err"); return; }

  if (carItems.length === 0){
    carTrack.innerHTML = `<div class="gcard"><div class="skeleton title"></div><div class="skeleton line"></div><div class="skeleton line"></div></div>`;
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
    const idx = carItems.findIndex(x => x.accountNumber === normalized.accountNumber);
    if (idx === -1){ carItems.push(normalized); carIndex = carItems.length - 1; } else { carItems[idx] = normalized; carIndex = idx; }
    renderCarousel();
    toast("Account fetched");
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
  }finally{
    showLoader(false); updateStickyHeight();
  }
});

// UPDATE
$("btnUpdate").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("updateAcc").value||"").trim();
  if(!id){ toast("Account number is required","err"); return; }
  const payload = {
    FullName: ($("updateName").value||"").trim(),
    email: ($("updateEmail").value||"").trim(),
    mobileNumber: ($("updateMobile").value||"").trim()
  };
  Object.keys(payload).forEach(k => payload[k]==="" && delete payload[k]);
  if(Object.keys(payload).length===0){ toast("Provide at least one field to update","err"); return; }

  const btn = $("btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), {
      method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("updateResult").textContent = JSON.stringify(data, null, 2);
    toast("Account updated");
    lastSuccess = Date.now();
  }catch(e){
    $("updateResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled=false; showLoader(false); updateStickyHeight();
  }
});

// DELETE
$("btnDelete").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("deleteAcc").value||"").trim();
  if(!id){ toast("Account number is required","err"); return; }

  const btn = $("btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("deleteResult").textContent = JSON.stringify(data, null, 2);
    toast("Account deleted");
    // Remove from carousel if present
    const idx = carItems.findIndex(x => String(x.accountNumber) === id);
    if (idx !== -1){ carItems.splice(idx, 1); carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1)); renderCarousel(); }
    lastSuccess = Date.now();
  }catch(e){
    $("deleteResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled=false; showLoader(false); updateStickyHeight();
  }
});

// Init
window.addEventListener("load", ()=>{
  updateStickyHeight();
  // Confetti keyframes (once)
  const s=document.createElement("style"); s.textContent='@keyframes fall { to { transform: translateY(110vh) rotate(360deg) } }'; document.head.appendChild(s);
});
