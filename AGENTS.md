# Project Architecture & Instructions

## CRITICAL RULE 1: Active Game Engine is the Polished Version

> [!CAUTION]
> **DO NOT** replace `index.html` with `/src/main.tsx` or attempt to run the React prototype in `src/`.

### Active Game vs. Legacy Prototype
- **Active Game (Polished Version):**
  - Loaded by [`index.html`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/index.html) via [`/assets/index-DZDTu90F.js`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/public/assets/index-DZDTu90F.js) and [`/assets/index-D6_GbB_6.css`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/public/assets/index-D6_GbB_6.css).
  - Uses the native `<canvas id="game">`, `<div id="hud">`, and `<div id="boot">`.
  - Features the full Lagos voice lines, authentic audio effects, Third Mainland Bridge environment, coin mechanics, and high-performance instanced rendering.
  - GLB vehicles are loaded dynamically in the boot sequence of `index-DZDTu90F.js` and injected into the instanced vehicle batches (`_vb`).

- **Legacy Prototype (`src/`):**
  - Archived into `legacy_react_prototype.tar.gz`.
  - Lacks the custom Lagos bridge environment, authentic voices, sound design, and shaders.
  - **Never** recreate or mount `src/` to `index.html`.

---

## CRITICAL RULE 2: Vehicle Asset Replacement Protocol

When replacing or adding 3D vehicle assets (GLB files):

### 1. Highway Coordinate Standards
- **Z-Axis = Length of Road:** Highway traffic travels forward towards **`-Z`** (away from camera / player).
- **X-Axis = Width across Lanes:** Each highway lane is **`4.0 meters wide`**. Vehicles must have a width between **`1.8m and 2.5m`** so they stay centered inside their lane.
- **Y-Axis = Height:** `Y = 0` is flush with the asphalt road surface.

### 2. Model Orientation & Axis Alignment
> [!WARNING]
> Many 3D models from Blender or Sketchfab have their length modeled along the **X axis** or have baked diagonal rotations from FBX.
> **NEVER assume a raw GLB model faces forward.**

Always check the model's bounding box and test Y-rotations to ensure:
1. **Length is along the Z axis** (parallel to the road lanes).
2. **Headlights / front bumper face `-Z`** (downstream traffic direction).
3. **Width along X is < 2.5m** (preventing sideways blocking or "parked in the middle of the road" errors).

### 3. Active Vehicle Configuration
In [`public/assets/index-DZDTu90F.js`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/public/assets/index-DZDTu90F.js), vehicles are registered in the `defs` map:
```javascript
let defs = {
  van:   { url: '/assets/lagos_danfo_bus_opt.glb',      len: 5.2, rotY: Math.PI / 2 },
  hatch: { url: '/assets/volkswagen_t3_opt.glb',         len: 5.0, rotY: 147 * Math.PI / 180 },
  sedan: { url: '/assets/2006_toyota_corolla.glb',       len: 4.6, rotY: Math.PI },
  taxi:  { url: '/assets/2005_toyota_corolla_luxel.glb', len: 4.6, rotY: Math.PI },
  bus:   { url: '/assets/lagos_danfo_bus_opt.glb',      len: 5.2, rotY: Math.PI / 2 }
};
```

### 4. Preservation of Materials
- All vehicle models retain **100% of their original textures and materials** (no yellow repainting or color overrides unless explicitly instructed).

### 5. Mandatory Cache-Busting
- After updating `index-DZDTu90F.js`, always increment the query version in [`index.html`](file:///home/afigo/Documents/My-App/Lagos%20Street%20Race/index.html) (e.g., `?v=align4`) to prevent Chrome from loading stale cached orientations.
