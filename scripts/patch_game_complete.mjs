import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Target 1: Set time-of-day progression & enhanced streetlamp ambient at night
const oldTarget1 = `this.honkGate>0&&(this.honkGate-=e);let isN=window.__LAGOS_TOD__==='night';let s=this.distance/Yg%2,c=isN?1.0:0;Math.abs(c-this.lastTod)>.002&&(this.lastTod=c,this.world?.setTimeOfDay?.(c));`;
const newTarget1 = `this.honkGate>0&&(this.honkGate-=e);let isN=window.__LAGOS_TOD__==='night';let s=this.distance/Yg%2,c=isN?1.0:0;if(Math.abs(c-this.lastTod)>.002){this.lastTod=c;if(this.world?.setTimeOfDay){this.world.setTimeOfDay(c);if(isN&&this.world.hemi){this.world.hemi.intensity=1.95;this.world.hemi.color.setHex(0x9cb4ff);this.world.hemi.groundColor.setHex(0x5a4c3e);this.world.sun.intensity=1.45;this.world.sun.color.setHex(0xb8caff);if(this.world.roadMat)this.world.roadMat.color.setScalar(0.92);if(this.world.groundMat)this.world.groundMat.color.setScalar(0.90);}}};`;

if (content.includes(oldTarget1)) {
  content = content.replace(oldTarget1, newTarget1);
  console.log('Target 1 replaced with enhanced night streetlamp illumination');
} else {
  // Check if previously patched
  const rawTarget1 = `this.honkGate>0&&(this.honkGate-=e);let s=this.distance/Yg%2,c=s<1?s:2-s;Math.abs(c-this.lastTod)>.002&&(this.lastTod=c,this.world?.setTimeOfDay?.(c));`;
  if (content.includes(rawTarget1)) {
    content = content.replace(rawTarget1, newTarget1);
    console.log('Target 1 (raw) replaced with enhanced night streetlamp illumination');
  }
}

// 2. Target 2: Character sub-geometry preloading, Per-Variant Random Shirts, Streetlamp vehicle ambient & Tight Taillights
const target2Start = `let chosenTod=new URLSearchParams(location.search).get('tod')||localStorage.getItem('lagos_time_of_day')||'day';`;
const target2End = `pCont.userData={plumes:plumes,wheels:[],body:pRoot};let origCR=o.createRoadster;o.createRoadster=(opts={})=>pCont;console.log('[LagosGLB] Player vehicle mounted: '+chosenCar);}}catch(pErr){console.warn('[LagosGLB] Failed to mount player vehicle '+chosenCar,pErr)}}`;

const idxStart = content.indexOf(target2Start);
const idxEnd = content.indexOf(target2End);

if (idxStart === -1 || idxEnd === -1) {
  console.error('ERROR: Target 2 block boundaries not found in index-DZDTu90F.js');
  process.exit(1);
}

const replacement2 = `let chosenTod=new URLSearchParams(location.search).get('tod')||localStorage.getItem('lagos_time_of_day')||'day';
window.__LAGOS_TOD__=chosenTod;
console.log('[LagosMode] Active Time of Day: '+chosenTod);

let charSubGeoms={};
for(let cid of['driver','female_passager','male_passager']){
  try{
    let cg=await gp('/assets/'+cid+'_opt.glb');
    if(cg&&cg.scene){
      let m=null;
      cg.scene.traverse(c=>{if(c.isMesh)m=c;});
      if(m&&m.geometry){
        let geo=m.geometry;
        let pos=geo.attributes.position;
        let index=geo.index;
        let groups={hair:[],skin:[],shirt:[],pants:[],shoes:[]};
        for(let i=0;i<index.count;i+=3){
          let a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);
          let avgY=(pos.getY(a)+pos.getY(b)+pos.getY(c))/3;
          let avgZ=(pos.getZ(a)+pos.getZ(b)+pos.getZ(c))/3;
          let avgX=(pos.getX(a)+pos.getX(b)+pos.getX(c))/3;
          if(avgY>0.38)groups.hair.push(a,b,c);
          else if(avgY>0.17)groups.skin.push(a,b,c);
          else if(avgY>-0.09){
            if(avgZ>0.12&&avgY<0.13&&Math.abs(avgX)<0.15)groups.skin.push(a,b,c);
            else groups.shirt.push(a,b,c);
          }else if(avgY>-0.42)groups.pants.push(a,b,c);
          else groups.shoes.push(a,b,c);
        }
        let mkSub=(idxArr)=>{
          let g=new geo.constructor();
          for(let k in geo.attributes)g.setAttribute(k,geo.attributes[k]);
          g.setIndex(idxArr);
          return g;
        };
        charSubGeoms[cid]={
          hair:mkSub(groups.hair),
          skin:mkSub(groups.skin),
          shirt:mkSub(groups.shirt),
          pants:mkSub(groups.pants),
          shoes:mkSub(groups.shoes)
        };
        console.log('[LagosChar] Sub-geometries created for '+cid);
      }
    }
  }catch(e){console.warn('[LagosChar] Error loading '+cid,e);}
}

let streetLightMesh=null;
try{
  let slG=await gp('/assets/street_light_opt.glb');
  if(slG&&slG.scene){
    slG.scene.traverse(c=>{if(c.isMesh)streetLightMesh=c;});
    console.log('[LagosGLB] Loaded street_light_opt.glb');
  }
}catch(e){console.warn('[LagosGLB] Error loading street_light_opt',e);}
window.__STREET_LIGHT_MESH__=streetLightMesh;

let afSkins=['#2c1b14','#3d2318','#4e2d1f','#633b28','#7a4b33','#8f593e','#a3694a','#b87b58'].map(h=>new U(h));
let lagosShirts=['#f59e0b','#00e5ff','#2563eb','#10b981','#ef4444','#f97316','#a855f7','#f8fafc','#1e293b','#e11d48','#14b8a6','#84cc16','#ec4899','#6366f1'].map(h=>new U(h));
let pantsCols=['#1e3a5f','#0f172a','#785e45','#334155'].map(h=>new U(h));
let hairCol=new U('#120c0a'),shoeCol=new U('#181514');

let makeChar=(cid='driver',vIdx=0,offset=0)=>{
  let sub=charSubGeoms[cid]||charSubGeoms.driver;
  if(!sub)return null;
  let shirt=lagosShirts[(vIdx*3+offset)%lagosShirts.length];
  let skin=afSkins[(vIdx*2+offset)%afSkins.length];
  let pants=pantsCols[(vIdx+offset)%pantsCols.length];

  let mHair=new Z({color:hairCol,roughness:0.8,metalness:0.05});
  let mSkin=new Z({color:skin,roughness:0.55,metalness:0.05,emissive:skin,emissiveIntensity:0.12});
  let mShirt=new Z({color:shirt,roughness:0.50,metalness:0.05,emissive:shirt,emissiveIntensity:0.15});
  let mPants=new Z({color:pants,roughness:0.7,metalness:0.05});
  let mShoes=new Z({color:shoeCol,roughness:0.7,metalness:0.1});

  let grp=new go();
  let mHairMsh=new q(sub.hair,mHair);
  let mSkinMsh=new q(sub.skin,mSkin);
  let mShirtMsh=new q(sub.shirt,mShirt);
  let mPantsMsh=new q(sub.pants,mPants);
  let mShoesMsh=new q(sub.shoes,mShoes);
  for(let m of[mHairMsh,mSkinMsh,mShirtMsh,mPantsMsh,mShoesMsh]){
    m.rotation.y=Math.PI;
    m.castShadow=!1;
    m.receiveShadow=!1;
    grp.add(m);
  }
  return grp;
};

let attachOccupants=(veh,type,variant=0)=>{
  let isNight=window.__LAGOS_TOD__==='night';
  let tl=veh.userData?.taillights;
  if(tl){
    tl.forEach(t=>t.visible=isNight);
  }
  if(type==='pickup'||type==='pickup_truck'||type==='cement_truck'||veh.name==='cement_truck'||veh.userData?.type==='cement_truck'||veh.userData?.model==='cement_truck'){
    return;
  }
  let dMsh=makeChar('driver',variant,0);
  if(!dMsh)return;
  let dims=veh.userData?.dims||{w:2,h:1.5,l:4.6};

  if(type==='sedan'||type==='taxi'){
    dMsh.scale.setScalar(0.78);
    dMsh.position.set(-0.38, 0.92, -0.35);
    veh.add(dMsh);
  }else if(type==='van'||type==='bus'||type==='hatch'){
    dMsh.scale.setScalar(0.86);
    dMsh.position.set(-0.48, 1.44, -1.48);
    veh.add(dMsh);
    let seats=[
      [0.48, 1.42, -1.45],
      [-0.45, 1.40, -0.65],
      [0.45, 1.40, -0.65],
      [-0.45, 1.40, 0.10],
      [0.45, 1.40, 0.10]
    ];
    for(let i=0;i<seats.length;i++){
      let pos=seats[i];
      let pCid=(i%2===0)?'female_passager':'male_passager';
      let pMsh=makeChar(pCid,variant,i+1);
      if(pMsh){
        pMsh.scale.setScalar(0.84);
        pMsh.position.set(pos[0], pos[1], pos[2]);
        veh.add(pMsh);
      }
    }
  }else if(type==='suv'||type==='highlander'){
    dMsh.scale.setScalar(0.85);
    dMsh.position.set(-0.42, 1.08, -0.42);
    veh.add(dMsh);
  }else if(type==='boxtruck'||type==='truck'||type==='carrier'){
    dMsh.scale.setScalar(0.92);
    dMsh.position.set(-0.52, 1.72, -(dims.l/2 - 0.70));
    veh.add(dMsh);
  }
};

let defs={van:{url:'/assets/lagos_danfo_bus_opt.glb',len:5.2,rotY:Math.PI/2},hatch:{url:'/assets/volkswagen_t3_opt.glb',len:5.0,rotY:147*Math.PI/180},sedan:{url:'/assets/2006_toyota_corolla.glb',len:4.6,rotY:Math.PI},taxi:{url:'/assets/2005_toyota_corolla_luxel.glb',len:4.6,rotY:Math.PI},bus:{url:'/assets/lagos_danfo_bus_opt.glb',len:5.2,rotY:Math.PI/2},carrier:{url:'/assets/truck_car_carrier_opt.glb',len:14.0,rotY:3*Math.PI/2,ramp:!0},truck:{url:'/assets/truck_opt.glb',len:7.5,rotY:Math.PI/2},cement_truck:{url:'/assets/cement_truck_opt.glb',len:8.0,rotY:3*Math.PI/2},pickup_truck:{url:'/assets/pick_up_vechile_opt.glb',len:5.4,rotY:3*Math.PI/2},highlander:{url:'/assets/highlander_opt.glb',len:4.8,rotY:Math.PI/2},suv:{url:'/assets/suv_car_opt.glb',len:4.8,rotY:Math.PI/2}},realModels={};for(let k in defs){try{let g=await gp(defs[k].url);if(g&&g.scene){let root=g.scene;root.rotation.y=defs[k].rotY,root.position.set(0,0,0),root.scale.set(1,1,1),root.updateMatrixWorld(!0);let bb=new it().setFromObject(root),sz=new V;bb.getSize(sz);let sc=defs[k].len/Math.max(sz.z,.001);root.scale.set(sc,sc,sc),root.updateMatrixWorld(!0);let bb2=new it().setFromObject(root);root.position.y=-bb2.min.y,root.position.x=-(bb2.min.x+bb2.max.x)/2,root.position.z=-(bb2.min.z+bb2.max.z)/2,root.updateMatrixWorld(!0);let finalSz=new V;new it().setFromObject(root).getSize(finalSz),root.traverse(c=>{
  if(c.isMesh){
    c.castShadow=!0;
    c.receiveShadow=!1;
    if(k==='hatch'||k==='van'||k==='bus'){
      return;
    }
    let m=c.material;
    if(m){
      let name=(m.name||c.name||'').toLowerCase();
      // Glass
      if(/(glass|window|translucent)/i.test(name)){
        m.transparent=!0;
        m.opacity=Math.min(m.opacity||1,0.36);
        m.depthWrite=!1;
        c.castShadow=!1;
      }else if(/(taillight|tail_light|brake|plt5|firebrick|light_r|rear_light)/i.test(name)&&!/detail/i.test(name)){
        m.emissive=new U(0xff1818);
        m.emissiveIntensity=2.4;
      }else if(m.isMeshStandardMaterial&&!m.map){
        if(m.metalness>0.28)m.metalness=0.22;
        if(m.roughness<0.48)m.roughness=0.52;
        if(m.color){
          let lum=m.color.r*0.299+m.color.g*0.587+m.color.b*0.114;
          let isTrim=/(tire|tyre|black_plastic|rubber)/i.test(name);
          if(lum<0.22&&!isTrim){
            m.color.r=Math.max(m.color.r,0.24);
            m.color.g=Math.max(m.color.g,0.26);
            m.color.b=Math.max(m.color.b,0.36);
          }
        }
      }
    }
  }
});let cont=new go;cont.name=k,cont.add(root);let tlMat=new W({color:0xff1515});let tlGeo=new J(0.24,0.13,0.06);let tl1=new q(tlGeo,tlMat);let tl2=new q(tlGeo,tlMat);let tlX=Math.min(Math.max(finalSz.x*0.22,0.42),0.60);tl1.position.set(-tlX,Math.max(0.48,finalSz.y*0.38),finalSz.z/2+0.03);tl2.position.set(tlX,Math.max(0.48,finalSz.y*0.38),finalSz.z/2+0.03);let isNight=window.__LAGOS_TOD__==='night';tl1.visible=isNight;tl2.visible=isNight;cont.add(tl1,tl2);cont.userData={type:k,dims:{w:finalSz.x,h:finalSz.y,l:finalSz.z},roofHeight:finalSz.y,taillights:[tl1,tl2]},defs[k].ramp&&(cont.userData.ramp={length:6,height:finalSz.y}),realModels[k]=cont,console.log('[LagosGLB] Loaded & aligned: '+k+' (w='+finalSz.x.toFixed(2)+'m, l='+finalSz.z.toFixed(2)+'m)')}}catch(err){console.warn('[LagosGLB] Error loading '+k,err)}}

let origCV=o.createVehicle;
o.createVehicle=(type,variant=0)=>{
  let pick=null;
  if(type==='boxtruck'){
    if(realModels.truck){
      pick=realModels.truck.clone(!0);
      pick.userData.type='boxtruck';
    }else if(realModels.cement_truck){
      pick=realModels.cement_truck.clone(!0);
      pick.userData.type='cement_truck';
    }
  }else if(type==='cement_truck'){
    if(realModels.cement_truck){
      pick=realModels.cement_truck.clone(!0);
      pick.userData.type='cement_truck';
    }
  }else if(type==='pickup'){
    let pool=[realModels.pickup_truck,realModels.highlander].filter(Boolean);
    if(pool.length){
      pick=pool[Math.floor(Math.random()*pool.length)].clone(!0);
      pick.userData.type='pickup';
    }
  }else if(type==='carrier'&&realModels.carrier){
    pick=realModels.carrier.clone(!0);
    pick.userData.type='carrier';
  }else if(type==='suv'&&realModels.suv){
    pick=realModels.suv.clone(!0);
    pick.userData.type='suv';
  }else if(realModels[type]){
    pick=realModels[type].clone(!0);
  }else if(origCV){
    pick=origCV(type,variant);
  }
  if(pick){
    attachOccupants(pick, pick.userData?.type||type, variant);
  }
  return pick;
};

let pDefs={flying_danfo:{url:'/assets/flying_danfo_opt.glb',len:4.8,rotY:Math.PI,rear:[[-1.25,0.75,1.8],[1.25,0.75,1.8]],down:[[-1.25,0.35,0.2],[1.25,0.35,0.2]],left:[[-1.35,0.85,0.3]],right:[[1.35,0.85,0.3]]},flying_tortoise:{url:'/assets/flying_tortoise_car_opt.glb',len:4.5,rotY:Math.PI/2,rear:[[-1.18,0.55,1.7],[1.18,0.55,1.7]],down:[[-1.18,0.28,0.1],[1.18,0.28,0.1]],left:[[-1.28,0.60,0.2]],right:[[1.28,0.60,0.2]]}};let chosenCar=localStorage.getItem('lagos_player_car')||'flying_t';if(pDefs[chosenCar]){try{let pConf=pDefs[chosenCar],pg=await gp(pConf.url);if(pg&&pg.scene){let pRoot=pg.scene;pRoot.rotation.y=pConf.rotY,pRoot.position.set(0,0,0),pRoot.scale.set(1,1,1),pRoot.updateMatrixWorld(!0);let pBb=new it().setFromObject(pRoot),pSz=new V;pBb.getSize(pSz);let pSc=pConf.len/Math.max(pSz.z,.001);pRoot.scale.set(pSc,pSc,pSc),pRoot.updateMatrixWorld(!0);let pBb2=new it().setFromObject(pRoot);pRoot.position.y=-pBb2.min.y,pRoot.position.x=-(pBb2.min.x+pBb2.max.x)/2,pRoot.position.z=-(pBb2.min.z+pBb2.max.z)/2,pRoot.updateMatrixWorld(!0);pRoot.traverse(c=>{c.isMesh&&(c.castShadow=!0,c.receiveShadow=!1)});let pCont=new go;pCont.name='PlayerCar_'+chosenCar,pCont.add(pRoot);let cGeo=new Zs(0.2,1.6,12,1,!0);cGeo.rotateX(Math.PI),cGeo.translate(0,-0.8,0);let pMat=new W({color:6288127,transparent:!0,opacity:.85,blending:2,depthWrite:!1,side:2});let mkPlume=(pos,rx,rz,sc=1.3)=>{let gr=new go;gr.position.set(pos[0],pos[1],pos[2]),gr.rotation.set(rx,0,rz);let msh=new q(cGeo,pMat.clone());gr.add(msh),gr.scale.set(0,0,0),gr.userData.baseScale=new V(sc,sc,sc);pCont.add(gr);return gr;};let plumes={rear:pConf.rear.map(p=>mkPlume(p,-Math.PI/2,0,1.4)),down:pConf.down.map(p=>mkPlume(p,0,0,1.0)),left:pConf.left.map(p=>mkPlume(p,0,-Math.PI/2,.9)),right:pConf.right.map(p=>mkPlume(p,0,Math.PI/2,.9))};let pDriver=makeChar('driver',0,0);if(pDriver){if(chosenCar.includes('danfo')){pDriver.scale.setScalar(0.86);pDriver.position.set(-0.48,1.45,-1.45);}else{pDriver.scale.setScalar(0.78);pDriver.position.set(-0.30,0.94,-0.38);}pCont.add(pDriver);}pCont.userData={plumes:plumes,wheels:[],body:pRoot};let origCR=o.createRoadster;o.createRoadster=(opts={})=>pCont;console.log('[LagosGLB] Player vehicle mounted: '+chosenCar);}}catch(pErr){console.warn('[LagosGLB] Failed to mount player vehicle '+chosenCar,pErr)}}`;

content = content.substring(0, idxStart) + replacement2 + content.substring(idxEnd + target2End.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: index-DZDTu90F.js updated with per-variant random shirts, sub-geometries, and streetlamp visibility!');
