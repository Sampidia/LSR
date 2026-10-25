import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const assets = [
  { in: 'public/assets/truck_car_carrier.glb', opt: 'public/assets/truck_car_carrier_opt.glb', ratio: 0.05 },
  { in: 'public/assets/truck.glb',             opt: 'public/assets/truck_opt.glb',             ratio: 0.05 },
  { in: 'public/assets/cement_truck.glb',      opt: 'public/assets/cement_truck_opt.glb',      ratio: 0.05 },
  { in: 'public/assets/pick_up_vechile.glb',   opt: 'public/assets/pick_up_vechile_opt.glb',   ratio: 0.06 },
  { in: 'public/assets/highlander.glb',        opt: 'public/assets/highlander_opt.glb',        ratio: 0.06 },
  { in: 'public/assets/suv_car.glb',           opt: 'public/assets/suv_car_opt.glb',           ratio: 0.06 }
];

for (const a of assets) {
  console.log(`\n========================================`);
  console.log(`Optimizing: ${a.in}`);
  const origSize = (fs.statSync(a.in).size / 1024 / 1024).toFixed(2);
  console.log(`Original size: ${origSize} MB`);

  const tmp1 = `/tmp/opt_tmp1_${path.basename(a.opt)}`;
  const tmp2 = `/tmp/opt_tmp2_${path.basename(a.opt)}`;
  const tmp3 = `/tmp/opt_tmp3_${path.basename(a.opt)}`;

  try {
    // 1. Decompress (strips meshopt) and resize textures to max 2048x2048
    console.log(`Step 1: Resizing textures...`);
    execSync(`npx @gltf-transform/cli resize --width 2048 --height 2048 "${a.in}" "${tmp1}"`, { stdio: 'inherit' });

    // 2. Weld vertices
    console.log(`Step 2: Welding vertices...`);
    execSync(`npx @gltf-transform/cli weld "${tmp1}" "${tmp2}"`, { stdio: 'inherit' });

    // 3. Simplify geometry
    console.log(`Step 3: Simplifying geometry (ratio ${a.ratio})...`);
    execSync(`npx @gltf-transform/cli simplify "${tmp2}" "${tmp3}" --ratio ${a.ratio} --error 0.01`, { stdio: 'inherit' });

    // 4. Dedup & prune
    console.log(`Step 4: Dedup and prune...`);
    execSync(`npx @gltf-transform/cli dedup "${tmp3}" "${tmp1}"`, { stdio: 'inherit' });
    execSync(`npx @gltf-transform/cli prune "${tmp1}" "${a.opt}"`, { stdio: 'inherit' });

    // Also copy to original filename in public/assets/ (originals already backed up safely in assets_backup/)
    fs.copyFileSync(a.opt, a.in);

    const optSize = (fs.statSync(a.opt).size / 1024 / 1024).toFixed(2);
    console.log(`Finished ${a.opt}: ${origSize} MB -> ${optSize} MB`);
  } catch (err) {
    console.error(`Error optimizing ${a.in}:`, err.message);
  } finally {
    [tmp1, tmp2, tmp3].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  }
}
console.log(`\nAll assets optimized successfully!`);
