
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// CR7 STUDIO - BICYCLE KICK PROTOTYPE
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111d);
scene.fog = new THREE.Fog(0x07111d, 45, 110);

const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 200
);
camera.position.set(0, 8, 27);
camera.lookAt(0, 1, -7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.getElementById('game').appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.HemisphereLight(0xffffff, 0x263b30, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(-10, 20, 12);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
scene.add(sunlight);

for (const x of [-15, 15]) {
  const light = new THREE.PointLight(0xffffff, 100, 55);
  light.position.set(x, 15, -8);
  scene.add(light);
}

// PITCH
const pitch = new THREE.Mesh(
  new THREE.PlaneGeometry(36, 55),
  new THREE.MeshStandardMaterial({ color: 0x14713b, roughness: 1 })
);
pitch.rotation.x = -Math.PI / 2;
pitch.receiveShadow = true;
scene.add(pitch);

// GRASS STRIPES
for (let i = 0; i < 10; i++) {
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 2.75),
    new THREE.MeshBasicMaterial({
      color: i % 2 ? 0x126532 : 0x1a7941
    })
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.012, -22 + i * 5.5);
  scene.add(stripe);
}

// FIELD MARKINGS
const whiteLine = new THREE.LineBasicMaterial({ color: 0xffffff });

function drawLine(points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(([x, z]) => new THREE.Vector3(x, 0.03, z))
  );
  scene.add(new THREE.Line(geometry, whiteLine));
}

drawLine([
  [-18, -27], [18, -27], [18, 27],
  [-18, 27], [-18, -27]
]);
drawLine([[-18, 0], [18, 0]]);
drawLine([[-9, -27], [-9, -19], [9, -19], [9, -27]]);

const centerCircle = new THREE.Mesh(
  new THREE.RingGeometry(4.95, 5, 64),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
);
centerCircle.rotation.x = -Math.PI / 2;
centerCircle.position.y = 0.03;
scene.add(centerCircle);

// GOAL
const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

function addPost(x, y, z, sx, sy, sz) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz), goalMaterial
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);
}

addPost(-3.66, 1.22, -24, 0.15, 2.44, 0.15);
addPost(3.66, 1.22, -24, 0.15, 2.44, 0.15);
addPost(0, 2.44, -24, 7.46, 0.15, 0.15);

const net = new THREE.Mesh(
  new THREE.BoxGeometry(7.3, 2.4, 2.5),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  })
);
net.position.set(0, 1.2, -25.2);
scene.add(net);

// STANDS
const standMaterial = new THREE.MeshStandardMaterial({
  color: 0x263449
});

function stand(x, z, width, height, depth) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    standMaterial
  );
  mesh.position.set(x, height / 2, z);
  scene.add(mesh);
}

stand(-21, 0, 7, 12, 55);
stand(21, 0, 7, 12, 55);
stand(0, -31, 36, 12, 8);

// CROWD
const crowdColors = [0xffffff, 0xff3333, 0x2266ff, 0xffcc22];

for (let i = 0; i < 500; i++) {
  const person = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.18, 0.12),
    new THREE.MeshBasicMaterial({
      color: crowdColors[i % crowdColors.length]
    })
  );
  person.position.set(
    (Math.random() - 0.5) * 45,
    2 + Math.random() * 7,
    (Math.random() - 0.5) * 60 - 2
  );
  scene.add(person);
}

// ==========================================
// ARTICULATED PLAYER
// ==========================================

function makePlayer(teamColor, position) {
  const root = new THREE.Group();
  scene.add(root);
  root.position.set(...position);

  const shirt = new THREE.MeshStandardMaterial({ color: teamColor });
  const shorts = new THREE.MeshStandardMaterial({ color: 0x171b25 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb77b57 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x20150e });
  const boots = new THREE.MeshStandardMaterial({ color: 0xffffff });

  function capsule(parent, radius, length, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, 5, 12),
      material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // HIP AND BODY
  const body = new THREE.Group();
  body.position.y = 0.85;
  root.add(body);

  capsule(body, 0.34, 0.65, shirt, 0, 0.5, 0);
  capsule(body, 0.28, 0.22, shorts, 0, 0.02, 0);

  // HEAD
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 24, 24), skin
  );
  head.position.set(0, 1.25, 0);
  body.add(head);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.235, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45
    ), hair
  );
  hairCap.position.copy(head.position);
  body.add(hairCap);

  // ARMS
  const arms = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.38, 0.95, 0);
    body.add(arm);

    capsule(arm, 0.12, 0.45, shirt, 0, -0.25, 0);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16), skin
    );
    hand.position.set(0, -0.52, 0);
    arm.add(hand);

    arms.push(arm);
  }

  // LEGS WITH PIVOTS
  const legs = [];

  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.18, 0.05, 0);
    root.add(leg);

    capsule(leg, 0.14, 0.48, shirt, 0, -0.30, 0);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.12, 0.36), boots
    );
    boot.position.set(0, -0.63, -0.12);
    boot.castShadow = true;
    leg.add(boot);

    legs.push(leg);
  }

  return { root, body, legs, arms };
}

// RED PLAYER AND BLUE GOALKEEPER
const ronaldo = makePlayer(0xc91d32, [0, 0, 5]);
const goalkeeper = makePlayer(0x1766e8, [0, 0, -21]);

goalkeeper.root.rotation.y = Math.PI;

// ==========================================
// FOOTBALL
// ==========================================

const ball = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5
  })
);
ball.castShadow = true;
scene.add(ball);

const ballPattern = new THREE.Mesh(
  new THREE.TorusGeometry(0.18, 0.015, 8, 40),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);
scene.add(ballPattern);

// ==========================================
// ANIMATION HELPERS
// ==========================================

const clock = new THREE.Clock();
const duration = 8;

function smooth(a, b, t) {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ==========================================
// BICYCLE KICK ANIMATION
// ==========================================

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  const t = time % duration;

  const approach = smooth(0.5, 1.5, t);
  const jump = smooth(1.5, 2.2, t);
  const kick = smooth(2.1, 2.55, t);
  const landing = smooth(3.0, 4.0, t);

  // PLAYER MOVEMENT
  ronaldo.root.position.z = lerp(5, 3.8, approach);

  // BODY LEANS BACK IN THE AIR
  ronaldo.root.position.y = jump * (1 - landing) * 1.25;
  ronaldo.body.rotation.x = -jump * (1 - landing) * 0.85;

  // BICYCLE KICK LEGS
  ronaldo.legs[0].rotation.x = lerp(
    0, -2.4, kick * (1 - landing)
  );

  ronaldo.legs[1].rotation.x = lerp(
    0, 1.5, jump * (1 - landing)
  );

  // ARMS SPREAD FOR BALANCE
  ronaldo.arms[0].rotation.z = jump * (1 - landing) * 1.1;
  ronaldo.arms[1].rotation.z = -jump * (1 - landing) * 1.1;

  // FOOTBALL FLIGHT
  const flight = smooth(2.45, 3.8, t);
  const ballX = 0;
  const ballZ = lerp(2, -23, flight);
  const ballY = 0.35 + Math.sin(flight * Math.PI) * 3.0;

  ball.position.set(
    ballX,
    t > 2.45 && t < 4.0 ? ballY : 0.35,
    t > 2.45 && t < 4.0 ? ballZ : 2
  );

  ball.rotation.x += 0.12;
  ball.rotation.z += 0.08;

  ballPattern.position.copy(ball.position);
  ballPattern.quaternion.copy(ball.quaternion);

  // GOALKEEPER DIVE
  const dive = smooth(3.0, 3.6, t);

  goalkeeper.root.rotation.z = -dive * (1 - landing) * 1.0;
  goalkeeper.root.position.x = dive * 1.3;
  goalkeeper.root.position.y = dive * 0.15;

  if (t > 4.0) {
    goalkeeper.root.rotation.z = 0;
    goalkeeper.root.position.x = 0;
    goalkeeper.root.position.y = 0;
  }

  renderer.render(scene, camera);
}

animate();

// ==========================================
// RESPONSIVE
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
