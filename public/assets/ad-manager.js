/**
 * ad-manager.js — Lagos Street Race Monetization
 * ─────────────────────────────────────────────────────────────────────────
 *  1. Monetag In-Page Push  (zone 12129837)  — auto-fires at session start
 *  2. Monetag OnClick       (zone 12129897)  — fires via rewarded overlay
 *     Every 3rd game over → show "Get Extra Life?" overlay → user taps →
 *     onclick ad fires in new tab → extra life granted after 5s delay.
 *  3. Adsterra Billboard    — runtime texture swap on boardMats[0-3]
 *     Falls back to billboard_i.jpg if any creative fetch fails.
 *  4. Adsterra Social Bar   — injected via bauval.org (index.html handles script)
 * ─────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
   * CONFIG
   * ───────────────────────────────────────────────────────────────────── */
  var CFG = {
    // Monetag OnClick zone ID (rewarded interstitial trigger)
    monetagOnclickZoneId: '12129897',

    // Adsterra creative image URLs for in-world billboard slots 0–3.
    // Must be direct image URLs (JPEG/PNG) with CORS headers.
    // Direct image creative URLs for in-world billboard slots 0–3.
    // Must be a direct image URL (JPEG/PNG, ~1024×512) with CORS headers.
    // NOTE: Adsterra banner zones are iframe-based — they cannot be used here.
    //       Only direct CDN image URLs (e.g. a custom sponsor image) work.
    //       Leave '' to keep billboard_i.jpg as the fallback for that slot.
    adstreaBillboardUrls: [
      '',   // billboard_0  ← paste direct image URL here when available
      '',   // billboard_1
      '',   // billboard_2
      '',   // billboard_3
    ],

    // Rotate billboard creatives every N milliseconds (0 = no rotation)
    rotateIntervalMs: 60000,

    // How long (ms) to wait after onclick fires before granting the extra life
    rewardDelayMs: 5000,
  };

  /* ─────────────────────────────────────────────────────────────────────
   * 1. REWARDED ONCLICK — every 3rd game over
   * ───────────────────────────────────────────────────────────────────── */
  var _gameOverCount = 0;
  var INTERSTITIAL_EVERY = 3;

  function onGameOver() {
    if (window.__DISABLE_EXTERNAL_ADS__ || window.__IS_LAGOS_LIFE__) return;
    _gameOverCount++;
    if (_gameOverCount % INTERSTITIAL_EVERY === 0) {
      _showRewardedOverlay();
    }
  }

  /* ── Rewarded overlay (Option 1: 5s Sponsor Banner) ─────────────────── */
  var _overlayEl = null;
  var _rewardCountdownTimer = null;

  function _buildOverlay() {
    if (_overlayEl) return _overlayEl;

    // Inject cyber modal styles for reward popup
    if (!document.getElementById('lsr-ad-reward-css')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'lsr-ad-reward-css';
      styleEl.textContent = [
        '#lsr-reward-overlay {',
        '  position: fixed; inset: 0; z-index: 9999999;',
        '  display: none; align-items: center; justify-content: center;',
        '  background: radial-gradient(circle at 50% 45%, rgba(10, 16, 26, 0.88) 0%, rgba(3, 6, 12, 0.96) 100%);',
        '  backdrop-filter: blur(20px) saturate(190%);',
        '  -webkit-backdrop-filter: blur(20px) saturate(190%);',
        '  font-family: "Outfit", -apple-system, BlinkMacSystemFont, sans-serif;',
        '  color: #fff; padding: 16px; user-select: none;',
        '  animation: lsrAdFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);',
        '}',
        '@keyframes lsrAdFadeIn { from { opacity: 0; } to { opacity: 1; } }',
        '#lsr-reward-overlay .cyber-reward-dialog {',
        '  position: relative; width: 100%; max-width: 360px;',
        '  background: linear-gradient(175deg, rgba(12, 18, 30, 0.98) 0%, rgba(5, 8, 16, 0.96) 100%);',
        '  backdrop-filter: blur(28px) saturate(200%);',
        '  -webkit-backdrop-filter: blur(28px) saturate(200%);',
        '  border: 1.5px solid rgba(0, 229, 255, 0.35);',
        '  border-radius: 20px; padding: 20px 22px 18px;',
        '  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 229, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25);',
        '  box-sizing: border-box;',
        '  display: flex; flex-direction: column; align-items: center;',
        '}',
        '#lsr-reward-overlay .stage-frame-reticle {',
        '  position: absolute; width: 14px; height: 14px;',
        '  border: 2px solid rgba(0, 229, 255, 0.55); pointer-events: none;',
        '}',
        '#lsr-reward-overlay .stage-frame-reticle.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }',
        '#lsr-reward-overlay .stage-frame-reticle.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }',
        '#lsr-reward-overlay .stage-frame-reticle.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }',
        '#lsr-reward-overlay .stage-frame-reticle.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }',
        '#lsr-reward-overlay .top-chamfer-notch {',
        '  position: absolute; top: -2px; right: 48px; width: 50px; height: 3px;',
        '  background: #00e5ff; box-shadow: 0 0 12px #00e5ff; border-radius: 2px;',
        '}',
        '#lsr-reward-overlay .stage-header {',
        '  width: 100%; display: flex; justify-content: space-between; align-items: flex-start;',
        '  margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(0, 229, 255, 0.15);',
        '}',
        '#lsr-reward-overlay .stage-breadcrumb {',
        '  display: flex; align-items: center; gap: 8px;',
        '  font-family: "JetBrains Mono", monospace; font-size: 10px; font-weight: 700;',
        '  letter-spacing: 0.12em; color: #00e5ff; text-transform: uppercase;',
        '}',
        '#lsr-reward-overlay .stage-blink-dot {',
        '  width: 6px; height: 6px; border-radius: 50%;',
        '  background: #00e5ff; box-shadow: 0 0 8px #00e5ff;',
        '  animation: lsrAdPulse 1.8s infinite;',
        '}',
        '@keyframes lsrAdPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.75); } }',
        '#lsr-reward-overlay .stage-title {',
        '  margin: 4px 0 0; font-size: 20px; font-weight: 800;',
        '  letter-spacing: 0.05em; text-transform: uppercase; color: #fff;',
        '  text-shadow: 0 0 16px rgba(0, 229, 255, 0.45); text-align: left;',
        '}',
        '#lsr-reward-overlay .stage-close-btn {',
        '  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15);',
        '  border-radius: 8px; color: rgba(255, 255, 255, 0.7); cursor: pointer; padding: 6px;',
        '  display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;',
        '}',
        '#lsr-reward-overlay .stage-close-btn:hover {',
        '  background: rgba(255, 45, 85, 0.2); border-color: rgba(255, 45, 85, 0.5); color: #ff2d55;',
        '}',
        '#lsr-reward-overlay .ad-slot-box {',
        '  width: 300px; height: 250px; background: #000; border-radius: 8px;',
        '  overflow: hidden; border: 1px solid rgba(0, 229, 255, 0.22);',
        '  display: flex; align-items: center; justify-content: center; margin-bottom: 12px;',
        '}',
        '#lsr-reward-overlay .progress-wrap {',
        '  width: 100%; background: rgba(0, 229, 255, 0.1); border-radius: 4px; height: 4px;',
        '  overflow: hidden; margin-bottom: 8px;',
        '}',
        '#lsr-reward-overlay .progress-bar {',
        '  width: 0%; height: 100%; background: linear-gradient(90deg, #00e5ff, #00b4d8);',
        '  box-shadow: 0 0 10px #00e5ff; transition: width 0.25s linear;',
        '}',
        '#lsr-reward-overlay .status-row {',
        '  width: 100%; display: flex; justify-content: space-between; align-items: center;',
        '  font-family: "JetBrains Mono", monospace; font-size: 10px; font-weight: 700;',
        '  color: #00e5ff; letter-spacing: 0.08em; margin-bottom: 12px; text-transform: uppercase;',
        '}',
        '#lsr-reward-overlay .claim-btn {',
        '  width: 100%; padding: 13px 18px; border-radius: 12px; border: none;',
        '  font-family: "Outfit", sans-serif; font-size: 13px; font-weight: 800;',
        '  letter-spacing: 0.12em; text-transform: uppercase;',
        '  display: flex; align-items: center; justify-content: center; gap: 8px;',
        '  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); cursor: not-allowed;',
        '}',
        '#lsr-reward-overlay .claim-btn.disabled {',
        '  background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.4);',
        '}',
        '#lsr-reward-overlay .claim-btn.ready {',
        '  background: linear-gradient(135deg, #00e5ff 0%, #0099cc 100%);',
        '  color: #040914; box-shadow: 0 0 24px rgba(0, 229, 255, 0.5); cursor: pointer;',
        '}',
        '#lsr-reward-overlay .claim-btn.ready:hover {',
        '  box-shadow: 0 0 32px rgba(0, 229, 255, 0.7); filter: brightness(1.08);',
        '}',
        '#lsr-reward-overlay .skip-btn {',
        '  background: transparent; border: none; color: rgba(255, 255, 255, 0.45);',
        '  font-family: "JetBrains Mono", monospace; font-size: 10px; font-weight: 600;',
        '  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;',
        '  padding: 8px 0 2px; margin-top: 8px; transition: color 0.2s;',
        '  display: flex; align-items: center; justify-content: center; gap: 6px;',
        '}',
        '#lsr-reward-overlay .skip-btn:hover { color: #ffffff; }'
      ].join('\n');
      document.head.appendChild(styleEl);
    }

    var el = document.createElement('div');
    el.id = 'lsr-reward-overlay';

    el.innerHTML = [
      '<div class="cyber-reward-dialog" role="dialog" aria-modal="true" aria-labelledby="lsr-ad-title">',
      '  <div class="stage-frame-reticle tl"></div>',
      '  <div class="stage-frame-reticle tr"></div>',
      '  <div class="stage-frame-reticle bl"></div>',
      '  <div class="stage-frame-reticle br"></div>',
      '  <div class="top-chamfer-notch"></div>',
      '  <div class="stage-header">',
      '    <div>',
      '      <div class="stage-breadcrumb">',
      '        <span class="stage-blink-dot"></span>',
      '        <span>REVIVAL PROTOCOL</span>',
      '      </div>',
      '      <h2 class="stage-title" id="lsr-ad-title">SECOND CHANCE</h2>',
      '    </div>',
      '    <button class="stage-close-btn" id="lsr-reward-close-btn" title="Close">',
      '      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">',
      '        <line x1="18" y1="6" x2="6" y2="18"></line>',
      '        <line x1="6" y1="6" x2="18" y2="18"></line>',
      '      </svg>',
      '    </button>',
      '  </div>',
      '  <div id="lsr-reward-ad-slot" class="ad-slot-box"></div>',
      '  <div class="progress-wrap">',
      '    <div id="lsr-reward-progress" class="progress-bar"></div>',
      '  </div>',
      '  <div class="status-row">',
      '    <span>BROADCAST LINK</span>',
      '    <span id="lsr-reward-timer-text">STANDBY // 5S</span>',
      '  </div>',
      '  <button id="lsr-reward-claim-btn" class="claim-btn disabled" disabled>',
      '    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite">',
      '      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
      '    </svg>',
      '    <span>STANDBY (5S)</span>',
      '  </button>',
      '  <button id="lsr-reward-skip-btn" class="skip-btn">',
      '    <span>ABORT RUN</span>',
      '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
      '      <line x1="5" y1="12" x2="19" y2="12"></line>',
      '      <polyline points="12 5 19 12 12 19"></polyline>',
      '    </svg>',
      '  </button>',
      '</div>'
    ].join('');

    document.body.appendChild(el);
    _overlayEl = el;

    function _closeOverlay() {
      if (_rewardCountdownTimer) {
        clearInterval(_rewardCountdownTimer);
        _rewardCountdownTimer = null;
      }
      _overlayEl.style.display = 'none';
    }

    // Claim button
    var claimBtn = el.querySelector('#lsr-reward-claim-btn');
    claimBtn.addEventListener('click', function () {
      if (claimBtn.disabled) return;
      _closeOverlay();
      _grantExtraLife();
    });

    // Skip / Close buttons
    el.querySelector('#lsr-reward-skip-btn').addEventListener('click', _closeOverlay);
    var closeBtn = el.querySelector('#lsr-reward-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', _closeOverlay);

    return el;
  }

  function _showRewardedOverlay() {
    var overlay = _buildOverlay();
    overlay.style.display = 'flex';

    var slot = overlay.querySelector('#lsr-reward-ad-slot');
    var bar = overlay.querySelector('#lsr-reward-progress');
    var timerText = overlay.querySelector('#lsr-reward-timer-text');
    var claimBtn = overlay.querySelector('#lsr-reward-claim-btn');

    // Reset UI state
    bar.style.width = '0%';
    claimBtn.disabled = true;
    claimBtn.className = 'claim-btn disabled';
    claimBtn.innerHTML = [
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite">',
      '  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
      '</svg>',
      '<span>STANDBY (5S)</span>'
    ].join('');
    timerText.textContent = 'STANDBY // 5S';

    // Inject Adsterra 300x250 banner into slot
    slot.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.style.width = '300px';
    iframe.style.height = '250px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    slot.appendChild(iframe);

    var bannerHtml = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;padding:0;width:300px;height:250px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center;}</style></head><body>' +
      '<script type="text/javascript">' +
      'atOptions = {' +
      "  'key' : 'd63c5535d695dc8fc37ba5d09d406934'," +
      "  'format' : 'iframe'," +
      "  'height' : 250," +
      "  'width' : 300," +
      "  'params' : {}" +
      '};' +
      '<\/script>' +
      '<script type="text/javascript" src="https://bauval.org/22/d63c5535d695dc8fc37ba5d09d406934"><\/script>' +
      '</body></html>';

    if ('srcdoc' in iframe) {
      iframe.srcdoc = bannerHtml;
    } else {
      try {
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) doc = doc.document;
        doc.open();
        doc.write(bannerHtml);
        doc.close();
      } catch (e) {
        console.warn('[AdManager] Reward ad iframe error:', e);
      }
    }

    // 5-second countdown timer
    if (_rewardCountdownTimer) clearInterval(_rewardCountdownTimer);
    var remaining = 5;
    var totalTime = 5;

    _rewardCountdownTimer = setInterval(function () {
      remaining -= 0.5;
      var pct = Math.min(100, Math.round(((totalTime - remaining) / totalTime) * 100));
      bar.style.width = pct + '%';

      if (remaining > 0) {
        var sec = Math.ceil(remaining);
        timerText.textContent = 'STANDBY // ' + sec + 'S';
        claimBtn.innerHTML = [
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite">',
          '  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
          '</svg>',
          '<span>STANDBY (' + sec + 'S)</span>'
        ].join('');
      } else {
        clearInterval(_rewardCountdownTimer);
        _rewardCountdownTimer = null;
        bar.style.width = '100%';
        timerText.textContent = 'SYS READY';

        claimBtn.disabled = false;
        claimBtn.className = 'claim-btn ready';
        claimBtn.innerHTML = [
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">',
          '  <polygon points="5 3 19 12 5 21 5 3"/>',
          '</svg>',
          '<span>RESUME RACE</span>'
        ].join('');

        // Auto-resume after 1.2s if player doesn't tap
        setTimeout(function () {
          if (overlay.style.display !== 'none') {
            overlay.style.display = 'none';
            _grantExtraLife();
          }
        }, 1200);
      }
    }, 500);
  }

  // Global test helper
  window.__showRewardedLifeAd = _showRewardedOverlay;

  function _grantExtraLife() {
    window.dispatchEvent(new CustomEvent('ad:reward', {
      detail: { type: 'extraLife' }
    }));
    console.log('[AdManager] Extra life granted after ad.');
  }

  /* ─────────────────────────────────────────────────────────────────────
   * 2. BILLBOARD AD TEXTURE INJECTION
   * ───────────────────────────────────────────────────────────────────── */
  function _loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      var timer = setTimeout(function () { reject(new Error('timeout')); }, 8000);
      img.onload  = function () { clearTimeout(timer); resolve(img); };
      img.onerror = function () { clearTimeout(timer); reject(new Error('load error')); };
      img.src = url;
    });
  }

  function _injectAdOnMaterial(mat, url, slotIndex) {
    if (!url || !mat) return;
    _loadImage(url).then(function (img) {
      try {
        var canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || 1024;
        canvas.height = img.naturalHeight || 512;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        var existingTex = mat.map;
        if (!existingTex) return;

        var newTex = new existingTex.constructor(canvas);
        newTex.colorSpace = existingTex.colorSpace;
        newTex.anisotropy = existingTex.anisotropy || 4;
        newTex.needsUpdate = true;

        mat.map = newTex;
        if (mat.emissiveMap) mat.emissiveMap = newTex;
        mat.needsUpdate = true;

        console.log('[AdManager] Billboard ' + slotIndex + ' → ad creative loaded.');
      } catch (err) {
        // billboard_i.jpg stays — no action needed
        console.warn('[AdManager] Billboard ' + slotIndex + ' swap failed:', err.message);
      }
    }).catch(function (err) {
      // Network failure → billboard_i.jpg stays (natural fallback)
      console.warn('[AdManager] Billboard ' + slotIndex + ' fetch failed — JPG fallback.', err.message);
    });
  }

  function _initBillboards() {
    if (window.__DISABLE_EXTERNAL_ADS__ || window.__IS_LAGOS_LIFE__) {
      console.log('[AdManager] Billboard ads suppressed (Lagos Life platform mode)');
      return;
    }
    var urls = CFG.adstreaBillboardUrls;
    if (!urls || urls.every(function (u) { return !u; })) {
      console.log('[AdManager] No billboard URLs yet — billboard_i.jpg active.');
      return;
    }

    var mats = (window.__lsrWorld && window.__lsrWorld.boardMats) || [];
    if (!mats.length) {
      setTimeout(_initBillboards, 500);
      return;
    }

    for (var i = 0; i < Math.min(mats.length, urls.length); i++) {
      _injectAdOnMaterial(mats[i], urls[i], i);
    }

    if (CFG.rotateIntervalMs > 0) {
      setInterval(function () {
        var fresh = (window.__lsrWorld && window.__lsrWorld.boardMats) || [];
        for (var i = 0; i < Math.min(fresh.length, urls.length); i++) {
          if (urls[i]) _injectAdOnMaterial(fresh[i], urls[i], i);
        }
      }, CFG.rotateIntervalMs);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
   * 3. HOOK INTO window.__GAME__ — same pattern as TOD guardian
   * ───────────────────────────────────────────────────────────────────── */
  var _patchAttempts = 0;

  function _tryPatch() {
    var g = window.__GAME__ && window.__GAME__.game;
    if (!g) {
      if (++_patchAttempts < 200) setTimeout(_tryPatch, 100);
      return;
    }

    // Patch _gameOver
    if (typeof g._gameOver === 'function' && !g.__adManagerPatched) {
      var _orig = g._gameOver.bind(g);
      g._gameOver = function () {
        _orig();
        try { onGameOver(); } catch (e) { console.warn('[AdManager] onGameOver error:', e); }
      };
      g.__adManagerPatched = true;
      console.log('[AdManager] _gameOver patched.');
    }

    // ── Extra Life — real engine respawn ──────────────────────────────────────────
    // Verified engine internals:
    //   g.mode            — 'playing' | 'crashed' | 'gameover'
    //   g.crashT          — timer counting up; triggers _gameOver at Kg
    //   g.player.alive    — false after crash()
    //   g.player._rollIframe — when > 0, invulnerable getter returns true
    //   g.hud.popup(label, points, color) — floating HUD popup
    // ───────────────────────────────────────────────────────────────────────
    window.addEventListener('ad:reward', function (evt) {
      if (!evt || !evt.detail || evt.detail.type !== 'extraLife') return;
      try {
        var p = g.player;
        if (!p) { console.warn('[AdManager] player not found'); return; }

        // Only apply if the player is crashed (not already past game over screen)
        if (g.mode !== 'crashed' && g.mode !== 'gameover') return;

        // 1. Restore game state
        g.mode   = 'playing';
        g.crashT = 0;
        g.overT  = 0;

        // 2. Hide Game Over screen and restore HUD
        if (g.hud) {
          if (typeof g.hud.hideGameOver === 'function') g.hud.hideGameOver();
          if (typeof g.hud.showRun === 'function') g.hud.showRun();
          if (typeof g.hud.showPause === 'function') g.hud.showPause(false);
          if (g.hud.over) g.hud.over.classList.add('hidden');
        }

        // 3. Restore camera mode to playing
        if (g.chase && typeof g.chase.setMode === 'function') {
          g.chase.setMode('play');
        }

        // 4. Restore player alive flag and upright position
        p.alive = true;
        p.grounded = true;
        if (p.velocity && typeof p.velocity.set === 'function') {
          p.velocity.set(0, 0, 0);
        }
        if (p.rotation && typeof p.rotation.set === 'function') {
          p.rotation.set(0, 0, 0);
        }
        if (p.mesh && p.mesh.rotation && typeof p.mesh.rotation.set === 'function') {
          p.mesh.rotation.set(0, 0, 0);
        }
        if (p.position && p.position.y < 0.2) {
          p.position.y = 0.5;
        }
        if (typeof p.recoverFromCrash === 'function') {
          p.recoverFromCrash();
        }

        // 5. Grant 3.5s invulnerability via _rollIframe
        //    (invulnerable getter = rolling || _rollIframe > 0 || rocketTimer...)
        p._rollIframe = 3.5;

        // 6. Show “RESPAWNED!” HUD popup
        if (g.hud && typeof g.hud.popup === 'function') {
          g.hud.popup('❤️ RESPAWNED!', 0, 'cyan');
        }

        // 7. Resume ambient / run music
        if (g.audio && typeof g.audio.music === 'function') {
          g.audio.music('run');
        }

        console.log('[AdManager] Extra life granted — game over hidden, mode restored to playing.');
      } catch (err) {
        console.warn('[AdManager] Extra life grant failed:', err);
      }
    });

    _initBillboards();
    console.log('[AdManager] Ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_tryPatch, 600); });
  } else {
    setTimeout(_tryPatch, 600);
  }

})();
