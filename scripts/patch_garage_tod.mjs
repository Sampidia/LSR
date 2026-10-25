import fs from 'fs';

const files = ['public/garage.html', 'public/hangar.html'];

const todCss = `
    /* Day / Night Environment Toggle */
    .tod-toggle-wrap {
      display: flex;
      align-items: center;
      background: rgba(12, 16, 26, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 999px;
      padding: 3px;
      gap: 3px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .tod-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-dim);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 6px 14px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.22s ease;
    }
    .tod-btn svg {
      transition: transform 0.22s ease;
    }
    .tod-btn:hover {
      color: #fff;
    }
    .tod-btn.active#tod-btn-day {
      background: linear-gradient(135deg, #f5c518 0%, #ff9800 100%);
      color: #06070a;
      box-shadow: 0 0 16px rgba(245, 197, 24, 0.6);
    }
    .tod-btn.active#tod-btn-night {
      background: linear-gradient(135deg, #00e5ff 0%, #7928ca 100%);
      color: #ffffff;
      box-shadow: 0 0 16px rgba(0, 229, 255, 0.6);
    }
    .tod-btn.active svg {
      transform: scale(1.12);
    }
`;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let html = fs.readFileSync(f, 'utf8');

  // 1. Add CSS
  if (!html.includes('.tod-toggle-wrap')) {
    html = html.replace('</style>', `${todCss}\n  </style>`);
  }

  // 2. Add Toggle UI in header top-meta
  const headerTarget = `<div class="top-meta">`;
  const headerReplacement = `<div class="top-meta">
      <!-- Day / Night Environment Toggle -->
      <div class="tod-toggle-wrap" id="tod-toggle-wrap">
        <button type="button" class="tod-btn active" id="tod-btn-day" onclick="setGarageTod('day')" title="Day Mode (99% Daylight)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <span>DAY</span>
        </button>
        <button type="button" class="tod-btn" id="tod-btn-night" onclick="setGarageTod('night')" title="Night Mode (Street Lights & Taillights)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span>NIGHT</span>
        </button>
      </div>`;

  if (html.includes(headerTarget) && !html.includes('id="tod-toggle-wrap"')) {
    html = html.replace(headerTarget, headerReplacement);
  }

  // 3. Add JS functions & update launchRace
  const jsTarget = `window.launchRace = function () {`;
  const jsReplacement = `window.setGarageTod = function (tod) {
      localStorage.setItem('lagos_time_of_day', tod);
      document.getElementById('tod-btn-day')?.classList.toggle('active', tod === 'day');
      document.getElementById('tod-btn-night')?.classList.toggle('active', tod === 'night');
      playBeep(tod === 'night' ? 440 : 660, 0.08, 'sine');
    };
    // Initialize Day/Night from localStorage (default: day)
    (function initTod() {
      const savedTod = localStorage.getItem('lagos_time_of_day') || 'day';
      setTimeout(() => {
        document.getElementById('tod-btn-day')?.classList.toggle('active', savedTod === 'day');
        document.getElementById('tod-btn-night')?.classList.toggle('active', savedTod === 'night');
      }, 50);
    })();

    window.launchRace = function () {
      const currentTod = localStorage.getItem('lagos_time_of_day') || 'day';`;

  if (html.includes(jsTarget) && !html.includes('window.setGarageTod')) {
    html = html.replace(jsTarget, jsReplacement);
  }

  // 4. Update the URL redirect in launchRace
  html = html.replace(/window\.location\.href\s*=\s*['"]\/\?race=1[^'"]*['"]/, `window.location.href = '/?race=1&tod=' + currentTod + '&v=garage2'`);

  fs.writeFileSync(f, html, 'utf8');
  console.log(`Updated ${f} with Day/Night selector!`);
}
