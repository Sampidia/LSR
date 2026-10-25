---
name: vehicle-replacement
description: Instructions and checklist for replacing or adding 3D vehicle assets (GLB) to Lagos Street Race without breaking the polished engine or vehicle orientations.
---

# Vehicle Asset Replacement Guide for Lagos Street Race

This workflow ensures any new GLB vehicle model is integrated cleanly into the **Polished Version** of Lagos Street Race, oriented properly down the highway, scaled accurately to lane boundaries, and preserves 100% of its original textures.

---

## 1. Golden Rules (Non-Negotiable)

1. **Active Engine Only:**
   - Always edit [`public/assets/index-DZDTu90F.js`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/public/assets/index-DZDTu90F.js).
   - **NEVER** switch [`index.html`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/index.html) to `src/main.tsx`. The React prototype in `src/` is deprecated.

2. **Preserve Original Textures & Materials:**
   - **Never** repaint or override GLB materials (no yellow coats or procedural color overrides).
   - Keep all original PBR textures, clearcoats, and materials from the 3D artist.

3. **Coordinate System & Heading in Lagos Street Race:**
   - **Z-Axis:** Length of the highway. Traffic travels towards **`-Z`** (forward towards the horizon).
   - **X-Axis:** Width across the highway (each lane is **`4.0 meters wide`**).
   - **Y-Axis:** Height above the road surface (`Y = 0` is flush on the asphalt).

---

## 2. Vehicle Replacement Steps

### Step 1: Place the GLB in `public/assets/`
Copy the optimized GLB into [`public/assets/`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/public/assets/).

### Step 2: Determine Model Axes & Optimal Y-Rotation
Many 3D models from Blender or Sketchfab have their length modeled along the X axis or rotated at diagonal angles (e.g. from FBX exports).

Run this Node.js command to find the vehicle's narrowest orientation and front-facing angle:
```bash
node -e "
globalThis.self = globalThis;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

const loader = new GLTFLoader();
const buf = fs.readFileSync('public/assets/<MODEL_FILENAME>.glb');
loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
  const root = gltf.scene;
  let bestDeg = 0, minW = 999;
  for (let d = 0; d < 360; d++) {
    root.rotation.y = d * Math.PI / 180;
    root.updateMatrixWorld(true);
    const sz = new THREE.Vector3();
    new THREE.Box3().setFromObject(root).getSize(sz);
    if (sz.x < minW) { minW = sz.x; bestDeg = d; }
  }
  console.log('Narrowest width angle:', bestDeg, 'deg (width=' + minW.toFixed(2) + 'm)');
  console.log('Opposite heading angle:', (bestDeg + 180) % 360, 'deg');
});
"
```
- Verify which of the two angles (`bestDeg` vs `bestDeg + 180`) places the **front headlights towards `-Z`** (downstream).

### Step 3: Register in `public/assets/index-DZDTu90F.js`
Locate the `defs` mapping in `public/assets/index-DZDTu90F.js`:
```javascript
let defs = {
  van:   { url: '/assets/lagos_danfo_bus_opt.glb',      len: 5.2, rotY: Math.PI / 2 },
  hatch: { url: '/assets/volkswagen_t3_opt.glb',         len: 5.0, rotY: 147 * Math.PI / 180 },
  sedan: { url: '/assets/2006_toyota_corolla.glb',       len: 4.6, rotY: Math.PI },
  taxi:  { url: '/assets/2005_toyota_corolla_luxel.glb', len: 4.6, rotY: Math.PI },
  bus:   { url: '/assets/lagos_danfo_bus_opt.glb',      len: 5.2, rotY: Math.PI / 2 }
};
```
- Set `url`: Path to your GLB in `/assets/`.
- Set `len`: Target length in meters (typically `4.4m - 4.6m` for cars, `4.8m - 5.2m` for buses/vans).
- Set `rotY`: The exact angle determined in Step 2.

### Step 4: Validate Bounds
The auto-scaling logic will automatically:
1. Rotate by `defs[k].rotY`.
2. Scale uniformly to `len / sz.z`.
3. Center horizontally at `x = 0`.
4. Ground bottom flush to road surface at `y = 0`.
5. Ensure width is between `1.8m and 2.5m` so it stays inside its `4.0m` lane.

### Step 5: Bump Cache-Buster in `index.html`
Whenever you update `index-DZDTu90F.js`, increment the query string in [`index.html`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/index.html):
```html
<script type="module" crossorigin src="/assets/index-DZDTu90F.js?v=align4"></script>
```
This forces all browsers to fetch the updated model transforms rather than serving stale cache.
