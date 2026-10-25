/**
 * ═══════════════════════════════════════════════════════════════════════
 * LAGOS STREET RACE — PREMIUM CYBER-ARCADE RACING CONTROLS DECORATOR
 * ═══════════════════════════════════════════════════════════════════════
 * Upgrades raw prototype text buttons into glassmorphic circular discs
 * and authentic perforated racing pedals with responsive active feedback.
 */

(function () {
  'use strict';

  const ICONS = {
    left: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="15 19 8 12 15 5" fill="currentColor"></polygon>
      </svg>
      <span class="ctrl-key">A</span>
    `,
    right: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="9 19 16 12 9 5" fill="currentColor"></polygon>
      </svg>
      <span class="ctrl-key">D</span>
    `,
    rollLeft: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
        <path d="M3 3v5h5"></path>
      </svg>
      <span class="ctrl-label">ROLL</span>
      <span class="ctrl-key">Q</span>
    `,
    rollRight: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8"></path>
        <path d="M21 3v5h-5"></path>
      </svg>
      <span class="ctrl-label">ROLL</span>
      <span class="ctrl-key">E</span>
    `,
    dive: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="7 13 12 18 17 13"></polyline>
        <polyline points="7 6 12 11 17 6"></polyline>
      </svg>
      <span class="ctrl-label">DIVE</span>
      <span class="ctrl-key">S / ↓</span>
    `,
    thrust: `
      <svg class="ctrl-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v8"></path>
        <path d="M5 10l7-8 7 8"></path>
        <path d="M6 18c0-3 3-5 6-5s6 2 6 5"></path>
        <path d="M8 22l4-3 4 3"></path>
      </svg>
      <span class="ctrl-label">FLY</span>
      <span class="ctrl-key">SPACE</span>
    `,
    boost: `
      <div class="pedal-perforations">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="pedal-core">
        <svg class="pedal-flame-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        <span class="pedal-text">BOOST</span>
      </div>
      <span class="ctrl-key">W / ↑</span>
    `
  };

  let decorated = false;

  function decorateControls() {
    const controls = document.querySelector('.touch-controls');
    if (!controls) return false;

    // Decorate each button based on data-action
    for (const [action, markup] of Object.entries(ICONS)) {
      const btn = controls.querySelector(`[data-action="${action}"]`);
      if (btn && !btn.dataset.decorated) {
        btn.innerHTML = markup;
        btn.dataset.decorated = '1';
      }
    }

    decorated = true;
    return true;
  }

  // Keyboard visual feedback synchronizer
  const KEY_MAP = {
    'KeyA': 'left',
    'ArrowLeft': 'left',
    'KeyD': 'right',
    'ArrowRight': 'right',
    'KeyQ': 'rollLeft',
    'KeyE': 'rollRight',
    'KeyW': 'boost',
    'ArrowUp': 'boost',
    'ShiftLeft': 'boost',
    'ShiftRight': 'boost',
    'Space': 'thrust',
    'KeyS': 'dive',
    'ArrowDown': 'dive'
  };

  window.addEventListener('keydown', (e) => {
    const action = KEY_MAP[e.code];
    if (action) {
      const btn = document.querySelector(`.touch-controls [data-action="${action}"]`);
      if (btn) btn.classList.add('key-active');
    }
  });

  window.addEventListener('keyup', (e) => {
    const action = KEY_MAP[e.code];
    if (action) {
      const btn = document.querySelector(`.touch-controls [data-action="${action}"]`);
      if (btn) btn.classList.remove('key-active');
    }
  });

  // Observe DOM for HUD insertion
  const observer = new MutationObserver(() => {
    if (decorateControls()) {
      // Keep observing lightly in case HUD rebuilds on restart
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial attempt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateControls);
  } else {
    decorateControls();
  }
})();
