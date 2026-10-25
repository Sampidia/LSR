import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// Target the mesh traversal block for landmarks
const targetTraverse = `root.traverse(msh=>{if(msh.isMesh){msh.castShadow=!1;msh.receiveShadow=!0;msh.frustumCulled=!0;}});`;

const replaceTraverse = `root.traverse(msh=>{if(msh.isMesh){msh.castShadow=!1;msh.receiveShadow=!0;msh.frustumCulled=!0;if(msh.material){msh.material.metalness=0.15;msh.material.roughness=0.55;}}});`;

if (content.includes(targetTraverse)) {
  content = content.replace(targetTraverse, replaceTraverse);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Landmark material lighting updated for vibrant daylight reflection!');
} else {
  console.log('targetTraverse not found or already updated');
}
