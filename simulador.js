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
plane.material.transparent = true;
plane.material.opacity = 0.3; // Ajusta la opacidad aquí
scene.add(plane);

const planeVertical1 = new THREE.GridHelper(100, 30);
planeVertical1.rotation.x = Math.PI / 2;
planeVertical1.material.transparent = true;
planeVertical1.material.opacity = 0.3; // Ajusta la opacidad aquí
scene.add(planeVertical1);

const planeVerticalZ = new THREE.GridHelper(100, 30);
planeVerticalZ.rotation.z = Math.PI / 2;
planeVerticalZ.material.transparent = true;
planeVerticalZ.material.opacity = 0.3; // Ajusta la opacidad aquí
scene.add(planeVerticalZ);

// Cámara y controles
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 10, 10);

const initalCameraPosition = camera.position.clone();
const initialCameraQuaternion = camera.quaternion.clone();
const initialCameraTarget = new THREE.Vector3(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 400;
controls.enableDamping = true;

// Trayectorias
const maxOrbitPoints = 10000;
/**
 * Actualiza las posiciones de los cuerpos en la simulación.
 *
 * @param {Body[]} bodies - Array de cuerpos a actualizar.
 * @param {number} dt - Intervalo de tiempo para la simulación.
 */
const updatePositions = (bodies, dt) => {
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
    updateOrbit(body);
  });
};

/**
 * Clase que representa un cuerpo en la simulación.
 */
class Body {
  /**
   * Crea una nueva instancia de un cuerpo.
   *
   * @param {THREE.Vector3} position - Posición inicial del cuerpo.
   * @param {THREE.Vector3} velocity - Velocidad inicial del cuerpo.
   * @param {number} mass - Masa del cuerpo.
   * @param {number} color - Color del cuerpo.
   */
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

    const orbitLineGeometry = new THREE.BufferGeometry();
    orbitLineGeometry.setFromPoints([this.position]);
    const orbitLineMaterial = new THREE.LineBasicMaterial({ color: this.color });
    this.orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
    scene.add(this.orbitLine);

    this.orbitPoints = [];
  }
  

  /**
   * Actualiza la posición de la malla del cuerpo para que coincida con su posición física.
   */
  updateMesh = () => {
    this.mesh.position.copy(this.position);
  };
}

/**
 * Actualiza las trayectorias de los cuerpos.
 *
 * @param {Body} body - El cuerpo cuya trayectoria se está actualizando.
 * @param {number} index - El índice del cuerpo en el array de cuerpos.
 */
const updateOrbit = (body) => {
  body.orbitPoints.push(body.position.clone());
  if (body.orbitPoints.length > maxOrbitPoints) {
    body.orbitPoints.shift();
  }
  body.orbitLine.geometry.setFromPoints(body.orbitPoints);
};


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

/**
 * Configura los valores iniciales de los controles deslizantes.
 */
const setupInitialScrollValues = () => {
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
};

/**
 * Añade los listeners a los controles deslizantes para actualizar las posiciones de los cuerpos.
 */
const addScrollListeners = () => {
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
};

/**
 * Función principal de animación.
 */
const animate = () => {
  requestAnimationFrame(animate);

  if (simulationActive) {
    updatePositions(bodies, dt);
    bodies.forEach((body) => body.updateMesh());
  }

  renderer.render(scene, camera);
  controls.update();
};

/**
 * Evento de reinicio de la simulación.
 */
document.getElementById("reset-button").addEventListener("click", () => {
  simulationActive = false;
  dt = 0;
  bodies[0].position.set(-5, 0, 0);
  bodies[0].velocity.set(0, 0, 0);
  bodies[0].orbitPoints = [];
  scene.remove(bodies[0].orbitLine);

  bodies[1].position.set(5, 0, 0);
  bodies[1].velocity.set(0, 0, 0);
  bodies[1].orbitPoints = [];
  scene.remove(bodies[1].orbitLine);
  
  bodies[2].position.set(0, 5, 0);
  bodies[2].velocity.set(0, 0, 0);
  bodies[2].orbitPoints = [];
  scene.remove(bodies[2].orbitLine);

  bodies.forEach(body => {
    const orbitLineGeometry = new THREE.BufferGeometry();
    orbitLineGeometry.setFromPoints([body.position]);
    const orbitLineMaterial = new THREE.LineBasicMaterial({ color: body.color });
    body.orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
    scene.add(body.orbitLine);
  })


  setupInitialScrollValues();
  bodies.forEach((body) => body.updateMesh());
  camera.position.copy(initalCameraPosition);
  camera.quaternion.copy(initialCameraQuaternion);
  controls.target.copy(initialCameraTarget);
  controls.update();
});

/**
 * Evento para iniciar la simulación.
 */
document.getElementById("simulator-button").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (simulationActive) {
    alert("La simulación ya está activa, reinicie la simulación para volver a empezar");
  } else {
    const maxVelocity = 50; // Valor máximo permitido para la velocidad
    let masa1 = parseFloat(document.getElementById("masa1").value);
    let masa2 = parseFloat(document.getElementById("masa2").value);
    let masa3 = parseFloat(document.getElementById("masa3").value);
    
    let vel1x = parseFloat(document.getElementById("velocidad1x").value) || 0;
    let vel1y = parseFloat(document.getElementById("velocidad1y").value) || 0;
    let vel1z = parseFloat(document.getElementById("velocidad1z").value) || 0;
    
    let vel2x = parseFloat(document.getElementById("velocidad2x").value) || 0;
    let vel2y = parseFloat(document.getElementById("velocidad2y").value) || 0;
    let vel2z = parseFloat(document.getElementById("velocidad2z").value) || 0;
    
    let vel3x = parseFloat(document.getElementById("velocidad3x").value) || 0;
    let vel3y = parseFloat(document.getElementById("velocidad3y").value) || 0;
    let vel3z = parseFloat(document.getElementById("velocidad3z").value) || 0;

    // Verificar las masas
    if (masa1 > 0 && masa2 > 0 && masa3 > 0 && masa1 <= 100000 && masa2 <= 100000 && masa3 <= 100000) {
      // Verificar que las velocidades no excedan el valor máximo permitido
      if (Math.abs(vel1x) <= maxVelocity && Math.abs(vel1y) <= maxVelocity && Math.abs(vel1z) <= maxVelocity &&
          Math.abs(vel2x) <= maxVelocity && Math.abs(vel2y) <= maxVelocity && Math.abs(vel2z) <= maxVelocity &&
          Math.abs(vel3x) <= maxVelocity && Math.abs(vel3y) <= maxVelocity && Math.abs(vel3z) <= maxVelocity) {
        
        dt = 0.01;
        simulationActive = true;
        
        bodies[0].mass = masa1;
        bodies[1].mass = masa2;
        bodies[2].mass = masa3;

        bodies[0].velocity.set(vel1x, vel1y, vel1z);
        bodies[1].velocity.set(vel2x, vel2y, vel2z);
        bodies[2].velocity.set(vel3x, vel3y, vel3z);

        bodies.forEach((body) => body.updateMesh());
      } else {
        alert(`Las velocidades no pueden superar los ${maxVelocity} en valor absoluto`);
        for (let i = 1; i <= 3; i++) {
          for (let j = 1; j <= 3; j++) {
            document.getElementById(`velocidad${i}x`).value = "";
            document.getElementById(`velocidad${i}y`).value = "";
            document.getElementById(`velocidad${i}z`).value = "";
          }
        }
        simulationActive = false;
      }
    } else {
      alert("Las masas deben estar entre 0 y 100000 y no pueden ser negativas");
      document.getElementById("masa1").value = "";
      document.getElementById("masa2").value = "";
      document.getElementById("masa3").value = "";
      simulationActive = false;
      dt = 0;
    }
  }
});

/**
 * Inicialización al cargar el DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
  setupInitialScrollValues();
  addScrollListeners();
});

// Llamada a la función principal de animación
animate();
