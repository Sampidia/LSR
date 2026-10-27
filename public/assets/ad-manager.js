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

    // Approach A: Roadside Billboard Overlay (Adsterra 300×250 Banner)
    roadsideBillboard: {
      adsterraKey: 'd63c5535d695dc8fc37ba5d09d406934',
      adsterraScriptUrl: 'https://bauval.org/22/d63c5535d695dc8fc37ba5d09d406934',
      firstShowSec: 25,         // Initial slide-in after 25s of driving
      showDurationSec: 18,      // Visible for 18s (full CPM impression captured)
      repeatIntervalSec: 75,    // Repeats every 75s while driving
    },
  };

  /* ─────────────────────────────────────────────────────────────────────
   * 1. REWARDED ONCLICK — every 3rd game over
   * ───────────────────────────────────────────────────────────────────── */
  var _gameOverCount = 0;
  var INTERSTITIAL_EVERY = 3;

  function onGameOver() {
    _gameOverCount++;
    if (_gameOverCount % INTERSTITIAL_EVERY === 0) {
      _showRewardedOverlay();
    }
  }

  /* ── Rewarded overlay ────────────────────────────────────────────────── */
  var _overlayEl = null;

  function _buildOverlay() {
    if (_overlayEl) return _overlayEl;

    var el = document.createElement('div');
    el.id = 'lsr-reward-overlay';
    el.style.cssText = [
      'position:fixed;inset:0;z-index:99999',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'background:rgba(0,0,0,0.85)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'font-family:"Outfit","Inter",sans-serif',
      'color:#fff',
      'text-align:center',
      'padding:24px',
    ].join(';');

    el.innerHTML =
      '<div style="font-size:52px;margin-bottom:12px">❤️</div>' +
      '<h2 style="margin:0 0 8px;font-size:24px;font-weight:800;' +
             'background:linear-gradient(135deg,#00f0ff,#f5c518);' +
             '-webkit-background-clip:text;-webkit-text-fill-color:transparent">' +
        'Second Chance!' +
      '</h2>' +
      '<p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.78);max-width:300px;line-height:1.5">' +
        'Claim a free extra life and jump straight back into the race!' +
      '</p>' +
      '<button id="lsr-watch-ad-btn" style="' +
        'background:linear-gradient(135deg,#00f0ff,#0090ff);' +
        'border:none;border-radius:9999px;color:#000;' +
        'font-size:15px;font-weight:800;letter-spacing:.05em;' +
        'padding:14px 36px;cursor:pointer;' +
        'box-shadow:0 8px 24px rgba(0,240,255,.45);' +
        'transition:transform .15s,box-shadow .15s' +
      '">' +
        '❤️ Claim Extra Life' +
      '</button>' +
      '<button id="lsr-skip-ad-btn" style="' +
        'background:none;border:none;margin-top:16px;' +
        'color:rgba(255,255,255,0.45);font-size:13px;cursor:pointer;' +
        'font-family:inherit;text-decoration:underline' +
      '">No thanks, end run</button>';

    document.body.appendChild(el);
    _overlayEl = el;

    // Claim button: Grants extra life directly without injecting click interceptors
    el.querySelector('#lsr-watch-ad-btn').addEventListener('click', function () {
      _overlayEl.style.display = 'none';
      _grantExtraLife();
    });

    // Skip button
    el.querySelector('#lsr-skip-ad-btn').addEventListener('click', function () {
      _overlayEl.style.display = 'none';
    });

    return el;
  }

  function _showRewardedOverlay() {
    var overlay = _buildOverlay();
    overlay.style.display = 'flex';
  }

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

        // 2. Restore player alive flag
        p.alive = true;
        if (typeof p.recoverFromCrash === 'function') p.recoverFromCrash();

        // 3. Grant 3s invulnerability via _rollIframe
        //    (invulnerable getter = rolling || _rollIframe > 0 || rocketTimer...)
        p._rollIframe = 3.0;

        // 4. Show “EXTRA LIFE!” HUD popup
        if (g.hud && typeof g.hud.popup === 'function') {
          g.hud.popup('❤️ Extra Life!', 0, 'cyan');
        }

        // 5. Resume ambient / run music
        if (g.audio && typeof g.audio.music === 'function') {
          g.audio.music('run');
        }

        console.log('[AdManager] Extra life granted — mode restored to playing.');
      } catch (err) {
        console.warn('[AdManager] Extra life grant failed:', err);
      }
    });

    _initBillboards();
    _initRoadsideBillboard(g);
    console.log('[AdManager] Ready.');
  }

  /* ─────────────────────────────────────────────────────────────────────
   * 3. ROADSIDE BILLBOARD OVERLAY (Adsterra 300×250 Banner)
   * ───────────────────────────────────────────────────────────────────── */
  function _initRoadsideBillboard(g) {
    var panel = document.getElementById('lsr-roadside-billboard');
    var closeBtn = document.getElementById('lsr-billboard-close-btn');
    if (!panel) return;

    var _driveSec = 0;
    var _bbVisible = false;
    var _autoHideTimer = null;

    function _showBillboard() {
      if (_bbVisible) return;
      if (!g || g.mode !== 'playing' || g.paused) return;
      _bbVisible = true;
      panel.classList.add('visible');
      console.log('[AdManager] Roadside billboard displayed.');

      if (_autoHideTimer) clearTimeout(_autoHideTimer);
      // Stays visible for 18 seconds (full CPM impression captured)
      _autoHideTimer = setTimeout(function () {
        _hideBillboard();
        _driveSec = -60; // Show again after another 60s of driving
      }, 18000);
    }

    function _hideBillboard() {
      if (!_bbVisible) return;
      _bbVisible = false;
      panel.classList.remove('visible');
      if (_autoHideTimer) clearTimeout(_autoHideTimer);
      console.log('[AdManager] Roadside billboard retracted.');
    }

    // Dismiss button on billboard frame
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        _hideBillboard();
        _driveSec = -90; // dismissed: wait 90s before next show
      });
    }

    // Monitor driving state every 250ms
    setInterval(function () {
      if (!g) return;

      // If player paused, crashed, or in menu: hide immediately
      if (g.mode !== 'playing' || g.paused) {
        if (_bbVisible) _hideBillboard();
        return;
      }

      // Actively racing on Third Mainland Bridge!
      _driveSec += 0.25;

      // Show after 10 seconds of active driving
      if (!_bbVisible && _driveSec >= 10) {
        _showBillboard();
      }
    }, 250);

    // Global test helpers for instant console verification
    window.__showLsrBillboard = _showBillboard;
    window.__hideLsrBillboard = _hideBillboard;

    console.log('[AdManager] Roadside billboard monitoring active driving time.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_tryPatch, 600); });
  } else {
    setTimeout(_tryPatch, 600);
  }

})();
