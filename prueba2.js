import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import FakeGlowMaterial from './FakeGlowMaterials.js';

let scene, camera, renderer, starsParticles;
let planets = [];
let orbitAngle = 0;

class Particulas {
    constructor(position, scale, scene, rutaModelo) {
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
    constructor(position, scale, scene, orbitRadius, direction, color) {
        this.scene = scene;
        this.scale = scale;
        this.orbitRadius = orbitRadius;
        this.direction = direction;

        // Material para el centro sólido
        const solidMaterial = new THREE.MeshStandardMaterial({ color: color });


        // Material para el borde con glow
        const glowMaterial = new FakeGlowMaterial({
            glowColor: new THREE.Color(color),
        });

        // Crear la geometría de la esfera
        const geometry = new THREE.SphereGeometry(scale, 32, 32);



        // Crear el mesh para el centro sólido
        this.solidSphere = new THREE.Mesh(geometry, solidMaterial);
        this.solidSphere.position.copy(position);
        this.scene.add(this.solidSphere);

        // Crear el mesh para el borde con glow
        this.glowSphere = new THREE.Mesh(geometry, glowMaterial);
        this.glowSphere.position.copy(position);
        this.scene.add(this.glowSphere);

        // Escalar el mesh del borde con glow para que rodee al mesh sólido
        const scaleFactor = 3; // Ajusta este valor según sea necesario
        this.glowSphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

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

        this.glowSphere.position.copy(this.solidSphere.position); // Mover el borde con glow junto al centro sólido
        this.solidSphere.rotation.y += 0.01;
        // Actualizar posición de la línea para seguir la órbita
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    camera.position.z = 200;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 400;
    controls.enableDamping = true;

    // Cargamos las texturas del cubemap usando CubeTextureLoader
    const textureLoader = new THREE.TextureLoader();
    
    const materials = [
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-xpos.png'), side: THREE.BackSide }), // Cara 1
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-xneg.png'), side: THREE.BackSide }), // Cara 2
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-ypos.png'), side: THREE.BackSide }), // Cara 3
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-yneg.png'), side: THREE.BackSide }), // Cara 4
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-zpos.png'), side: THREE.BackSide }), // Cara 5
        new THREE.MeshStandardMaterial({ map: textureLoader.load('/background/nebula-zneg.png'), side: THREE.BackSide }), // Cara 6
    ];
    
    const cubeGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const cube = new THREE.Mesh(cubeGeometry, materials);
    scene.add(cube);


    const nebulosa = new Particulas(new THREE.Vector3(0, 0, 0), 1, scene, './planetas/nebulosa/scene.gltf');
    const planetaCentral = new Planeta(new THREE.Vector3(0, 0, 0), 40, scene, 0, 0, "#f57011");
    const planeta1 = new Planeta(new THREE.Vector3(20, 0, 0), 15, scene, 120, 1, "#1f65f0");
    const planeta2 = new Planeta(new THREE.Vector3(30, 0, 0), 10, scene, 130, 0, "#f01fb5");

    planets.push(planetaCentral, planeta1, planeta2);

    starsParticles = createStars();
    scene.add(starsParticles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
    directionalLight.position.set(30, 20, 0);
    scene.add(directionalLight);

    //document.addEventListener('mousemove', onMouseMove, false);

    animate();
}

function createStars() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const particlesCount = 1000;

    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 1000;
        positions[i + 1] = (Math.random() - 0.5) * 1000;
        positions[i + 2] = (Math.random() - 0.5) * 1000;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    return particles;
}



/*function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    camera.position.x = mouseX * 5;
    camera.position.y = mouseY * 5;
}*/

function animate() {
    requestAnimationFrame(animate);
    
    planets.forEach((planet, index) => {
        const angleOffset = Math.PI / 2 * index;
        planet.actualizarOrbita(angleOffset, 0.5, 1 + 0.1 * index);
    });

    renderer.render(scene, camera);
    controls.update();
}

init();
