/**
 * lagoslife-bridge.js — Lagos Life Platform & Vatar Games SDK Bridge
 * ─────────────────────────────────────────────────────────────────────────
 * Dual-Environment Coordinator:
 *  - Mode 1: Lagos Life Virtual Smartphone (lagoslife.app & Sandbox)
 *            • Vatar Games SDK (vatar-games-v1.js) active
 *            • Microtransactions (VIP Cars ₦300, Extra Lives ₦100)
 *            • Server-side purchase verification & delivery
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
  // CRITICAL: Any iframe embedding, or Lagos Life domain, or param = LAGOS LIFE platform!
  // NOTE: window.Vatar is included via script tag globally, so hasVatarGlobal alone must NOT force Lagos Life mode on standalone web.
  const urlParams = new URLSearchParams(window.location.search);
  const isIframe = window.self !== window.top;
  const isLagosDomain = document.referrer.includes('lagoslife') ||
                        document.referrer.includes('naijalife') ||
                        document.referrer.includes('eliysites') ||
                        window.location.hostname.includes('lagoslife');
  const hasParam = urlParams.has('vatar') ||
                   urlParams.get('platform') === 'lagoslife' ||
                   urlParams.has('sandbox') ||
                   urlParams.has('session');

  // Any iframe embedding represents Lagos Life virtual smartphone or its developer sandbox
  const isLagosLife = isIframe || isLagosDomain || hasParam;

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
      const data = JSON.stringify(Array.from(state.entitlements));
      if (state.player && state.player.id) {
        localStorage.setItem('lsr_ll_entitlements_' + state.player.id, data);
      } else if (!isLagosLife) {
        localStorage.setItem('lsr_ll_entitlements', data);
      }
    } catch (_) {}
  }

  function saveLives(n) {
    state.lives = Math.max(0, n);
    try {
      if (state.player && state.player.id) {
        localStorage.setItem('lsr_ll_lives_' + state.player.id, String(state.lives));
      } else if (!isLagosLife) {
        localStorage.setItem('lsr_ll_lives', String(state.lives));
      }
    } catch (_) {}
  }

  /**
   * Notify our Cloudflare Worker to verify purchase with Lagos Life server
   * and mark it as delivered via POST /purchases/{id}/deliver.
   * This completes the two sandbox checklist items:
   * 1. A purchase verified by your server
   * 2. One marked delivered
   */
  async function claimPurchaseWithServer(purchaseId, productId) {
    if (!purchaseId) return;
    try {
      console.log(`[LagosLifeBridge] Sending claim to server for purchaseId: "${purchaseId}", product: "${productId}"`);
      
      let session = null;
      if (window.Vatar && typeof window.Vatar.session === 'function') {
        try {
          const s = await window.Vatar.session();
          session = s?.session || s;
        } catch (_) {}
      }

      const res = await fetch('/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          purchaseId,
          productId,
          playerId: state.player?.id
        })
      });
      const data = await res.json();
      console.log('[LagosLifeBridge] Server claim response:', data);
      return data;
    } catch (err) {
      console.warn('[LagosLifeBridge] Server claim error:', err);
    }
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
          const purchaseId = res?.purchaseId || res?.id;
          if (res && (res.productId === sku || purchaseId || res.success)) {
            state.entitlements.add(sku);
            saveEntitlements();

            // Server-to-server verification & mark delivered
            if (purchaseId) {
              await claimPurchaseWithServer(purchaseId, sku);
            }

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
          const purchaseId = res?.purchaseId || res?.id;
          if (res && (res.productId === sku || purchaseId || res.success)) {
            saveLives(state.lives + 3);

            // Server-to-server verification & mark delivered
            if (purchaseId) {
              await claimPurchaseWithServer(purchaseId, sku);
            }

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
     * Fetch top leaderboard ranks from Lagos Life Vatar API
     */
    async getLeaderboard(limit = 10) {
      if (window.Vatar) {
        const fetchFn = typeof window.Vatar.leaderboard === 'function'
          ? window.Vatar.leaderboard
          : (typeof window.Vatar.getLeaderboard === 'function' ? window.Vatar.getLeaderboard : null);

        if (fetchFn) {
          try {
            const raw = await fetchFn.call(window.Vatar, { limit });
            console.log('[LagosLifeBridge] Live Vatar leaderboard response:', raw);

            let topList = [];
            let meData = null;

            if (raw && Array.isArray(raw.top)) {
              topList = raw.top;
              meData = raw.me;
            } else if (raw && Array.isArray(raw.entries)) {
              topList = raw.entries;
              meData = raw.me || (raw.playerRank ? { rank: raw.playerRank } : null);
            } else if (Array.isArray(raw)) {
              topList = raw;
            }

            const entries = topList.map((item, idx) => ({
              rank: item.rank !== undefined ? item.rank : (idx + 1),
              name: item.name || item.player?.name || item.username || 'Lagos Pilot',
              score: typeof item.score === 'number' ? item.score : parseInt(item.score || '0', 10),
              car: item.car || 'Flying T'
            }));

            return {
              entries,
              playerRank: meData?.rank || null,
              playerScore: meData?.score || null,
              playerLabel: meData?.label || null,
              isLive: true
            };
          } catch (err) {
            console.warn('[LagosLifeBridge] Vatar.leaderboard error:', err);
          }
        }
      }

      // If outside Lagos Life or offline, show local high score if recorded
      const localBest = parseInt(localStorage.getItem('lagos_high_score') || '0', 10);
      return {
        entries: localBest > 0 ? [
          { rank: 1, name: state.player?.name || 'Local Driver', score: localBest, car: 'Flying T' }
        ] : [],
        playerRank: localBest > 0 ? 1 : null,
        isLive: false
      };
    },

    /**
     * Show Lagos Life Respawn Modal on Crash / Game Over
     * Styled identically to the Cyber Stage Select Dialog in the Garage (Zero Emojis, Pure AAA Cyberpunk UI)
     */
    showRespawnSheet(score, distance) {
      if (!isLagosLife) return false;
      if (state.hasRespawnedThisRun) return false; // Max 1 respawn per run

      const existing = document.getElementById('ll-respawn-modal');
      if (existing) existing.remove();

      // Ensure dialog styles are injected
      if (!document.getElementById('ll-respawn-cyber-css')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'll-respawn-cyber-css';
        styleEl.textContent = `
          #ll-respawn-modal {
            position: fixed; inset: 0; z-index: 9999999;
            display: flex; align-items: center; justify-content: center;
            background: radial-gradient(circle at 50% 45%, rgba(10, 16, 26, 0.88) 0%, rgba(3, 6, 12, 0.96) 100%);
            backdrop-filter: blur(20px) saturate(190%);
            -webkit-backdrop-filter: blur(20px) saturate(190%);
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #fff; padding: 16px; user-select: none;
            animation: llModalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes llModalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          #ll-respawn-modal .cyber-stage-dialog {
            position: relative; width: 100%; max-width: 440px;
            background: linear-gradient(175deg, rgba(12, 18, 30, 0.98) 0%, rgba(5, 8, 16, 0.96) 100%);
            backdrop-filter: blur(28px) saturate(200%);
            -webkit-backdrop-filter: blur(28px) saturate(200%);
            border: 1.5px solid rgba(0, 229, 255, 0.35);
            border-radius: 20px;
            padding: 24px 26px 20px;
            box-shadow: 
              0 30px 80px rgba(0, 0, 0, 0.95),
              0 0 45px rgba(0, 229, 255, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -2px 10px rgba(0, 0, 0, 0.6);
            box-sizing: border-box;
            animation: llDialogPop 0.26s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes llDialogPop {
            from { transform: scale(0.93) translateY(14px); }
            to { transform: scale(1) translateY(0); }
          }
          #ll-respawn-modal .stage-frame-reticle {
            position: absolute; width: 14px; height: 14px;
            border: 2px solid rgba(0, 229, 255, 0.55);
            pointer-events: none;
          }
          #ll-respawn-modal .stage-frame-reticle.top-left { top: 8px; left: 8px; border-right: none; border-bottom: none; }
          #ll-respawn-modal .stage-frame-reticle.top-right { top: 8px; right: 8px; border-left: none; border-bottom: none; }
          #ll-respawn-modal .stage-frame-reticle.bottom-left { bottom: 8px; left: 8px; border-right: none; border-top: none; }
          #ll-respawn-modal .stage-frame-reticle.bottom-right { bottom: 8px; right: 8px; border-left: none; border-top: none; }
          #ll-respawn-modal .top-chamfer-notch {
            position: absolute; top: -2px; right: 48px; width: 50px; height: 3px;
            background: #00e5ff; box-shadow: 0 0 12px #00e5ff; border-radius: 2px;
          }
          #ll-respawn-modal .stage-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 16px; padding-bottom: 12px;
            border-bottom: 1px solid rgba(0, 229, 255, 0.15);
          }
          #ll-respawn-modal .stage-breadcrumb {
            display: flex; align-items: center; gap: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
            color: #00e5ff; text-transform: uppercase;
          }
          #ll-respawn-modal .hud-blink-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #00e5ff; box-shadow: 0 0 8px #00e5ff;
            animation: llDotPulse 1.8s infinite;
          }
          @keyframes llDotPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
          }
          #ll-respawn-modal .stage-title {
            margin: 4px 0 0; font-size: 22px; font-weight: 800;
            letter-spacing: 0.05em; text-transform: uppercase; color: #fff;
            text-shadow: 0 0 16px rgba(0, 229, 255, 0.45);
          }
          #ll-respawn-modal .stage-subtitle {
            margin: 3px 0 0; font-family: 'JetBrains Mono', monospace;
            font-size: 11px; color: rgba(0, 229, 255, 0.75); letter-spacing: 0.04em;
          }
          #ll-respawn-modal .stage-close-btn {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px; color: rgba(255, 255, 255, 0.7);
            cursor: pointer; padding: 6px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease;
          }
          #ll-respawn-modal .stage-close-btn:hover {
            background: rgba(255, 45, 85, 0.2);
            border-color: rgba(255, 45, 85, 0.5);
            color: #ff2d55;
          }
          #ll-respawn-modal .telemetry-card {
            background: rgba(0, 229, 255, 0.04);
            border: 1px solid rgba(0, 229, 255, 0.18);
            border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;
            display: flex; align-items: center; gap: 14px;
          }
          #ll-respawn-modal .telemetry-icon-box {
            width: 44px; height: 44px; border-radius: 10px;
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.35);
            display: flex; align-items: center; justify-content: center;
            color: #00e5ff; flex-shrink: 0;
            box-shadow: 0 0 14px rgba(0, 229, 255, 0.25);
          }
          #ll-respawn-modal .telemetry-rows {
            flex: 1; display: flex; flex-direction: column; gap: 4px;
          }
          #ll-respawn-modal .telemetry-row {
            display: flex; justify-content: space-between; align-items: center;
            font-family: 'JetBrains Mono', monospace; font-size: 11px;
          }
          #ll-respawn-modal .telemetry-label {
            color: #7e8c9f; letter-spacing: 0.06em;
          }
          #ll-respawn-modal .telemetry-value {
            color: #ffffff; font-weight: 700;
          }
          #ll-respawn-modal .respawn-action-btn {
            width: 100%; padding: 14px 18px; border-radius: 12px;
            border: none; cursor: pointer;
            font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 800;
            letter-spacing: 0.12em; text-transform: uppercase;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          #ll-respawn-modal .respawn-action-btn:active {
            transform: scale(0.98);
          }
          #ll-respawn-modal .respawn-btn-cyan {
            background: linear-gradient(135deg, #00e5ff 0%, #0099cc 100%);
            color: #040914; box-shadow: 0 0 24px rgba(0, 229, 255, 0.45);
          }
          #ll-respawn-modal .respawn-btn-cyan:hover {
            box-shadow: 0 0 32px rgba(0, 229, 255, 0.7); filter: brightness(1.08);
          }
          #ll-respawn-modal .respawn-btn-gold {
            background: linear-gradient(135deg, #f5c518 0%, #d49e00 100%);
            color: #050810; box-shadow: 0 0 24px rgba(245, 197, 24, 0.45);
          }
          #ll-respawn-modal .respawn-btn-gold:hover {
            box-shadow: 0 0 32px rgba(245, 197, 24, 0.7); filter: brightness(1.08);
          }
          #ll-respawn-modal .respawn-btn-ghost {
            width: 100%; background: transparent; border: none;
            color: rgba(255, 255, 255, 0.45);
            font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
            letter-spacing: 0.1em; text-transform: uppercase;
            cursor: pointer; padding: 10px 0 4px; margin-top: 10px;
            transition: color 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
          }
          #ll-respawn-modal .respawn-btn-ghost:hover {
            color: #ffffff;
          }
        `;
        document.head.appendChild(styleEl);
      }

      const modal = document.createElement('div');
      modal.id = 'll-respawn-modal';

      const lives = state.lives;

      modal.innerHTML = `
        <div class="cyber-stage-dialog" role="dialog" aria-modal="true" aria-labelledby="ll-respawn-title">
          <!-- Cyber Reticles -->
          <div class="stage-frame-reticle top-left"></div>
          <div class="stage-frame-reticle top-right"></div>
          <div class="stage-frame-reticle bottom-left"></div>
          <div class="stage-frame-reticle bottom-right"></div>
          <div class="top-chamfer-notch"></div>

          <!-- Top Tactical Header -->
          <div class="stage-header">
            <div class="stage-header-left">
              <div class="stage-breadcrumb">
                <span class="hud-blink-dot"></span>
                <span>EMERGENCY PROTOCOL // SYS-REVIVAL</span>
              </div>
              <h2 class="stage-title" id="ll-respawn-title">SECOND CHANCE</h2>
              <div class="stage-subtitle">THIRD MAINLAND BRIDGE &bull; TELEMETRY LINK ACTIVE</div>
            </div>

            <button class="stage-close-btn" id="ll-close-x-btn" title="Decline (ESC)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Telemetry Data Box (Zero Emojis, Pure SVG HUD) -->
          <div class="telemetry-card">
            <div class="telemetry-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v8"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
            <div class="telemetry-rows">
              <div class="telemetry-row">
                <span class="telemetry-label">RECORDED RUN</span>
                <span class="telemetry-value" style="color:#00e5ff">${Math.floor(score).toLocaleString()} M</span>
              </div>
              <div class="telemetry-row">
                <span class="telemetry-label">EXTRA LIVES IN BANK</span>
                <span class="telemetry-value" style="color:${lives > 0 ? '#22c55e' : '#f5c518'}">${lives} READY</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons Area -->
          <div id="ll-respawn-action-area">
            ${lives > 0 ? `
              <button id="ll-use-life-btn" class="respawn-action-btn respawn-btn-cyan">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>DEPLOY RESPAWN (${lives} REMAINING)</span>
              </button>
            ` : `
              <button id="ll-buy-pack-btn" class="respawn-action-btn respawn-btn-gold">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>UNLOCK 3 RESPAWNS (&#8358;100)</span>
              </button>
            `}
          </div>

          <button id="ll-decline-btn" class="respawn-btn-ghost">
            <span>ABORT MISSION // SUBMIT RUN SCORE</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      function doRevive() {
        state.hasRespawnedThisRun = true;
        modal.remove();
        // Fire engine respawn event to resume active run
        window.dispatchEvent(new CustomEvent('ad:reward', {
          detail: { type: 'extraLife' }
        }));
      }

      function doFinish() {
        modal.remove();
        LagosLifeBridge.submitScore(score, distance);
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
          buyBtn.innerHTML = `
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>CONNECTING TO VATAR PAY...</span>
          `;
          buyBtn.style.opacity = '0.75';
          buyBtn.style.pointerEvents = 'none';

          const res = await LagosLifeBridge.purchaseExtraLives();
          if (res && res.success) {
            saveLives(state.lives - 1); // 1 used instantly to revive, 2 in bank
            doRevive();
          } else {
            buyBtn.innerHTML = `
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>UNLOCK 3 RESPAWNS (&#8358;100)</span>
            `;
            buyBtn.style.opacity = '1';
            buyBtn.style.pointerEvents = 'auto';
          }
        });
      }

      // Bind Decline / Close
      const declineBtn = modal.querySelector('#ll-decline-btn');
      if (declineBtn) declineBtn.addEventListener('click', doFinish);

      const closeXBtn = modal.querySelector('#ll-close-x-btn');
      if (closeXBtn) closeXBtn.addEventListener('click', doFinish);

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
            if (info && info.player) {
              state.player = info.player;
              // Clear in-memory entitlements so multiple accounts on the same phone never cross-contaminate
              state.entitlements.clear();
              state.lives = 0;
              // Restore entitlements strictly scoped to this specific player ID
              if (info.player.id) {
                try {
                  const playerCached = localStorage.getItem('lsr_ll_entitlements_' + info.player.id);
                  if (playerCached) {
                    const arr = JSON.parse(playerCached);
                    arr.forEach(item => state.entitlements.add(item));
                  }
                  const playerLives = parseInt(localStorage.getItem('lsr_ll_lives_' + info.player.id) || '0', 10);
                  if (!isNaN(playerLives) && playerLives > 0) {
                    state.lives = playerLives;
                  }
                } catch (_) {}
              }
              window.dispatchEvent(new CustomEvent('lsr:entitlementsUpdated'));
            }
            if (info && info.mode) state.mode = info.mode;
            console.log('[LagosLifeBridge] Vatar SDK initialized. Player:', info?.player?.name, 'Mode:', info?.mode);

            // Fetch past / pending purchases to restore consistency
            if (typeof window.Vatar.purchases === 'function') {
              window.Vatar.purchases().then(purchases => {
                if (Array.isArray(purchases)) {
                  purchases.forEach(async p => {
                    const purchaseId = p.purchaseId || p.id;
                    const sku = typeof p === 'string' ? p : (p.productId || p.sku);
                    if (sku) {
                      if (sku === 'respawn_pack_3') {
                        saveLives(state.lives + 3);
                      } else {
                        state.entitlements.add(sku);
                        saveEntitlements();
                      }
                    }
                    // Auto-claim undelivered items with server
                    if (purchaseId) {
                      await claimPurchaseWithServer(purchaseId, sku);
                    }
                  });
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
          window.Vatar.onPurchase(async p => {
            const purchaseId = p?.purchaseId || p?.id;
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
            // Auto-claim with server to verify & mark delivered
            if (purchaseId) {
              await claimPurchaseWithServer(purchaseId, sku);
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
