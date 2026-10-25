import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = 'let p=-(t*Yu+Yu*(.15+.7*o));ed(p)&&(c=!1);let m=c?.85+o*.5:0;';
const replacement = 'let p=-(t*Yu+Yu*(.15+.7*o));ed(p)&&(c=!1);if(c){let _k0=Math.floor((-p-65)/qu),_k1=Math.ceil((-p+10)/qu);for(let _k=_k0;_k<=_k1;_k++){if(_k>=0){let _bz=-(_k*qu+qu*(.05+.9*Qu(_k,433)));if(!(Qu(_k,439)<.25||ed(_bz)||Math.abs(_bz)<30)&&(Qu(_k,401)<.5?-1:1)===r){let _dz=p-_bz;if(_dz>=-3&&_dz<=55){c=!1;break}}}}}let m=c?.85+o*.5:0;';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Palm clearance before billboards patched successfully!');
} else {
  if (content.includes('let _dz=p-_bz')) {
    console.log('Already patched!');
  } else {
    console.error('ERROR: Could not find target pattern in index-DZDTu90F.js');
    process.exit(1);
  }
}
