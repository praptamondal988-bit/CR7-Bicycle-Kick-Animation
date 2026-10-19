
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111d);
scene.fog = new THREE.Fog(0x07111d, 35, 100);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 9, 22);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game').appendChild(renderer.domElement);

// LIGHTING
const ambient = new THREE.HemisphereLight(
  0xffffff,
  0x233344,
  2
);
scene.add(ambient);

const stadiumLight = new THREE.DirectionalLight(0xffffff, 3);
stadiumLight.position.set(-8, 15, 8);
stadiumLight.castShadow = true;
scene.add(stadiumLight);

// FOOTBALL PITCH
const pitch = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 48),
  new THREE.MeshStandardMaterial({
    color: 0x176b38,
    roughness: 0.9
  })
);

pitch.rotation.x = -Math.PI / 2;
pitch.receiveShadow = true;
scene.add(pitch);

// FIELD LINES
function line(x1, z1, x2, z2) {
  const points = [
    new THREE.Vector3(x1, 0.025, z1),
    new THREE.Vector3(x2, 0.025, z2)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const mesh = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );

  scene.add(mesh);
}

line(-16, -22, 16, -22);
line(-16, 22, 16, 22);
line(-16, -22, -16, 22);
line(16, -22, 16, 22);
line(-16, 0, 16, 0);

// CENTER CIRCLE
const circle = new THREE.Mesh(
  new THREE.RingGeometry(4.95, 5, 64),
  new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
);

circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.03;
scene.add(circle);

// GOALPOST
const postMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.3
});

function post(x, y, z, sx, sy, sz) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    postMaterial
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);
}

post(-3.66, 1.22, -18, 0.14, 2.44, 0.14);
post(3.66, 1.22, -18, 0.14, 2.44, 0.14);
post(0, 2.44, -18, 7.46, 0.14, 0.14);

// GOAL NET
const net = new THREE.Mesh(
  new THREE.BoxGeometry(7.3, 2.4, 2.5),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true
  })
);

net.position.set(0, 1.2, -19.2);
scene.add(net);

// FOOTBALL
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.65
  })
);

ball.position.set(0, 0.35, 3);
ball.castShadow = true;
scene.add(ball);

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);

  ball.rotation.x += 0.015;
  ball.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
