import fs from 'fs';

function fineTuneAAAStageSelect(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace CSS
  const cssStartMarker = `    /* ═══════════════════════════════════════════════════════════════════════
       AAA ARCADE VIDEO GAME TRACK SELECTION SCREEN (HUD & Stage Select)`;
  const cssEndMarker = `    /* Teaser Dialog Styles */`;

  const newCSS = `    /* ═══════════════════════════════════════════════════════════════════════
       AAA ARCADE VIDEO GAME TRACK SELECTION SCREEN (HUD & Stage Select)
       ═══════════════════════════════════════════════════════════════════════ */
    .cyber-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(3, 5, 10, 0.86);
      backdrop-filter: blur(20px) saturate(210%);
      -webkit-backdrop-filter: blur(20px) saturate(210%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Expansive Tactical Cockpit Dialog Frame */
    .cyber-stage-dialog {
      position: relative;
      width: 100%;
      max-width: 1100px;
      max-height: 94vh;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 229, 255, 0.35) transparent;
      background: linear-gradient(175deg, rgba(12, 18, 30, 0.97) 0%, rgba(5, 8, 16, 0.95) 100%);
      backdrop-filter: blur(28px) saturate(200%) brightness(1.06);
      -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.06);
      border: 1.5px solid rgba(0, 229, 255, 0.35);
      border-radius: 20px;
      padding: 20px 26px 16px;
      box-shadow: 
        0 30px 80px rgba(0, 0, 0, 0.95),
        0 0 45px rgba(0, 229, 255, 0.18),
        inset 0 1px 1px rgba(255, 255, 255, 0.25),
        inset 0 -2px 10px rgba(0, 0, 0, 0.6);
      transform: scale(0.95) translateY(12px);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    .cyber-stage-dialog::-webkit-scrollbar {
      width: 5px;
    }
    .cyber-stage-dialog::-webkit-scrollbar-thumb {
      background: rgba(0, 229, 255, 0.35);
      border-radius: 999px;
    }
    .cyber-modal-overlay.open .cyber-stage-dialog {
      transform: scale(1) translateY(0);
    }

    /* Cyber Chamfer Notches & HUD Reticles */
    .cyber-stage-dialog::before {
      content: "";
      position: absolute;
      top: -2px;
      right: 48px;
      width: 50px;
      height: 3px;
      background: var(--accent-cyan);
      box-shadow: 0 0 12px var(--accent-cyan);
      border-radius: 2px;
    }
    .cyber-stage-dialog::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 48px;
      width: 50px;
      height: 3px;
      background: var(--accent-cyan);
      box-shadow: 0 0 12px var(--accent-cyan);
      border-radius: 2px;
    }
    .stage-frame-reticle {
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0, 229, 255, 0.45);
      pointer-events: none;
    }
    .stage-frame-reticle.top-left { top: 8px; left: 8px; border-right: none; border-bottom: none; }
    .stage-frame-reticle.top-right { top: 8px; right: 8px; border-left: none; border-bottom: none; }
    .stage-frame-reticle.bottom-left { bottom: 8px; left: 8px; border-right: none; border-top: none; }
    .stage-frame-reticle.bottom-right { bottom: 8px; right: 8px; border-left: none; border-top: none; }

    /* Top Tactical Game Header */
    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 229, 255, 0.15);
    }
    .stage-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.22em;
      color: var(--accent-cyan);
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .hud-blink-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 8px var(--accent-cyan);
      animation: locPulse 1.4s infinite;
    }
    .hud-sep { color: rgba(255, 255, 255, 0.25); }
    .hud-dim { color: rgba(220, 240, 255, 0.55); font-weight: 600; }
    .stage-title {
      font-family: var(--font-sans);
      font-size: 26px;
      font-weight: 900;
      font-style: italic;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
      line-height: 1.05;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9), 0 0 24px rgba(0, 229, 255, 0.35);
    }
    .stage-telemetry-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 4px;
    }
    .tel-item {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.5);
    }
    .tel-k { color: rgba(0, 229, 255, 0.75); margin-right: 4px; }
    .tel-v { color: #fff; font-weight: 700; }

    .stage-close-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      color: rgba(255, 255, 255, 0.75);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
    }
    .stage-close-btn:hover {
      background: rgba(255, 42, 58, 0.22);
      border-color: #ff4d6d;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 0 14px rgba(255, 77, 109, 0.4);
    }

    /* 4-Track Stage Selection Cards Grid */
    .stage-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 14px;
    }
    .stage-card {
      background: rgba(14, 20, 32, 0.78);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
    .stage-card:hover {
      transform: translateY(-3px) scale(1.015);
      box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 229, 255, 0.25);
    }
    .stage-card.selected-stage {
      background: linear-gradient(175deg, rgba(16, 34, 56, 0.95) 0%, rgba(9, 18, 30, 0.92) 100%);
      border: 2px solid var(--accent-cyan);
      box-shadow: 
        0 14px 35px rgba(0, 0, 0, 0.75),
        0 0 24px rgba(0, 229, 255, 0.4),
        inset 0 0 16px rgba(0, 229, 255, 0.15);
    }
    .stage-card.locked-stage {
      opacity: 0.82;
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(10, 14, 22, 0.7);
    }
    .stage-card.locked-stage:hover {
      opacity: 0.98;
      border-color: rgba(245, 197, 24, 0.5);
    }

    /* 16:9 Cinematic Video Game Preview Artwork */
    .stage-art-wrap {
      position: relative;
      width: 100%;
      height: 122px;
      overflow: hidden;
      background: #000;
    }
    .stage-art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 65%;
      transition: transform 0.4s ease, filter 0.3s ease;
      display: block;
    }
    .stage-card:hover .stage-art-img {
      transform: scale(1.06);
    }
    .stage-card.locked-stage .stage-art-img {
      filter: saturate(0.65) brightness(0.65);
    }
    .stage-art-scanline {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.16) 0px,
        rgba(0, 0, 0, 0.16) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
      z-index: 2;
    }
    .stage-art-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, rgba(10,16,26,0.96) 100%);
      pointer-events: none;
      z-index: 2;
    }

    /* Lock Overlay for In-Dev Stages */
    .stage-lock-overlay {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(4, 7, 14, 0.42);
      gap: 3px;
      pointer-events: none;
    }
    .lock-shield-icon {
      font-size: 20px;
      filter: drop-shadow(0 0 8px rgba(245, 197, 24, 0.6));
    }
    .lock-shield-text {
      font-family: var(--font-mono);
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.16em;
      color: var(--accent-gold);
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(245, 197, 24, 0.4);
      padding: 1px 7px;
      border-radius: 999px;
      text-transform: uppercase;
    }

    /* Art Top and Bottom Badges */
    .stage-art-top-row {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 4;
    }
    .sec-index-tag {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #fff;
      background: rgba(10, 16, 26, 0.88);
      border: 1px solid rgba(0, 229, 255, 0.4);
      padding: 1px 6px;
      border-radius: 4px;
      backdrop-filter: blur(6px);
    }
    .sec-index-tag.dim {
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.65);
    }
    .stage-status-badge {
      font-family: var(--font-mono);
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .active-live-badge {
      background: rgba(0, 229, 255, 0.22);
      border: 1px solid var(--accent-cyan);
      color: #ffffff;
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
    }
    .locked-badge {
      background: rgba(245, 197, 24, 0.16);
      border: 1px solid rgba(245, 197, 24, 0.4);
      color: var(--accent-gold);
    }
    .pulse-beacon {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 6px var(--accent-cyan);
      animation: locPulse 1.4s infinite;
    }

    .stage-art-bottom-row {
      position: absolute;
      bottom: 6px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 4;
    }
    .surface-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(0, 0, 0, 0.72);
      padding: 1px 5px;
      border-radius: 3px;
      backdrop-filter: blur(4px);
    }
    .speed-record-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-gold);
      background: rgba(0, 0, 0, 0.72);
      padding: 1px 5px;
      border-radius: 3px;
    }
    .speed-record-badge.lock-txt {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Card Body & Telemetry Data */
    .stage-info {
      padding: 10px 12px 10px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .stage-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .stage-name {
      font-family: var(--font-sans);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.02em;
      color: #ffffff;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .stage-select-mark {
      color: var(--accent-cyan);
      font-size: 14px;
      font-weight: 900;
      text-shadow: 0 0 8px var(--accent-cyan);
    }
    .lock-mini-icon {
      font-size: 11px;
      opacity: 0.7;
    }
    .stage-subname {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 600;
      color: rgba(220, 240, 255, 0.6);
      margin-bottom: 10px;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Telemetry Stat Meters */
    .stage-stats-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: auto;
    }
    .stage-stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-k {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
    }
    .stat-pips {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .pip {
      width: 6px;
      height: 6px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.15);
    }
    .stat-pips.normal .pip.filled {
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }
    .stat-pips.hard .pip.filled {
      background: #f59e0b;
      box-shadow: 0 0 6px #f59e0b;
    }
    .stat-pips.extreme .pip.filled {
      background: #ef4444;
      box-shadow: 0 0 6px #ef4444;
    }
    .stat-txt {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ffffff;
      margin-left: 3px;
    }
    .stat-meter-bar {
      width: 52px;
      height: 5px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      overflow: hidden;
    }
    .meter-fill {
      height: 100%;
      border-radius: 999px;
    }
    .meter-fill.green { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
    .meter-fill.amber { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
    .meter-fill.cyan  { background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan); }
    .meter-fill.red   { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

    /* Action Ribbon at Bottom of Card */
    .stage-action-ribbon {
      padding: 7px 10px;
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: center;
      transition: all 0.2s ease;
    }
    .stage-action-ribbon.active {
      background: linear-gradient(90deg, rgba(0, 229, 255, 0.3) 0%, rgba(0, 229, 255, 0.15) 100%);
      color: #ffffff;
      border-top: 1px solid var(--accent-cyan);
      text-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
    }
    .stage-action-ribbon.locked {
      background: rgba(0, 0, 0, 0.45);
      color: rgba(245, 197, 24, 0.75);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .stage-card:hover .stage-action-ribbon.locked {
      color: var(--accent-gold);
      background: rgba(245, 197, 24, 0.12);
    }

    /* Bottom Tactical Stage Footer */
    .stage-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 229, 255, 0.15);
      margin-top: 4px;
    }
    .stage-summary {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(220, 240, 255, 0.7);
    }
    .summary-bracket { color: var(--accent-cyan); font-weight: 800; }
    .summary-label { color: rgba(255, 255, 255, 0.45); margin-right: 6px; }
    .summary-value { color: var(--accent-cyan); font-weight: 800; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }

    .stage-confirm-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 28px;
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.38) 0%, rgba(0, 229, 255, 0.12) 100%);
      border: 1.5px solid var(--accent-cyan);
      border-radius: 999px;
      color: #ffffff;
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(0, 229, 255, 0.35);
      transition: all 0.22s ease;
      outline: none;
    }
    .stage-confirm-btn:hover {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.55) 0%, rgba(0, 229, 255, 0.22) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 26px rgba(0, 229, 255, 0.55);
    }
    .stage-confirm-btn:active {
      transform: translateY(0);
    }
`;

  const startIndex = content.indexOf(cssStartMarker);
  const endIndex = content.indexOf(cssEndMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error(`Could not find CSS boundaries in ${filePath}`);
    return false;
  }

  content = content.substring(0, startIndex) + newCSS + content.substring(endIndex);

  // Add sound triggers to stage cards
  content = content.replace(
    `onclick="window.selectLocation('lekki')"`,
    `onclick="window.selectLocation('lekki')" onmouseenter="playBeep(920,0.03,'sine')"`
  );
  content = content.replace(
    `onclick="window.selectLocation('coastal')"`,
    `onclick="window.selectLocation('coastal')" onmouseenter="playBeep(780,0.03,'sine')"`
  );
  content = content.replace(
    `onclick="window.selectLocation('eko')"`,
    `onclick="window.selectLocation('eko')" onmouseenter="playBeep(780,0.03,'sine')"`
  );
  content = content.replace(
    `onclick="window.selectLocation('oshodi')"`,
    `onclick="window.selectLocation('oshodi')" onmouseenter="playBeep(780,0.03,'sine')"`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`SUCCESS: Fine-tuned AAA Stage Select in ${filePath}`);
  return true;
}

fineTuneAAAStageSelect('public/hangar.html');
fineTuneAAAStageSelect('public/garage.html');
