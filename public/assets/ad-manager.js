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

    var el = document.createElement('div');
    el.id = 'lsr-reward-overlay';
    el.style.cssText = [
      'position:fixed;inset:0;z-index:99999',
      'display:none;flex-direction:column;align-items:center;justify-content:center',
      'background:rgba(4,7,14,0.88)',
      'backdrop-filter:blur(12px)',
      '-webkit-backdrop-filter:blur(12px)',
      'font-family:"Outfit","Inter",-apple-system,sans-serif',
      'color:#fff',
      'text-align:center',
      'padding:16px',
      'user-select:none',
    ].join(';');

    el.innerHTML = [
      '<div style="',
      '  background: linear-gradient(180deg, #161c28 0%, #0d121c 100%);',
      '  border: 1.5px solid rgba(0, 240, 255, 0.4);',
      '  border-radius: 12px;',
      '  box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,240,255,0.2);',
      '  padding: 18px 20px 16px;',
      '  width: 326px;',
      '  max-width: 95vw;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  box-sizing: border-box;',
      '">',
      '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">',
      '    <span style="font-size:22px">❤️</span>',
      '    <h2 style="margin:0;font-size:20px;font-weight:800;letter-spacing:1px;background:linear-gradient(135deg,#00f0ff,#f5c518);-webkit-background-clip:text;-webkit-text-fill-color:transparent">SECOND CHANCE!</h2>',
      '  </div>',
      '  <p style="margin:0 0 10px;font-size:12px;color:rgba(255,255,255,0.72);line-height:1.4">Watch sponsor ad to continue your race</p>',
      '  <!-- Adsterra 300x250 Banner Slot -->',
      '  <div id="lsr-reward-ad-slot" style="width:300px;height:250px;background:#000;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:12px"></div>',
      '  <!-- 5-Second Countdown Bar -->',
      '  <div style="width:100%;background:rgba(255,255,255,0.08);border-radius:6px;height:6px;overflow:hidden;margin-bottom:8px">',
      '    <div id="lsr-reward-progress" style="width:0%;height:100%;background:linear-gradient(90deg,#00f0ff,#f5c518);transition:width 0.25s linear"></div>',
      '  </div>',
      '  <div id="lsr-reward-timer-text" style="font-size:12px;font-weight:700;color:#00f0ff;letter-spacing:0.5px;margin-bottom:10px">Sponsor Ad: Reviving in 5s...</div>',
      '  <!-- Continue Button -->',
      '  <button id="lsr-reward-claim-btn" disabled style="',
      '    width: 100%;',
      '    background: rgba(255,255,255,0.12);',
      '    border: none;',
      '    border-radius: 8px;',
      '    color: rgba(255,255,255,0.45);',
      '    font-size: 14px;',
      '    font-weight: 800;',
      '    letter-spacing: 0.05em;',
      '    padding: 12px 20px;',
      '    cursor: not-allowed;',
      '    transition: all 0.25s ease;',
      '    font-family: inherit;',
      '  ">⏳ Watching sponsor ad (5s)...</button>',
      '  <!-- Skip Option -->',
      '  <button id="lsr-reward-skip-btn" style="background:none;border:none;margin-top:10px;color:rgba(255,255,255,0.4);font-size:12px;cursor:pointer;font-family:inherit;text-decoration:underline">No thanks, end run</button>',
      '</div>'
    ].join('');

    document.body.appendChild(el);
    _overlayEl = el;

    // Claim button
    var claimBtn = el.querySelector('#lsr-reward-claim-btn');
    claimBtn.addEventListener('click', function () {
      if (claimBtn.disabled) return;
      if (_rewardCountdownTimer) clearInterval(_rewardCountdownTimer);
      _overlayEl.style.display = 'none';
      _grantExtraLife();
    });

    // Skip button
    el.querySelector('#lsr-reward-skip-btn').addEventListener('click', function () {
      if (_rewardCountdownTimer) clearInterval(_rewardCountdownTimer);
      _overlayEl.style.display = 'none';
    });

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
    claimBtn.style.background = 'rgba(255,255,255,0.12)';
    claimBtn.style.color = 'rgba(255,255,255,0.45)';
    claimBtn.style.boxShadow = 'none';
    claimBtn.style.cursor = 'not-allowed';
    claimBtn.textContent = '⏳ Watching sponsor ad (5s)...';
    timerText.textContent = 'Sponsor Ad: Reviving in 5s...';

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
        timerText.textContent = 'Sponsor Ad: Reviving in ' + Math.ceil(remaining) + 's...';
        claimBtn.textContent = '⏳ Watching sponsor ad (' + Math.ceil(remaining) + 's)...';
      } else {
        clearInterval(_rewardCountdownTimer);
        _rewardCountdownTimer = null;
        bar.style.width = '100%';
        timerText.textContent = '❤️ SPONSOR REWARD READY!';

        claimBtn.disabled = false;
        claimBtn.style.background = 'linear-gradient(135deg, #00f0ff, #0090ff)';
        claimBtn.style.color = '#000';
        claimBtn.style.boxShadow = '0 8px 24px rgba(0, 240, 255, 0.45)';
        claimBtn.style.cursor = 'pointer';
        claimBtn.textContent = '❤️ RESUME RACE NOW';

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
