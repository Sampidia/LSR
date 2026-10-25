import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// Target South Point Tower in landmarkDefs
const targetDefs = `{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-475,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}`;
const replaceDefs = `{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-475,x:-45,y:-14.0,height:70,rotY:Math.PI/2-0.2}`;

if (!content.includes(targetDefs)) {
  console.error('ERROR: targetDefs not found in index-DZDTu90F.js');
  process.exit(1);
}

content = content.replace(targetDefs, replaceDefs);
fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: South Point Tower foundation submerged to y: -14.0m at z: -475m (Left)!');
