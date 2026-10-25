import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const jobs = [
  {
    file: 'public/assets/2005_toyota_corolla_luxel.glb',
    join: true,
    ratio: 0.12,
    targetTris: '~10k'
  },
  {
    file: 'public/assets/pick_up_vechile_opt.glb',
    join: false,
    ratio: 0.07,
    targetTris: '~14k'
  },
  {
    file: 'public/assets/cement_truck_opt.glb',
    join: false,
    ratio: 0.09,
    targetTris: '~14k'
  },
  {
    file: 'public/assets/truck_car_carrier_opt.glb',
    join: false,
    ratio: 0.13,
    targetTris: '~15k'
  },
  {
    file: 'public/assets/highlander_opt.glb',
    join: false,
    ratio: 0.10,
    targetTris: '~12k'
  },
  {
    file: 'public/assets/suv_car_opt.glb',
    join: false,
    ratio: 0.10,
    targetTris: '~12k'
  },
  {
    file: 'public/assets/truck_opt.glb',
    join: false,
    ratio: 0.13,
    targetTris: '~12k'
  },
  {
    file: 'public/assets/flying_danfo_opt.glb',
    join: false,
    ratio: 0.14,
    targetTris: '~16k'
  },
  {
    file: 'public/assets/flying_tortoise_car_opt.glb',
    join: false,
    ratio: 0.14,
    targetTris: '~16k'
  }
];

console.log('=== STARTING HIGH-EFFICIENCY VEHICLE OPTIMIZATION PASS ===\n');

for (const job of jobs) {
  const filePath = job.file;
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing file: ${filePath}`);
    continue;
  }

  const baseName = path.basename(filePath);
  const origSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  console.log(`\n--------------------------------------------------`);
  console.log(`Processing: ${baseName} (Original size: ${origSize} MB, target: ${job.targetTris})`);

  const t0 = `/tmp/opt_step0_${baseName}`;
  const t1 = `/tmp/opt_step1_${baseName}`;
  const t2 = `/tmp/opt_step2_${baseName}`;
  const t3 = `/tmp/opt_step3_${baseName}`;
  const tFinal = `/tmp/opt_final_${baseName}`;

  try {
    let currentIn = filePath;

    // Step 1: Join meshes if requested
    if (job.join) {
      console.log(`  [1/4] Joining meshes...`);
      execSync(`npx @gltf-transform/cli join "${currentIn}" "${t0}"`, { stdio: 'pipe' });
      currentIn = t0;
    }

    // Step 2: Simplify geometry
    console.log(`  [2/4] Simplifying geometry (ratio ${job.ratio})...`);
    execSync(`npx @gltf-transform/cli simplify "${currentIn}" "${t1}" --ratio ${job.ratio} --error 0.02`, { stdio: 'pipe' });

    // Step 3: Resize textures to 1024x1024 to save VRAM
    console.log(`  [3/4] Resizing textures to 1024x1024...`);
    execSync(`npx @gltf-transform/cli resize "${t1}" "${t2}" --width 1024 --height 1024`, { stdio: 'pipe' });

    // Step 4: Dedup & prune
    console.log(`  [4/4] Dedup & prune...`);
    execSync(`npx @gltf-transform/cli dedup "${t2}" "${t3}"`, { stdio: 'pipe' });
    execSync(`npx @gltf-transform/cli prune "${t3}" "${tFinal}"`, { stdio: 'pipe' });

    const newSize = (fs.statSync(tFinal).size / 1024 / 1024).toFixed(2);
    fs.copyFileSync(tFinal, filePath);
    console.log(`  ✓ SUCCESS: ${origSize} MB -> ${newSize} MB`);
  } catch (err) {
    console.error(`  ✗ Error optimizing ${baseName}:`, err.message);
  } finally {
    [t0, t1, t2, t3, tFinal].forEach(f => {
      if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch {}
    });
  }
}

console.log('\n=== ALL VEHICLE ASSETS OPTIMIZED SUCCESSFULLY! ===');
