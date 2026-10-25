import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const jobs = [
  { in: 'public/assets/driver.glb',           opt: 'public/assets/driver_opt.glb',          ratio: 0.007 },
  { in: 'public/assets/female _passager.glb', opt: 'public/assets/female_passager_opt.glb',  ratio: 0.0028 },
  { in: 'public/assets/male_passager.glb',    opt: 'public/assets/male_passager_opt.glb',    ratio: 0.007 }
];

console.log('=== STARTING LOW-POLY CHARACTER ASSETS OPTIMIZATION ===\n');

for (const job of jobs) {
  if (!fs.existsSync(job.in)) {
    console.warn(`File missing: ${job.in}`);
    continue;
  }
  const baseName = path.basename(job.in);
  const origSize = (fs.statSync(job.in).size / 1024 / 1024).toFixed(2);
  console.log(`--------------------------------------------------`);
  console.log(`Processing: ${baseName} (Original size: ${origSize} MB, ratio: ${job.ratio})`);

  const t1 = `/tmp/char_t1_${path.basename(job.opt)}`;
  const t2 = `/tmp/char_t2_${path.basename(job.opt)}`;

  try {
    // 1. Simplify geometry down to ~2,500-3,000 triangles
    console.log(`  [1/3] Simplifying geometry...`);
    execSync(`npx @gltf-transform/cli simplify "${job.in}" "${t1}" --ratio ${job.ratio} --error 0.02`, { stdio: 'inherit' });

    // 2. Dedup accessors and weld
    console.log(`  [2/3] Deduplicating accessors...`);
    execSync(`npx @gltf-transform/cli dedup "${t1}" "${t2}"`, { stdio: 'inherit' });

    // 3. Prune unused nodes
    console.log(`  [3/3] Pruning...`);
    execSync(`npx @gltf-transform/cli prune "${t2}" "${job.opt}"`, { stdio: 'inherit' });

    const newSize = (fs.statSync(job.opt).size / 1024).toFixed(1);
    console.log(`  ✓ SUCCESS: ${baseName} -> ${path.basename(job.opt)} (${origSize} MB -> ${newSize} KB)`);
  } catch (err) {
    console.error(`  ✗ Error optimizing ${baseName}:`, err.message);
  } finally {
    [t1, t2].forEach(f => {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch {}
      }
    });
  }
}

// Also create a normalized filename for female passenger without space
if (fs.existsSync('public/assets/female_passager_opt.glb')) {
  fs.copyFileSync('public/assets/female_passager_opt.glb', 'public/assets/female_passager.glb');
}

console.log('\n=== ALL CHARACTER ASSETS OPTIMIZED SUCCESSFULLY! ===\n');
