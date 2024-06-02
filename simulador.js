import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const canvas = document.querySelector("#canvas");
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let dt = 0;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 400;
controls.enableDamping = true;

function updatePositions(bodies, dt) {
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i];
    let force = new THREE.Vector3(0, 0, 0);

    for (let j = 0; j < bodies.length; j++) {
      if (i !== j) {
        let other = bodies[j];
        let distance = body.position.distanceTo(other.position);
        let direction = new THREE.Vector3()
          .subVectors(other.position, body.position)
          .normalize();
        let magnitude = (body.mass * other.mass) / (distance * distance);
        force.add(direction.multiplyScalar(magnitude));
      }
    }

    let acceleration = force.divideScalar(body.mass);
    body.velocity.add(acceleration.multiplyScalar(dt));
  }

  bodies.forEach((body) => {
    body.position.add(body.velocity.clone().multiplyScalar(dt));
  });
}

class Body {
  constructor(position, velocity, mass, color) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.color = color;
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  updateMesh() {
    this.mesh.position.copy(this.position);
  }
}

const bodies = [
  new Body(
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(0, 0, 0),
    5,
    0xff0000
  ),
  new Body(new THREE.Vector3(5, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0x00ff00),
  new Body(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, 0), 5, 0x0000ff),
];

function addScrollListeners() {
  const scrolls = document.querySelectorAll(
    '.scroll-container input[type="range"]'
  );
  scrolls.forEach((scroll) => {
    scroll.addEventListener("input", () => {
      bodies.forEach((body, index) => {
        body.position.set(
          parseFloat(document.getElementById(`scrollX${index + 1}`).value) || 0,
          parseFloat(document.getElementById(`scrollY${index + 1}`).value) || 0,
          parseFloat(document.getElementById(`scrollZ${index + 1}`).value) || 0
        );
        body.updateMesh();
      });
    });
  });
}
function animate() {
  requestAnimationFrame(animate);

  const dt = 0.01;
  updatePositions(bodies, dt);
  bodies.forEach((body) => body.updateMesh());

  renderer.render(scene, camera);
  controls.update();
}

document.getElementById("reset-button").addEventListener("click", () => {
  dt = 0;
  bodies[0].position.set(-5, 0, 0);
  bodies[0].velocity.set(0, 0, 0);
  bodies[1].position.set(5, 0, 0);
  bodies[1].velocity.set(0, 0, 0);
  bodies[2].position.set(0, 5, 0);
  bodies[2].velocity.set(0, 0, 0);
  bodies.forEach((body) => body.updateMesh());
});

document.getElementById("simulator-button").addEventListener("click", () => {
  dt = 0.1;
  bodies[0].mass = parseFloat(document.getElementById("masa1").value) || 1;
  bodies[0].velocity.set(
    parseFloat(document.getElementById("velocidad1").value) || 0,
    0,
    0
  );
  bodies[1].mass = parseFloat(document.getElementById("masa2").value) || 1;
  bodies[1].velocity.set(
    parseFloat(document.getElementById("velocidad2").value) || 0,
    0,
    0
  );
  bodies[2].mass = parseFloat(document.getElementById("masa3").value) || 1;
  bodies[2].velocity.set(
    parseFloat(document.getElementById("velocidad3").value) || 0,
    0,
    0
  );

  // Actualizar posiciones iniciales
  bodies[0].position.set(
    parseFloat(document.getElementById("scrollX1").value) || 0,
    parseFloat(document.getElementById("scrollY1").value) || 0,
    parseFloat(document.getElementById("scrollZ1").value) || 0
  );
  bodies[1].position.set(
    parseFloat(document.getElementById("scrollX2").value) || 0,
    parseFloat(document.getElementById("scrollY2").value) || 0,
    parseFloat(document.getElementById("scrollZ2").value) || 0
  );
  bodies[2].position.set(
    parseFloat(document.getElementById("scrollX3").value) || 0,
    parseFloat(document.getElementById("scrollY3").value) || 0,
    parseFloat(document.getElementById("scrollZ3").value) || 0
  );

  bodies.forEach((body) => body.updateMesh());
});
addScrollListeners();
animate();
