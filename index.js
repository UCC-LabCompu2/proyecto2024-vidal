import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import FakeGlowMaterial from "./modules/FakeGlowMaterials.js";

let scene, camera, renderer, controls;
let planets = [];
let orbitAngle = 0;

class Planeta {
  /**
   * @constuctor Crea una instancia de Planeta.
   * @param {THREE.Vector3} position - La posición inicial del planeta.
   * @param {number} scale - La escala del planeta.
   * @param {THREE.Scene} scene - La escena de Three.js.
   * @param {number} orbitRadius 
   * @param {number} direction - La dirección de la órbita.
   * @param {string} color 
   */
  constructor(position, scale, scene, orbitRadius, direction, color) {
    this.scene = scene;
    this.scale = scale;
    this.orbitRadius = orbitRadius;
    this.direction = direction;

    const solidMaterial = new THREE.MeshStandardMaterial({ color: color });

    const glowMaterial = new FakeGlowMaterial({
      glowColor: new THREE.Color(color),
    });

    const geometry = new THREE.SphereGeometry(scale, 32, 32);

    this.solidSphere = new THREE.Mesh(geometry, solidMaterial);
    this.solidSphere.position.copy(position);
    this.scene.add(this.solidSphere);

    this.glowSphere = new THREE.Mesh(geometry, glowMaterial);
    this.glowSphere.position.copy(position);
    this.scene.add(this.glowSphere);

    const scaleFactor = 3;
    this.glowSphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  /**
   * @method Actualiza la órbita del planeta.
   * @param {number} angleOffset - El desplazamiento angular de la órbita.
   * @param {number} speed - La velocidad de la órbita.
   * @param {number} amplitude - La amplitud de la órbita.
   */
  actualizarOrbita(angleOffset, speed, amplitude) {
    const angle = Date.now() * speed * 0.001 + angleOffset;
    const x = Math.cos(angle) * this.orbitRadius * amplitude;
    const y = Math.cos(angle) * this.orbitRadius;
    const z = Math.sin(angle) * this.orbitRadius * amplitude;

    this.solidSphere.position.x = x;
    this.solidSphere.position.z = z;

    if (this.direction == 1) {
      this.solidSphere.position.y = y;
    } else {
      this.solidSphere.position.y = -y;
    }

    this.glowSphere.position.copy(this.solidSphere.position);
    this.solidSphere.rotation.y += 0.01;
  }
}

/**
 * @method Inicializa la escena de Three.js, la cámara, el renderizador y los controles de órbita.
 */
const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );

  const canvas = document.querySelector(".webgl");
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.z = 399;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 400;
  controls.enableDamping = true;

  const textureLoader = new THREE.TextureLoader();

  const materials = [
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-xpos.png"),
      side: THREE.BackSide,
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-xneg.png"),
      side: THREE.BackSide,
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-ypos.png"),
      side: THREE.BackSide,
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-yneg.png"),
      side: THREE.BackSide,
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-zpos.png"),
      side: THREE.BackSide,
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./images/background/nebula-zneg.png"),
      side: THREE.BackSide,
    }),
  ];

  const cubeGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
  const cube = new THREE.Mesh(cubeGeometry, materials);
  scene.add(cube);

  const planetaCentral = new Planeta(
    new THREE.Vector3(0, 0, 0),
    40,
    scene,
    0,
    0,
    "#f57011"
  );
  const planeta1 = new Planeta(
    new THREE.Vector3(20, 0, 0),
    15,
    scene,
    120,
    1,
    "#1f65f0"
  );
  const planeta2 = new Planeta(
    new THREE.Vector3(30, 0, 0),
    10,
    scene,
    130,
    0,
    "#f01fb5"
  );

  planets.push(planetaCentral, planeta1, planeta2);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
  directionalLight.position.set(30, 20, 0);
  scene.add(directionalLight);

  //document.addEventListener('mousemove', onMouseMove, false);

  //animaciones
  const tl = gsap.timeline({ defaults: { duration: 3 } });
  tl.fromTo(
    planetaCentral.glowSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 3, x: 3, y: 3 },
    1
  );
  tl.fromTo(
    planetaCentral.solidSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 1, x: 1, y: 1 },
    1
  );

  tl.fromTo(
    planeta1.glowSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 3, x: 3, y: 3 },
    1
  );
  tl.fromTo(
    planeta1.solidSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 1, x: 1, y: 1 },
    1
  );

  tl.fromTo(
    planeta2.glowSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 3, x: 3, y: 3 },
    1
  );
  tl.fromTo(
    planeta2.solidSphere.scale,
    { z: 0, x: 0, y: 0 },
    { z: 1, x: 1, y: 1 },
    1
  );

  tl.fromTo("nav", { opacity: 0 }, { opacity: 1 }, 0);
  tl.fromTo(".title", { fontSize: "0rem" }, { fontSize: "35px" }, 0);
  tl.fromTo(".title", { opacity: "0%" }, { opacity: "80%" }, 0);
  tl.fromTo(".title", { top: "50%" }, { top: "15%" }, 1);

  animate();
};

/**
 * @method Anima la escena de Three.js.
 */
const animate = () => {
  requestAnimationFrame(animate);

  camera.lookAt(scene.position);

  planets.forEach((planet, index) => {
    const angleOffset = (Math.PI / 2) * index;
    planet.actualizarOrbita(angleOffset, 0.5, 1 + 0.1 * index);
  });

  renderer.render(scene, camera);
  controls.update();
};

init();
