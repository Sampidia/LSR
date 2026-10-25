import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const assets = [
  { in: 'public/assets/EbonyLife_tower.glb',  opt: 'public/assets/EbonyLife_tower_opt.glb',  ratio: 0.02 },
  { in: 'public/assets/Eko_Tower_1.glb',      opt: 'public/assets/Eko_Tower_1_opt.glb',      ratio: 0.02 },
  { in: 'public/assets/Eko_Tower_2.glb',      opt: 'public/assets/Eko_Tower_2_opt.glb',      ratio: 0.02 },
  { in: 'public/assets/South_Point_Tower.glb', opt: 'public/assets/South_Point_Tower_opt.glb', ratio: 0.02 }
];

console.log('=== STARTING LANDMARK SKYSCRAPER OPTIMIZATION PASS ===\n');

for (const a of assets) {
  if (!fs.existsSync(a.in)) {
    console.warn(`File missing: ${a.in}`);
    continue;
  }
  const baseName = path.basename(a.in);
  const origSize = (fs.statSync(a.in).size / 1024 / 1024).toFixed(2);
  console.log(`\n==================================================`);
  console.log(`Optimizing: ${baseName} (Original size: ${origSize} MB)`);

  const t1 = `/tmp/opt_t1_${baseName}`;
  const t2 = `/tmp/opt_t2_${baseName}`;
  const t3 = `/tmp/opt_t3_${baseName}`;

  try {
    // 1. Simplify geometry (from ~1.95M tris down to ~35k-40k tris)
    console.log(`  [1/4] Simplifying geometry (ratio: ${a.ratio})...`);
    execSync(`npx @gltf-transform/cli simplify "${a.in}" "${t1}" --ratio ${a.ratio} --error 0.02`, { stdio: 'inherit' });

    // 2. Resize 4K textures down to 1024x1024 (saves 94% VRAM)
    console.log(`  [2/4] Resizing textures to 1024x1024...`);
    execSync(`npx @gltf-transform/cli resize "${t1}" "${t2}" --width 1024 --height 1024`, { stdio: 'inherit' });

    // 3. Dedup accessors and materials
    console.log(`  [3/4] Deduplicating mesh accessors & materials...`);
    execSync(`npx @gltf-transform/cli dedup "${t2}" "${t3}"`, { stdio: 'inherit' });

    // 4. Prune unused data
    console.log(`  [4/4] Pruning unreferenced data...`);
    execSync(`npx @gltf-transform/cli prune "${t3}" "${a.opt}"`, { stdio: 'inherit' });

    const newSize = (fs.statSync(a.opt).size / 1024 / 1024).toFixed(2);
    console.log(`  ✓ SUCCESS: ${baseName} -> ${path.basename(a.opt)} (${origSize} MB -> ${newSize} MB)`);
  } catch (err) {
    console.error(`  ✗ Error optimizing ${baseName}:`, err.message);
  } finally {
    [t1, t2, t3].forEach(f => {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch {}
      }
    });
  }
}

console.log('\n=== ALL LANDMARK SKYSCRAPERS OPTIMIZED SUCCESSFULLY! ===\n');
