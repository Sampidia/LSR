import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update image extensions to .webp
    content = content.replace('/assets/tracks/lekki.jpg', '/assets/tracks/lekki.webp')
    content = content.replace('/assets/tracks/coastal.jpg', '/assets/tracks/coastal.webp')
    content = content.replace('/assets/tracks/eko.jpg', '/assets/tracks/eko.webp')
    content = content.replace('/assets/tracks/oshodi.jpg', '/assets/tracks/oshodi.webp')

    # 2. Compact Left Column & Dossier to prevent overflowing car selector
    # Replace .hangar-left-col and .vehicle-info-panel styles
    dossier_css_old = re.search(r'/\* Left Column Container: Stacks Dossier and Feature Hub \*/.*?(?=/\* Right Sidebar: Specs Card \*/)', content, re.DOTALL)
    if dossier_css_old:
        compact_dossier_css = """/* Left Column Container: Stacks Dossier and Feature Hub */
    .hangar-left-col {
      position: fixed;
      top: 96px;
      left: 32px;
      z-index: 10;
      width: 330px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .hangar-left-col > * {
      pointer-events: auto;
    }

    /* Left Sidebar: Vehicle Title & Description Card */
    .vehicle-info-panel {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 14px 18px 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .panel-tag {
      font-family: var(--font-mono); font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em;
      color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px;
    }
    .vehicle-class {
      font-family: var(--font-mono); font-size: 10px; font-weight: 800; letter-spacing: 0.18em;
      color: var(--accent-gold); text-transform: uppercase; margin-bottom: 4px;
    }
    .vehicle-name {
      font-size: 22px; font-weight: 900; letter-spacing: -0.01em; color: #fff;
      display: flex; align-items: center; justify-content: space-between;
      line-height: 1.1;
    }
    .vehicle-tagline {
      font-size: 11.5px; color: #a4b3c6; line-height: 1.4; margin: 8px 0 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Feature Hub Card below Vehicle Dossier */
    .feature-hub-panel {
      position: relative;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 12px 14px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      overflow: hidden;
    }
    .feature-hub-panel::before {
      content: "";
      position: absolute;
      top: -1px;
      right: 20px;
      width: 22px;
      height: 2px;
      background: var(--accent-cyan);
      box-shadow: 0 0 8px var(--accent-cyan);
      border-radius: 2px;
    }
    .feature-hub-panel .panel-tag {
      margin-bottom: 6px;
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
      gap: 8px;
    }
    .hub-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px 7px;
      background: rgba(18, 26, 44, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
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
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
      transition: all 0.25s ease;
    }
    .hub-tile-icon-wrap svg {
      width: 17px;
      height: 17px;
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
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 2px;
      text-align: center;
      line-height: 1.1;
    }
    .hub-tile-subtitle {
      font-family: var(--font-mono);
      font-size: 9px;
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
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 6px var(--accent-cyan);
      animation: locPulse 1.8s infinite;
    }
    .hub-tile-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent-gold);
      background: rgba(245, 197, 24, 0.12);
      border: 1px solid rgba(245, 197, 24, 0.35);
      border-radius: 999px;
      padding: 1px 5px;
      line-height: 1.2;
    }

    """
        content = content[:dossier_css_old.start()] + compact_dossier_css + content[dossier_css_old.end():]

    # 3. Add styling for AAA Feature Teaser Dialogues (matching Location dialogue layout)
    teaser_css = """
    /* AAA Feature Teaser Dialog Showcase Layout */
    .teaser-showcase-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 20px;
      align-items: stretch;
      margin-bottom: 16px;
    }
    .teaser-showcase-art {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid rgba(0, 229, 255, 0.35);
      background: #000;
      min-height: 240px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .teaser-showcase-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .teaser-features-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .teaser-feat-card {
      background: rgba(14, 20, 32, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .teaser-feat-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 15px;
    }
    .teaser-feat-icon.gold {
      background: rgba(245, 197, 24, 0.15);
      border: 1px solid rgba(245, 197, 24, 0.35);
      color: var(--accent-gold);
    }
    .teaser-feat-icon.cyan {
      background: rgba(0, 229, 255, 0.15);
      border: 1px solid rgba(0, 229, 255, 0.35);
      color: var(--accent-cyan);
    }
    .teaser-feat-icon.red {
      background: rgba(255, 42, 58, 0.15);
      border: 1px solid rgba(255, 42, 58, 0.35);
      color: #ff4d6d;
    }
    .teaser-feat-title {
      font-family: var(--font-sans);
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #ffffff;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .teaser-feat-desc {
      font-size: 11px;
      color: #9cb1c9;
      line-height: 1.35;
    }
    .teaser-progress-card {
      background: rgba(10, 15, 26, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      padding: 12px 14px;
      margin-top: auto;
    }
    .teaser-prog-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      color: rgba(220, 240, 255, 0.7);
      margin-bottom: 6px;
    }
    .teaser-prog-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }
    .teaser-prog-fill {
      height: 100%;
      border-radius: 999px;
    }
    .teaser-prog-fill.gold {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }
    .teaser-prog-fill.cyan {
      background: linear-gradient(90deg, #00b4d8, #00e5ff);
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    }
    @media (max-width: 820px) {
      .teaser-showcase-grid { grid-template-columns: 1fr; }
      .teaser-showcase-art { min-height: 170px; }
    }
"""

    if '/* AAA Feature Teaser Dialog Showcase Layout */' not in content:
        content = content.replace('/* Teaser Dialog Styles */', teaser_css + '\n    /* Teaser Dialog Styles */')

    # 4. Replace the old teaser modal HTML with AAA stage-style dialogue for Leaderboard & Custom Cars
    old_teaser_html = re.search(r'<!-- Glassmorphic Feature Teaser Dialog Overlay -->.*?<!-- Cyber Toast Notification -->', content, re.DOTALL)
    if old_teaser_html:
        new_teaser_html = """<!-- AAA Video Game Leaderboard Stage Dialog Overlay -->
  <div class="cyber-modal-overlay" id="leaderboard-dialog-overlay" onclick="if(event.target===this)window.closeTeaserModal()">
    <div class="cyber-stage-dialog" role="dialog" aria-modal="true" aria-labelledby="lb-stage-title" style="max-width: 880px;">
      <div class="stage-frame-reticle top-left"></div>
      <div class="stage-frame-reticle top-right"></div>
      <div class="stage-frame-reticle bottom-left"></div>
      <div class="stage-frame-reticle bottom-right"></div>

      <div class="stage-header">
        <div class="stage-header-left">
          <div class="stage-breadcrumb">
            <span class="hud-blink-dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b;"></span>
            <span style="color:#f59e0b;">GLOBAL EXPANSION // TOURNAMENT LEADERBOARD</span>
            <span class="hud-sep">/</span>
            <span class="hud-dim">REGIONAL SATELLITE UPLINK: ACTIVE</span>
          </div>
          <h2 class="stage-title" id="lb-stage-title">GLOBAL LEADERBOARD</h2>
          <div class="stage-telemetry-row">
            <span class="tel-item"><span class="tel-k">CIRCUIT:</span> <span class="tel-v">ALL LAGOS TRACKS</span></span>
            <span class="tel-item"><span class="tel-k">STANDINGS:</span> <span class="tel-v">WORLD PILOT CUP</span></span>
            <span class="tel-item"><span class="tel-k">STATUS:</span> <span class="tel-v" style="color:#f59e0b;">EXPANSION PHASE 2</span></span>
          </div>
        </div>

        <button class="stage-close-btn" onclick="window.closeTeaserModal()" title="Close (ESC)">
          <span>CLOSE</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="teaser-showcase-grid">
        <div class="teaser-showcase-art">
          <img src="/assets/features/leaderboard.webp" alt="Global Leaderboard Championship" class="stage-art-img">
          <div class="stage-art-scanline"></div>
          <div class="stage-art-vignette"></div>
          <div class="stage-art-top-row">
            <span class="sec-index-tag" style="border-color:rgba(245,197,24,0.4);color:#f5c518;">🏆 TOURNAMENT ARENA</span>
            <span class="stage-status-badge locked-badge" style="background:rgba(245,197,24,0.2);">COMING SOON</span>
          </div>
          <div class="stage-art-bottom-row">
            <span class="surface-badge">LAGOS GRAND PRIX</span>
            <span class="speed-record-badge">PB: 148,250 PTS</span>
          </div>
        </div>

        <div class="teaser-features-col">
          <div class="teaser-feat-card">
            <div class="teaser-feat-icon gold">👑</div>
            <div>
              <div class="teaser-feat-title">Global Sprint Cups</div>
              <div class="teaser-feat-desc">Compete with Lagos pilots worldwide for the fastest Third Mainland Bridge record and global rankings.</div>
            </div>
          </div>
          <div class="teaser-feat-card">
            <div class="teaser-feat-icon cyan">⚡</div>
            <div>
              <div class="teaser-feat-title">Daily Crown Tournaments</div>
              <div class="teaser-feat-desc">Top daily racers unlock exclusive neon yellow Danfo champion liveries and VIP garage showcase spots.</div>
            </div>
          </div>
          <div class="teaser-progress-card">
            <div class="teaser-prog-row">
              <span>MULTIPLAYER NETWORKING ENGINE</span>
              <span style="color:#f5c518;">86% COMPLETE</span>
            </div>
            <div class="teaser-prog-bar">
              <div class="teaser-prog-fill gold" style="width: 86%;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stage-footer">
        <div class="stage-summary">
          <span class="summary-bracket">[</span>
          <span class="summary-label">DEVELOPMENT TARGET:</span>
          <span class="summary-value" style="color:#f5c518;">PHASE 2 WORLD PILOT CHAMPIONSHIP</span>
          <span class="summary-bracket">]</span>
        </div>

        <button class="stage-confirm-btn" onclick="window.closeTeaserModal()" style="border-color:#f59e0b;background:linear-gradient(135deg,rgba(245,158,11,0.38) 0%,rgba(245,158,11,0.12) 100%);box-shadow:0 4px 18px rgba(245,158,11,0.35);">
          <span>UNDERSTOOD</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- AAA Video Game Custom Cars Stage Dialog Overlay -->
  <div class="cyber-modal-overlay" id="custom-cars-dialog-overlay" onclick="if(event.target===this)window.closeTeaserModal()">
    <div class="cyber-stage-dialog" role="dialog" aria-modal="true" aria-labelledby="custom-stage-title" style="max-width: 880px;">
      <div class="stage-frame-reticle top-left"></div>
      <div class="stage-frame-reticle top-right"></div>
      <div class="stage-frame-reticle bottom-left"></div>
      <div class="stage-frame-reticle bottom-right"></div>

      <div class="stage-header">
        <div class="stage-header-left">
          <div class="stage-breadcrumb">
            <span class="hud-blink-dot" style="background:#ff4d6d;box-shadow:0 0 8px #ff4d6d;"></span>
            <span style="color:#ff4d6d;">CUSTOM WORKSHOP // TUNING & LIVERIES</span>
            <span class="hud-sep">/</span>
            <span class="hud-dim">CYBER DOCK: UNDER CONSTRUCTION</span>
          </div>
          <h2 class="stage-title" id="custom-stage-title">CUSTOM CARS GARAGE</h2>
          <div class="stage-telemetry-row">
            <span class="tel-item"><span class="tel-k">BAY:</span> <span class="tel-v">CYBER GARAGE 2077</span></span>
            <span class="tel-item"><span class="tel-k">SYSTEM:</span> <span class="tel-v">ROBOTIC MOD SUITE</span></span>
            <span class="tel-item"><span class="tel-k">STATUS:</span> <span class="tel-v" style="color:#ff4d6d;">UNDER CONSTRUCTION</span></span>
          </div>
        </div>

        <button class="stage-close-btn" onclick="window.closeTeaserModal()" title="Close (ESC)">
          <span>CLOSE</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="teaser-showcase-grid">
        <div class="teaser-showcase-art">
          <img src="/assets/features/custom_cars.webp" alt="Custom Tuning Workshop" class="stage-art-img">
          <div class="stage-art-scanline"></div>
          <div class="stage-art-vignette"></div>
          <div class="stage-art-top-row">
            <span class="sec-index-tag" style="border-color:rgba(255,77,109,0.4);color:#ff4d6d;">🛠️ CYBER WORKSHOP</span>
            <span class="stage-status-badge locked-badge" style="background:rgba(255,77,109,0.2);color:#ff4d6d;border-color:rgba(255,77,109,0.4);">IN DEV</span>
          </div>
          <div class="stage-art-bottom-row">
            <span class="surface-badge">WIDEBODY & UNDERGLOW</span>
            <span class="speed-record-badge" style="color:#ff4d6d;">12 MOD SLOTS</span>
          </div>
        </div>

        <div class="teaser-features-col">
          <div class="teaser-feat-card">
            <div class="teaser-feat-icon red">🚀</div>
            <div>
              <div class="teaser-feat-title">Ion Thruster Overclocking</div>
              <div class="teaser-feat-desc">Fine-tune thruster pulse frequencies, nitro burn rates, and cold-gas atmospheric stabilizer balance.</div>
            </div>
          </div>
          <div class="teaser-feat-card">
            <div class="teaser-feat-icon cyan">🎨</div>
            <div>
              <div class="teaser-feat-title">Lagos Street Liveries</div>
              <div class="teaser-feat-desc">Apply custom 9ja Drift Danfo wraps, tribal cyber decals, and customizable neon underglow neon lighting.</div>
            </div>
          </div>
          <div class="teaser-progress-card">
            <div class="teaser-prog-row">
              <span>AERODYNAMICS & CUSTOM SHOP</span>
              <span style="color:#ff4d6d;">80% COMPLETE</span>
            </div>
            <div class="teaser-prog-bar">
              <div class="teaser-prog-fill cyan" style="width: 80%;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stage-footer">
        <div class="stage-summary">
          <span class="summary-bracket">[</span>
          <span class="summary-label">DEVELOPMENT TARGET:</span>
          <span class="summary-value" style="color:#ff4d6d;">NEON WORKSHOP & CUSTOM LIVERY STUDIO</span>
          <span class="summary-bracket">]</span>
        </div>

        <button class="stage-confirm-btn" onclick="window.closeTeaserModal()" style="border-color:#ff4d6d;background:linear-gradient(135deg,rgba(255,77,109,0.38) 0%,rgba(255,77,109,0.12) 100%);box-shadow:0 4px 18px rgba(255,77,109,0.35);">
          <span>UNDERSTOOD</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Cyber Toast Notification -->"""
        content = content[:old_teaser_html.start()] + new_teaser_html + content[old_teaser_html.end():]

    # 5. Update JavaScript controllers to open the new AAA dialogs
    js_old = re.search(r'window\.openTeaserModal = function\(type\).*?window\.closeTeaserModal = function\(\) {', content, re.DOTALL)
    if js_old:
        js_new = """window.openTeaserModal = function(type) {
      playBeep(720, 0.08, 'sine');
      if (type === 'leaderboard') {
        const overlay = document.getElementById('leaderboard-dialog-overlay');
        if (overlay) overlay.classList.add('open');
      } else if (type === 'custom') {
        const overlay = document.getElementById('custom-cars-dialog-overlay');
        if (overlay) overlay.classList.add('open');
      }
    };

    window.closeTeaserModal = function() {
      playBeep(480, 0.06, 'sine');
      const lb = document.getElementById('leaderboard-dialog-overlay');
      if (lb) lb.classList.remove('open');
      const cc = document.getElementById('custom-cars-dialog-overlay');
      if (cc) cc.classList.remove('open');
    };"""
        content = content[:js_old.start()] + js_new + content[js_old.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"SUCCESS: Fully updated {filepath}")

update_file('public/hangar.html')
update_file('public/garage.html')
