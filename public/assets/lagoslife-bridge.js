/**
 * lagoslife-bridge.js — Lagos Life Platform & Vatar Games SDK Bridge
 * ─────────────────────────────────────────────────────────────────────────
 * Dual-Environment Coordinator:
 *  - Mode 1: Lagos Life Virtual Smartphone (lagoslife.app & Sandbox)
 *            • Vatar Games SDK (vatar-games-v1.js) active
 *            • Microtransactions (VIP Cars ₦300, Extra Lives ₦100)
 *            • Platform Leaderboard (Vatar.leaderboard & Vatar.submitScore)
 *            • External ads completely disabled (safe for virtual phone iframe)
 *  - Mode 2: Standalone Web (lsr.sampidia.com)
 *            • 100% Free VIP vehicles unlocked
 *            • Existing Web Ads (Monetag & Adsterra) active
 * ─────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // Environment Detection
  // CRITICAL: Any iframe embedding, or Vatar global, or Lagos Life domain, or param = LAGOS LIFE!
  const urlParams = new URLSearchParams(window.location.search);
  const isIframe = window.self !== window.top;
  const isLagosDomain = document.referrer.includes('lagoslife') ||
                        document.referrer.includes('naijalife') ||
                        document.referrer.includes('eliysites') ||
                        window.location.hostname.includes('lagoslife');
  const hasVatarGlobal = typeof window.Vatar !== 'undefined';
  const hasParam = urlParams.has('vatar') ||
                   urlParams.get('platform') === 'lagoslife' ||
                   urlParams.has('sandbox') ||
                   urlParams.has('session');

  // Any iframe embedding represents Lagos Life virtual smartphone or its developer sandbox
  const isLagosLife = isIframe || hasVatarGlobal || isLagosDomain || hasParam;

  // Global Flags
  window.__IS_LAGOS_LIFE__ = isLagosLife;
  if (isLagosLife) {
    window.__DISABLE_EXTERNAL_ADS__ = true;
    console.log('[LagosLifeBridge] RUNTIME: LAGOS LIFE PLATFORM / SANDBOX (Ads DISABLED, Vatar SDK ENABLED)');
  } else {
    window.__DISABLE_EXTERNAL_ADS__ = false;
    console.log('[LagosLifeBridge] RUNTIME: STANDALONE WEB (lsr.sampidia.com — all cars unlocked)');
  }

  // State & Entitlements
  const state = {
    initialized: false,
    player: null,
    mode: 'live',
    entitlements: new Set(),
    lives: 0,
    hasRespawnedThisRun: false
  };

  // Restore stored entitlements & extra lives
  try {
    const cached = localStorage.getItem('lsr_ll_entitlements');
    if (cached) {
      const arr = JSON.parse(cached);
      arr.forEach(item => state.entitlements.add(item));
    }
    const savedLives = parseInt(localStorage.getItem('lsr_ll_lives') || '0', 10);
    if (!isNaN(savedLives) && savedLives >= 0) {
      state.lives = savedLives;
    }
  } catch (e) {
    console.warn('[LagosLifeBridge] Could not parse cached data', e);
  }

  function saveEntitlements() {
    try {
      localStorage.setItem('lsr_ll_entitlements', JSON.stringify(Array.from(state.entitlements)));
    } catch (_) {}
  }

  function saveLives(n) {
    state.lives = Math.max(0, n);
    try {
      localStorage.setItem('lsr_ll_lives', String(state.lives));
    } catch (_) {}
  }

  // Bridge Public API
  const LagosLifeBridge = {
    isLagosLife() {
      return isLagosLife;
    },

    getPlayer() {
      return state.player;
    },

    getLives() {
      return state.lives;
    },

    /**
     * Check if a vehicle is owned / playable:
     * - 'flying_t' is always free and owned in all environments.
     * - On standalone web, all vehicles are 100% unlocked and free.
     * - In Lagos Life mode, VIP vehicles require entitlement.
     */
    hasCar(carKey) {
      if (!isLagosLife) return true; // Standalone web: all free
      if (carKey === 'flying_t') return true; // Default starter car: always free
      return state.entitlements.has('car_' + carKey);
    },

    /**
     * Trigger in-app purchase for a vehicle via Vatar SDK
     * Vatar.purchase takes product ID string: "car_flying_danfo" | "car_flying_tortoise"
     */
    async purchaseCar(carKey) {
      const sku = 'car_' + carKey;
      if (!isLagosLife) {
        return { success: true, message: 'Unlocked' };
      }

      if (window.Vatar && typeof window.Vatar.purchase === 'function') {
        try {
          const res = await window.Vatar.purchase(sku);
          // SDK resolves with { purchaseId, productId }
          if (res && (res.productId === sku || res.purchaseId || res.success)) {
            state.entitlements.add(sku);
            saveEntitlements();
            window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated', { detail: { sku } }));
            return { success: true };
          }
          return { success: false, reason: 'Incomplete' };
        } catch (err) {
          console.error('[LagosLifeBridge] Purchase error:', err);
          return { success: false, error: err.code || err.message };
        }
      } else {
        // Mock fallback if running in sandbox without SDK injection
        const confirmed = window.confirm(`[Lagos Life Store]\n\nUnlock VIP vehicle for ₦300?\n(Game Naira will be deducted from your virtual phone balance)`);
        if (confirmed) {
          state.entitlements.add(sku);
          saveEntitlements();
          window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated', { detail: { sku } }));
          return { success: true };
        }
        return { success: false, reason: 'Canceled' };
      }
    },

    /**
     * Purchase extra lives pack: ₦100 for 3 lives
     */
    async purchaseExtraLives() {
      const sku = 'respawn_pack_3';
      if (!isLagosLife) return { success: false };

      if (window.Vatar && typeof window.Vatar.purchase === 'function') {
        try {
          const res = await window.Vatar.purchase(sku);
          if (res && (res.productId === sku || res.purchaseId || res.success)) {
            saveLives(state.lives + 3);
            return { success: true, lives: state.lives };
          }
          return { success: false };
        } catch (err) {
          console.error('[LagosLifeBridge] Extra lives purchase error:', err);
          return { success: false, error: err.code || err.message };
        }
      } else {
        const confirmed = window.confirm(`[Lagos Life Store]\n\nBuy 3 Extra Lives (Respawn Pack) for ₦100?`);
        if (confirmed) {
          saveLives(state.lives + 3);
          return { success: true, lives: state.lives };
        }
        return { success: false };
      }
    },

    /**
     * Submit score to Lagos Life Leaderboard
     */
    async submitScore(score, distance) {
      if (!isLagosLife) return;
      if (window.Vatar && typeof window.Vatar.submitScore === 'function') {
        try {
          const res = await window.Vatar.submitScore(Math.floor(score));
          return res;
        } catch (err) {
          if (err && err.code === 'too_soon') {
            // Ignore rate-limit quietly (max 1 submission per 20 seconds)
          } else {
            console.warn('[LagosLifeBridge] submitScore warning:', err);
          }
        }
      }
    },

    /**
     * Fetch top leaderboard ranks
     */
    async getLeaderboard(limit = 10) {
      if (window.Vatar && typeof window.Vatar.getLeaderboard === 'function') {
        try {
          return await window.Vatar.getLeaderboard({ limit });
        } catch (err) {
          console.warn('[LagosLifeBridge] getLeaderboard caught:', err);
        }
      }
      return {
        entries: [
          { rank: 1, name: 'Chidi_VIP', score: 38420, car: 'Flying Danfo' },
          { rank: 2, name: 'LekkiPilot', score: 29150, car: 'Flying Tortoise' },
          { rank: 3, name: 'YabaRacer', score: 24800, car: 'Flying T' },
          { rank: 4, name: 'MainlandDrift', score: 19650, car: 'Flying Danfo' },
          { rank: 5, name: 'EkoCyber', score: 17200, car: 'Flying T' }
        ],
        playerRank: state.player ? 42 : null
      };
    },

    /**
     * Show Lagos Life Respawn Modal on Crash / Game Over
     */
    showRespawnSheet(score, distance) {
      if (!isLagosLife) return false;
      if (state.hasRespawnedThisRun) return false; // Max 1 respawn per run

      const existing = document.getElementById('ll-respawn-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'll-respawn-modal';
      modal.style.cssText = [
        'position:fixed;inset:0;z-index:999999',
        'display:flex;align-items:center;justify-content:center',
        'background:rgba(5,9,16,0.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)',
        'font-family:"Outfit","Inter",sans-serif;color:#fff;padding:20px;user-select:none'
      ].join(';');

      const lives = state.lives;

      modal.innerHTML = `
        <div style="background:linear-gradient(165deg, rgba(16,24,40,0.92) 0%, rgba(8,13,24,0.96) 100%);
                    border:1.5px solid rgba(0,240,255,0.45);border-radius:20px;padding:28px 24px 22px;
                    max-width:340px;width:92vw;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 35px rgba(0,240,255,0.25)">
          <div style="font-size:36px;margin-bottom:6px;filter:drop-shadow(0 0 16px rgba(255,42,68,0.6))">❤️</div>
          <h2 style="margin:0 0 6px;font-size:20px;font-weight:900;letter-spacing:0.04em;text-transform:uppercase;color:#fff;text-shadow:0 0 14px rgba(0,240,255,0.5)">
            Second Chance!
          </h2>
          <p style="margin:0 0 16px;font-size:12px;color:rgba(220,240,255,0.75);line-height:1.4">
            Keep your current score (${Math.floor(score).toLocaleString()} M) and continue racing on Third Mainland Bridge!
          </p>

          <div id="ll-respawn-action-area" style="margin-bottom:12px">
            ${lives > 0 ? `
              <button id="ll-use-life-btn" style="width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;
                background:linear-gradient(135deg,#00f0ff 0%,#00b4d8 100%);color:#040914;font-size:13px;font-weight:900;
                letter-spacing:0.1em;text-transform:uppercase;box-shadow:0 0 24px rgba(0,240,255,0.5);display:flex;align-items:center;justify-content:center;gap:8px">
                <span>❤️</span>
                <span>Use Extra Life (${lives} Left)</span>
              </button>
            ` : `
              <button id="ll-buy-pack-btn" style="width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;
                background:linear-gradient(135deg,#ffd700 0%,#ff8c00 100%);color:#000;font-size:13px;font-weight:900;
                letter-spacing:0.1em;text-transform:uppercase;box-shadow:0 0 24px rgba(255,215,0,0.5);display:flex;align-items:center;justify-content:center;gap:8px">
                <span>⚡</span>
                <span>Buy 3 Lives (₦100) &amp; Revive</span>
              </button>
            `}
          </div>

          <button id="ll-decline-btn" style="background:none;border:none;color:rgba(255,255,255,0.45);font-size:11px;
            font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;padding:8px;transition:color 0.2s">
            No Thanks &bull; Finish Run
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      function doRevive() {
        state.hasRespawnedThisRun = true;
        modal.remove();
        // Fire real engine respawn event
        window.dispatchEvent(new CustomEvent('ad:reward', {
          detail: { type: 'extraLife' }
        }));
      }

      // Bind Use Life
      const useBtn = modal.querySelector('#ll-use-life-btn');
      if (useBtn) {
        useBtn.addEventListener('click', () => {
          saveLives(state.lives - 1);
          doRevive();
        });
      }

      // Bind Buy Pack
      const buyBtn = modal.querySelector('#ll-buy-pack-btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
          buyBtn.innerHTML = '<span>⚡ Opening Lagos Life Pay Sheet...</span>';
          buyBtn.style.opacity = '0.7';
          const res = await LagosLifeBridge.purchaseExtraLives();
          if (res && res.success) {
            saveLives(state.lives - 1); // Use 1 immediately to revive, 2 stored
            doRevive();
          } else {
            buyBtn.innerHTML = '<span>⚡ Buy 3 Lives (₦100) &amp; Revive</span>';
            buyBtn.style.opacity = '1';
          }
        });
      }

      // Bind Decline / Finish
      const declineBtn = modal.querySelector('#ll-decline-btn');
      if (declineBtn) {
        declineBtn.addEventListener('click', () => {
          modal.remove();
          LagosLifeBridge.submitScore(score, distance);
        });
      }

      return true;
    },

    /**
     * Reset per-run flags on new race
     */
    resetRun() {
      state.hasRespawnedThisRun = false;
    },

    /**
     * Initialize SDK connection
     */
    init() {
      if (state.initialized) return;
      state.initialized = true;

      // Always initialize Vatar if present
      this._bindVatarEvents();
    },

    _bindVatarEvents() {
      if (!window.Vatar) return;

      try {
        if (typeof window.Vatar.init === 'function') {
          window.Vatar.init().then(info => {
            if (info && info.player) state.player = info.player;
            if (info && info.mode) state.mode = info.mode;
            console.log('[LagosLifeBridge] Vatar SDK initialized. Player:', info?.player?.name, 'Mode:', info?.mode);

            // Fetch past active purchases
            if (typeof window.Vatar.purchases === 'function') {
              window.Vatar.purchases().then(purchases => {
                if (Array.isArray(purchases)) {
                  purchases.forEach(p => {
                    const sku = typeof p === 'string' ? p : (p.productId || p.sku);
                    if (sku) state.entitlements.add(sku);
                  });
                  saveEntitlements();
                  window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated'));
                }
              }).catch(() => {});
            }
          }).catch(err => {
            console.warn('[LagosLifeBridge] Vatar.init error:', err);
          });
        }

        // Listen for background purchase completions
        if (typeof window.Vatar.onPurchase === 'function') {
          window.Vatar.onPurchase(p => {
            const sku = typeof p === 'string' ? p : (p?.productId || p?.sku);
            if (sku) {
              if (sku === 'respawn_pack_3') {
                saveLives(state.lives + 3);
              } else {
                state.entitlements.add(sku);
                saveEntitlements();
              }
              window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated', { detail: { sku } }));
            }
          });
        }

        // Bind pause / resume callbacks
        if (typeof window.Vatar.onPause === 'function') {
          window.Vatar.onPause(() => {
            const g = window.__GAME__ && window.__GAME__.game;
            if (g && typeof g._pause === 'function' && !g.paused) {
              g._pause();
            }
          });
        }
        if (typeof window.Vatar.onResume === 'function') {
          window.Vatar.onResume(() => {
            const g = window.__GAME__ && window.__GAME__.game;
            if (g && typeof g._resume === 'function' && g.paused) {
              g._resume();
            }
          });
        }
      } catch (e) {
        console.warn('[LagosLifeBridge] Error binding Vatar events:', e);
      }
    }
  };

  // Expose bridge globally
  window.LagosLifeBridge = LagosLifeBridge;

  // Auto-init on script evaluation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LagosLifeBridge.init());
  } else {
    LagosLifeBridge.init();
  }
})();
