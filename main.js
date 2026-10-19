
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// CR7 FOOTBALL STUDIO
// 3D FOOTBALL SIMULATION
// ==========================================

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111d);
scene.fog = new THREE.Fog(0x07111d, 45, 110);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 10, 27);
camera.lookAt(0, 0, -3);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.getElementById('game').appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(0xffffff, 0x263b30, 2));

const mainLight = new THREE.DirectionalLight(0xffffff, 3);
mainLight.position.set(-10, 20, 12);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
scene.add(mainLight);

const stadiumLight = new THREE.PointLight(0xffffff, 100, 50);
stadiumLight.position.set(0, 18, -10);
scene.add(stadiumLight);

// MATERIALS
const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x14713b,
  roughness: 1
});

// FOOTBALL PITCH
const pitch = new THREE.Mesh(
  new THREE.PlaneGeometry(36, 55),
  grassMaterial
);

pitch.rotation.x = -Math.PI / 2;
pitch.receiveShadow = true;
scene.add(pitch);

// GRASS STRIPES
for (let i = 0; i < 10; i++) {
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 2.75),
    new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x1a7941 : 0x126532
    })
  );

  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.012, -22 + i * 5.5);
  scene.add(stripe);
}

// FIELD LINES
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff
});

function fieldLine(points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(p => new THREE.Vector3(p[0], 0.025, p[1]))
  );

  scene.add(new THREE.Line(geometry, lineMaterial));
}

fieldLine([
  [-18, -27], [18, -27],
  [18, 27], [-18, 27], [-18, -27]
]);

fieldLine([[-18, 0], [18, 0]]);

// CENTER CIRCLE
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

// PENALTY AREA
fieldLine([
  [-9, -27], [-9, -19],
  [9, -19], [9, -27]
]);

fieldLine([
  [-4, -27], [-4, -23],
  [4, -23], [4, -27]
]);

// GOALPOST
const postMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.3
});

function addPost(x, y, z, sx, sy, sz) {
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    postMaterial
  );

  post.position.set(x, y, z);
  post.castShadow = true;
  scene.add(post);
}

addPost(-3.66, 1.22, -24, 0.15, 2.44, 0.15);
addPost(3.66, 1.22, -24, 0.15, 2.44, 0.15);
addPost(0, 2.44, -24, 7.46, 0.15, 0.15);

// GOAL NET
const goalNet = new THREE.Mesh(
  new THREE.BoxGeometry(7.3, 2.4, 2.5),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  })
);

goalNet.position.set(0, 1.2, -25.2);
scene.add(goalNet);

// STADIUM STANDS
const standMaterial = new THREE.MeshStandardMaterial({
  color: 0x263449,
  roughness: 0.9
});

function createStand(x, z, width, height, depth) {
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    standMaterial
  );

  stand.position.set(x, height / 2, z);
  stand.receiveShadow = true;
  scene.add(stand);
}

createStand(-21, 0, 7, 12, 55);
createStand(21, 0, 7, 12, 55);
createStand(0, -31, 36, 12, 8);

// STADIUM AUDIENCE
const crowdMaterial = [
  0xffffff, 0xff3333, 0x2266ff,
  0xffcc22, 0x33cc99
].map(color => new THREE.MeshBasicMaterial({ color }));

for (let i = 0; i < 500; i++) {
  const x = (Math.random() - 0.5) * 45;
  const z = (Math.random() - 0.5) * 60 - 2;

  const person = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.18, 0.12),
    crowdMaterial[i % crowdMaterial.length]
  );

  person.position.set(
    x,
    2 + Math.random() * 7,
    z
  );

  scene.add(person);
}

// ==========================================
// PLAYER MODEL
// ==========================================

function createPlayer(teamColor, position, scale = 1) {
  const player = new THREE.Group();

  const shirtMaterial = new THREE.MeshStandardMaterial({
    color: teamColor,
    roughness: 0.75
  });

  const shortsMaterial = new THREE.MeshStandardMaterial({
    color: 0x20242c
  });

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xb77b57
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x20150e
  });

  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
  });

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

  // TORSO
  capsule(
    player, 0.36, 0.65,
    shirtMaterial, 0, 1.35, 0
  );

  // HEAD
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 24, 24),
    skinMaterial
  );

  head.position.set(0, 2.05, 0);
  head.castShadow = true;
  player.add(head);

  // HAIR
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.235, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45
    ),
    hairMaterial
  );

  hair.position.copy(head.position);
  player.add(hair);

  // SHORTS
  capsule(
    player, 0.29, 0.22,
    shortsMaterial, 0, 0.85, 0
  );

  // ARMS
  const leftArm = capsule(
    player, 0.12, 0.52,
    shirtMaterial, -0.48, 1.35, 0
  );

  const rightArm = capsule(
    player, 0.12, 0.52,
    shirtMaterial, 0.48, 1.35, 0
  );

  leftArm.rotation.z = 0.18;
  rightArm.rotation.z = -0.18;

  // HANDS
  for (const side of [-1, 1]) {
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      skinMaterial
    );

    hand.position.set(side * 0.49, 1.02, 0);
    player.add(hand);
  }

  // LEGS
  const legs = [];

  for (const side of [-1, 1]) {
    const leg = capsule(
      player, 0.14, 0.48,
      shirtMaterial, side * 0.19, 0.47, 0
    );

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.12, 0.36),
      bootMaterial
    );

    boot.position.set(side * 0.19, 0.06, -0.1);
    boot.castShadow = true;
    player.add(boot);

    legs.push(leg);
  }

  player.position.set(...position);
  player.scale.setScalar(scale);

  scene.add(player);

  return {
    group: player,
    legs,
    leftArm,
    rightArm
  };
}

// RONALDO-INSPIRED PLAYER
const ronaldo = createPlayer(
  0xc91d32,
  [0, 0, 5],
  1
);

// GOALKEEPER
const goalkeeper = createPlayer(
  0x1766e8,
  [0, 0, -21],
  0.95
);

goalkeeper.group.rotation.y = Math.PI;

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

ball.position.set(0, 0.35, 2);
ball.castShadow = true;
scene.add(ball);

// BALL PATTERN
const ballPattern = new THREE.Mesh(
  new THREE.TorusGeometry(0.18, 0.015, 8, 40),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);

ballPattern.position.copy(ball.position);
scene.add(ballPattern);

// ==========================================
// ANIMATION
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Football rotation
  ball.rotation.x += 0.012;
  ball.rotation.z += 0.008;

  // Pattern follows ball
  ballPattern.position.copy(ball.position);
  ballPattern.quaternion.copy(ball.quaternion);

  // Subtle player movement
  ronaldo.group.position.y = Math.abs(Math.sin(time * 2)) * 0.025;

  ronaldo.legs[0].rotation.x = Math.sin(time * 2) * 0.05;
  ronaldo.legs[1].rotation.x = -Math.sin(time * 2) * 0.05;

  goalkeeper.group.position.y =
    Math.abs(Math.sin(time * 1.8)) * 0.02;

  renderer.render(scene, camera);
}

animate();

// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
