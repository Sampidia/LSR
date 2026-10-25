/**
 * danfo-injector.js  —  plain (non-module) script
 *
 * Loads lagos_danfo_bus_opt.glb and volkswagen_t3_opt.glb via
 * window.ThreeGLTF.GLTFLoader (from three-gltf.js IIFE bundle).
 *
 * Stores prepared scene roots in window.__danfoTemps[].
 * The compiled bundle's vehicle factory T(e) has been patched to check
 * window.__danfoTemps when spawning a 'van' — it clones a template and
 * returns a real Danfo GLB instead of the procedural box mesh.
 *
 * Materials use window.__vendorTHREE.MeshPhysicalMaterial so they render
 * correctly under the game's existing lighting/env-map setup.
 */
(function () {
  'use strict';

  var DANFO_URLS  = [
    '/assets/lagos_danfo_bus_opt.glb',
    '/assets/volkswagen_t3_opt.glb',
  ];
  var VAN_LENGTH  = 5.0;   // scale to match vf.van.l ≈ 5.2

  window.__danfoTemps = [];
  window.__danfoIdx   = 0;

  /* ── Poll until ThreeGLTF and __vendorTHREE are both available ─────────── */
  function waitAndLoad() {
    if (!window.ThreeGLTF || !window.ThreeGLTF.GLTFLoader) {
      setTimeout(waitAndLoad, 50);
      return;
    }

    // Use vendor THREE for materials (same instance as compiled bundle → same renderer)
    var THREE      = window.__vendorTHREE || window.ThreeGLTF;
    var GLTFLoader = window.ThreeGLTF.GLTFLoader;

    var yellowPaint = new THREE.MeshPhysicalMaterial({
      color: 0xf5c518,
      roughness: 0.22,
      metalness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.9,
      envMapIntensity: 1.1,
    });

    var pending = DANFO_URLS.length;

    DANFO_URLS.forEach(function (url) {
      var loader = new GLTFLoader();
      loader.load(
        url,
        function (gltf) {
          var root = gltf.scene;

          // Face forward (same direction as game traffic)
          root.rotation.y = Math.PI;

          // Scale: longest horiz side → VAN_LENGTH
          var bb1 = new (THREE.Box3 || window.__vendorTHREE.Box3)().setFromObject(root);
          var sz  = new (THREE.Vector3 || window.__vendorTHREE.Vector3)();
          bb1.getSize(sz);
          var s = VAN_LENGTH / Math.max(sz.x, sz.z, 0.001);
          root.scale.set(s, s, s);

          // Sit on y = 0
          var bb2 = new (THREE.Box3 || window.__vendorTHREE.Box3)().setFromObject(root);
          root.position.y = -bb2.min.y;

          // Preserve 100% original GLB textures & materials — enable shadows
          root.traverse(function (child) {
            if (!child.isMesh) return;
            child.castShadow    = true;
            child.receiveShadow = false;
          });

          window.__danfoTemps.push(root);
          console.log('[Danfo] Loaded: ' + url.split('/').pop() +
                      ' (' + window.__danfoTemps.length + '/' + DANFO_URLS.length + ')');

          if (--pending === 0) {
            console.log('[Danfo] Both GLBs ready \u2713  — new van spawns will use real Danfo models');
          }
        },
        function (xhr) {
          if (xhr.total) {
            console.log('[Danfo] ' + url.split('/').pop() + ' ' +
                        Math.round(xhr.loaded / xhr.total * 100) + '%');
          }
        },
        function (err) {
          console.warn('[Danfo] Load error:', url.split('/').pop(), err);
          if (--pending === 0 && window.__danfoTemps.length > 0) {
            console.log('[Danfo] Partial load — ' + window.__danfoTemps.length + ' templates ready');
          }
        }
      );
    });
  }

  waitAndLoad();
})();
