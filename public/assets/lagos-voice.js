/**
 * Lagos Street Race - Nigerian Voiceover & Pidgin Commentary Engine.
 * Provides authentic Nigerian accent voiceover, energetic Pidgin street commentary,
 * and dynamic Lagos FM radio subtitle HUD.
 */

(function () {
  const PIDGIN_LINES = {
    start: [
      "Oya now! Traffic na for people wey no get wings! Clear road for the boss!",
      "Third Mainland Bridge go hear am today! Full speed, no shaking!",
      "Lagos never sleeps! Step on the gas, make we fly enter Lekki!",
      "Clear road, clear road! Flying motor dey come through!"
    ],
    closeCall: [
      "Ewooo! That Danfo almost clear your side mirror!",
      "Commot for road, Danfo driver! You dey craze?!",
      "Too close, my guy! Blood of Zachariah!",
      "See sharp steering! Steeze on a hundred!",
      "Chai! That Molue driver almost jam you!"
    ],
    roll: [
      "Gbe body e! Do barrel roll sharp sharp!",
      "Chai! You dey spin like ceiling fan!",
      "Odikwa high level! Oya roll am again!",
      "See aerobatics! Burna Boy would be proud!"
    ],
    rocket: [
      "Oya zoom zoom! Full speed enter Lekki! No shaking!",
      "We dey fly pass Oshodi! Full gas, no brakes!",
      "SpaceX booster activated! Eko to the world!"
    ],
    crash: [
      "Na wa o, where I go see money give mechanic for repair?!",
      "Chai! Na wa o, where I go see money give mechanic for repair now?!",
      "Na wa o, where I go see money give mechanic for repair!"
    ],
    airLow: [
      "Chai, air tank don low o! Land make you recharge!",
      "Fuel don dey finish! Touch ground sharp sharp!"
    ],
    combo: [
      "Mad combo! You dey hot, Burna Boy level!",
      "Steeze on a hundred! Odikwa sharp!",
      "Chop life combo! Oya keep moving!"
    ],
    milestone: [
      "One kilometer cleared! Eko oni baje o!",
      "Lagos express, you dey run am well!",
      "Smooth cruising! Give yourself a chilled palmwine!"
    ],
    sky: [
      "Look up! Other flying motors dey come from Ikeja!",
      "Sky traffic heavy today o! Watch your airspace!"
    ]
  };

  let lastSpokenTime = 0;
  let bannerTimeout = null;

  // Create Subtitle HUD element
  function getOrCreateBanner() {
    let banner = document.getElementById('lagos-commentary-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'lagos-commentary-banner';
      banner.style.cssText = `
        position: fixed;
        top: calc(16px + env(safe-area-inset-top, 0px));
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        opacity: 0;
        z-index: 100;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 18px;
        border-radius: 9999px;
        background: rgba(4, 18, 10, 0.88);
        border: 1px solid rgba(34, 197, 94, 0.55);
        box-shadow: 0 4px 24px rgba(34, 197, 94, 0.25), 0 0 12px rgba(0, 0, 0, 0.6);
        color: #fff;
        font-family: "Inter", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        white-space: nowrap;
        max-width: 92vw;
        transition: transform 0.25s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.25s ease-out;
      `;
      document.body.appendChild(banner);
    }
    return banner;
  }

  function showCommentaryBanner(text) {
    const banner = getOrCreateBanner();
    banner.innerHTML = `
      <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#16a34a;color:#fff;font-size:11px;flex-shrink:0;">🎙️</span>
      <span style="color:#86efac;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">LAGOS FM:</span>
      <span style="color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.8);">${text}</span>
    `;
    banner.style.opacity = '1';
    banner.style.transform = 'translateX(-50%) translateY(0)';

    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(-14px)';
    }, 3800);
  }

  // Voice synthesis disabled — real MP3 Nigerian voice lines are played by the
  // compiled game engine. The banner subtitle still shows for visual commentary.
  // function speakPidgin(text) { ... } — removed to prevent double audio.

  // Global commentator hook called by the game engine
  window.__playNigerianCommentary = function (eventKey, options = {}) {
    const now = Date.now();
    const isForced = options.force === true || options.force === 'always';
    
    // Throttle non-forced lines so banners don't overlap constantly
    if (!isForced && now - lastSpokenTime < 4500) {
      return;
    }

    const lines = PIDGIN_LINES[eventKey];
    if (!lines || lines.length === 0) return;

    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    lastSpokenTime = now;

    // Show vibrant Lagos FM Subtitle HUD banner only (no TTS)
    showCommentaryBanner(randomLine);
  };

  // Pre-load voices on user interaction
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  console.log('[Lagos Street Race] Nigerian Pidgin Voiceover Engine initialized!');
})();
