/**
 * css3d-billboard.js — Lagos Street Race
 * ─────────────────────────────────────────────────────────────────────────
 * Approach A: Three.js CSS3DRenderer for in-world 3D Highway Billboards
 * Projects real HTML ad iframes (728×90, 468×60, 300×250) onto 3D roadside gantries
 * using real-time CSS 3D matrix transforms synchronized with the WebGL camera.
 * ─────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from './vendor/CSS3DRenderer.js';

(function () {
  'use strict';

  // Adsterra Active Production Zones
  var ZONES = {
    // 300x250 Medium Rectangle (High CPM, fits 14m × 7m billboard face with 1:1 pixel aspect)
    '300x250': {
      key: 'd63c5535d695dc8fc37ba5d09d406934',
      scriptUrl: 'https://bauval.org/22/d63c5535d695dc8fc37ba5d09d406934',
      width: 300,
      height: 250,
      worldWidth: 8.4,
      worldHeight: 7.0,
    },
    // 728x90 Leaderboard (Wide horizontal panoramic highway billboard)
    '728x90': {
      key: 'b9e6f3bd29d22d1fa424821a8efd89e7',
      scriptUrl: 'https://bauval.org/22/b9e6f3bd29d22d1fa424821a8efd89e7',
      width: 728,
      height: 90,
      worldWidth: 13.6,
      worldHeight: 2.8,
    },
    // 468x60 Full Banner (Standard highway strip)
    '468x60': {
      key: 'a17715ea07b1b1610aa56994fd732a79',
      scriptUrl: 'https://bauval.org/22/a17715ea07b1b1610aa56994fd732a79',
      width: 468,
      height: 60,
      worldWidth: 12.0,
      worldHeight: 2.6,
    }
  };

  var cssRenderer = null;
  var cssScene = null;
  var cssBillboards = [];
  var _tmpVec = new THREE.Vector3();
  var _tmpQuat = new THREE.Quaternion();
  var _forwardVec = new THREE.Vector3(0, 0, 1);

  function createAdElement(zone) {
    var wrapper = document.createElement('div');
    wrapper.className = 'lsr-3d-billboard-node';
    wrapper.style.width = zone.width + 'px';
    wrapper.style.height = zone.height + 'px';
    wrapper.style.background = '#060a12';
    wrapper.style.border = '3px solid #1a2233';
    wrapper.style.borderRadius = '8px';
    wrapper.style.boxShadow = '0 0 35px rgba(0, 240, 255, 0.45), inset 0 0 15px rgba(0, 0, 0, 0.8)';
    wrapper.style.overflow = 'hidden';
    wrapper.style.pointerEvents = 'auto';

    var iframe = document.createElement('iframe');
    iframe.style.width = zone.width + 'px';
    iframe.style.height = zone.height + 'px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.setAttribute('loading', 'lazy');

    var bannerHtml = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;padding:0;width:' + zone.width + 'px;height:' + zone.height + 'px;overflow:hidden;background:#05070c;display:flex;align-items:center;justify-content:center;}</style>' +
      '</head><body>' +
      '<script type="text/javascript">' +
      'atOptions = {' +
      "  'key' : '" + zone.key + "'," +
      "  'format' : 'iframe'," +
      "  'height' : " + zone.height + "," +
      "  'width' : " + zone.width + "," +
      "  'params' : {}" +
      '};' +
      '<\/script>' +
      '<script type="text/javascript" src="' + zone.scriptUrl + '"><\/script>' +
      '</body></html>';

    iframe.srcdoc = bannerHtml;
    wrapper.appendChild(iframe);
    return wrapper;
  }

  function initCSS3D() {
    var g = window.__GAME__ && window.__GAME__.game;
    if (!g || !g.scene || !g.camera || !g.world || !g.world.billboards) {
      setTimeout(initCSS3D, 200);
      return;
    }

    // 1. Initialize CSS3D Renderer Layer
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.id = 'css3d-ad-layer';
    cssRenderer.domElement.style.position = 'fixed';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.width = '100%';
    cssRenderer.domElement.style.height = '100%';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.zIndex = '3'; // Above WebGL scene, below HUD
    document.body.appendChild(cssRenderer.domElement);

    cssScene = new THREE.Scene();

    // 2. Pair highway billboards with alternating ad formats across all ring slots:
    var worldBoards = g.world.billboards;
    var slotConfigs = [ZONES['300x250'], ZONES['728x90'], ZONES['300x250'], ZONES['728x90']];
    var count = Math.min(slotConfigs.length, worldBoards.length);

    for (var i = 0; i < count; i++) {
      var zone = slotConfigs[i % slotConfigs.length];
      var adEl = createAdElement(zone);
      var cssObj = new CSS3DObject(adEl);

      // Scale to world meters
      var scaleX = zone.worldWidth / zone.width;
      var scaleY = zone.worldHeight / zone.height;
      cssObj.scale.set(scaleX, scaleY, 1);
      cssObj.position.set(0, 0, 1e5); // Initially parked off-screen

      cssScene.add(cssObj);
      cssBillboards.push({
        cssObj: cssObj,
        gantry: worldBoards[i],
        zone: zone,
      });
    }

    // 3. Keep size synced with viewport
    window.addEventListener('resize', function () {
      if (cssRenderer) {
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    // 4. Hook into Game Render Loop
    var origRender = g.render.bind(g);
    g.render = function () {
      origRender();

      var playerZ = (g.player && g.player.position) ? g.player.position.z : 0;

      // Synchronize 3D billboard positions with highway roadside billboards
      for (var j = 0; j < cssBillboards.length; j++) {
        var item = cssBillboards[j];
        var gantry = item.gantry;
        var cssObj = item.cssObj;

        // Distance culling: Only render when within 220m in front of camera
        var isVisibleOnRoad = gantry && gantry.position.z <= 2000 &&
                              (gantry.position.z < playerZ + 15) &&
                              (gantry.position.z > playerZ - 220);

        if (!isVisibleOnRoad) {
          cssObj.position.set(0, 0, 1e5);
        } else {
          var boardMesh = gantry.userData && gantry.userData.board;
          if (boardMesh) {
            // The 3D in-world billboard face has geometry centered at local (0, 14.5, -0.03).
            // Elevate to Y = 14.5m and offset slightly forward (+0.08m in local Z) along the
            // billboard normal so the CSS3D ad mounts cleanly on the billboard frame at the proper
            // roadside setback distance (matching in-game billboard ads) rather than down on the road barrier / lanes.
            _tmpVec.set(0, 14.5, 0.08);
            boardMesh.localToWorld(_tmpVec);
            boardMesh.getWorldQuaternion(_tmpQuat);

            cssObj.position.copy(_tmpVec);
            cssObj.quaternion.copy(_tmpQuat);
          }
        }
      }

      // Render CSS3D scene matching current camera perspective
      if (cssRenderer && cssScene && g.camera) {
        cssRenderer.render(cssScene, g.camera);
      }
    };

    console.log('[LSR 3D Ads] CSS3DRenderer active — 300×250 and 728×90 billboards live in 3D world space.');
  }

  // Start initialization after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initCSS3D, 500); });
  } else {
    setTimeout(initCSS3D, 500);
  }

  // Global controller for testing or dynamic zone updates
  window.__LSR_CSS3D__ = {
    zones: ZONES,
    billboards: cssBillboards,
  };

})();
