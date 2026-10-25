import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `<button class="btn go-retry">Retry</button>`;
const replacement = `<div class="go-actions" style="display:flex;gap:12px;width:100%;justify-content:center;align-items:center;margin-top:10px;"><button class="btn go-retry" style="flex:1;margin:0;">Retry</button><a href="/hangar.html" class="btn go-hangar" style="flex:1;margin:0;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:linear-gradient(135deg,rgba(0,229,255,0.2) 0%,rgba(0,229,255,0.06) 100%);border:1px solid #00e5ff;color:#00e5ff;box-shadow:0 0 16px rgba(0,229,255,0.35);">🛸 Hangar</a></div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Game Over dialog patched with Retry on left and Hangar on right!');
} else {
  console.log('Target already replaced or not found');
}
