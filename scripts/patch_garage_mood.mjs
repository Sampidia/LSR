import fs from 'fs';

const files = ['public/garage.html', 'public/hangar.html'];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let html = fs.readFileSync(f, 'utf8');

  // 1. Add Mood CSS
  const moodCss = `
    /* Day / Night Mood Transitions */
    .vignette-overlay {
      transition: background 0.5s ease;
    }
    body.garage-night-mode .vignette-overlay {
      background: radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.45) 15%, rgba(2, 3, 6, 0.98) 88%);
    }
    body.garage-day-mode .vignette-overlay {
      background: radial-gradient(circle at 50% 45%, rgba(120, 160, 255, 0.08) 25%, rgba(8, 12, 20, 0.78) 95%);
    }
    body {
      transition: background-color 0.5s ease;
    }
    body.garage-night-mode {
      background-color: #020306;
    }
    body.garage-day-mode {
      background-color: #0a0e1a;
    }
`;
  if (!html.includes('body.garage-night-mode')) {
    html = html.replace('</style>', `${moodCss}\n  </style>`);
  }

  // 2. Expose lights in Studio Lighting block
  const targetLights = `scene.add(underLight);`;
  const replaceLights = `scene.add(underLight);
    window.__GARAGE_LIGHTS__ = { ambient, keyLight, rimLight, fillLight, underLight, scene };`;
  if (html.includes(targetLights) && !html.includes('window.__GARAGE_LIGHTS__')) {
    html = html.replace(targetLights, replaceLights);
  }

  // 3. Update window.setGarageTod and applyGarageMood
  const oldSetTod = `window.setGarageTod = function (tod) {
      localStorage.setItem('lagos_time_of_day', tod);
      document.getElementById('tod-btn-day')?.classList.toggle('active', tod === 'day');
      document.getElementById('tod-btn-night')?.classList.toggle('active', tod === 'night');
      playBeep(tod === 'night' ? 440 : 660, 0.08, 'sine');
    };`;

  const newSetTod = `window.applyGarageMood = function (tod) {
      const isNight = tod === 'night';
      const gl = window.__GARAGE_LIGHTS__;
      if (gl) {
        if (isNight) {
          // Moody, darker cyber-night garage
          gl.ambient.color.setHex(0x111624);
          gl.ambient.intensity = 0.85;
          gl.keyLight.color.setHex(0xccd8f0);
          gl.keyLight.intensity = 1.9;
          gl.rimLight.color.setHex(0x00d4ff);
          gl.rimLight.intensity = 3.6; // Dramatic blue-cyan rim silhouette
          gl.fillLight.color.setHex(0xff7733);
          gl.fillLight.intensity = 0.5;
          gl.underLight.color.setHex(0x00f0ff);
          gl.underLight.intensity = 4.4; // Glowing neon underglow pops in dark
          gl.scene.background.setHex(0x020306);
          if (gl.scene.fog) gl.scene.fog.color.setHex(0x020306);
        } else {
          // Brighter, vibrant daytime luxury showroom
          gl.ambient.color.setHex(0x283854);
          gl.ambient.intensity = 2.8;
          gl.keyLight.color.setHex(0xfff8ee);
          gl.keyLight.intensity = 4.4;
          gl.rimLight.color.setHex(0x00c8ff);
          gl.rimLight.intensity = 2.2;
          gl.fillLight.color.setHex(0xffb84d);
          gl.fillLight.intensity = 1.8;
          gl.underLight.color.setHex(0x00e5ff);
          gl.underLight.intensity = 2.2;
          gl.scene.background.setHex(0x0c101c);
          if (gl.scene.fog) gl.scene.fog.color.setHex(0x0c101c);
        }
      }
      document.body.classList.toggle('garage-night-mode', isNight);
      document.body.classList.toggle('garage-day-mode', !isNight);
    };

    window.setGarageTod = function (tod) {
      localStorage.setItem('lagos_time_of_day', tod);
      document.getElementById('tod-btn-day')?.classList.toggle('active', tod === 'day');
      document.getElementById('tod-btn-night')?.classList.toggle('active', tod === 'night');
      window.applyGarageMood?.(tod);
      playBeep(tod === 'night' ? 440 : 660, 0.08, 'sine');
    };`;

  if (html.includes(oldSetTod)) {
    html = html.replace(oldSetTod, newSetTod);
  }

  // 4. Update initTod
  const oldInitTod = `    // Initialize Day/Night from localStorage (default: day)
    (function initTod() {
      const savedTod = localStorage.getItem('lagos_time_of_day') || 'day';
      setTimeout(() => {
        document.getElementById('tod-btn-day')?.classList.toggle('active', savedTod === 'day');
        document.getElementById('tod-btn-night')?.classList.toggle('active', savedTod === 'night');
      }, 50);
    })();`;

  const newInitTod = `    // Initialize Day/Night from localStorage (default: day)
    (function initTod() {
      const savedTod = localStorage.getItem('lagos_time_of_day') || 'day';
      setTimeout(() => {
        document.getElementById('tod-btn-day')?.classList.toggle('active', savedTod === 'day');
        document.getElementById('tod-btn-night')?.classList.toggle('active', savedTod === 'night');
        window.applyGarageMood?.(savedTod);
      }, 50);
    })();`;

  if (html.includes(oldInitTod)) {
    html = html.replace(oldInitTod, newInitTod);
  }

  fs.writeFileSync(f, html, 'utf8');
  console.log('Successfully patched garage mood for:', f);
}
