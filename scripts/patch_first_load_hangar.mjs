import fs from 'fs';

const filePath = 'public/assets/index-DZDTu90F.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = 'window.location.href=`/hangar.html`;return}';
const replacement = 'window.location.href=`/hangar.html?from=intro`;return}';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: First load redirect now passes ?from=intro!');
} else {
  if (content.includes('/hangar.html?from=intro')) {
    console.log('Already patched with ?from=intro!');
  } else {
    console.error('ERROR: Could not find target pattern in index-DZDTu90F.js');
    process.exit(1);
  }
}
