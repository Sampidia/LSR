/**
 * Lagos Street Race — Authentic Player Vehicle Generators
 * 
 * Provides:
 *  - createAuthenticRoadster(THREE, options)
 *  - attachPlayerRockets(THREE, root, config)
 *  - animatePlumes(THREE, plumes, thrust, mats, rMult, iMult)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('three'));
  } else {
    root.PlayerRoadster = factory(root.THREE || root.ThreeGLTF);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE) {

  // Paint presets
  const PAINTS = {
    white:    { color: 0xeeeeee, metalness: 0.25, roughness: 0.28, name: 'Pearl White' },
    lagos:    { color: 0xf5c518, metalness: 0.35, roughness: 0.22, name: 'Lagos Yellow' },
    chrome:   { color: 0xd8e2ec, metalness: 0.92, roughness: 0.08, name: 'Cyber Chrome' },
    midnight: { color: 0x111317, metalness: 0.40, roughness: 0.30, name: 'Midnight Matte' },
    sunset:   { color: 0xff4d26, metalness: 0.50, roughness: 0.20, name: 'Sunset Orange' },
    neonCyan: { color: 0x00e5ff, metalness: 0.60, roughness: 0.15, name: 'Neon Lagos' }
  };

  /**
   * Builds the authentic procedural Roadster with gold quad exhaust rings,
   * glass bubble canopy, carbon splitter/diffuser, LED lightbars, and 4-plume RCS array.
   */
  function createAuthenticRoadster(T, opts = {}) {
    T = T || THREE;
    const group = new T.Group();
    group.name = 'Roadster_Authentic';

    const paintKey = opts.paint || 'white';
    const paintConf = PAINTS[paintKey] || (typeof opts.paint === 'number' ? { color: opts.paint, metalness: 0.3, roughness: 0.25 } : PAINTS.white);

    // High quality PBR materials
    const bodyMat = new T.MeshStandardMaterial({
      color: paintConf.color,
      metalness: paintConf.metalness,
      roughness: paintConf.roughness,
      name: 'ChassisPaint'
    });

    const carbonMat = new T.MeshStandardMaterial({
      color: 0x121417,
      roughness: 0.65,
      metalness: 0.2,
      name: 'CarbonFiber'
    });

    const glassMat = new T.MeshStandardMaterial({
      color: 0x1a2636,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0a192f,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.92,
      name: 'CockpitCanopy'
    });

    const rimMat = new T.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.3,
      metalness: 0.85,
      name: 'Rims'
    });

    const goldRingMat = new T.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.92,
      emissive: 0x664808,
      emissiveIntensity: 0.35,
      name: 'GoldExhaustRings'
    });

    const innerNozzleMat = new T.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.7,
      metalness: 0.5,
      name: 'InnerNozzle'
    });

    const headlightMat = new T.MeshStandardMaterial({
      color: 0xeef8ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.8,
      toneMapped: false,
      name: 'HeadlightGlow'
    });

    const taillightMat = new T.MeshStandardMaterial({
      color: 0xff1020,
      emissive: 0xff0820,
      emissiveIntensity: 3.2,
      toneMapped: false,
      name: 'TaillightGlow'
    });

    // 1. Aerodynamic Curved Chassis
    const chassisGeo = new T.BoxGeometry(1.95, 0.52, 4.3, 2, 2, 4);
    const pos = chassisGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const x = pos.getX(i);

      // Sloped hood towards front (-Z)
      if (z < -0.8 && y > 0) {
        pos.setY(i, y - 0.28 * (Math.abs(z) - 0.8));
      }
      // Tapered nose
      if (z < -1.0) {
        pos.setX(i, x * (1.0 - (Math.abs(z) - 1.0) * 0.12));
      }
      // Rear aerodynamic sweep
      if (z > 1.2 && y > 0) {
        pos.setY(i, y - 0.08 * (z - 1.2));
      }
    }
    chassisGeo.computeVertexNormals();

    const chassisMesh = new T.Mesh(chassisGeo, bodyMat);
    chassisMesh.position.set(0, 0.52, 0);
    chassisMesh.castShadow = true;
    group.add(chassisMesh);

    // 2. Glass Canopy (Aerodynamic Fighter Cockpit Dome)
    const domeGeo = new T.SphereGeometry(0.78, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeo.scale(1.05, 0.64, 2.15);
    const domeMesh = new T.Mesh(domeGeo, glassMat);
    domeMesh.position.set(0, 0.74, 0.15);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    // 3. Carbon Front Splitter & Underbody Floor
    const splitter = new T.Mesh(new T.BoxGeometry(2.04, 0.08, 4.2), carbonMat);
    splitter.position.set(0, 0.22, 0);
    splitter.castShadow = true;
    group.add(splitter);

    // Carbon Diffuser fins in rear
    for (let df of [-0.65, -0.22, 0.22, 0.65]) {
      const fin = new T.Mesh(new T.BoxGeometry(0.03, 0.16, 0.45), carbonMat);
      fin.position.set(df, 0.24, 2.05);
      group.add(fin);
    }

    // 4. Front Xenon Lightbar
    const headBar = new T.Mesh(new T.BoxGeometry(1.68, 0.05, 0.06), headlightMat);
    headBar.position.set(0, 0.52, -2.14);
    group.add(headBar);

    // 5. Rear Cyber Red LED Lightbar
    const tailBar = new T.Mesh(new T.BoxGeometry(1.92, 0.06, 0.06), taillightMat);
    tailBar.position.set(0, 0.68, 2.16);
    group.add(tailBar);

    // 6. Quad Gold Exhaust Rings (authentic to game engine)
    const exhaustPlumes = [];
    const exhaustNozzles = [];
    for (let side of [-1, 1]) {
      // Outer & Inner ring pairs
      for (let offset of [0.34, 0.52]) {
        const ringX = side * offset;
        const ringY = 0.36;
        const ringZ = 2.17;

        // Gold Torus Outer Ring
        const goldTorus = new T.Mesh(new T.TorusGeometry(0.075, 0.018, 12, 24), goldRingMat);
        goldTorus.position.set(ringX, ringY, ringZ);
        group.add(goldTorus);

        // Dark Titanium Inner Cylinder
        const nozzle = new T.Mesh(new T.CylinderGeometry(0.065, 0.055, 0.14, 16, 1, true), innerNozzleMat);
        nozzle.rotation.x = Math.PI / 2;
        nozzle.position.set(ringX, ringY, ringZ - 0.05);
        group.add(nozzle);
        exhaustNozzles.push(nozzle);
      }
    }

    // 7. Hover Wheels / Mag-Lev Pods
    const wheels = [];
    const wheelGeo = new T.CylinderGeometry(0.36, 0.36, 0.3, 24).rotateZ(Math.PI / 2);
    for (let pair of [[-0.94, -1.35], [0.94, -1.35], [-0.94, 1.4], [0.94, 1.4]]) {
      const whGrp = new T.Group();
      whGrp.position.set(pair[0], 0.36, pair[1]);
      const whMesh = new T.Mesh(wheelGeo, rimMat);
      whMesh.castShadow = true;
      whGrp.add(whMesh);

      // Carbon Guard arch
      const guard = new T.Mesh(new T.BoxGeometry(0.32, 0.14, 0.54), carbonMat);
      guard.position.y = 0.16;
      whGrp.add(guard);

      group.add(whGrp);
      wheels.push(whGrp);
    }

    // 8. Ion Thruster Plumes
    const plumeMat = new T.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide
    });

    const coneGeo = new T.CylinderGeometry(0.18, 1.6, 12, 1, true);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, -0.8, 0);

    const plumeMats = {};
    const dMat = (k) => plumeMats[k] = plumeMat.clone();

    const createPlume = (x, y, z, rx, rz, key) => {
      const g = new T.Group();
      g.position.set(x, y, z);
      g.rotation.set(rx, 0, rz);
      const mesh = new T.Mesh(coneGeo, plumeMats[key] || plumeMat);
      g.add(mesh);
      g.scale.set(0, 0, 0);
      g.userData.baseScale = new T.Vector3(1, 1, 1);
      group.add(g);
      return g;
    };

    dMat('rear');
    dMat('down');
    dMat('left');
    dMat('right');

    const plumes = {
      rear: [
        createPlume(-0.43, 0.36, 2.22, -Math.PI / 2, 0, 'rear'),
        createPlume( 0.43, 0.36, 2.22, -Math.PI / 2, 0, 'rear')
      ],
      down: [
        createPlume(-0.65, 0.18, -1.0, 0, 0, 'down'),
        createPlume( 0.65, 0.18, -1.0, 0, 0, 'down'),
        createPlume(-0.65, 0.18,  1.1, 0, 0, 'down'),
        createPlume( 0.65, 0.18,  1.1, 0, 0, 'down')
      ],
      left: [
        createPlume(-1.02, 0.45, -1.6, 0, -Math.PI / 2, 'left'),
        createPlume(-1.02, 0.45,  1.6, 0, -Math.PI / 2, 'left')
      ],
      right: [
        createPlume( 1.02, 0.45, -1.6, 0,  Math.PI / 2, 'right'),
        createPlume( 1.02, 0.45,  1.6, 0,  Math.PI / 2, 'right')
      ]
    };

    group.userData = {
      body: chassisMesh,
      wheels,
      lightBar: tailBar,
      headlights: headBar,
      plumes,
      plumeMats,
      setPaint: (pKey) => {
        const conf = PAINTS[pKey] || PAINTS.white;
        bodyMat.color.setHex(conf.color);
        bodyMat.metalness = conf.metalness;
        bodyMat.roughness = conf.roughness;
      }
    };

    return group;
  }

  /**
   * Attaches dual heavy side rocket thrusters + VTOL thrusters to imported GLB models (Danfo / Tortoise)
   */
  function attachPlayerRockets(T, root, config = {}) {
    T = T || THREE;
    const plumeMat = new T.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide
    });

    const coneGeo = new T.CylinderGeometry(0.24, 1.8, 12, 1, true);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, -0.8, 0);

    const plumeMats = {
      rear: plumeMat.clone(),
      down: plumeMat.clone(),
      left: plumeMat.clone(),
      right: plumeMat.clone()
    };

    const makePlume = (pos, rx, rz, key, baseScale = 1.3) => {
      const g = new T.Group();
      g.position.copy(pos);
      g.rotation.set(rx, 0, rz);
      const mesh = new T.Mesh(coneGeo, plumeMats[key]);
      g.add(mesh);
      g.scale.set(0, 0, 0);
      g.userData.baseScale = new T.Vector3(baseScale, baseScale, baseScale);
      root.add(g);
      return g;
    };

    const c = config;
    const plumes = {
      rear: [
        makePlume(c.rearL || new T.Vector3(-1.25, 0.75, 1.8), -Math.PI / 2, 0, 'rear', 1.4),
        makePlume(c.rearR || new T.Vector3( 1.25, 0.75, 1.8), -Math.PI / 2, 0, 'rear', 1.4)
      ],
      down: [
        makePlume(c.downL || new T.Vector3(-1.25, 0.35, 0.2), 0, 0, 'down', 1.0),
        makePlume(c.downR || new T.Vector3( 1.25, 0.35, 0.2), 0, 0, 'down', 1.0)
      ],
      left: [
        makePlume(c.rcsL || new T.Vector3(-1.35, 0.85, 0.3), 0, -Math.PI / 2, 'left', 0.9)
      ],
      right: [
        makePlume(c.rcsR || new T.Vector3( 1.35, 0.85, 0.3), 0,  Math.PI / 2, 'right', 0.9)
      ]
    };

    root.userData = root.userData || {};
    root.userData.plumes = plumes;
    root.userData.plumeMats = plumeMats;
    return root;
  }

  /**
   * Real-time thruster plume animation
   */
  function animatePlumes(T, plumes, thrust, mats, rMult = 1, iMult = 1) {
    if (!plumes) return;
    const active = thrust > 0.02;
    const lenScale = active ? (0.28 + thrust * 0.95) * rMult : 0;
    const radScale = active ? (0.55 + thrust * 0.50) * iMult : 0;

    for (let i = 0; i < plumes.length; i++) {
      const p = plumes[i];
      const base = p.userData.baseScale || { x: 1, y: 1, z: 1 };
      if (active) {
        p.visible = true;
        p.scale.set(base.x * radScale, base.y * lenScale, base.z * radScale);
      } else {
        p.scale.set(1e-4, 1e-4, 1e-4);
        p.visible = false;
      }
    }

    if (mats) {
      const arr = Array.isArray(mats) ? mats : [mats];
      for (const m of arr) {
        if (m) m.opacity = Math.min(1.0, 0.45 + thrust * 0.55);
      }
    }
  }

  return {
    PAINTS,
    createAuthenticRoadster,
    attachPlayerRockets,
    animatePlumes
  };
});
