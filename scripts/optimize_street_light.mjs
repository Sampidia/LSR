import { execSync } from 'child_process';
import fs from 'fs';

const input = 'public/assets/Street_light.glb';
const output = 'public/assets/street_light_opt.glb';

console.log('Optimizing Street_light.glb...');
const origSize = (fs.statSync(input).size / 1024 / 1024).toFixed(2);
console.log(`Original size: ${origSize} MB`);

const tmp1 = '/tmp/sl_tmp1.glb';
const tmp2 = '/tmp/sl_tmp2.glb';
const tmp3 = '/tmp/sl_tmp3.glb';

try {
  // Step 1: Resize 4K textures to 1024x1024
  console.log('Step 1: Resizing textures to 1024x1024...');
  execSync(`npx @gltf-transform/cli resize --width 1024 --height 1024 "${input}" "${tmp1}"`, { stdio: 'inherit' });

  // Step 2: Weld vertices
  console.log('Step 2: Welding vertices...');
  execSync(`npx @gltf-transform/cli weld "${tmp1}" "${tmp2}"`, { stdio: 'inherit' });

  // Step 3: Simplify geometry (ratio 0.012 -> ~4,800 triangles)
  console.log('Step 3: Simplifying 400k triangles to ~5k triangles...');
  execSync(`npx @gltf-transform/cli simplify "${tmp2}" "${tmp3}" --ratio 0.012 --error 0.01`, { stdio: 'inherit' });

  // Step 4: Dedup and prune
  console.log('Step 4: Dedup and prune...');
  execSync(`npx @gltf-transform/cli dedup "${tmp3}" "${tmp1}"`, { stdio: 'inherit' });
  execSync(`npx @gltf-transform/cli prune "${tmp1}" "${output}"`, { stdio: 'inherit' });

  const optSize = (fs.statSync(output).size / 1024 / 1024).toFixed(2);
  console.log(`SUCCESS: Created ${output} (${origSize} MB -> ${optSize} MB)`);
} catch (err) {
  console.error('Error optimizing street light:', err);
  process.exit(1);
} finally {
  [tmp1, tmp2, tmp3].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
}
