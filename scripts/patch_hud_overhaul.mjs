import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = 'this.titleBest=t.querySelector(`.title-best`);let _locPinSvg=';
const targetEnd = ',this.veil=Ug(`div`,`fade-veil`)';

const idxStart = content.indexOf(targetStart);
const idxEnd = content.indexOf(targetEnd);

if (idxStart === -1 || idxEnd === -1) {
  console.error('ERROR: Target boundaries not found in index-DZDTu90F.js');
  process.exit(1);
}

const newBlock = `this.titleBest=t.querySelector(\`.title-best\`);let _locPinSvg=\`<svg class="score-loc-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>\`,_playSvg=\`<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>\`,_restartSvg=\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"/></svg>\`,_carSvg=\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 12 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h10"/></svg>\`,_laurelSvg=\`<svg class="laurel-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16.5c-1.2-1.3-1.8-3-1.7-4.8.1-1.8.8-3.5 2.2-4.7 0 1.2.3 2.4.9 3.4.6 1 1.5 1.9 2.5 2.5-.8 1.1-1.9 2.1-3.1 2.8-.3.3-.6.5-.8.8zm14 0c-.2-.3-.5-.5-.8-.8-1.2-.7-2.3-1.7-3.1-2.8 1-.6 1.9-1.5 2.5-2.5.6-1 .9-2.2.9-3.4 1.4 1.2 2.1 2.9 2.2 4.7.1 1.8-.5 3.5-1.7 4.8zm-7-5.5l2.5-4 2 2.5L12 3l-4.5 6.5 2-2.5 2.5 4zm0 8c-3.3 0-6.1-2.2-7-5.2.6-.3 1.2-.7 1.8-1.2.6 2.2 2.7 3.9 5.2 3.9s4.6-1.7 5.2-3.9c.6.5 1.2.9 1.8 1.2-.9 3-3.7 5.2-7 5.2z"/></svg>\`;let n=this.run=Ug(\`div\`,\`run off hidden\`);n.innerHTML=\`
      <div class="hud-left">
        <div class="score-card glass">
          <div class="score-head"><span class="micro">SCORE</span><span class="mult idle">×1</span></div>
          <div class="score-value">0</div>
          <div class="score-sub">\${_locPinSvg}<span class="dist">0</span> <span class="micro">M</span></div>
          <div class="combo-bar"><i></i></div>
          <div class="air-wrap"><div class="air-label">Air</div><div class="air-track"><div class="air-fill"></div></div></div>
        </div>
        <div class="powerups"></div>
      </div>
      <div class="popups"></div>
      <div class="touch-hint glass hidden">Hold Accelerate to fire rear thrusters · hold Fly to climb · double-tap to roll</div>
      <div class="touch-controls" data-ui="1">
        <div class="touch-cluster touch-left">
          <button type="button" class="touch-btn touch-roll glass" data-action="rollLeft" aria-label="Barrel roll left">Roll L</button>
          <div class="touch-steer-row">
            <button type="button" class="touch-btn touch-lane glass" data-action="left" aria-label="Steer left">&#9664;</button>
            <button type="button" class="touch-btn touch-lane glass" data-action="right" aria-label="Steer right">&#9654;</button>
          </div>
        </div>
        <div class="touch-cluster touch-right">
          <div class="touch-aux-row">
            <button type="button" class="touch-btn touch-roll glass" data-action="rollRight" aria-label="Barrel roll right">Roll R</button>
            <button type="button" class="touch-btn touch-aux glass" data-action="dive" data-hold="1" aria-label="Hold to dive">Dive</button>
          </div>
          <div class="touch-primary-row">
            <button type="button" class="touch-btn touch-accel glass" data-action="boost" data-hold="1" aria-label="Hold to accelerate forward with rear thrusters"><span class="accel-ico" aria-hidden="true">\${Ng}</span><span>Accelerate</span></button>
            <button type="button" class="touch-btn touch-fly glass" data-action="thrust" data-hold="1" aria-label="Tap to hop or hold to fly">Fly</button>
          </div>
        </div>
      </div>\`,e.appendChild(n),this.scoreEl=n.querySelector(\`.score-value\`),this.distEl=n.querySelector(\`.score-sub .dist\`),this.multEl=n.querySelector(\`.mult\`),this.comboFill=n.querySelector(\`.combo-bar i\`),this.airWrap=n.querySelector(\`.air-wrap\`),this.airFill=n.querySelector(\`.air-fill\`),this.puWrap=n.querySelector(\`.powerups\`),this.popWrap=n.querySelector(\`.popups\`),this.touchHint=n.querySelector(\`.touch-hint\`),this.touchControls=n.querySelector(\`.touch-controls\`),this.accelBtn=n.querySelector(\`.touch-accel\`),this.flyBtn=n.querySelector(\`.touch-fly\`),this.diveBtn=n.querySelector(\`[data-action="dive"]\`),this._bindTouchControls(),this._pu={};let r=this.topRight=Ug(\`div\`,\`hud-right\`),i=this.pauseBtn=Ug(\`button\`,\`mute-btn pause-btn glass off hidden\`);i.setAttribute(\`aria-label\`,\`Pause game\`),i.innerHTML=Pg,i.addEventListener(\`pointerup\`,e=>{e.stopPropagation(),this.cb.onPause&&this.cb.onPause()});let a=this.muteBtn=Ug(\`button\`,\`mute-btn glass\`);a.setAttribute(\`aria-label\`,\`Toggle sound\`),a.innerHTML=this.cb.muted?Ig:Fg,a.addEventListener(\`pointerup\`,e=>{e.stopPropagation();let t=this.cb.onToggleMute?this.cb.onToggleMute():!1;this.setMuted(t)});let o=this.boltsCard=Ug(\`div\`,\`bolts-card glass off hidden\`,\`<div class="bolt-icon">\${Mg}</div><div class="bolts-value">0</div>\`);this.boltsEl=o.querySelector(\`.bolts-value\`),r.appendChild(i),r.appendChild(a),r.appendChild(o),e.appendChild(r);let s=this.pause=Ug(\`div\`,\`card-layer hidden\`);s.innerHTML=\`
      <div class="card glass">
        <h2>Paused</h2>
        <div class="quip">The traffic will wait. It always does.</div>
        <div class="cyber-modal-actions">
          <button class="btn btn-cyber-primary go-resume"><span class="btn-action-icon">\${_playSvg}</span><span>Resume</span></button>
          <a href="/garage.html" class="btn btn-cyber-secondary"><span class="btn-action-icon">\${_carSvg}</span><span>Quit</span></a>
        </div>
        <div class="hint">\${this._touch?\`Tap to resume\`:\`Press P to resume\`}</div>
      </div>\`,s.querySelector(\`.go-resume, .btn\`).addEventListener(\`click\`,()=>this.cb.onResume&&this.cb.onResume()),e.appendChild(s);let c=this.over=Ug(\`div\`,\`card-layer hidden\`);c.innerHTML=\`
      <div class="card glass card-gameover">
        <div class="go-overline">Run Ended</div>
        <h2 class="go-head">MOGBE!</h2>
        <div class="quip go-quip">Third Mainland Bridge gridlock don catch you!</div>
        
        <div class="go-score-wrap">
          <div class="go-score-row">
            <div class="big-score go-score">0</div>
            <div class="personal-best-badge go-new hidden">
              \${_laurelSvg}
              <div class="laurel-text">PERSONAL<br>BEST</div>
            </div>
          </div>
          <div class="go-score-label">Your Score</div>
          <div class="best-line go-best">Best 0</div>
        </div>

        <div class="stats go-stats-cyber">
          <div class="stats-col">
            <b class="go-dist">0</b>
            <span>Distance M</span>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-col">
            <b class="go-bolts">0</b>
            <span>Bolts</span>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-col">
            <b class="go-combo">0</b>
            <span>Best Combo</span>
          </div>
        </div>

        <div class="go-actions cyber-modal-actions">
          <button class="btn btn-cyber-primary go-retry"><span class="btn-action-icon">\${_restartSvg}</span><span>Race Again</span></button>
          <a href="/garage.html" class="btn btn-cyber-secondary go-hangar"><span class="btn-action-icon">\${_carSvg}</span><span>Garage</span></a>
        </div>
        
        <div class="go-shortcut-hint hint">\${this._touch?\`Tap Race Again (Oya now!)\`:\`<kbd>SPACE</kbd> • RETRY (OYA NOW!)\`}</div>
      </div>\`,c.querySelector(\`.go-retry\`).addEventListener(\`click\`,e=>{e.stopPropagation(),e.preventDefault(),c.classList.add(\`hidden\`),this.cb.onRetry&&this.cb.onRetry()}),e.appendChild(c),this.veil=Ug(\`div\`,\`fade-veil\`)`;

content = content.slice(0, idxStart) + newBlock + content.slice(idxEnd + targetEnd.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: index-DZDTu90F.js successfully patched with cyber-arcade HUD!');
