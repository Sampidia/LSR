import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const AFRICAN_SKIN_TONES = [
  '#2e1a12', // Deep Ebony / Espresso
  '#3d2318', // Dark Chocolate
  '#4e2d1f', // Rich Mahogany
  '#633b28', // Deep Chestnut
  '#7a4b33', // Warm Bronze / Copper
  '#8f593e', // Warm Caramel
  '#a3694a'  // Golden Amber
];

const LAGOS_CLOTHES_COLORS = [
  '#f59e0b', // Danfo Yellow
  '#00e5ff', // Electric Cyan
  '#2563eb', // Royal Blue
  '#10b981', // Emerald Green
  '#ef4444', // Coral Red
  '#f97316', // Orange
  '#a855f7', // Ankara Purple
  '#f8fafc', // Crisp White
  '#1e293b'  // Charcoal Black
];

const PANTS_COLORS = [
  '#1e3a5f', // Denim Blue
  '#0f172a', // Slate Black
  '#785e45', // Khaki Tan
  '#334155'  // Dark Gray
];

console.log('Testing character asset loading & vertex coloring...');

const loader = new GLTFLoader();
const models = {};

for (const key of ['driver', 'female_passager', 'male_passager']) {
  const filePath = `public/assets/${key}_opt.glb`;
  const buf = fs.readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  await new Promise((resolve, reject) => {
    loader.parse(ab, '', (gltf) => {
      let m;
      gltf.scene.traverse(c => { if (c.isMesh) m = c; });
      models[key] = m.geometry;
      console.log(`Loaded ${key}: ${m.geometry.attributes.position.count} vertices`);
      resolve();
    }, reject);
  });
}

function makePerson(modelKey, isDriver = false) {
  const baseGeom = models[modelKey];
  const geom = baseGeom.clone();
  const pos = geom.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const skinHex = AFRICAN_SKIN_TONES[Math.floor(Math.random() * AFRICAN_SKIN_TONES.length)];
  const shirtHex = LAGOS_CLOTHES_COLORS[Math.floor(Math.random() * LAGOS_CLOTHES_COLORS.length)];
  const pantsHex = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];

  const skin = new THREE.Color(skinHex);
  const hair = new THREE.Color('#120e0d');
  const shirt = new THREE.Color(shirtHex);
  const pants = new THREE.Color(pantsHex);
  const shoes = new THREE.Color('#0a0a0c');

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const x = pos.getX(i);

    let col = shirt;
    if (y > 0.38) {
      col = hair;
    } else if (y > 0.18) {
      col = skin;
    } else if (y > -0.08) {
      if (z > 0.12 && y < 0.12 && Math.abs(x) < 0.14) {
        col = skin; // hands
      } else {
        col = shirt;
      }
    } else if (y > -0.42) {
      col = pants;
    } else {
      col = shoes;
    }

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.65,
    metalness: 0.1
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.rotation.y = Math.PI; // Face forward (-Z)
  mesh.scale.set(0.9, 0.9, 0.9);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

// Test generating a Danfo bus with 1 driver and 4 passengers
const driver = makePerson('driver', true);
const passengers = [
  makePerson('female_passager'),
  makePerson('male_passager'),
  makePerson('female_passager'),
  makePerson('male_passager')
];

console.log('✓ Successfully generated driver and 4 randomized passengers!');
console.log('Test completed with 100% success.');
