import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Move EbonyLife Tower downward to z: -250m, x: 48m, rotated 180°
const targetDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-215,x:45,y:0,height:65,rotY:Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-335,x:-45,y:-1,height:75,rotY:-Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-405,x:46,y:-7.5,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-475,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}];`;

const replaceDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-250,x:48,y:0,height:65,rotY:Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-340,x:-45,y:-1,height:75,rotY:-Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-410,x:46,y:-7.5,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-475,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}];`;

if (!content.includes(targetDefs)) {
  console.error('ERROR: targetDefs not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(targetDefs, replaceDefs);

// 2. Add billboard overlap suppression so billboards never merge with landmark towers
const targetBoard = `(Qu(t,439)<.25||ed(i)||Math.abs(i)<30)&&(i=1e5)`;
const replaceBoard = `(Qu(t,439)<.25||ed(i)||Math.abs(i)<30||(Array.isArray(window.__LANDMARK_TOWERS__)&&window.__LANDMARK_TOWERS__.some(lm=>Math.abs(i-lm.z)<40&&(lm.x<0?-1:1)===r)))&&(i=1e5)`;

if (!content.includes(targetBoard)) {
  console.error('ERROR: targetBoard not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(targetBoard, replaceBoard);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: EbonyLife moved downward and billboard-tower collision suppression added!');
