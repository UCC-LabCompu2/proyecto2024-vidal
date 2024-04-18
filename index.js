import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, starsParticles;
let planets = [];
let orbitAngle = 0;

class Particulas{
    constructor(position, scale, scene, rutaModelo){
        this.scene = scene;
        this.scale = scale;
        this.position = position;

        const loader = new GLTFLoader();
        loader.load(
            rutaModelo,
            (gltf) => {
                gltf.scene.scale.set(this.scale, this.scale, this.scale);
                gltf.scene.position.copy(position);
                this.scene.add(gltf.scene);
                this.particula = gltf.scene;        
            }
        )
    }
}

class Planeta {
    constructor(position, scale, scene, rutaModelo, orbitRadius, direction) {
        this.scene = scene;
        this.scale = scale;
        this.orbitRadius = orbitRadius;
        this.direction = direction; // Radio de la órbita

        const loader = new GLTFLoader();
        // Crear la estela de la órbita

        loader.load(
            rutaModelo,
            (gltf) => {
                gltf.scene.scale.set(this.scale, this.scale, this.scale);
                gltf.scene.position.copy(position);
                this.scene.add(gltf.scene);
                this.planeta = gltf.scene;
            },
            undefined,
            (error) => {
                console.error(error);
            }
        );
    }

    // Función para actualizar la órbita de los planetas alrededor del planeta central
    actualizarOrbita(angleOffset, speed, amplitude) {
        const angle = Date.now() * speed * 0.001 + angleOffset; // Offset para cada planeta
        const x = Math.cos(angle) * this.orbitRadius * amplitude;
        const y = Math.cos(angle) * this.orbitRadius;
        const z = Math.sin(angle) * this.orbitRadius * amplitude;

        this.planeta.position.x = x;
        this.planeta.position.z = z;
        
        if(this.direction == 1){
            this.planeta.position.y = y;
        } else{
            this.planeta.position.y = -y;
        }
        

        this.planeta.rotation.y += 0.01;
        // Actualizar la posición de la estela de la órbita
        
    }
}

// Inicialización de la escena y los planetas
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 200;

    const backgroundLoader = new THREE.TextureLoader();
    const backgroundTexture = backgroundLoader.load("./background.jpg");
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.BackSide });
    const backgroundGeometry = new THREE.BoxGeometry(2560, 1440, 1000);
    const backgroundCube = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(backgroundCube);

    //crear nebulosa 
    const nebulosa = new Particulas(new THREE.Vector3(0,0,0),1, scene, './planetas/nebulosa/scene.gltf');
    
    // Crear planeta central fijo en el centro
    const planetaCentral = new Planeta(new THREE.Vector3(0, 0, 0), 0.5, scene, './planetas/nuevoplanetacentral/scene.gltf', 0, 0);

    // Crear planetas que orbitarán alrededor del planeta central
    const planeta1 = new Planeta(new THREE.Vector3(20, 0, 0), 0.1, scene, './planetas/scene.gltf', 70, 1);
    const planeta2 = new Planeta(new THREE.Vector3(30, 0, 0), 0.2, scene, './planetas/scene.gltf', 90, 0);

    planets.push(planetaCentral, planeta1, planeta2);

    starsParticles = createStars();
    scene.add(starsParticles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Color y intensidad
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Color y intensidad
    directionalLight.position.set(30, 20, 0); // Posición de la luz (desde arriba)
    scene.add(directionalLight);

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('wheel', onScroll, false);

    animate();
}
function createStars() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Color de las estrellas

    const particlesCount = 1000;

    const positions = new Float32Array(particlesCount * 3); // Cada partícula tiene 3 coordenadas (x, y, z)

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 1000; // Posición X aleatoria
        positions[i + 1] = (Math.random() - 0.5) * 1000; // Posición Y aleatoria
        positions[i + 2] = (Math.random() - 0.5) * 1000; // Posición Z aleatoria
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    return particles;
}
function onScroll(event){
    const delta = event.deltaY * 0.01;
    camera.position.z += delta;
}

function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    camera.position.x = mouseX * 5;
    camera.position.y = mouseY * 5;
}

function animate() {
    requestAnimationFrame(animate);

    planets.forEach((planet, index) => {
        const angleOffset = Math.PI / 2 * index; // Desfase de ángulo para cada planeta
        planet.actualizarOrbita(angleOffset, 1, 1 + 0.1 * index); // Actualizar órbita de los planetas con amplitud variable
    });

    renderer.render(scene, camera);
}

init();
