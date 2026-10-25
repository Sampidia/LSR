import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// Target 1: Generic building clearance in _bldRing
const target1 = `a.position.set(r*(f+l/2),0,-(t*Zu+(i?15:0)+o*10)),a.rotation.set(0,(c-.5)*.3,0),a.scale.set(l,Math.max(.001,d),u),a.updateMatrix(),this.buildings.setMatrixAt(e*4+n,a.matrix)`;

const replace1 = `let _bz=-(t*Zu+(i?15:0)+o*10);let _nearLM=Array.isArray(window.__LANDMARK_TOWERS__)&&window.__LANDMARK_TOWERS__.some(lm=>Math.abs(_bz-lm.z)<75&&(lm.x<0?-1:1)===r);a.position.set(r*(f+l/2),0,_bz),a.rotation.set(0,(c-.5)*.3,0),a.scale.set(_nearLM?1e-4:l,Math.max(.001,_nearLM?1e-4:d),_nearLM?1e-4:u),a.updateMatrix(),this.buildings.setMatrixAt(e*4+n,a.matrix)`;

if (!content.includes(target1)) {
  console.error('ERROR: target1 not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(target1, replace1);

// Target 2: Landmark loading and attachment in C_()
const target2 = `e.stage(.9);let s=new Sg(i),c=new cd({scene:i,renderer:r,textures:o.textures})`;

const replace2 = `let landmarkDefs=[{id:'ebonylife',name:'EbonyLife Place',url:'/assets/EbonyLife_tower_opt.glb',z:-650,x:68,height:85,rotY:0},{id:'eko1',name:'Eko Tower 1',url:'/assets/Eko_Tower_1_opt.glb',z:-1550,x:-75,height:115,rotY:Math.PI/2},{id:'eko2',name:'Eko Tower 2',url:'/assets/Eko_Tower_2_opt.glb',z:-2550,x:80,height:120,rotY:0},{id:'southpoint',name:'South Point Tower',url:'/assets/South_Point_Tower_opt.glb',z:-3650,x:-75,height:105,rotY:Math.PI}];window.__LANDMARK_TOWERS__=landmarkDefs;let loadedLandmarks=[];for(let lm of landmarkDefs){try{let g=await gp(lm.url);if(g&&g.scene){let root=g.scene;root.rotation.y=lm.rotY||0;root.position.set(0,0,0);root.scale.set(1,1,1);root.updateMatrixWorld(!0);let bb=new it().setFromObject(root),sz=new V;bb.getSize(sz);let sc=lm.height/Math.max(sz.y,.001);root.scale.set(sc,sc,sc);root.updateMatrixWorld(!0);let bb2=new it().setFromObject(root);root.position.y=-bb2.min.y;root.position.x=-(bb2.min.x+bb2.max.x)/2;root.position.z=-(bb2.min.z+bb2.max.z)/2;root.traverse(msh=>{if(msh.isMesh){msh.castShadow=!1;msh.receiveShadow=!0;msh.frustumCulled=!0;}});let grp=new go;grp.name='Landmark_'+lm.id;grp.add(root);grp.position.set(lm.x,0,lm.z);grp.userData={landmark:lm};loadedLandmarks.push(grp);console.log('[LagosLandmark] Loaded & placed '+lm.name+' at x='+lm.x+', z='+lm.z+', h='+lm.height+'m');}}catch(err){console.warn('[LagosLandmark] Error loading '+lm.id,err);}}e.stage(.9);let s=new Sg(i),c=new cd({scene:i,renderer:r,textures:o.textures});let lmGroup=new go;lmGroup.name='landmark-skyscrapers';for(let lm of loadedLandmarks){lmGroup.add(lm);}c.root.add(lmGroup);c.landmarkGroup=lmGroup`;

if (!content.includes(target2)) {
  console.error('ERROR: target2 not found in index-DZDTu90F.js');
  process.exit(1);
}
content = content.replace(target2, replace2);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: index-DZDTu90F.js successfully patched with landmark towers!');
