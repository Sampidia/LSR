import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `return realModels[type]?realModels[type].clone(!0):origCV?origCV(type,variant):null}}catch(err){console.warn('[LagosGLB] Model patch error:',err)}`;

const playerLogic = `let pDefs={flying_danfo:{url:'/assets/flying_danfo_opt.glb',len:4.8,rotY:Math.PI,rear:[[-1.25,0.75,1.8],[1.25,0.75,1.8]],down:[[-1.25,0.35,0.2],[1.25,0.35,0.2]],left:[[-1.35,0.85,0.3]],right:[[1.35,0.85,0.3]]},flying_tortoise:{url:'/assets/flying_tortoise_car_opt.glb',len:4.5,rotY:Math.PI/2,rear:[[-1.18,0.55,1.7],[1.18,0.55,1.7]],down:[[-1.18,0.28,0.1],[1.18,0.28,0.1]],left:[[-1.28,0.60,0.2]],right:[[1.28,0.60,0.2]]}};let chosenCar=localStorage.getItem('lagos_player_car')||'flying_t';if(pDefs[chosenCar]){try{let pConf=pDefs[chosenCar],pg=await gp(pConf.url);if(pg&&pg.scene){let pRoot=pg.scene;pRoot.rotation.y=pConf.rotY,pRoot.position.set(0,0,0),pRoot.scale.set(1,1,1),pRoot.updateMatrixWorld(!0);let pBb=new it().setFromObject(pRoot),pSz=new V;pBb.getSize(pSz);let pSc=pConf.len/Math.max(pSz.z,.001);pRoot.scale.set(pSc,pSc,pSc),pRoot.updateMatrixWorld(!0);let pBb2=new it().setFromObject(pRoot);pRoot.position.y=-pBb2.min.y,pRoot.position.x=-(pBb2.min.x+pBb2.max.x)/2,pRoot.position.z=-(pBb2.min.z+pBb2.max.z)/2,pRoot.updateMatrixWorld(!0);pRoot.traverse(c=>{c.isMesh&&(c.castShadow=!0,c.receiveShadow=!1)});let pCont=new go;pCont.name='PlayerCar_'+chosenCar,pCont.add(pRoot);let cGeo=new Zs(0.2,1.6,12,1,!0);cGeo.rotateX(Math.PI),cGeo.translate(0,-0.8,0);let pMat=new W({color:6288127,transparent:!0,opacity:.85,blending:2,depthWrite:!1,side:2});let mkPlume=(pos,rx,rz,sc=1.3)=>{let gr=new go;gr.position.set(pos[0],pos[1],pos[2]),gr.rotation.set(rx,0,rz);let msh=new q(cGeo,pMat.clone());gr.add(msh),gr.scale.set(0,0,0),gr.userData.baseScale=new V(sc,sc,sc);pCont.add(gr);return gr;};let plumes={rear:pConf.rear.map(p=>mkPlume(p,-Math.PI/2,0,1.4)),down:pConf.down.map(p=>mkPlume(p,0,0,1.0)),left:pConf.left.map(p=>mkPlume(p,0,-Math.PI/2,.9)),right:pConf.right.map(p=>mkPlume(p,0,Math.PI/2,.9))};pCont.userData={plumes:plumes,wheels:[],body:pRoot};let origCR=o.createRoadster;o.createRoadster=(opts={})=>pCont;console.log('[LagosGLB] Player vehicle mounted: '+chosenCar);}}catch(pErr){console.warn('[LagosGLB] Failed to mount player vehicle '+chosenCar,pErr)}}`;

const replacement = `return realModels[type]?realModels[type].clone(!0):origCV?origCV(type,variant):null};${playerLogic}}catch(err){console.warn('[LagosGLB] Model patch error:',err)}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: index-DZDTu90F.js patched successfully with Player Hangar vehicle support!');
} else {
  console.error('ERROR: Target string not found in index-DZDTu90F.js');
  process.exit(1);
}
