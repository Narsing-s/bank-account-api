<script>
  // ----- Settings Store -----
  const defaultSettings = {
    themeMode: 'system',    // 'system' | 'light' | 'dark'
    accentColor: '#0ea5e9',
    highContrast: false,
    density: 'comfortable', // 'comfortable' | 'compact'
    fontSize: 'md',         // 'sm' | 'md' | 'lg'
    reduceMotion: false
  };

  const SETTINGS_KEY = 'bankapp:settings';

  const loadSettings = () => {
    try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
    catch { return { ...defaultSettings }; }
  };

  const saveSettings = (s) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

  // ----- Apply settings to CSS / DOM -----
  function applySettings(s) {
    const root = document.documentElement;

    // Theme mode
    root.classList.remove('light','hc','system');
    if (s.themeMode === 'light') root.classList.add('light');
    if (s.themeMode === 'system') root.classList.add('system');

    // Dark is default token set; if 'dark', leave root as-is (no 'light' class)

    // Accent color
    root.style.setProperty('--accent', s.accentColor);

    // High contrast
    if (s.highContrast) root.classList.add('hc');

    // Density -> modifies spacing multiplier
    root.style.setProperty('--density', s.density === 'compact' ? 0.85 : 1);

    // Font size
    const scale = s.fontSize === 'sm' ? 0.9 : s.fontSize === 'lg' ? 1.1 : 1;
    root.style.setProperty('--font-scale', scale);

    // Reduce motion
    document.body.style.setProperty('transition', s.reduceMotion ? 'none' : '');
  }

  // ----- UI bindings -----
  const settings = loadSettings();
  applySettings(settings);

  const dlg = document.getElementById('settingsPanel');
  document.getElementById('openSettingsBtn').addEventListener('click', () => dlg.showModal());
  document.getElementById('closeSettingsBtn').addEventListener('click', () => dlg.close());

  // Initialize controls
  const $ = (id) => document.getElementById(id);
  $('themeMode').value = settings.themeMode;
  $('accentColor').value = settings.accentColor;
  $('highContrast').checked = settings.highContrast;
  $('density').value = settings.density;
  $('fontSize').value = settings.fontSize;
  $('reduceMotion').checked = settings.reduceMotion;

  $('saveSettingsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const newSettings = {
      themeMode: $('themeMode').value,
      accentColor: $('accentColor').value,
      highContrast: $('highContrast').checked,
      density: $('density').value,
      fontSize: $('fontSize').value,
      reduceMotion: $('reduceMotion').checked
    };
    saveSettings(newSettings);
    applySettings(newSettings);
    dlg.close();
    toast('Settings saved');
  });

  // ----- Toast helper -----
  const toastEl = document.getElementById('toast');
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ----- Input masks / validation (basic) -----
  const mobile = $('mobile');
  mobile.addEventListener('input', () => {
    mobile.value = mobile.value.replace(/\D/g, '').slice(0,10);
  });

  const aadhaar = $('aadhaar');
  aadhaar.addEventListener('input', () => {
    aadhaar.value = aadhaar.value.replace(/\D/g, '').slice(0,12);
  });

  // Example: Create account submit (wire to your API)
  document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      fullName: $('fullName').value.trim(),
      email: $('email').value.trim(),
      dob: $('dob').value,
      mobile: $('mobile').value,
      address: $('address').value.trim(),
      aadhaar: $('aadhaar').value
    };

    // Basic client validation
    if (!/^\d{10}$/.test(payload.mobile)) {
      toast('Mobile must be 10 digits'); return;
    }
    if (payload.aadhaar && !/^\d{12}$/.test(payload.aadhaar)) {
      toast('Aadhaar must be 12 digits'); return;
    }

    try {
      // TODO: replace with your actual API endpoint
      // const res = await fetch('/api/accounts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      // if (!res.ok) throw new Error(await res.text());
      toast('Account created ✔');  // demo
      e.target.reset();
    } catch (err) {
      console.error(err);
      toast('Failed to create account');
    }
  });

  // Wire Get/Delete similarly
  document.getElementById('getBtn').addEventListener('click', () => toast('Get account (demo)'));
  document.getElementById('delBtn').addEventListener('click', () => toast('Delete account (demo)'));
</script>
