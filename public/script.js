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
  });
});

// Hover shimmer — keep the cursor glow centered
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
  const strength = 0.25;      // attraction
  const maxShift = 16;        // px

  magnets.forEach(el=>{
    let raf = null;

    function onMove(e){
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (mx - cx) / cx;  // -1..1
      const dy = (my - cy) / cy;  // -1..1

      const tx = Math.max(-1, Math.min(1, dx)) * maxShift;
      const ty = Math.max(-1, Math.min(1, dy)) * maxShift;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        el.style.transform = `translate(${tx*strength}px, ${ty*strength}px)`;
      });
    }

    function onLeave(){
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = `translate(0,0)`;
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", ()=> el.style.transform = "scale(0.98)");
    el.addEventListener("touchend", ()=> el.style.transform = "scale(1)");
  });
}
initMagnetic();

// Confetti (blue & pink)
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

// Common fetch wrapper
async function doFetch(url, options){
  const res = await fetch(url, options);
  const text = await res.text();
  let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; }
  return {res, data};
}

/* ====================== CAROUSEL (glassmorphism) ====================== */
const carTrack = $("carTrack");
const carPrev = $("carPrev");
const carNext = $("carNext");
let carItems = [];       // {accountNumber, fullName, mobileNumber, email, dateOfBirth, address, bankName}
let carIndex = 0;
let carCardWidth = 0;

function renderCarousel(){
  carTrack.innerHTML = carItems.map(item => {
    const fullName = item.FullName || item.fullName || "(No Name)";
    return `
      <div class="gcard">
        <h3>${fullName}</h3>
        <p><strong>Account:</strong> ${item.accountNumber ?? "(unknown)"}</p>
        <p><strong>Mobile:</strong> ${item.mobileNumber ?? "(unknown)"}</p>
        <p><strong>Email:</strong> ${item.email ?? "(unknown)"}</p>
        <p><strong>DOB:</strong> ${item.dateOfBirth ?? "(unknown)"}</p>
        <p><strong>Address:</strong> ${item.address ?? "(unknown)"}</p>
        <p><strong>Bank:</strong> ${item.bankName ?? "(unknown)"}</p>
      </div>
    `;
  }).join("");

  // measure first card for width
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
}

carPrev?.addEventListener("click", ()=>{
  carIndex = Math.max(0, carIndex - 1);
  updateCarousel();
});
carNext?.addEventListener("click", ()=>{
  carIndex = Math.min(carItems.length - 1, carIndex + 1);
  updateCarousel();
});
window.addEventListener("resize", ()=>{ renderCarousel(); });

// Drag / Swipe support
(function initCarouselDrag(){
  let isDown = false;
  let startX = 0;
  let startOffset = 0;

  const viewport = document.querySelector(".carousel-viewport");
  if (!viewport) return;

  function currentOffset(){
    const m = /translateX\((-?\d+(\.\d+)?)px\)/.exec(carTrack.style.transform || "");
    return m ? parseFloat(m[1]) : 0;
  }

  const onDown = (e)=>{
    isDown = true;
    startX = (e.touches?.[0]?.clientX ?? e.clientX);
    startOffset = currentOffset();
    carTrack.style.transition = "none";
  };
  const onMove = (e)=>{
    if(!isDown) return;
    const x = (e.touches?.[0]?.clientX ?? e.clientX);
    const dx = x - startX;
    carTrack.style.transform = `translateX(${startOffset + dx}px)`;
    e.preventDefault();
  };
  const onUp = (e)=>{
    if(!isDown) return;
    isDown = false;
    carTrack.style.transition = "transform .35s ease";

    const endX = (e.changedTouches?.[0]?.clientX ?? e.clientX ?? startX);
    const dx = endX - startX;
    const threshold = 60; // px
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

/* ====================== API actions ====================== */

// CREATE
$("btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("name").value || "").trim();
  const dateOfBirth = convertDOB(($("dob").value || "").trim());
  const mobileNumber = ($("mobile").value || "").trim();
  const email = ($("email").value || "").trim();
  const address = ($("address").value || "").trim();
  const adharNumber = ($("aadhaar").value || "").trim(); // RAML key uses 'adharNumber'
  const bankName = ($("bank").value || "").trim();

  // RAML validations
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
    const {res, data} = await doFetch(API(`/accounts?${qs}`), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    $("createResult").textContent = JSON.stringify(data, null, 2);
    toast("Account created successfully");
    launchConfetti(80);
    lastSuccess = Date.now();
  }catch(e){
    $("createResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// SEARCH → adds cards to carousel
$("btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("getAcc").value || "").trim();
  if(!id){ toast("Account number is required", "err"); return; }

  // Show a temporary placeholder card while loading (optional)
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
    if(!res.ok){
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }

    // Normalize and push if not present
    const normalized = {
      accountNumber: data.accountNumber,
      FullName: data.FullName,
      fullName: data.fullName, // handle either
      dateOfBirth: data.dateOfBirth,
      mobileNumber: data.mobileNumber,
      email: data.email,
      address: data.address,
      bankName: data.bankName
    };

    const existsIdx = carItems.findIndex(x => x.accountNumber === normalized.accountNumber);
    if (existsIdx === -1) {
      carItems.push(normalized);
      carIndex = carItems.length - 1;
    } else {
      carItems[existsIdx] = normalized;
      carIndex = existsIdx;
    }

    renderCarousel();
    toast("Account added to carousel");
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
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    $("updateResult").textContent = JSON.stringify(data, null, 2);
    toast("Account updated");
    launchConfetti(50);
    lastSuccess = Date.now();
  }catch(e){
    $("updateResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
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
    if(!res.ok){
      throw new Error((data && data.message) || `HTTP ${res.status}`);
    }
    $("deleteResult").textContent = JSON.stringify(data, null, 2);
    toast("Account deleted");
    launchConfetti(40);

    // Remove from carousel if present
    const idx = carItems.findIndex(x => String(x.accountNumber) === id);
    if (idx !== -1){
      carItems.splice(idx, 1);
      carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1));
      renderCarousel();
    }

    lastSuccess = Date.now();
  }catch(e){
    $("deleteResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// Initial compute of sticky area
window.addEventListener("load", ()=>{
  updateStickyHeight();
  renderCarousel(); // empty at start
});
