
// src/main.js

// If you don’t use Vite or a bundler, hardcode or read from a global:
const API_BASE = window.API_BASE || 'http://localhost:8080'; // ← change to your backend URL

// Helpers
async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

function show(el, value) {
  el.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

// Create Account
const createForm = document.getElementById('createAccountForm');
const createResp = document.getElementById('createAccountResponse');

createForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    dob: document.getElementById('dob').value,
    mobileNumber: document.getElementById('mobileNumber').value.trim(),
    address: document.getElementById('address').value.trim(),
    bankName: document.getElementById('bankName').value.trim(),
    aadharNumber: document.getElementById('adharNumber').value.trim(),
  };
  try {
    const data = await jsonFetch(`${API_BASE}/api/accounts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    show(createResp, data);
  } catch (err) {
    show(createResp, `Error: ${err.message}`);
  }
});

// Get Account
document.getElementById('getAccountBtn')?.addEventListener('click', async () => {
  const acc = document.getElementById('getAccountNumber').value.trim();
  const out = document.getElementById('getAccountResponse');
  if (!acc) return show(out, 'Please enter an account number');
  try {
    const data = await jsonFetch(`${API_BASE}/api/accounts/${encodeURIComponent(acc)}`);
    show(out, data);
  } catch (err) {
    show(out, `Error: ${err.message}`);
  }
});

// Update Account
document.getElementById('updateAccountBtn')?.addEventListener('click', async () => {
  const acc = document.getElementById('updateAccountNumber').value.trim();
  const out = document.getElementById('updateAccountResponse');
  if (!acc) return show(out, 'Please enter an account number');
  const payload = {
    fullName: document.getElementById('updateFullName').value.trim() || undefined,
    address: document.getElementById('updateAddress').value.trim() || undefined,
    mobileNumber: document.getElementById('updateMobile').value.trim() || undefined,
  };
  // Remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  try {
    const data = await jsonFetch(`${API_BASE}/api/accounts/${encodeURIComponent(acc)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    show(out, data);
  } catch (err) {
    show(out, `Error: ${err.message}`);
  }
});

// Delete Account
document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
  const acc = document.getElementById('deleteAccountNumber').value.trim();
  const out = document.getElementById('deleteAccountResponse');
  if (!acc) return show(out, 'Please enter an account number');
  try {
    const data = await jsonFetch(`${API_BASE}/api/accounts/${encodeURIComponent(acc)}`, {
      method: 'DELETE',
    });
    show(out, data);
  } catch (err) {
    show(out, `Error: ${err.message}`);
  }
});