import fs from 'fs';

const bundlePath = 'public/assets/index-DZDTu90F.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');
let changed = 0;

function patch(oldStr, newStr, label) {
  const count = bundle.split(oldStr).length - 1;
  if (count === 0) {
    console.error(`✗ NOT FOUND: ${label}`);
    return;
  }
  if (count > 1) {
    console.warn(`⚠ Multiple matches (${count}) for: ${label}`);
  }
  bundle = bundle.replace(oldStr, newStr);
  changed++;
  console.log(`✓ ${label}`);
}

// 1. Add cement_truck to the FALLBACK local `o` spec object inside x_()
//    This is the CRITICAL fix - without this, the instanced batch gets sedan geometry
patch(
  'o={sedan:[1.9,1.45,4.6],hatch:[1.8,1.5,4],suv:[2,1.85,4.8],taxi:[1.9,1.5,4.6],van:[2,2.3,5.2],pickup:[2,1.9,5.4],boxtruck:[2.4,3.4,8],bus:[2.5,3.2,12],carrier:[2.5,3.6,16]}',
  'o={sedan:[1.9,1.45,4.6],hatch:[1.8,1.5,4],suv:[2,1.85,4.8],taxi:[1.9,1.5,4.6],van:[2,2.3,5.2],pickup:[2,1.9,5.4],boxtruck:[2.4,3.4,8],cement_truck:[2.5,3.4,8],bus:[2.5,3.2,12],carrier:[2.5,3.6,16]}',
  'Add cement_truck to fallback spec object o in x_()'
);

// 2. Add cement_truck to the tall-truck shape check in _fallbackVehicle
//    Without this, the fallback draws a small sedan-shaped box instead of a tall truck cab
patch(
  'e===`boxtruck`||e===`bus`||e===`carrier`',
  'e===`boxtruck`||e===`cement_truck`||e===`bus`||e===`carrier`',
  'Add cement_truck to tall-truck shape check in _fallbackVehicle'
);

// 3. Add cement_truck to the collision box shape check (e===`boxtruck`||e===`bus`||e===`van`)
//    used when building physics bounds around the vehicle
const collisionCheck = 'e===`boxtruck`||e===`bus`||e===`van`';
const collisionPatch = 'e===`boxtruck`||e===`cement_truck`||e===`bus`||e===`van`';
if (bundle.split(collisionCheck).length - 1 === 1) {
  bundle = bundle.replace(collisionCheck, collisionPatch);
  changed++;
  console.log('✓ Add cement_truck to collision box shape check');
} else {
  console.warn(`⚠ collision check count: ${bundle.split(collisionCheck).length - 1}`);
}

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log(`\nDone. Applied ${changed} patches to ${bundlePath}`);
