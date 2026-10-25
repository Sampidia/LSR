import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// Target the current landmarkDefs string
const targetDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-215,x:45,y:0,height:65,rotY:-Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-335,x:-45,y:-1,height:75,rotY:-Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-455,x:46,y:-7.5,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-575,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}];`;

const replaceDefs = `landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-215,x:45,y:0,height:65,rotY:Math.PI/2+0.2},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-335,x:-45,y:-1,height:75,rotY:-Math.PI/2-0.2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-405,x:46,y:-7.5,height:78,rotY:-Math.PI/2+0.2},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-475,x:-45,y:-7.0,height:70,rotY:Math.PI/2-0.2}];`;

if (!content.includes(targetDefs)) {
  console.error('ERROR: targetDefs not found in index-DZDTu90F.js');
  process.exit(1);
}

content = content.replace(targetDefs, replaceDefs);
fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: EbonyLife rotated 180° and South Point Tower set to ~475m!');
