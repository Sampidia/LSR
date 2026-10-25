import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `root.traverse(c=>{c.isMesh&&(c.castShadow=!0,c.receiveShadow=!1)});let cont=new go;cont.name=k,cont.add(root),cont.userData={type:k,dims:{w:finalSz.x,h:finalSz.y,l:finalSz.z},roofHeight:finalSz.y},defs[k].ramp&&(cont.userData.ramp={length:6,height:finalSz.y}),realModels[k]=cont,console.log('[LagosGLB] Loaded & aligned: '+k+' (w='+finalSz.x.toFixed(2)+'m, l='+finalSz.z.toFixed(2)+'m)')`;

const replacement = `root.traverse(c=>{
  if(c.isMesh){
    c.castShadow=!0;
    c.receiveShadow=!1;
    let m=c.material;
    if(m){
      let name=(m.name||c.name||'').toLowerCase();
      if(/(glass|window|translucent)/i.test(name)){
        m.transparent=!0;
        m.opacity=Math.min(m.opacity||1,0.38);
        m.depthWrite=!1;
        c.castShadow=!1;
      }else if(/(tail|brake|plt5|firebrick|light_r|rear_light)/i.test(name)){
        m.emissive=new U(0xff1818);
        m.emissiveIntensity=2.4;
      }else if(/(internal|seat|leather)/i.test(name)){
        m.emissive=new U(0x383230);
        m.emissiveIntensity=0.6;
      }else if(m.isMeshStandardMaterial){
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
        m.emissive=new U(0x22222a);
        m.emissiveIntensity=0.4;
      }
    }
  }
});let cont=new go;cont.name=k,cont.add(root);let tlMat=new W({color:0xff1515});let tlGeo=new J(0.24,0.13,0.06);let tl1=new q(tlGeo,tlMat);tl1.position.set(-finalSz.x*0.37,Math.max(0.48,finalSz.y*0.38),finalSz.z/2+0.03);let tl2=new q(tlGeo,tlMat);tl2.position.set(finalSz.x*0.37,Math.max(0.48,finalSz.y*0.38),finalSz.z/2+0.03);cont.add(tl1,tl2);cont.userData={type:k,dims:{w:finalSz.x,h:finalSz.y,l:finalSz.z},roofHeight:finalSz.y},defs[k].ramp&&(cont.userData.ramp={length:6,height:finalSz.y}),realModels[k]=cont,console.log('[LagosGLB] Loaded & aligned: '+k+' (w='+finalSz.x.toFixed(2)+'m, l='+finalSz.z.toFixed(2)+'m, with taillights & tuned lighting)')`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Vehicle materials, translucent windows, and glowing taillights patched!');
} else {
  console.error('ERROR: Target string not found in index-DZDTu90F.js');
  process.exit(1);
}
