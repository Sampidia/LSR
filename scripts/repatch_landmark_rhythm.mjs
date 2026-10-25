import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update landmark defs to place them right in the skyline rhythm
const targetDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-650,x:68,height:85,rotY:0},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-1550,x:-75,height:115,rotY:Math.PI/2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-2550,x:80,height:120,rotY:0},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-3650,x:-75,height:105,rotY:Math.PI}];`;

const replaceDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-95,x:45,height:65,rotY:-Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-215,x:-45,height:75,rotY:Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-305,x:46,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-425,x:-45,height:70,rotY:Math.PI/2-0.2}];`;

if (!content.includes(targetDefs)) {
  console.error('ERROR: targetDefs not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(targetDefs, replaceDefs);

// 2. Adjust clearance in _bldRing so only the single replaced building slot is suppressed (leaving 2 old before, 3 old after, etc.)
const targetClear = `Math.abs(_bz-lm.z)<75`;
const replaceClear = `Math.abs(_bz-lm.z)<22`;

if (content.includes(targetClear)) {
  content = content.replace(targetClear, replaceClear);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: Landmark rhythm updated to [2 old -> EbonyLife -> 3 old -> Eko Tower 1 -> 2 old -> Eko Tower 2 -> 3 old -> South Point Tower -> endless old]!');
