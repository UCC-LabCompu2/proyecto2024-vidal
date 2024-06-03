import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

// Variables globales
const MIN_DISTANCE = 0.1; // Distancia mínima para evitar divisiones por cero
let dt = 0.01;
let simulationActive = false;

// Elementos de la escena
const scene = new THREE.Scene();
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

const plane = new THREE.GridHelper(100, 30);
scene.add(plane);

const planeVertical1 = new THREE.GridHelper(100, 30);
planeVertical1.rotation.x = Math.PI / 2;
scene.add(planeVertical1);

const planeVerticalZ = new THREE.GridHelper(100, 30);
planeVerticalZ.rotation.z = Math.PI / 2;
scene.add(planeVerticalZ);

// Cámara y controles
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 400;
controls.enableDamping = true;

// Funciones de simulación
function updatePositions(bodies, dt) {
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i];
    let force = new THREE.Vector3(0, 0, 0);

    for (let j = 0; j < bodies.length; j++) {
      if (i !== j) {
        let other = bodies[j];
        let distance = body.position.distanceTo(other.position);

        if (distance > MIN_DISTANCE) {
          let direction = new THREE.Vector3()
            .subVectors(other.position, body.position)
            .normalize();
          let magnitude = (body.mass * other.mass) / (distance * distance);
          force.add(direction.multiplyScalar(magnitude));
        } else {
          // Aplica una fuerza de repulsión si están demasiado cerca
          let repulsion = new THREE.Vector3()
            .subVectors(body.position, other.position)
            .normalize()
            .multiplyScalar(1000);
          force.add(repulsion);
        }
      }
    }

    let acceleration = force.divideScalar(body.mass);
    body.velocity.add(acceleration.multiplyScalar(dt));
  }

  bodies.forEach((body) => {
    body.position.add(body.velocity.clone().multiplyScalar(dt));
  });
}

// Clase Body
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

// Creación de cuerpos
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

// Funciones de inicialización y escucha de eventos
function setupInitialScrollValues() {
  // Cuerpo 1
  document.getElementById("scrollX1").value = bodies[0].position.x;
  document.getElementById("scrollY1").value = bodies[0].position.y;
  document.getElementById("scrollZ1").value = bodies[0].position.z;

  // Cuerpo 2
  document.getElementById("scrollX2").value = bodies[1].position.x;
  document.getElementById("scrollY2").value = bodies[1].position.y;
  document.getElementById("scrollZ2").value = bodies[1].position.z;

  // Cuerpo 3
  document.getElementById("scrollX3").value = bodies[2].position.x;
  document.getElementById("scrollY3").value = bodies[2].position.y;
  document.getElementById("scrollZ3").value = bodies[2].position.z;
}

function addScrollListeners() {
  // Cuerpo 1
  document.getElementById("scrollX1").addEventListener("input", () => {
    bodies[0].position.x =
      parseFloat(document.getElementById("scrollX1").value) || 0;
    bodies[0].updateMesh();
  });

  document.getElementById("scrollY1").addEventListener("input", () => {
    bodies[0].position.y =
      parseFloat(document.getElementById("scrollY1").value) || 0;
    bodies[0].updateMesh();
  });

  document.getElementById("scrollZ1").addEventListener("input", () => {
    bodies[0].position.z =
      parseFloat(document.getElementById("scrollZ1").value) || 0;
    bodies[0].updateMesh();
  });

  // Cuerpo 2
  document.getElementById("scrollX2").addEventListener("input", () => {
    bodies[1].position.x =
      parseFloat(document.getElementById("scrollX2").value) || 0;
    bodies[1].updateMesh();
  });

  document.getElementById("scrollY2").addEventListener("input", () => {
    bodies[1].position.y =
      parseFloat(document.getElementById("scrollY2").value) || 0;
    bodies[1].updateMesh();
  });

  document.getElementById("scrollZ2").addEventListener("input", () => {
    bodies[1].position.z =
      parseFloat(document.getElementById("scrollZ2").value) || 0;
    bodies[1].updateMesh();
  });

  // Cuerpo 3
  document.getElementById("scrollX3").addEventListener("input", () => {
    bodies[2].position.x =
      parseFloat(document.getElementById("scrollX3").value) || 0;
    bodies[2].updateMesh();
  });

  document.getElementById("scrollY3").addEventListener("input", () => {
    bodies[2].position.y =
      parseFloat(document.getElementById("scrollY3").value) || 0;
    bodies[2].updateMesh();
  });

  document.getElementById("scrollZ3").addEventListener("input", () => {
    bodies[2].position.z =
      parseFloat(document.getElementById("scrollZ3").value) || 0;
    bodies[2].updateMesh();
  });
}

// Función principal de animación
function animate() {
  requestAnimationFrame(animate);

  if (simulationActive) {
    updatePositions(bodies, dt);
    bodies.forEach((body) => body.updateMesh());
  }

  renderer.render(scene, camera);
  controls.update();
}

// Evento de reinicio
document.getElementById("reset-button").addEventListener("click", () => {
  simulationActive = false;
  dt = 0;
  bodies[0].position.set(-5, 0, 0);
  bodies[0].velocity.set(0, 0, 0);
  bodies[1].position.set(5, 0, 0);
  bodies[1].velocity.set(0, 0, 0);
  bodies[2].position.set(0, 5, 0);
  bodies[2].velocity.set(0, 0, 0);
  setupInitialScrollValues();
  bodies.forEach((body) => body.updateMesh());
});

// Evento de inicio de simulación
document.getElementById("simulator-button").addEventListener("click", () => {
  var masa1 = parseFloat(document.getElementById("masa1").value) || 1;
  var masa2 = parseFloat(document.getElementById("masa2").value) || 1;
  var masa3 = parseFloat(document.getElementById("masa3").value) || 1;
  if(masa1 > 0 && masa2 > 0 && masa3 > 0){
    dt = 0.01;
    simulationActive = true;
  } else {
    alert("las masas deben ser mayores a 0");
    document.getElementById("masa1").value = "";
    document.getElementById("masa2").value = "";
    document.getElementById("masa3").value = "";
    simulationActive = false;
    dt = 0;
  }

  bodies[0].mass = masa1;
  bodies[1].mass = masa2;
  bodies[2].mass = masa3;

  bodies[0].velocity.set(
    parseFloat(document.getElementById("velocidad1x").value) || 0,
    parseFloat(document.getElementById("velocidad1y").value) || 0,
    parseFloat(document.getElementById("velocidad1z").value) || 0
  );
  bodies[1].mass = parseFloat(document.getElementById("masa2").value) || 1;
  bodies[1].velocity.set(
    parseFloat(document.getElementById("velocidad2x").value) || 0,
    parseFloat(document.getElementById("velocidad2y").value) || 0,
    parseFloat(document.getElementById("velocidad2z").value) || 0
  );
  bodies[2].mass = parseFloat(document.getElementById("masa3").value) || 1;
  bodies[2].velocity.set(
    parseFloat(document.getElementById("velocidad3x").value) || 0,
    parseFloat(document.getElementById("velocidad3y").value) || 0,
    parseFloat(document.getElementById("velocidad3z").value) || 0
  );
  bodies.forEach((body) => body.updateMesh());

});

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  setupInitialScrollValues();
  addScrollListeners();
});

// Llamada a la función principal de animación
animate();
