/**
 * ═══════════════════════════════════════════════════════════════════════
 * LAGOS STREET RACE — ARCADE SPEEDOMETER & NITRO (AIR) GAUGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════
 * Screen-space 60 FPS vector HUD matching authentic arcade racing dials.
 * Renders circular speed arc, tick marks, redline zone, and integrated
 * NOS Air/Nitro cylinder with real-time pressure sweep.
 */

(function () {
  'use strict';

  // Inject speedometer HTML template into document
  function initSpeedometer() {
    if (document.getElementById('speedometer-cluster')) return;

    const container = document.createElement('div');
    container.id = 'speedometer-cluster';
    container.innerHTML = `
      <div class="speedo-dial" id="speedo-dial">
        <!-- SVG Radial Gauges (200x200 viewBox) -->
        <svg class="speedo-svg" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <!-- Cyan Glow Filter -->
            <filter id="gauge-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <!-- Redline Glow Filter -->
            <filter id="gauge-glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <!-- Cyan to White Linear Gradient for Speed -->
            <linearGradient id="speed-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#00a8ff" />
              <stop offset="65%" stop-color="#00f0ff" />
              <stop offset="100%" stop-color="#ffffff" />
            </linearGradient>
            <!-- Nitro Gradient -->
            <linearGradient id="nitro-grad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0088ff" />
              <stop offset="60%" stop-color="#00e5ff" />
              <stop offset="100%" stop-color="#70f3ff" />
            </linearGradient>
            <linearGradient id="nitro-low-grad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#990011" />
              <stop offset="100%" stop-color="#ff2a44" />
            </linearGradient>
          </defs>

          <!-- Outer Background Track Arc (R=80, 270 deg from 135 to 405) -->
          <!-- Arc path: Center (100,100), R=80, from (43.43, 156.57) to (156.57, 156.57) -->
          <path d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.12)" 
                stroke-width="7" 
                stroke-linecap="round" />

          <!-- Radial Tick Marks (Dashed Inner Circle R=72) -->
          <circle cx="100" cy="100" r="72" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.35)" 
                  stroke-width="4" 
                  stroke-dasharray="2 9.3" 
                  stroke-dashoffset="0" />

          <!-- Redline Zone Segment (Top-Right high speed sector: R=80, from approx 15 to 45 deg) -->
          <path id="speedo-redline-bg" 
                d="M 170.7 72.4 A 80 80 0 0 1 156.57 156.57" 
                fill="none" 
                stroke="rgba(255, 42, 68, 0.45)" 
                stroke-width="7" 
                stroke-linecap="round" />

          <!-- Dynamic Active Speed Fill Arc (R=80, length = ~377) -->
          <path id="speedo-arc-fill" 
                d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57" 
                fill="none" 
                stroke="url(#speed-grad)" 
                stroke-width="7" 
                stroke-linecap="round" 
                stroke-dasharray="377" 
                stroke-dashoffset="377" 
                filter="url(#gauge-glow-cyan)" />

          <!-- Nitro / Air Outer Pressure Gauge (R=92, length = ~240) -->
          <path id="nitro-arc-fill" 
                d="M 165 165 A 92 92 0 1 1 100 8" 
                fill="none" 
                stroke="url(#nitro-grad)" 
                stroke-width="5" 
                stroke-linecap="round" 
                stroke-dasharray="240" 
                stroke-dashoffset="0" 
                filter="url(#gauge-glow-cyan)" />
        </svg>

        <!-- Center Digital Speedometer Display -->
        <div class="speedo-center">
          <div class="speedo-digits" id="speedo-digits">0</div>
          <div class="speedo-unit">KM/H</div>
        </div>

        <!-- Integrated Nitro / Air NOS Canister -->
        <div class="nitro-bottle-wrap" id="nitro-bottle-wrap">
          <div class="nitro-exhaust-glow"></div>
          <svg class="nitro-bottle-svg" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Valve Stem & Knob -->
            <rect x="17" y="2" width="6" height="7" rx="1.5" fill="#a0aab8" />
            <polygon points="12,4 16,6 16,2" fill="#d0d7de" />
            <!-- Valve Collar & Pressure Gauge -->
            <rect x="15" y="9" width="10" height="5" rx="1" fill="#717d8e" />
            <circle cx="20" cy="11.5" r="2" fill="#00e5ff" />
            <!-- Cylinder Dome Shoulder -->
            <path d="M 13 14 C 13 14, 15 13, 20 13 C 25 13, 27 14, 27 14 L 30 19 L 10 19 Z" fill="#b8c2cc" />
            <!-- Cylinder Main Body (High-Tech Blue with Metallic Highlights) -->
            <rect x="9" y="19" width="22" height="34" rx="4" fill="url(#cylinder-body-grad)" />
            <!-- Cylinder Bottom Cap -->
            <path d="M 10 52 C 10 57, 30 57, 30 52 Z" fill="#1565c0" />
            <!-- High-Gloss Specular Highlight -->
            <path d="M 12 21 L 15 21 L 15 51 L 12 51 Z" fill="rgba(255, 255, 255, 0.45)" rx="1" />
            <!-- "AIR" Micro Badge -->
            <rect x="14" y="30" width="12" height="7" rx="1.5" fill="rgba(0, 0, 0, 0.55)" />
            <text x="20" y="35.5" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="900" fill="#00f0ff" text-anchor="middle" letter-spacing="0.5">AIR</text>

            <defs>
              <linearGradient id="cylinder-body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0d47a1" />
                <stop offset="35%" stop-color="#1e88e5" />
                <stop offset="70%" stop-color="#29b6f6" />
                <stop offset="100%" stop-color="#0d47a1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  // Speedometer State & Controller
  let speedArcLength = 377;
  let nitroArcLength = 240;
  let displayKmh = 0;
  let lastAir = 100;

  function updateGauge() {
    const cluster = document.getElementById('speedometer-cluster');
    const dial = document.getElementById('speedo-dial');
    const digits = document.getElementById('speedo-digits');
    const speedArc = document.getElementById('speedo-arc-fill');
    const nitroArc = document.getElementById('nitro-arc-fill');
    const nitroBottle = document.getElementById('nitro-bottle-wrap');

    if (!cluster || !dial || !digits || !speedArc || !nitroArc || !nitroBottle) {
      requestAnimationFrame(updateGauge);
      return;
    }

    const game = window.__GAME__?.game;
    const player = game?.player;
    const mode = game?.mode || window.__GAME__?.getState?.()?.mode;

    // Show speedometer only during active race
    if (mode === 'playing' || mode === 'crashed') {
      cluster.classList.add('active');
    } else {
      cluster.classList.remove('active');
      requestAnimationFrame(updateGauge);
      return;
    }

    if (player) {
      // 1. Calculate and Smooth Speed (KM/H)
      // Base cruising speed ~26 m/s = ~120 km/h; max non-boost ~55 m/s = ~245 km/h; rocket/boost ~75-95 m/s = ~330-410 km/h
      const rawSpeed = Math.max(0, player.speed || 0);
      const targetKmh = Math.round(rawSpeed * 3.6 * 1.25);
      
      // Smooth interpolation for digital numbers and needle
      displayKmh += (targetKmh - displayKmh) * 0.16;
      if (Math.abs(displayKmh - targetKmh) < 0.5) displayKmh = targetKmh;

      digits.textContent = Math.round(displayKmh);

      // Radial Speed Arc (0 to 350 km/h mapped to 0% - 100% of arc length 377)
      const maxKmh = 340;
      const speedPct = Math.min(1, Math.max(0, displayKmh / maxKmh));
      const speedOffset = speedArcLength * (1 - speedPct);
      speedArc.style.strokeDashoffset = speedOffset.toFixed(2);

      // Redline styling (over 230 KM/H)
      const isRedline = displayKmh >= 230;
      dial.classList.toggle('redline', isRedline);
      if (isRedline) {
        speedArc.setAttribute('filter', 'url(#gauge-glow-red)');
      } else {
        speedArc.setAttribute('filter', 'url(#gauge-glow-cyan)');
      }

      // 2. Nitro / Air Pressure Arc & Bottle FX
      const air = player.air != null ? Math.max(0, Math.min(100, player.air)) : 100;
      const airPct = air / 100;
      const nitroOffset = nitroArcLength * (1 - airPct);
      nitroArc.style.strokeDashoffset = nitroOffset.toFixed(2);

      // Air Low Alert (< 22%)
      const isLowAir = air <= 22;
      nitroBottle.classList.toggle('low-air', isLowAir);
      if (isLowAir) {
        nitroArc.setAttribute('stroke', 'url(#nitro-low-grad)');
        nitroArc.setAttribute('filter', 'url(#gauge-glow-red)');
      } else {
        nitroArc.setAttribute('stroke', 'url(#nitro-grad)');
        nitroArc.setAttribute('filter', 'url(#gauge-glow-cyan)');
      }

      // Boosting state (Nitro exhaust flame + subtle dial vibration)
      const isBoosting = !!(player.boosting || (player.rocketTimer || 0) > 0);
      dial.classList.toggle('boosting', isBoosting);
      dial.classList.toggle('shake', isBoosting || displayKmh > 270);
      nitroBottle.classList.toggle('active-boost', isBoosting);

      lastAir = air;
    }

    requestAnimationFrame(updateGauge);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSpeedometer();
      requestAnimationFrame(updateGauge);
    });
  } else {
    initSpeedometer();
    requestAnimationFrame(updateGauge);
  }
})();
