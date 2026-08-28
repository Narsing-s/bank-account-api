/* NOVA frontend hotfix: safe DOM access + email-only login */
const $ = (id) => document.getElementById(id);
const qa = (sel) => Array.from(document.querySelectorAll(sel));

function API(path){
  const cfg=window.AppConfig||{mode:'web',WEB_PREFIX:'/api',ANDROID_BASE:''};
  if(cfg.mode==='android'&&cfg.ANDROID_BASE)return `${cfg.ANDROID_BASE}${path}`;
  return `${window.API_PREFIX||cfg.WEB_PREFIX||'/api'}${path}`;
}

const statusDot=$("statusDot"), statusText=$("statusText"), loader=$("loader"), respOverlay=$("respOverlay"), respBody=$("respBody");
function toast(msg,type='ok'){const wrap=$("toasts");if(!wrap)return;const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;wrap.appendChild(el);setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),220)},2800)}
function showLoader(on){loader?.classList.toggle('hidden',!on)}
function blurActive(){document.activeElement?.blur?.()}
function setOnline(on){statusDot?.classList.toggle('online',on);statusDot?.classList.toggle('offline',!on);if(statusText)statusText.textContent=on?'Online':'Offline'}
setOnline(navigator.onLine);window.addEventListener('online',()=>setOnline(true));window.addEventListener('offline',()=>setOnline(false));
document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.md-ripple,.nav-item,.btn,.icon-btn');if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty('--x',`${e.clientX-r.left}px`);el.style.setProperty('--y',`${e.clientY-r.top}px`)});

function unlocked(){return localStorage.getItem('unlocked')==='1'}
function setUnlocked(on){localStorage.setItem('unlocked',on?'1':'0');$("loginSheet")?.classList.toggle('hidden',on)}
function requireUnlock(){if(!unlocked())$("loginSheet")?.classList.remove('hidden')}

// Email-only login. Never access removed biometric elements.
function doEmailLogin(){
  const input=$("loginEmail") || $("loginUser") || $("emailLogin");
  const email=(input?.value||'').trim();
  if(!email)return toast('Enter your email','err');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Enter a valid email','err');
  localStorage.setItem('loginEmail',email);setUnlocked(true);toast('Logged in successfully');
}
$("btnEmailLogin")?.addEventListener('click',doEmailLogin);
$("btnLoginEmail")?.addEventListener('click',doEmailLogin);
$("loginEmail")?.addEventListener('keydown',e=>{if(e.key==='Enter')doEmailLogin()});
$("loginUser")?.addEventListener('keydown',e=>{if(e.key==='Enter')doEmailLogin()});

$("btnCloseResp")?.addEventListener('click',()=>respOverlay?.classList.add('hidden'));
$("btnCopyResp")?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(respBody?.textContent||'');toast('Copied')}catch{toast('Copy failed','err')}});

// Remove legacy biometric controls if an older cached HTML is ever served.
['btnPasskeyRegister','btnPasskeyLogin','btnBiometricRegister','btnBiometricLogin'].forEach(id=>$(id)?.remove());

async function doFetch(url,options){const res=await fetch(url,options);const text=await res.text();let data;try{data=text?JSON.parse(text):{}}catch{data=text}return{res,data,text}}
function showResponse(obj){if(!respBody||!respOverlay)return;respBody.textContent=typeof obj==='string'?obj:JSON.stringify(obj,null,2);respOverlay.classList.remove('hidden')}
function convertDOB(d){const s=String(d||'').trim();return/^\d{8}$/.test(s)?`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`:''}

$("btnCreate")?.addEventListener('click',async()=>{if(!unlocked())return requireUnlock();blurActive();const FullName=$("name")?.value.trim()||'',dateOfBirth=convertDOB($("dob")?.value),mobileNumber=$("mobile")?.value.trim()||'',email=$("email")?.value.trim()||'',address=$("address")?.value.trim()||'',adharNumber=$("aadhaar")?.value.trim()||'',bankName=$("bank")?.value.trim()||'';if(!FullName)return toast('Full Name is required','err');if(!dateOfBirth)return toast('DOB must be YYYYMMDD','err');if(!mobileNumber)return toast('Mobile is required','err');if(!email)return toast('Email is required','err');if(!address)return toast('Address is required','err');if(!/^\d{12}$/.test(adharNumber))return toast('Aadhaar must be 12 digits','err');if(!['SBI','HDFC','APGIVB','AXIS','ICICI'].includes(bankName))return toast('Select a valid bank','err');const btn=$("btnCreate");btn.disabled=true;showLoader(true);try{const{res,data,text}=await doFetch(API(`/accounts?${new URLSearchParams({adharNumber,bankName})}`),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({FullName,dateOfBirth,mobileNumber,email,address})});showResponse(data||text);if(!res.ok)throw new Error(data?.message||`HTTP ${res.status}`);toast('Account created')}catch(e){toast(e.message||'Request failed','err')}finally{btn.disabled=false;showLoader(false)}});

$("btnSearch")?.addEventListener('click',async()=>{if(!unlocked())return requireUnlock();const id=$("getAcc")?.value.trim()||'';if(!id)return toast('Account number is required','err');showLoader(true);try{const{res,data,text}=await doFetch(API(`/accounts/${encodeURIComponent(id)}`));showResponse(data||text);if(!res.ok)throw new Error(data?.message||`HTTP ${res.status}`);toast('Account loaded')}catch(e){toast(e.message||'Request failed','err')}finally{showLoader(false)}});

// Safe initialization: every optional control is guarded with ?. 
qa('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{qa('.screen').forEach(s=>s.classList.toggle('active',s.id===btn.dataset.tab));qa('.nav-item').forEach(n=>n.classList.toggle('active',n===btn))}));
$("btnSettings")?.addEventListener('click',()=>$("settings")?.classList.remove('hidden'));
$("btnCloseSettings")?.addEventListener('click',()=>$("settings")?.classList.add('hidden'));
$("efab")?.addEventListener('click',()=>{$("create")?.scrollIntoView({behavior:'smooth'});$("name")?.focus()});

if(!unlocked())requireUnlock();
