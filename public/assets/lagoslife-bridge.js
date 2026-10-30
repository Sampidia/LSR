/**
 * lagoslife-bridge.js — Lagos Life Platform & Vatar Games SDK Bridge
 * ─────────────────────────────────────────────────────────────────────────
 * Dual-Environment Coordinator:
 *  - Mode 1: Lagos Life Virtual Smartphone (lagoslife.app)
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
  const urlParams = new URLSearchParams(window.location.search);
  const isIframe = window.self !== window.top;
  const isLagosDomain = document.referrer.includes('lagoslife.app') || window.location.hostname.includes('lagoslife.app');
  const hasVatarGlobal = typeof window.Vatar !== 'undefined';
  const hasParam = urlParams.get('platform') === 'lagoslife';

  const isLagosLife = (isIframe && (isLagosDomain || hasVatarGlobal)) || hasParam;

  // Global Flags
  window.__IS_LAGOS_LIFE__ = isLagosLife;
  if (isLagosLife) {
    window.__DISABLE_EXTERNAL_ADS__ = true;
    console.log('[LagosLifeBridge] Mode: LAGOS LIFE PLATFORM (External ads disabled, Vatar SDK enabled)');
  } else {
    window.__DISABLE_EXTERNAL_ADS__ = false;
    console.log('[LagosLifeBridge] Mode: STANDALONE WEB (lsr.sampidia.com — all cars unlocked)');
  }

  // Product Catalog Definitions (Prices in Game Naira ₦)
  const CATALOG = {
    car_flying_danfo: {
      sku: 'car_flying_danfo',
      title: 'Flying Danfo (Heavy Ion)',
      price: 300,
      currency: 'NGN',
      type: 'car',
      carKey: 'flying_danfo'
    },
    car_flying_tortoise: {
      sku: 'car_flying_tortoise',
      title: 'Flying Tortoise (Jet Cruiser)',
      price: 300,
      currency: 'NGN',
      type: 'car',
      carKey: 'flying_tortoise'
    },
    respawn_pack_3: {
      sku: 'respawn_pack_3',
      title: '3 Extra Lives (Respawn Pack)',
      price: 100,
      currency: 'NGN',
      type: 'consumable'
    }
  };

  // Bridge State
  const state = {
    initialized: false,
    player: null,
    entitlements: new Set(),
    leaderboardCache: null
  };

  // Restore cached local entitlements
  try {
    const cached = localStorage.getItem('lsr_ll_entitlements');
    if (cached) {
      const arr = JSON.parse(cached);
      arr.forEach(item => state.entitlements.add(item));
    }
  } catch (e) {
    console.warn('[LagosLifeBridge] Could not parse cached entitlements', e);
  }

  // Helper to persist entitlements
  function saveEntitlements() {
    try {
      localStorage.setItem('lsr_ll_entitlements', JSON.stringify(Array.from(state.entitlements)));
    } catch (e) {}
  }

  // Bridge Public API
  const LagosLifeBridge = {
    isLagosLife() {
      return isLagosLife;
    },

    getCatalog() {
      return CATALOG;
    },

    getPlayer() {
      return state.player;
    },

    /**
     * Check if a vehicle is owned / playable:
     * - 'flying_t' is always free and owned in all environments.
     * - On standalone web, all vehicles are 100% unlocked and free.
     * - In Lagos Life mode, VIP vehicles require entitlement.
     */
    hasCar(carKey) {
      if (!isLagosLife) return true; // Standalone web: all free
      if (carKey === 'flying_t') return true; // Starter car: always free
      return state.entitlements.has('car_' + carKey);
    },

    /**
     * Prompt in-app purchase for a vehicle via Vatar SDK
     */
    async purchaseCar(carKey) {
      const sku = 'car_' + carKey;
      const item = CATALOG[sku];
      if (!item) throw new Error('Unknown vehicle SKU: ' + sku);

      if (!isLagosLife) {
        // Already unlocked on standalone
        return { success: true, message: 'Unlocked' };
      }

      if (window.Vatar && typeof window.Vatar.purchase === 'function') {
        try {
          const res = await window.Vatar.purchase({
            sku: item.sku,
            title: item.title,
            price: item.price,
            currency: 'NGN'
          });
          if (res && (res.success || res.status === 'completed')) {
            state.entitlements.add(sku);
            saveEntitlements();
            window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated', { detail: { sku } }));
            return { success: true };
          }
          return { success: false, reason: res?.reason || 'User canceled' };
        } catch (err) {
          console.error('[LagosLifeBridge] Purchase error:', err);
          return { success: false, error: err.message };
        }
      } else {
        // Fallback mock prompt for testing if SDK is loading or mock mode
        const confirmed = window.confirm(`[Lagos Life Store]\n\nUnlock ${item.title} for ₦${item.price}?\n(Game Naira will be deducted from your virtual phone balance)`);
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
     * Prompt purchase for extra lives (₦100 for 3 lives)
     */
    async purchaseExtraLives() {
      const item = CATALOG.respawn_pack_3;
      if (!isLagosLife) return { success: false, reason: 'Use rewarded ad on web' };

      if (window.Vatar && typeof window.Vatar.purchase === 'function') {
        try {
          const res = await window.Vatar.purchase({
            sku: item.sku,
            title: item.title,
            price: item.price,
            currency: 'NGN'
          });
          return { success: !!(res && (res.success || res.status === 'completed')) };
        } catch (err) {
          console.error('[LagosLifeBridge] Extra lives purchase error:', err);
          return { success: false };
        }
      } else {
        const confirmed = window.confirm(`[Lagos Life Store]\n\nBuy 3 Extra Lives for ₦${item.price}?`);
        return { success: confirmed };
      }
    },

    /**
     * Submit score at end of run
     */
    async submitScore(score, distance) {
      if (!isLagosLife) return;
      const currentCar = localStorage.getItem('lagos_player_car') || 'flying_t';
      if (window.Vatar && typeof window.Vatar.submitScore === 'function') {
        try {
          const res = await window.Vatar.submitScore({
            score: Math.floor(score),
            distance: Math.floor(distance || 0),
            car: currentCar
          });
          return res;
        } catch (err) {
          console.error('[LagosLifeBridge] Failed to submit score:', err);
        }
      }
    },

    /**
     * Fetch top leaderboard ranks
     */
    async getLeaderboard(limit = 10) {
      if (window.Vatar && typeof window.Vatar.getLeaderboard === 'function') {
        try {
          const data = await window.Vatar.getLeaderboard({ limit });
          state.leaderboardCache = data;
          return data;
        } catch (err) {
          console.error('[LagosLifeBridge] Failed to fetch leaderboard:', err);
        }
      }
      // Clean fallback data if SDK is offline or on standalone web
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
     * Initialize SDK connection
     */
    init() {
      if (state.initialized) return;
      state.initialized = true;

      if (!isLagosLife) return;

      // Ensure SDK script is present
      if (!window.Vatar && !document.getElementById('vatar-sdk-script')) {
        const s = document.createElement('script');
        s.id = 'vatar-sdk-script';
        s.src = 'https://lagoslife.app/sdk/vatar-games-v1.js';
        s.async = true;
        s.onload = () => {
          this._bindVatarEvents();
        };
        s.onerror = () => {
          console.warn('[LagosLifeBridge] Vatar SDK script could not be loaded from remote; using bridge fallbacks.');
        };
        document.head.appendChild(s);
      } else if (window.Vatar) {
        this._bindVatarEvents();
      }
    },

    _bindVatarEvents() {
      if (!window.Vatar) return;

      try {
        if (typeof window.Vatar.init === 'function') {
          window.Vatar.init({ appId: 'lagos-street-race' }).then(info => {
            if (info && info.player) state.player = info.player;
            if (info && Array.isArray(info.entitlements)) {
              info.entitlements.forEach(sku => state.entitlements.add(sku));
              saveEntitlements();
              window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated'));
            }
          }).catch(err => {
            console.warn('[LagosLifeBridge] Vatar.init promise caught:', err);
          });
        }

        // Bind pause / resume callbacks from virtual phone
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
        console.warn('[LagosLifeBridge] Exception binding Vatar events:', e);
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

