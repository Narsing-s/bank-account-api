// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const API = (path) => `${window.API_PREFIX || ""}${path}`;

const statusDot = $("statusDot");
const statusText = $("statusText");
const loader = $("loader");
const uiLangSelect = $("uiLangSelect");
const ttsToggle = $("ttsToggle");
const voiceSelect = $("voiceSelect");
const langSelect = $("langSelect");
const micBtn = $("micBtn");

// ---------- i18n dictionary (EN, HI, TE) ----------
const I18N_KEY = "nb_ui_lang";
const translations = {
  en: {
    title: "NeoBank — Blue/Pink Animated UI (Voice + Multi-language)",
    brandTitle: "NeoBank Control Center",
    brandSub: "Blue × Pink Animated Experience + Voice",
    tabs: { create: "Create", search: "Search", update: "Update", delete: "Delete" },
    speak: "Speak",
    createTitle: "Create Account",
    searchTitle: "Search Account",
    updateTitle: "Update Account",
    deleteTitle: "Delete Account",
    labels: {
      fullName: "Full Name",
      dob: "Date of Birth (YYYYMMDD)",
      mobile: "Mobile",
      email: "Email",
      address: "Address",
      aadhaar: "Aadhaar (12 digits)",
      bank: "Bank",
      accountNumber: "Account Number"
    },
    placeholders: {
      fullName: "e.g., Jane Doe",
      dob: "19900131",
      mobile: "10-digit number",
      email: "name@example.com",
      address: "Street, City",
      searchAcc: "Enter account number",
      updateName: "New full name"
    },
    buttons: {
      create: "Create Account",
      search: "Search",
      update: "Update",
      delete: "Delete"
    },
    toasts: {
      required: "{field} is required",
      dobInvalid: "dateOfBirth must be YYYYMMDD",
      aadhaarInvalid: "Aadhaar must be 12 digits",
      bankInvalid: "Select a valid bank",
      created: "Account created successfully",
      fetched: "Account fetched",
      updated: "Account updated",
      deleted: "Account deleted",
      provideField: "Provide at least one field to update",
      listening: "Listening…",
      notRecognized: "Voice command not recognized",
      sttNotSupported: "Speech recognition not supported in this browser"
    },
    speak: {
      tab: "{tab} tab selected",
      createOk: "Account created. Your account number is {num}.",
      searchOk: "Account found. Name {name}. Mobile {mobile}. Email {email}.",
      updateOk: "Account {id} updated successfully.",
      deleteOk: "Account {id} deleted.",
      fail: "{action} failed. {reason}",
      prompt: "NeoBank voice enabled. Use the microphone for commands. For example: Create account. Search account 123456."
    },
    fields: { FullName: "FullName", dateOfBirth: "dateOfBirth", mobileNumber: "mobileNumber", email: "email", address: "address" }
  },
  hi: {
    title: "NeoBank — ब्लू/पिंक एनीमेटेड UI (वॉइस + बहुभाषी)",
    brandTitle: "NeoBank कंट्रोल सेंटर",
    brandSub: "ब्लू × पिंक एनीमेटेड अनुभव + वॉइस",
    tabs: { create: "बनाओ", search: "खोज", update: "अपडेट", delete: "हटाओ" },
    speak: "आवाज़",
    createTitle: "खाता बनाएं",
    searchTitle: "खाता खोजें",
    updateTitle: "खाता अपडेट करें",
    deleteTitle: "खाता हटाएं",
    labels: {
      fullName: "पूरा नाम",
      dob: "जन्म तिथि (YYYYMMDD)",
      mobile: "मोबाइल",
      email: "ईमेल",
      address: "पता",
      aadhaar: "आधार (12 अंक)",
      bank: "बैंक",
      accountNumber: "खाता नंबर"
    },
    placeholders: {
      fullName: "उदा., जेन डो",
      dob: "19900131",
      mobile: "10 अंकों का नंबर",
      email: "name@example.com",
      address: "गली, शहर",
      searchAcc: "खाता नंबर दर्ज करें",
      updateName: "नया पूरा नाम"
    },
    buttons: {
      create: "खाता बनाएं",
      search: "खोज",
      update: "अपडेट",
      delete: "हटाएं"
    },
    toasts: {
      required: "{field} आवश्यक है",
      dobInvalid: "जन्म तिथि YYYYMMDD होनी चाहिए",
      aadhaarInvalid: "आधार 12 अंकों का होना चाहिए",
      bankInvalid: "सही बैंक चुनें",
      created: "खाता सफलतापूर्वक बना",
      fetched: "खाता प्राप्त हुआ",
      updated: "खाता अपडेट हुआ",
      deleted: "खाता हटाया गया",
      provideField: "अपडेट के लिए कम से कम एक फ़ील्ड दें",
      listening: "सुन रहा हूँ…",
      notRecognized: "वॉइस कमांड समझ नहीं आया",
      sttNotSupported: "यह ब्राउज़र वॉइस रिकग्निशन सपोर्ट नहीं करता"
    },
    speak: {
      tab: "{tab} टैब चुना गया",
      createOk: "खाता बना। आपका खाता नंबर {num} है।",
      searchOk: "खाता मिला। नाम {name}. मोबाइल {mobile}. ईमेल {email}.",
      updateOk: "खाता {id} सफलतापूर्वक अपडेट हुआ।",
      deleteOk: "खाता {id} हटाया गया।",
      fail: "{action} असफल। {reason}",
      prompt: "NeoBank वॉइस सक्षम है। माइक्रोफोन से बोलें: जैसे 'खाता बनाओ', 'खाता 123456 खोजो'।"
    },
    fields: { FullName: "पूरा नाम", dateOfBirth: "जन्म तिथि", mobileNumber: "मोबाइल", email: "ईमेल", address: "पता" }
  },
  te: {
    title: "NeoBank — నీలం/గులాబీ యానిమేటెడ్ UI (వాయిస్ + బహుభాషా)",
    brandTitle: "NeoBank కంట్రోల్ సెంటర్",
    brandSub: "నీలం × గులాబీ యానిమేటెడ్ అనుభవం + వాయిస్",
    tabs: { create: "సృష్టించు", search: "శోధించు", update: "అప్‌డేట్", delete: "తొలగించు" },
    speak: "వాయిస్",
    createTitle: "ఖాతా సృష్టించు",
    searchTitle: "ఖాతా శోధించు",
    updateTitle: "ఖాతా అప్‌డేట్",
    deleteTitle: "ఖాతా తొలగించు",
    labels: {
      fullName: "పూర్తి పేరు",
      dob: "జన్మతేది (YYYYMMDD)",
      mobile: "మొబైల్",
      email: "ఈమెయిల్",
      address: "చిరునామా",
      aadhaar: "ఆధార్ (12 అంకెలు)",
      bank: "బ్యాంక్",
      accountNumber: "ఖాతా నంబర్"
    },
    placeholders: {
      fullName: "ఉదా., జేన్ డో",
      dob: "19900131",
      mobile: "10 అంకెల నంబర్",
      email: "name@example.com",
      address: "వీధి, నగరం",
      searchAcc: "ఖాతా నంబర్ నమోదు చేయండి",
      updateName: "కొత్త పూర్తి పేరు"
    },
    buttons: {
      create: "ఖాతా సృష్టించు",
      search: "శోధించు",
      update: "అప్‌డేట్",
      delete: "తొలగించు"
    },
    toasts: {
      required: "{field} అవసరం",
      dobInvalid: "జన్మతేది YYYYMMDD ఉండాలి",
      aadhaarInvalid: "ఆధార్ 12 అంకెలు ఉండాలి",
      bankInvalid: "సరైన బ్యాంక్ ఎంచుకోండి",
      created: "ఖాతా విజయవంతంగా సృష్టించబడింది",
      fetched: "ఖాతా పొందబడింది",
      updated: "ఖాతా అప్‌డేట్ అయింది",
      deleted: "ఖాతా తొలగించబడింది",
      provideField: "అప్‌డేట్ కోసం కనీసం ఒక ఫీల్డ్ ఇవ్వండి",
      listening: "వింటున్నాను…",
      notRecognized: "వాయిస్ కమాండ్ అర్థం కాలేదు",
      sttNotSupported: "ఈ బ్రౌజర్ వాయిస్ గుర్తింపు సపోర్ట్ చేయదు"
    },
    speak: {
      tab: "{tab} ట్యాబ్ ఎంపికైంది",
      createOk: "ఖాతా సృష్టించబడింది. మీ ఖాతా నంబర్ {num}.",
      searchOk: "ఖాతా దొరికింది. పేరు {name}. మొబైల్ {mobile}. ఈమెయిల్ {email}.",
      updateOk: "ఖాతా {id} విజయవంతంగా అప్‌డేట్ అయింది.",
      deleteOk: "ఖాతా {id} తొలగించబడింది.",
      fail: "{action} విఫలమైంది. {reason}",
      prompt: "NeoBank వాయిస్ ఎనేబుల్ అయింది. మైక్‌తో మాట్లాడండి: ఉదా., 'ఖాతా సృష్టించు', 'ఖాతా 123456 శోధించు'."
    },
    fields: { FullName: "పూర్తి పేరు", dateOfBirth: "జన్మతేది", mobileNumber: "మొబైల్", email: "ఈమెయిల్", address: "చిరునామా" }
  }
};

// State
let currentLang = "en";

// Helpers for i18n
function pickLangFromBrowser(){
  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("hi")) return "hi";
  if (nav.startsWith("te")) return "te";
  return "en";
}
function t(keyPath, vars){
  const lang = translations[currentLang] || translations.en;
  const val = keyPath.split(".").reduce((o,k)=> (o && o[k] != null) ? o[k] : null, lang)
           ?? keyPath.split(".").reduce((o,k)=> (o && o[k] != null) ? o[k] : null, translations.en)
           ?? keyPath;
  if (!vars) return val;
  return val.replace(/\{(\w+)\}/g, (_,k)=> (vars[k] != null ? vars[k] : ""));
}
function setUILang(lang){
  if (lang === "auto") currentLang = pickLangFromBrowser();
  else currentLang = ["en","hi","te"].includes(lang) ? lang : "en";
  localStorage.setItem(I18N_KEY, lang);
  applyI18n();
  // Map UI language to default STT language (user can override)
  const defaultMic = currentLang === "hi" ? "hi-IN" : currentLang === "te" ? "te-IN" : "en-IN";
  if (!langSelect.dataset.userSet) { // only auto-set if user didn't pick
    langSelect.value = defaultMic;
  }
  // Attempt to auto-pick a matching TTS voice
  autoPickVoiceFor(currentLang);
  // Update HTML lang attribute for accessibility
  document.documentElement.lang = currentLang === "en" ? "en" : currentLang === "hi" ? "hi" : "te";
}
function applyI18n(){
  // Titles
  $("#titleText").textContent = t("title");
  $("#brandTitle").textContent = t("brandTitle");
  $("#brandSub").textContent = t("brandSub");
  $("#speakLabel").textContent = t("speak");
  // Tabs
  $("#tabCreate").textContent = t("tabs.create");
  $("#tabSearch").textContent = t("tabs.search");
  $("#tabUpdate").textContent = t("tabs.update");
  "#tabDelete" && ($("#tabDelete").textContent = t("tabs.delete"));
  // Section titles
  $("#createTitle").textContent = t("createTitle");
  $("#searchTitle").textContent = t("searchTitle");
  $("#updateTitle").textContent = t("updateTitle");
  $("#deleteTitle").textContent = t("deleteTitle");
  // Labels
  $("#lblFullName").childNodes[0].nodeValue = t("labels.fullName") + " ";
  $("#lblDob").childNodes[0].nodeValue = t("labels.dob") + " ";
  $("#lblMobile").childNodes[0].nodeValue = t("labels.mobile") + " ";
  $("#lblEmail").childNodes[0].nodeValue = t("labels.email") + " ";
  $("#lblAddress").childNodes[0].nodeValue = t("labels.address") + " ";
  $("#lblAadhaar").childNodes[0].nodeValue = t("labels.aadhaar") + " ";
  $("#lblBank").childNodes[0].nodeValue = t("labels.bank") + " ";
  $("#lblSearchAcc").childNodes[0].nodeValue = t("labels.accountNumber") + " ";
  $("#lblUpdateAcc").childNodes[0].nodeValue = t("labels.accountNumber") + " ";
  $("#lblUpdateName").childNodes[0].nodeValue = t("labels.fullName") + " ";
  $("#lblUpdateEmail").childNodes[0].nodeValue = t("labels.email") + " ";
  $("#lblUpdateMobile").childNodes[0].nodeValue = t("labels.mobile") + " ";
  $("#lblDeleteAcc").childNodes[0].nodeValue = t("labels.accountNumber") + " ";
  // Placeholders
  $("#name").placeholder = t("placeholders.fullName");
  $("#dob").placeholder = t("placeholders.dob");
  $("#mobile").placeholder = t("placeholders.mobile");
  $("#email").placeholder = t("placeholders.email");
  $("#address").placeholder = t("placeholders.address");
  $("#getAcc").placeholder = t("placeholders.searchAcc");
  $("#updateName").placeholder = t("placeholders.updateName");
  $("#updateEmail").placeholder = t("placeholders.email");
  $("#updateMobile").placeholder = t("placeholders.mobile");
  $("#deleteAcc").placeholder = t("placeholders.searchAcc");
  // Buttons
  $("#btnCreate").textContent = t("buttons.create");
  $("#btnSearch").textContent = t("buttons.search");
  $("#btnUpdate").textContent = t("buttons.update");
  $("#btnDelete").textContent = t("buttons.delete");
}

// Load preferred UI language
(function initLang(){
  const saved = localStorage.getItem(I18N_KEY) || "auto";
  uiLangSelect.value = saved;
  setUILang(saved);
})();

// React to changes
uiLangSelect.addEventListener("change", (e)=> setUILang(e.target.value));
langSelect.addEventListener("change", ()=> { langSelect.dataset.userSet = "1"; });

// ---------- Toast & Speech ----------
function toast(msg, type="ok"){
  const wrap = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  speak(msg, { priority: "toast" });
  setTimeout(() => { el.style.opacity = "0"; setTimeout(()=> wrap.removeChild(el), 250); }, 3000);
}

// TTS
let voices = [];
function loadVoices(){
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voiceSelect.innerHTML = `<option value="">Auto Voice</option>` + voices.map(v =>
    `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("");
  // After voices load, try autopick again
  autoPickVoiceFor(currentLang);
}
if ('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}
function autoPickVoiceFor(lang){
  if (!('speechSynthesis' in window)) return;
  if (voiceSelect.value) return; // user already chose
  const target = lang === "hi" ? "hi-" : lang === "te" ? "te-" : "en-";
  const match = voices.find(v => (v.lang || "").toLowerCase().startsWith(target));
  if (match) voiceSelect.value = match.name;
}
function speak(text, opts={}){
  if (!ttsToggle.checked) return;
  if (!('speechSynthesis' in window)) return;
  if (!text) return;
  if (opts.priority === "toast") { window.speechSynthesis.cancel(); }
  const u = new SpeechSynthesisUtterance(text);
  const sel = voiceSelect.value;
  if (sel){
    const v = voices.find(x => x.name === sel);
    if (v) { u.voice = v; u.lang = v.lang; }
  } else {
    u.lang = currentLang === "hi" ? "hi-IN" : currentLang === "te" ? "te-IN" : "en-IN";
  }
  u.rate = 1.0; u.pitch = 1.0; u.volume = 1;
  window.speechSynthesis.speak(u);
}

// ---------- Online badge ----------
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

// ---------- Animations: hover shimmer / magnetic ----------
document.addEventListener("pointermove", e => {
  document.querySelectorAll("button").forEach(btn=>{
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});
function initMagnetic(){
  const magnets = document.querySelectorAll(".magnetic");
  const strength = 0.25, maxShift = 16;
  magnets.forEach(el=>{
    let raf = null;
    function onMove(e){
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - r.left) - r.width/2) / (r.width/2);
      const dy = ((e.clientY - r.top) - r.height/2) / (r.height/2);
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

// ---------- Confetti ----------
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
(function(){ const s=document.createElement("style"); s.textContent='@keyframes fall { to { transform: translateY(110vh) rotate(360deg) } }'; document.head.appendChild(s); })();

// ---------- Sticky bar lift ----------
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

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
    setTimeout(()=> $(btn.dataset.tab)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    setTimeout(updateStickyHeight, 150);
    // Speak which tab
    const tabName = btn.textContent;
    speak(t("speak.tab", { tab: tabName }));
  });
});

// ---------- STT ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, isListening = false;

function startListen(){
  if (!SR){ toast(t("toasts.sttNotSupported"), "err"); return; }
  if (isListening) return;
  rec = new SR();
  rec.lang = langSelect.value || "en-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onstart = ()=>{ isListening = true; micBtn.classList.add("listening"); toast(t("toasts.listening")); };
  rec.onerror = (e)=>{ isListening = false; micBtn.classList.remove("listening"); toast(`Voice error: ${e.error}`, "err"); };
  rec.onend = ()=>{ isListening = false; micBtn.classList.remove("listening"); };
  rec.onresult = (e)=>{
    const transcript = (e.results?.[0]?.[0]?.transcript || "").trim();
    if (!transcript) { toast(t("toasts.notRecognized")); return; }
    handleVoiceCommand(transcript);
  };
  rec.start();
}
function stopListen(){ if (rec && isListening) rec.stop(); }
micBtn.addEventListener("click", ()=>{ if (isListening) stopListen(); else startListen(); });

// ---------- Voice intents (EN/HI/TE basic) ----------
function digitsOnly(s){ return s.replace(/\D/g,''); }
function handleVoiceCommand(raw){
  const q = raw.toLowerCase();
  speak(`You said: ${raw}`);

  // Map synonyms per language
  const lang = currentLang;
  const key = (s) => q.includes(s);

  // Tabs
  if ((lang==="hi" && (key("बनाओ") || key("बनाइए") || key("बन")) ) ||
      (lang==="te" && (key("సృష్టించు") || key("క్రియేట్")) ) ||
      key("create")) { document.querySelector('[data-tab="create"]').click(); return; }

  if ((lang==="hi" && (key("खोज") || key("ढूँढ") || key("ढूंढ")) ) ||
      (lang==="te" && (key("శోధించు") || key("వెతుకు")) ) ||
      key("search")) { document.querySelector('[data-tab="search"]').click(); return; }

  if ((lang==="hi" && key("अपडेट")) || (lang==="te" && key("అప్‌డేట్")) || key("update")) {
    document.querySelector('[data-tab="update"]').click(); return;
  }

  if ((lang==="hi" && (key("हटाओ") || key("डिलीट"))) || (lang==="te" && key("తొలగించు")) || key("delete")) {
    document.querySelector('[data-tab="delete"]').click(); return;
  }

  // Fill fields (basic)
  if (key("full name") || key("name ") || key("नाम") || key("పేరు")) {
    const val = raw.replace(/^(full name|name|नाम|पुकार|पता|పేరు)\s*/i,'');
    $("#name").value = val.trim(); toast(`${t("labels.fullName")}: ${val}`); return;
  }
  if (key("mobile") || key("मोबाइल") || key("మొబైల్")) {
    const val = digitsOnly(raw); $("#mobile").value = val.slice(-15); toast(`${t("labels.mobile")}: ${$("#mobile").value}`); return;
  }
  if (key("email") || key("ईमेल") || key("ఈమెయిల్")) {
    const val = raw.replace(/^(\s*email|ईमेल)\s*/i,'').replace(/\s+at\s+/ig,'@').replace(/\s+dot\s+/ig,'.');
    $("#email").value = val.trim(); toast(`${t("labels.email")}: ${$("#email").value}`); return;
  }
  if (key("address") || key("पता") || key("చిరునామా")) {
    const val = raw.replace(/^(address|पता|చిరునామా)\s*/i,'');
    $("#address").value = val.trim(); toast(`${t("labels.address")}: ${$("#address").value}`); return;
  }
  if (key("dob") || key("जन्म") || key("తేది") || key("జన్మ")) {
    const digits = digitsOnly(raw);
    $("#dob").value = digits.slice(0,8); toast(`${t("labels.dob")}: ${$("#dob").value}`); return;
  }
  if (key("aadhaar") || key("aadhar") || key("adhar") || key("आधार") || key("ఆధార్")) {
    const val = digitsOnly(raw); $("#aadhaar").value = val.slice(-12); toast(`${t("labels.aadhaar")}: ${$("#aadhaar").value}`); return;
  }
  if (key("bank") || key("बैंक") || key("బ్యాంక్")) {
    const valid = ["SBI","HDFC","APGIVB","AXIS","ICICI"];
    const up = raw.toUpperCase();
    const pick = valid.find(x => up.includes(x));
    if (pick){ $("#bank").value = pick; toast(`${t("labels.bank")}: ${pick}`); return; }
  }

  // Commands
  if (key("create account") || key("खाता बनाओ") || key("खाता बनाएं") || key("ఖాతా సృష్టించు")) { $("#btnCreate").click(); return; }
  if (key("search account") || key("खाता खोज") || key("खाता ढूंढ") || key("ఖాతా శోధించు")) {
    const num = digitsOnly(raw); if (num) { $("#getAcc").value = num; $("#btnSearch").click(); } else toast(`${t("labels.accountNumber")} ?`);
    return;
  }
  if (key("update account") || key("खाता अपडेट") || key("ఖాతా అప్‌డేట్")) {
    const num = digitsOnly(raw); if (num) $("#updateAcc").value = num; $("#btnUpdate").click(); return;
  }
  if (key("delete account") || key("खाता हटाओ") || key("खाता हटाएं") || key("ఖాతా తొలగించు")) {
    const num = digitsOnly(raw); if (num) { $("#deleteAcc").value = num; $("#btnDelete").click(); } else toast(`${t("labels.accountNumber")} ?`);
    return;
  }

  toast(t("toasts.notRecognized"));
}

// ---------- API helpers ----------
function showLoader(on){ loader.classList.toggle("hidden", !on); }
function blurActive(){ if (document.activeElement?.blur) document.activeElement.blur(); }
function convertDOB(d){
  if(!d) return "";
  const s = String(d).trim();
  if(!/^\d{8}$/.test(s)) return "";
  return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
}
async function doFetch(url, options){
  const res = await fetch(url, options);
  const text = await res.text();
  let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = text; }
  return {res, data};
}

// ---------- Carousel (same as earlier build) ----------
const carTrack = $("carTrack");
const carPrev = $("carPrev");
const carNext = $("carNext");
let carItems = [], carIndex = 0, carCardWidth = 0;

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
  } else carCardWidth = 0;
  updateCarousel();
}
function updateCarousel(){
  if (carItems.length === 0 || carCardWidth === 0){ carTrack.style.transform = `translateX(0px)`; return; }
  carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1));
  const offset = -carIndex * carCardWidth;
  carTrack.style.transform = `translateX(${offset}px)`;
  const cur = carItems[carIndex];
  if (cur) {
    const fn = cur.FullName || cur.fullName || "No Name";
    speak(t("speak.searchOk", { name: fn, mobile: cur.mobileNumber ?? "unknown", email: cur.email ?? "unknown" }));
  }
}
carPrev?.addEventListener("click", ()=>{ carIndex = Math.max(0, carIndex - 1); updateCarousel(); });
carNext?.addEventListener("click", ()=>{ carIndex = Math.min(carItems.length - 1, carIndex + 1); updateCarousel(); });
window.addEventListener("resize", ()=> renderCarousel());
(function initCarouselDrag(){
  let isDown = false, startX=0, startOffset=0;
  const viewport = document.querySelector(".carousel-viewport");
  if (!viewport) return;
  function curOffset(){
    const m = /translateX\((-?\d+(\.\d+)?)px\)/.exec(carTrack.style.transform || ""); return m ? parseFloat(m[1]) : 0;
  }
  const onDown = (e)=>{ isDown=true; startX=(e.touches?.[0]?.clientX ?? e.clientX); startOffset=curOffset(); carTrack.style.transition="none"; };
  const onMove = (e)=>{ if(!isDown) return; const x=(e.touches?.[0]?.clientX ?? e.clientX); const dx=x-startX; carTrack.style.transform=`translateX(${startOffset+dx}px)`; e.preventDefault(); };
  const onUp = (e)=>{ if(!isDown) return; isDown=false; carTrack.style.transition="transform .35s ease";
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

// ---------- Actions: CREATE / SEARCH / UPDATE / DELETE ----------
function bankIsValid(b){ return ["SBI","HDFC","APGIVB","AXIS","ICICI"].includes(b); }

$("#btnCreate").addEventListener("click", async ()=>{
  blurActive();
  const FullName = ($("#name").value || "").trim();
  const dateOfBirth = (function(d){ const s=(d||"").trim(); return /^\d{8}$/.test(s) ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : ""; })($("#dob").value);
  const mobileNumber = ($("#mobile").value || "").trim();
  const email = ($("#email").value || "").trim();
  const address = ($("#address").value || "").trim();
  const adharNumber = ($("#aadhaar").value || "").trim(); // RAML query param key
  const bankName = ($("#bank").value || "").trim();

  if(!FullName){ toast(t("toasts.required", {field: t("labels.fullName")}),"err"); $("#name").focus(); return; }
  if(!dateOfBirth){ toast(t("toasts.dobInvalid"),"err"); $("#dob").focus(); return; }
  if(!mobileNumber){ toast(t("toasts.required",{field:t("labels.mobile")}),"err"); $("#mobile").focus(); return; }
  if(!email){ toast(t("toasts.required",{field:t("labels.email")}),"err"); $("#email").focus(); return; }
  if(!address){ toast(t("toasts.required",{field:t("labels.address")}),"err"); $("#address").focus(); return; }
  if(!/^\d{12}$/.test(adharNumber)){ toast(t("toasts.aadhaarInvalid"),"err"); $("#aadhaar").focus(); return; }
  if(!bankIsValid(bankName)){ toast(t("toasts.bankInvalid"),"err"); $("#bank").focus(); return; }

  const payload = { FullName, dateOfBirth, mobileNumber, email, address };
  const btn = $("#btnCreate");
  btn.disabled = true; showLoader(true);
  try{
    const qs = new URLSearchParams({ adharNumber, bankName }).toString();
    const {res, data} = await doFetch(API(`/accounts?${qs}`), {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("#createResult").textContent = JSON.stringify(data, null, 2);
    toast(t("toasts.created"));
    speak(t("speak.createOk", { num: data.accountNumber ?? "not available" }));
    launchConfetti(80);
    lastSuccess = Date.now();
  }catch(e){
    $("#createResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(t("speak.fail", { action: "Create", reason: e.message }));
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

$("#btnSearch").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("#getAcc").value || "").trim();
  if(!id){ toast(t("toasts.required",{field:t("labels.accountNumber")}),"err"); return; }

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
    toast(t("toasts.fetched"));
    const fn = normalized.FullName || normalized.fullName || "No Name";
    speak(t("speak.searchOk", { name: fn, mobile: normalized.mobileNumber ?? "unknown", email: normalized.email ?? "unknown" }));
    lastSuccess = Date.now();
  }catch(e){
    toast(e.message, "err");
    speak(t("speak.fail",{action:"Search",reason:e.message}));
  }finally{
    showLoader(false); updateStickyHeight();
  }
});

$("#btnUpdate").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("#updateAcc").value || "").trim();
  if(!id){ toast(t("toasts.required",{field:t("labels.accountNumber")}),"err"); return; }

  const payload = {
    FullName: ($("#updateName").value || "").trim(),
    email: ($("#updateEmail").value || "").trim(),
    mobileNumber: ($("#updateMobile").value || "").trim()
  };
  Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);
  if(Object.keys(payload).length === 0){ toast(t("toasts.provideField"), "err"); return; }

  const btn = $("#btnUpdate");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), {
      method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("#updateResult").textContent = JSON.stringify(data, null, 2);
    toast(t("toasts.updated"));
    speak(t("speak.updateOk", { id }));
    launchConfetti(50);
    lastSuccess = Date.now();
  }catch(e){
    $("#updateResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(t("speak.fail",{action:"Update",reason:e.message}));
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

$("#btnDelete").addEventListener("click", async ()=>{
  blurActive();
  const id = ($("#deleteAcc").value || "").trim();
  if(!id){ toast(t("toasts.required",{field:t("labels.accountNumber")}),"err"); return; }

  const btn = $("#btnDelete");
  btn.disabled = true; showLoader(true);
  try{
    const {res, data} = await doFetch(API(`/accounts/${encodeURIComponent(id)}`), { method:"DELETE" });
    if(!res.ok){ throw new Error((data && data.message) || `HTTP ${res.status}`); }
    $("#deleteResult").textContent = JSON.stringify(data, null, 2);
    toast(t("toasts.deleted"));
    speak(t("speak.deleteOk", { id }));
    launchConfetti(40);

    // Remove from carousel if present
    const idx = carItems.findIndex(x => String(x.accountNumber) === id);
    if (idx !== -1){ carItems.splice(idx, 1); carIndex = Math.max(0, Math.min(carIndex, carItems.length - 1)); renderCarousel(); }

    lastSuccess = Date.now();
  }catch(e){
    $("#deleteResult").textContent = `Error: ${e.message}`;
    toast(e.message, "err");
    speak(t("speak.fail",{action:"Delete",reason:e.message}));
  }finally{
    btn.disabled = false; showLoader(false); updateStickyHeight();
  }
});

// ---------- Initial ----------
window.addEventListener("load", ()=>{
  updateStickyHeight();
  renderCarousel();
  speak(translations[currentLang]?.speak?.prompt || translations.en.speak.prompt);
});
