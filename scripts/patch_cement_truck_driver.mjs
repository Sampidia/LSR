import fs from 'fs';

const bundlePath = 'public/assets/index-DZDTu90F.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// 1. Add cement_truck to ah array
if (bundle.includes('ah=[...rh,`boxtruck`,`bus`,`carrier`]')) {
  bundle = bundle.replace(
    'ah=[...rh,`boxtruck`,`bus`,`carrier`]',
    'ah=[...rh,`boxtruck`,`cement_truck`,`bus`,`carrier`]'
  );
  console.log('✓ Added cement_truck to ah array');
}

// 2. Add cement_truck dimensions to oh
if (bundle.includes('boxtruck:{w:2.5,h:3.4,l:8.5},bus:{w:2.6,h:3.3,l:12}')) {
  bundle = bundle.replace(
    'boxtruck:{w:2.5,h:3.4,l:8.5},bus:{w:2.6,h:3.3,l:12}',
    'boxtruck:{w:2.5,h:3.4,l:8.5},cement_truck:{w:2.5,h:3.4,l:8.0},bus:{w:2.6,h:3.3,l:12}'
  );
  console.log('✓ Added cement_truck to oh specs');
}

// 3. Add cement_truck pool size to sh
if (bundle.includes('boxtruck:9,bus:4')) {
  bundle = bundle.replace(
    'boxtruck:9,bus:4',
    'boxtruck:9,cement_truck:8,bus:4'
  );
  console.log('✓ Added cement_truck to sh pool counts');
}

// 4. Add cement_truck instanced batch capacity to Hh
if (bundle.includes('boxtruck:48,bus:24')) {
  bundle = bundle.replace(
    'boxtruck:48,bus:24',
    'boxtruck:48,cement_truck:36,bus:24'
  );
  console.log('✓ Added cement_truck to Hh capacity');
}

// 5. Add cement_truck to Kh array (heavy truck collision checks)
if (bundle.includes('Kh=[`boxtruck`,`bus`,`carrier`]')) {
  bundle = bundle.replace(
    'Kh=[`boxtruck`,`bus`,`carrier`]',
    'Kh=[`boxtruck`,`cement_truck`,`bus`,`carrier`]'
  );
  console.log('✓ Added cement_truck to Kh heavy truck list');
}

// 6. Add cement_truck to heavy traffic spawner
if (bundle.includes('t<i*.6?`boxtruck`:t<i*.8?`bus`')) {
  bundle = bundle.replace(
    't<i*.6?`boxtruck`:t<i*.8?`bus`',
    't<i*.3?`boxtruck`:t<i*.6?`cement_truck`:t<i*.8?`bus`'
  );
  console.log('✓ Added cement_truck to heavy traffic probability generator');
}

// 7. Update createVehicle and attachOccupants to cleanly support cement_truck and ensure NO driver is attached
const oldCVBlock = `if(type==='boxtruck'){
    let pool=[realModels.truck,realModels.cement_truck].filter(Boolean);
    if(pool.length){
      let chosen=pool[Math.floor(Math.random()*pool.length)];
      pick=chosen.clone(!0);
      pick.userData.type='boxtruck';
      pick.userData.model=chosen.name;
    }
  }`;

const newCVBlock = `if(type==='boxtruck'){
    if(realModels.truck){
      pick=realModels.truck.clone(!0);
      pick.userData.type='boxtruck';
    }else if(realModels.cement_truck){
      pick=realModels.cement_truck.clone(!0);
      pick.userData.type='cement_truck';
    }
  }else if(type==='cement_truck'){
    if(realModels.cement_truck){
      pick=realModels.cement_truck.clone(!0);
      pick.userData.type='cement_truck';
    }
  }`;

if (bundle.includes(oldCVBlock)) {
  bundle = bundle.replace(oldCVBlock, newCVBlock);
  console.log('✓ Updated createVehicle for boxtruck and cement_truck');
}

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('SUCCESS: Cement truck registered as distinct traffic vehicle without driver!');
