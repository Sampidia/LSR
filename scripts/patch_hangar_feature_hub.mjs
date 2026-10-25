import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add CSS for Hangar Left Column, Feature Hub, and Cyber Modals
  const cssTarget = `    /* Left Sidebar: Vehicle Title & Description Card */
    .vehicle-info-panel {
      position: fixed; top: 140px; left: 36px; z-index: 10;
      width: 360px;`;

  const cssReplacement = `    /* Left Column Container: Stacks Dossier and Feature Hub */
    .hangar-left-col {
      position: fixed;
      top: 130px;
      left: 36px;
      z-index: 10;
      width: 360px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      pointer-events: none;
    }
    .hangar-left-col > * {
      pointer-events: auto;
    }

    /* Left Sidebar: Vehicle Title & Description Card */
    .vehicle-info-panel {
      position: relative;
      width: 100%;
      box-sizing: border-box;`;

  if (!content.includes(cssTarget)) {
    console.error(`Target CSS not found in ${filePath}`);
    return false;
  }
  content = content.replace(cssTarget, cssReplacement);

  // Add the additional styling before @media (max-width: 960px)
  const mediaTarget = `    @media (max-width: 960px) {
      .vehicle-info-panel, .specs-panel-right { display: none; }`;

  const newStylesAndMedia = `    /* Feature Hub Card below Vehicle Dossier */
    .feature-hub-panel {
      position: relative;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 16px 18px 18px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      overflow: hidden;
    }
    .feature-hub-panel::before {
      content: "";
      position: absolute;
      top: -1px;
      right: 24px;
      width: 24px;
      height: 2px;
      background: var(--accent-cyan);
      box-shadow: 0 0 8px var(--accent-cyan);
      border-radius: 2px;
    }
    .feature-hub-panel .panel-tag {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .feature-hub-panel .panel-tag span.hub-live-dot {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--accent-cyan);
    }
    .hub-live-dot::before {
      content: "";
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 6px var(--accent-cyan);
      animation: locPulse 1.8s infinite;
    }
    .hub-tiles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .hub-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 6px 10px;
      background: rgba(18, 26, 44, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      cursor: pointer;
      color: #fff;
      font-family: var(--font-sans);
      outline: none;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hub-tile:hover {
      background: rgba(28, 42, 68, 0.88);
      border-color: rgba(0, 229, 255, 0.45);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 16px rgba(0, 229, 255, 0.2);
    }
    .hub-tile:active {
      transform: translateY(0) scale(0.97);
    }
    .hub-tile-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: all 0.25s ease;
    }
    .hub-tile:hover .hub-tile-icon-wrap {
      transform: scale(1.08);
    }
    .loc-icon {
      background: rgba(0, 229, 255, 0.14);
      color: var(--accent-cyan);
      border: 1px solid rgba(0, 229, 255, 0.3);
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.2);
    }
    .rank-icon {
      background: rgba(245, 197, 24, 0.14);
      color: var(--accent-gold);
      border: 1px solid rgba(245, 197, 24, 0.3);
      box-shadow: 0 0 12px rgba(245, 197, 24, 0.2);
    }
    .custom-icon {
      background: rgba(255, 42, 58, 0.14);
      color: #ff4d6d;
      border: 1px solid rgba(255, 42, 58, 0.3);
      box-shadow: 0 0 12px rgba(255, 42, 58, 0.2);
    }
    .hub-tile-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 4px;
      text-align: center;
      line-height: 1.1;
    }
    .hub-tile-subtitle {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: var(--accent-cyan);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .hub-tile-subtitle::before {
      content: "";
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 6px var(--accent-cyan);
      animation: locPulse 1.8s infinite;
    }
    .hub-tile-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent-gold);
      background: rgba(245, 197, 24, 0.12);
      border: 1px solid rgba(245, 197, 24, 0.35);
      border-radius: 999px;
      padding: 1px 6px;
      line-height: 1.2;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       CYBER-MODAL GLASSMORPHISM (Location & Teasers)
       Authentic Lagos Cyber-Glass Style matching Game Over screen
       ═══════════════════════════════════════════════════════════════════════ */
    .cyber-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(4, 7, 14, 0.78);
      backdrop-filter: blur(14px) saturate(190%);
      -webkit-backdrop-filter: blur(14px) saturate(190%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .cyber-modal-dialog {
      position: relative;
      width: 100%;
      max-width: 620px;
      background: linear-gradient(165deg, rgba(14, 22, 38, 0.94) 0%, rgba(6, 10, 20, 0.90) 100%);
      backdrop-filter: blur(24px) saturate(190%) brightness(1.08);
      -webkit-backdrop-filter: blur(24px) saturate(190%) brightness(1.08);
      border: 1.5px solid rgba(0, 229, 255, 0.35);
      border-radius: 22px;
      padding: 30px 34px 28px;
      box-shadow: 
        0 24px 60px rgba(0, 0, 0, 0.85),
        0 0 30px rgba(0, 229, 255, 0.16),
        inset 0 1px 1px rgba(255, 255, 255, 0.25),
        inset 0 -2px 6px rgba(0, 0, 0, 0.5);
      transform: scale(0.92) translateY(12px);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    .cyber-modal-overlay.open .cyber-modal-dialog {
      transform: scale(1) translateY(0);
    }
    /* Cyber Chamfer Notches */
    .cyber-modal-dialog::before {
      content: "";
      position: absolute;
      top: -2px;
      right: 28px;
      width: 34px;
      height: 3px;
      background: var(--accent-cyan);
      box-shadow: 0 0 10px var(--accent-cyan);
      border-radius: 2px;
    }
    .cyber-modal-dialog::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 28px;
      width: 34px;
      height: 3px;
      background: var(--accent-cyan);
      box-shadow: 0 0 10px var(--accent-cyan);
      border-radius: 2px;
    }
    .modal-close-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
    }
    .modal-close-btn:hover {
      background: rgba(255, 42, 58, 0.25);
      border-color: #ff4d6d;
      color: #fff;
      transform: rotate(90deg);
    }
    .modal-header {
      margin-bottom: 20px;
      text-align: left;
    }
    .modal-overline {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.26em;
      color: var(--accent-cyan);
      text-transform: uppercase;
      text-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
      margin-bottom: 4px;
    }
    .modal-title {
      font-family: var(--font-sans);
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    }
    .modal-subtitle {
      font-size: 13px;
      color: #a4b3c6;
      margin: 0;
      line-height: 1.4;
    }
    .location-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 22px;
    }
    .loc-card {
      background: rgba(14, 20, 32, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      position: relative;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      min-height: 154px;
    }
    .loc-card.active-card {
      background: linear-gradient(145deg, rgba(14, 38, 56, 0.85) 0%, rgba(8, 22, 34, 0.75) 100%);
      border: 1.5px solid var(--accent-cyan);
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.3);
    }
    .loc-card:hover:not(.locked-card) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 18px rgba(0, 229, 255, 0.3);
    }
    .loc-card.locked-card {
      opacity: 0.72;
      background: rgba(12, 16, 24, 0.5);
      border-style: dashed;
      border-color: rgba(255, 255, 255, 0.16);
    }
    .loc-card.locked-card:hover {
      opacity: 0.95;
      border-color: rgba(245, 197, 24, 0.5);
      transform: translateY(-2px);
    }
    .loc-card-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .status-label {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: var(--accent-cyan);
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .locked-label {
      color: var(--accent-gold);
    }
    .loc-pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 8px var(--accent-cyan);
      animation: locPulse 1.6s infinite;
    }
    @keyframes locPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .loc-badge {
      font-family: var(--font-mono);
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 999px;
      padding: 2px 7px;
    }
    .active-badge {
      background: rgba(0, 229, 255, 0.18);
      border: 1px solid var(--accent-cyan);
      color: #fff;
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.35);
    }
    .locked-badge {
      background: rgba(245, 197, 24, 0.12);
      border: 1px solid rgba(245, 197, 24, 0.35);
      color: var(--accent-gold);
    }
    .loc-card-name {
      font-family: var(--font-sans);
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.01em;
      color: #ffffff;
      margin-bottom: 3px;
    }
    .loc-card-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      color: rgba(220, 240, 255, 0.65);
      margin-bottom: 8px;
    }
    .loc-card-desc {
      font-size: 11.5px;
      color: #9cb1c9;
      line-height: 1.45;
      margin-bottom: 12px;
    }
    .loc-card-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .loc-meta {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.55);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 14px;
      margin-top: 8px;
    }
    .modal-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      letter-spacing: 0.14em !important;
      text-transform: uppercase !important;
      border-radius: 999px !important;
      cursor: pointer;
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.28) 0%, rgba(0, 229, 255, 0.08) 100%) !important;
      border: 1px solid var(--accent-cyan) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(0, 229, 255, 0.3) !important;
      transition: all 0.22s ease;
    }
    .modal-action-btn:hover {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.45) 0%, rgba(0, 229, 255, 0.16) 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(0, 229, 255, 0.45) !important;
    }

    /* Teaser Dialog Styles */
    .teaser-modal {
      max-width: 480px;
      text-align: center;
    }
    .teaser-modal .modal-header {
      text-align: center;
    }
    .teaser-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 12px 0 22px;
    }
    .teaser-icon-large {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: rgba(0, 229, 255, 0.12);
      border: 1px solid rgba(0, 229, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 0 24px rgba(0, 229, 255, 0.25);
    }
    .teaser-text {
      font-size: 13.5px;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 16px 0;
      max-width: 380px;
    }
    .teaser-status-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.16em;
      color: var(--accent-gold);
      background: rgba(245, 197, 24, 0.14);
      border: 1px solid rgba(245, 197, 24, 0.35);
      border-radius: 999px;
      padding: 5px 14px;
    }
    .teaser-modal .modal-footer {
      justify-content: center;
    }

    /* Cyber Toast Notification */
    .cyber-toast {
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%) translateY(30px);
      background: rgba(14, 22, 38, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--accent-gold);
      box-shadow: 0 12px 30px rgba(0,0,0,0.7), 0 0 20px rgba(245, 197, 24, 0.25);
      border-radius: 999px;
      padding: 10px 22px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      z-index: 2000;
      color: #ffffff;
      font-family: var(--font-sans);
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .cyber-toast .toast-icon {
      font-size: 16px;
    }

    @media (max-width: 960px) {
      .hangar-left-col, .vehicle-info-panel, .specs-panel-right { display: none; }
      .location-grid { grid-template-columns: 1fr; }
      .cyber-modal-dialog { padding: 22px 20px; }`;

  if (!content.includes(mediaTarget)) {
    console.error(`Media query target not found in ${filePath}`);
    return false;
  }
  content = content.replace(mediaTarget, newStylesAndMedia);

  // 2. Wrap #vehicle-info-panel and add #feature-hub-panel
  const htmlLeftTarget = `  <!-- Left: Vehicle Title & Description Card -->
  <aside class="vehicle-info-panel" id="vehicle-info-panel">
    <div class="panel-tag">Vehicle Dossier</div>
    <div class="vehicle-class" id="veh-class">AERODYNAMIC INTERCEPTOR</div>
    <div class="vehicle-name" id="veh-name">Flying T (Mark IV)</div>
    <div class="vehicle-tagline" id="veh-desc">
      Authentic Lagos prototype cyber-coupe with quadruple ion nozzles, swept carbon diffuser, and responsive mag-lev flight thrusters.
    </div>
  </aside>`;

  const htmlLeftReplacement = `  <!-- Left Column: Vehicle Dossier & Feature Hub -->
  <div class="hangar-left-col" id="hangar-left-col">
    <!-- Left: Vehicle Title & Description Card -->
    <aside class="vehicle-info-panel" id="vehicle-info-panel">
      <div class="panel-tag">Vehicle Dossier</div>
      <div class="vehicle-class" id="veh-class">AERODYNAMIC INTERCEPTOR</div>
      <div class="vehicle-name" id="veh-name">Flying T (Mark IV)</div>
      <div class="vehicle-tagline" id="veh-desc">
        Authentic Lagos prototype cyber-coupe with quadruple ion nozzles, swept carbon diffuser, and responsive mag-lev flight thrusters.
      </div>
    </aside>

    <!-- Feature Hub Card: Location, Leaderboard, Custom Cars -->
    <aside class="feature-hub-panel" id="feature-hub-panel">
      <div class="panel-tag">
        <span>Command Sector</span>
        <span class="hub-live-dot">ONLINE</span>
      </div>
      <div class="hub-tiles-grid">
        <!-- Location Tile -->
        <button class="hub-tile" id="hub-tile-location" onclick="window.openLocationModal()" title="Select Track Location">
          <div class="hub-tile-icon-wrap loc-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <span class="hub-tile-title">Location</span>
          <span class="hub-tile-subtitle" id="hub-loc-name">Lekki</span>
        </button>

        <!-- Leaderboard Tile -->
        <button class="hub-tile" id="hub-tile-leaderboard" onclick="window.openTeaserModal('leaderboard')" title="Global Leaderboard">
          <div class="hub-tile-icon-wrap rank-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
            </svg>
          </div>
          <span class="hub-tile-title">Leaderboard</span>
          <span class="hub-tile-badge">Soon</span>
        </button>

        <!-- Custom Cars Tile -->
        <button class="hub-tile" id="hub-tile-custom" onclick="window.openTeaserModal('custom')" title="Custom Cars Tuning & Liveries">
          <div class="hub-tile-icon-wrap custom-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <span class="hub-tile-title">Custom Cars</span>
          <span class="hub-tile-badge">Soon</span>
        </button>
      </div>
    </aside>
  </div>`;

  if (!content.includes(htmlLeftTarget)) {
    console.error(`HTML left target not found in ${filePath}`);
    return false;
  }
  content = content.replace(htmlLeftTarget, htmlLeftReplacement);

  // 3. Add Modals and Toast before </main> or after specs panel
  const modalInsertTarget = `  <!-- Right: Specs Card -->`;
  const modalsHTML = `  <!-- Glassmorphic Location Dialog Overlay -->
  <div class="cyber-modal-overlay" id="location-dialog-overlay" onclick="if(event.target===this)window.closeLocationModal()">
    <div class="cyber-modal-dialog location-modal" role="dialog" aria-modal="true" aria-labelledby="loc-modal-title">
      <button class="modal-close-btn" onclick="window.closeLocationModal()" aria-label="Close dialog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-header">
        <div class="modal-overline">LAGOS HIGHWAY SECTORS</div>
        <h2 class="modal-title" id="loc-modal-title">TRACK LOCATION</h2>
        <p class="modal-subtitle">Select your active racing zone across Lagos metropolis</p>
      </div>

      <div class="location-grid">
        <!-- Lekki (Default & Active) -->
        <div class="loc-card active-card" id="loc-card-lekki" onclick="window.selectLocation('lekki')">
          <div class="loc-card-status">
            <span class="status-label"><span class="loc-pulse-dot"></span> ACTIVE SECTOR</span>
            <span class="loc-badge active-badge">&#x2713; SELECTED</span>
          </div>
          <div class="loc-card-body">
            <div class="loc-card-name">Lekki</div>
            <div class="loc-card-sub">Third Mainland Bridge &bull; Lekki-Epe Expressway</div>
            <div class="loc-card-desc">
              High-speed coastal bridge spanning the Lagos lagoon, surrounded by soaring skyscrapers and aggressive Danfo traffic.
            </div>
          </div>
          <div class="loc-card-footer">
            <span class="loc-meta"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Endless Rush</span>
            <span class="loc-meta"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg> 6 Lanes</span>
          </div>
        </div>

        <!-- Coastal Road (Coming Soon) -->
        <div class="loc-card locked-card" id="loc-card-coastal" onclick="window.selectLocation('coastal')">
          <div class="loc-card-status">
            <span class="status-label locked-label">&#x1F512; COMING SOON</span>
            <span class="loc-badge locked-badge">IN DEV</span>
          </div>
          <div class="loc-card-body">
            <div class="loc-card-name">Coastal Road</div>
            <div class="loc-card-sub">Lagos-Calabar Coastal Superhighway</div>
            <div class="loc-card-desc">
              Pristine ocean-side straightaways with rolling Atlantic waves, gale-force crosswinds, and supersonic hyper-lanes.
            </div>
          </div>
          <div class="loc-card-footer">
            <span class="loc-meta">&#x1F30A; Ocean Vista</span>
            <span class="loc-meta">&#x26A1; Super Straight</span>
          </div>
        </div>

        <!-- Eko Atlantic (Coming Soon) -->
        <div class="loc-card locked-card" id="loc-card-eko" onclick="window.selectLocation('eko')">
          <div class="loc-card-status">
            <span class="status-label locked-label">&#x1F512; COMING SOON</span>
            <span class="loc-badge locked-badge">IN DEV</span>
          </div>
          <div class="loc-card-body">
            <div class="loc-card-name">Eko Atlantic</div>
            <div class="loc-card-sub">Neo-Lagos Financial District</div>
            <div class="loc-card-desc">
              Futuristic smart-city sector featuring neon waterfront promenades, glass sky-bridges, and elevated mag-lev speedways.
            </div>
          </div>
          <div class="loc-card-footer">
            <span class="loc-meta">&#x1F3D9; Cyber Towers</span>
            <span class="loc-meta">&#x2728; Neon Glow</span>
          </div>
        </div>

        <!-- Oshodi (Coming Soon) -->
        <div class="loc-card locked-card" id="loc-card-oshodi" onclick="window.selectLocation('oshodi')">
          <div class="loc-card-status">
            <span class="status-label locked-label">&#x1F512; COMING SOON</span>
            <span class="loc-badge locked-badge">IN DEV</span>
          </div>
          <div class="loc-card-body">
            <div class="loc-card-name">Oshodi</div>
            <div class="loc-card-sub">Multi-Tier Urban Interchange</div>
            <div class="loc-card-desc">
              Extreme congestion obstacle zone. High-density flyovers, commuter chaos, and unforgiving street-level traffic traps.
            </div>
          </div>
          <div class="loc-card-footer">
            <span class="loc-meta">&#x1F68C; Heavy Traffic</span>
            <span class="loc-meta">&#x26A0;&#xFE0F; Extreme Agility</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn modal-action-btn" onclick="window.closeLocationModal()">
          <span>&#x2713; Confirm Track</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Glassmorphic Feature Teaser Dialog Overlay -->
  <div class="cyber-modal-overlay" id="teaser-dialog-overlay" onclick="if(event.target===this)window.closeTeaserModal()">
    <div class="cyber-modal-dialog teaser-modal" role="dialog" aria-modal="true" aria-labelledby="teaser-title">
      <button class="modal-close-btn" onclick="window.closeTeaserModal()" aria-label="Close dialog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-header">
        <div class="modal-overline" id="teaser-overline">FUTURE EXPANSION</div>
        <h2 class="modal-title" id="teaser-title">LEADERBOARD</h2>
      </div>

      <div class="teaser-content">
        <div class="teaser-icon-large" id="teaser-icon">
          <!-- Icon injected dynamically -->
        </div>
        <p class="teaser-text" id="teaser-desc">
          Worldwide pilot rankings, daily high-score crowns, and street reputation tournaments are arriving in the next release!
        </p>
        <div class="teaser-status-badge" id="teaser-badge">
          <span>&#x1F6A7; CURRENTLY IN DEVELOPMENT</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn modal-action-btn" onclick="window.closeTeaserModal()">
          <span>Understood</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Cyber Toast Notification -->
  <div class="cyber-toast" id="cyber-toast">
    <span class="toast-icon" id="toast-icon">&#x1F512;</span>
    <span class="toast-msg" id="toast-msg">Location is currently under construction!</span>
  </div>

  <!-- Right: Specs Card -->`;

  if (!content.includes(modalInsertTarget)) {
    console.error(`Modal insert target not found in ${filePath}`);
    return false;
  }
  content = content.replace(modalInsertTarget, modalsHTML);

  // 4. Add Interactive Scripts for Location & Teasers
  const scriptTarget = `    // Start with 15% progress indicator, then load`;
  const scriptsToAdd = `    /* ── FEATURE HUB & LOCATION MODAL CONTROLLERS ───────────────────────── */
    const LOCATIONS = {
      lekki: { name: 'Lekki', full: 'Third Mainland Bridge & Lekki', active: true },
      coastal: { name: 'Coastal Road', full: 'Lagos-Calabar Coastal Superhighway', active: false },
      eko: { name: 'Eko Atlantic', full: 'Neo-Lagos Financial District', active: false },
      oshodi: { name: 'Oshodi', full: 'Multi-Tier Urban Interchange', active: false }
    };

    let selectedLocationKey = localStorage.getItem('lagos_selected_location') || 'lekki';
    const hubLocEl = document.getElementById('hub-loc-name');
    if (hubLocEl && LOCATIONS[selectedLocationKey]) {
      hubLocEl.textContent = LOCATIONS[selectedLocationKey].name;
    }

    let toastTimer = null;
    window.showCyberToast = function(msg, icon = '&#x1F512;') {
      const toast = document.getElementById('cyber-toast');
      const msgEl = document.getElementById('toast-msg');
      const iconEl = document.getElementById('toast-icon');
      if (!toast || !msgEl) return;
      msgEl.textContent = msg;
      if (iconEl) iconEl.innerHTML = icon;
      toast.classList.add('show');
      playBeep(420, 0.08, 'triangle');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
    };

    window.openLocationModal = function() {
      playBeep(650, 0.07, 'sine');
      const overlay = document.getElementById('location-dialog-overlay');
      if (overlay) overlay.classList.add('open');
    };

    window.closeLocationModal = function() {
      playBeep(480, 0.06, 'sine');
      const overlay = document.getElementById('location-dialog-overlay');
      if (overlay) overlay.classList.remove('open');
    };

    window.selectLocation = function(locKey) {
      const loc = LOCATIONS[locKey];
      if (!loc) return;
      if (loc.active) {
        selectedLocationKey = locKey;
        localStorage.setItem('lagos_selected_location', locKey);
        if (hubLocEl) hubLocEl.textContent = loc.name;
        playBeep(880, 0.09, 'sine');
        window.showCyberToast(loc.name + ' selected as active race zone!', '&#x2705;');
      } else {
        playBeep(330, 0.12, 'sawtooth');
        window.showCyberToast(loc.name + ' is coming soon in the next update!', '&#x1F512;');
      }
    };

    window.openTeaserModal = function(type) {
      playBeep(720, 0.08, 'sine');
      const overlay = document.getElementById('teaser-dialog-overlay');
      const overline = document.getElementById('teaser-overline');
      const title = document.getElementById('teaser-title');
      const icon = document.getElementById('teaser-icon');
      const desc = document.getElementById('teaser-desc');
      const badge = document.getElementById('teaser-badge');

      if (!overlay) return;

      if (type === 'leaderboard') {
        overline.textContent = 'GLOBAL RANKINGS';
        title.textContent = 'LEADERBOARD';
        icon.className = 'teaser-icon-large rank-icon';
        icon.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>';
        desc.textContent = 'Global Lagos pilot leaderboards, daily high-score crowns, and street reputation tournaments are arriving in the next release!';
        badge.innerHTML = '<span>&#x1F3C6; COMING SOON // PHASE 2</span>';
      } else if (type === 'custom') {
        overline.textContent = 'TUNING & LIVERIES';
        title.textContent = 'CUSTOM CARS';
        icon.className = 'teaser-icon-large custom-icon';
        icon.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>';
        desc.textContent = 'Cyber workshop customization! Fine-tune thruster boost rates, unlock neon underglow kits, and apply authentic Lagos Danfo and cyber-racing vinyl decals.';
        badge.innerHTML = '<span>&#x1F6E0;&#xFE0F; UNDER CONSTRUCTION</span>';
      }

      overlay.classList.add('open');
    };

    window.closeTeaserModal = function() {
      playBeep(480, 0.06, 'sine');
      const overlay = document.getElementById('teaser-dialog-overlay');
      if (overlay) overlay.classList.remove('open');
    };

    // Close on Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        window.closeLocationModal();
        window.closeTeaserModal();
      }
    });

    // Start with 15% progress indicator, then load`;

  if (!content.includes(scriptTarget)) {
    console.error(`Script target not found in ${filePath}`);
    return false;
  }
  content = content.replace(scriptTarget, scriptsToAdd);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`SUCCESS: Patched ${filePath}`);
  return true;
}

patchFile('public/hangar.html');
patchFile('public/garage.html');
