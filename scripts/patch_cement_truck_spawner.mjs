import fs from 'fs';

const bundlePath = 'public/assets/index-DZDTu90F.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');
let changed = 0;

function patch(oldStr, newStr, label) {
  const count = bundle.split(oldStr).length - 1;
  if (count === 0) { console.error(`✗ NOT FOUND: ${label}`); return; }
  if (count > 1)   { console.warn(`⚠ ${count} matches: ${label}`); }
  bundle = bundle.replace(oldStr, newStr);
  changed++;
  console.log(`✓ ${label}`);
}

// 1. Main live traffic spawner: replace boxtruck-only slot with a 50/50 boxtruck/cement_truck pick
// Before: else if(o<s+l+d){let e=this._placeVehicle(`boxtruck`,i,f);t.chance(.25)&&this._roofLine(e)}
// After:  else if(o<s+l+d){let _ct=t.chance(.5)?`boxtruck`:`cement_truck`;let e=this._placeVehicle(_ct,i,f);t.chance(.25)&&this._roofLine(e)}
patch(
  "else if(o<s+l+d){let e=this._placeVehicle(`boxtruck`,i,f);t.chance(.25)&&this._roofLine(e)}",
  "else if(o<s+l+d){let _ct=t.chance(.5)?`boxtruck`:`cement_truck`;let e=this._placeVehicle(_ct,i,f);t.chance(.25)&&this._roofLine(e)}",
  'Main live spawner: add 50/50 boxtruck/cement_truck split'
);

// 2. _spawnConvoy: sometimes spawn cement_truck instead of the secondary boxtruck
// Before: r.chance(.8)?`boxtruck`:`bus`
// After:  r.chance(.8)?(r.chance(.5)?`boxtruck`:`cement_truck`):`bus`
patch(
  "let n=t===0?r.chance(.45)?`carrier`:`boxtruck`:r.chance(.8)?`boxtruck`:`bus`",
  "let n=t===0?r.chance(.45)?`carrier`:`boxtruck`:r.chance(.8)?(r.chance(.5)?`boxtruck`:`cement_truck`):`bus`",
  '_spawnConvoy: add cement_truck as convoy secondary variant'
);

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log(`\nDone. Applied ${changed} patches. Cement truck now spawns in live traffic!`);
