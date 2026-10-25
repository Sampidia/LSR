import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// Target 1: The current landmarkDefs array
const targetDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-95,x:45,height:65,rotY:-Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-215,x:-45,height:75,rotY:Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-305,x:46,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-425,x:-45,height:70,rotY:Math.PI/2-0.2}];`;

const replaceDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-215,x:45,y:0,height:65,rotY:-Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-335,x:-45,y:-1,height:75,rotY:-Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-455,x:46,y:-7.5,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-575,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}];`;

if (!content.includes(targetDefs)) {
  console.error('ERROR: targetDefs not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(targetDefs, replaceDefs);

// Target 2: Ensure Y offset is applied to grp.position
const targetPos = `grp.position.set(lm.x,0,lm.z);`;
const replacePos = `grp.position.set(lm.x,lm.y||0,lm.z);`;

if (content.includes(targetPos)) {
  content = content.replace(targetPos, replacePos);
  console.log('✓ Updated grp.position to support lm.y');
} else {
  console.log('grp.position already supports lm.y or not matched');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: Landmark positions, 180deg rotation, and floor grounding updated in index-DZDTu90F.js!');
