class Sphere {
    constructor(size, color, position, scene) {
        this.geometry = new THREE.BufferGeometry();
        this.vertices = [];

        const particleCount = 7000;
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = size * Math.sin(phi) * Math.cos(theta) + position.x;
            const y = size * Math.sin(phi) * Math.sin(theta) + position.y;
            const z = size * Math.cos(phi) + position.z;

            this.vertices.push(x, y, z);
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));

        const material = new THREE.PointsMaterial({ color: color, size: 0.2 });
        this.particles = new THREE.Points(this.geometry, material);
        scene.add(this.particles);
    }
}

let scene, camera, renderer;
let particlesGeometry1, particlesGeometry2, particlesGeometry3; // Variables para las geometrías de partículas
let particles1, particles2, particles3; // Variables para las partículas
let angle1 = 0; // Ángulo inicial para la órbita de la esfera roja
let angle2 = Math.PI; // Ángulo inicial para la órbita de la esfera azul
let orbitAngle = 0; // Ángulo para la rotación vertical de las órbitas



const texto1 = document.getElementById("titulo");
const texto2 = document.getElementById("parrafo1");
const texto3 = document.getElementById("parrafo2");


// Inicializar Three.js y la escena
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

    // Crear esferas usando la clase Sphere
    const sphere1 = new Sphere(10, 0xffff00, { x: 0, y: 0, z: 0 }, scene); // Esfera amarilla de tamaño 10
    const sphere2 = new Sphere(5, 0xff0000, { x: 0, y: 0, z: 0 }, scene); // Esfera roja de tamaño 5
    const sphere3 = new Sphere(7, 0x0000ff, { x: 0, y: 0, z: 0 }, scene); // Esfera azul de tamaño 7

    particlesGeometry1 = sphere1.geometry; // Asignar la geometría de partículas de la esfera amarilla
    particlesGeometry2 = sphere2.geometry; // Asignar la geometría de partículas de la esfera roja
    particlesGeometry3 = sphere3.geometry; // Asignar la geometría de partículas de la esfera azul
    particles1 = sphere1.particles; // Asignar las partículas de la esfera amarilla
    particles2 = sphere2.particles; // Asignar las partículas de la esfera roja
    particles3 = sphere3.particles; // Asignar las partículas de la esfera azul

    // Añadir eventos de mouse para la interactividad
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('wheel', onScroll, false);

    // Llamar a la función animate para comenzar la animación
    animate();
}

function onScroll(event){
    const delta = event.deltaY * 0.01;
    camera.position.z += delta;
}

// Función para actualizar la posición de las partículas
function updateParticlesPosition(geometry) {
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.random() * 0.1 - 0.05; // Movimiento aleatorio en el eje X
        positions[i + 1] += Math.random() * 0.1 - 0.05; // Movimiento aleatorio en el eje Y
        positions[i + 2] += Math.random() * 0.1 - 0.05; // Movimiento aleatorio en el eje Z

        // Puedes agregar restricciones adicionales aquí para evitar que las partículas salgan de ciertos límites
    }

    geometry.attributes.position.needsUpdate = true; // Actualizar la geometría de las partículas
}

// Función para actualizar la posición de la esfera roja en órbita
function updateOrbitPosition1() {
    const radius = 20; // Radio de la órbita
    const speed = 0.05; // Velocidad de la órbita

    const x = radius * Math.cos(angle1);
    const z = radius * Math.sin(angle1);

    particles2.position.x = x;
    particles2.position.z = z;

    angle1 += speed;
    particles2.rotation.y += 0.01; // Rotación de la órbita
}

// Función para actualizar la posición de la esfera azul en órbita
function updateOrbitPosition2() {
    const radius = 30; // Radio de la órbita
    const speed = 0.03; // Velocidad de la órbita

    const x = radius * Math.cos(angle2);
    const z = radius * Math.sin(angle2);

    particles3.position.x = x;
    particles3.position.z = z;

    angle2 += speed;
    particles3.rotation.y += 0.01; // Rotación de la órbita
}

// Función para actualizar la rotación vertical de las órbitas
function updateOrbitVerticalRotation() {
    orbitAngle += 0.01; // Incremento en el ángulo de rotación vertical

    particles2.position.y = 20 * Math.cos(orbitAngle); // Aplicar rotación vertical a la órbita de la esfera roja
    particles3.position.y = 30 * Math.cos(orbitAngle); // Aplicar rotación vertical a la órbita de la esfera azul
}

// Función para actualizar la posición de la esfera según la posición del mouse
function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    camera.position.x = mouseX * 5;
    camera.position.y = mouseY * 5;
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    updateParticlesPosition(particlesGeometry1); // Actualizar partículas de la esfera amarilla
    updateOrbitPosition1(); // Actualizar posición de la esfera roja en órbita
    updateOrbitPosition2(); // Actualizar posición de la esfera azul en órbita
    updateOrbitVerticalRotation(); // Actualizar rotación vertical de las órbitas

    const cameraZ = camera.position.z;

    // Mostrar u ocultar los textos según la posición Z de la cámara
    if (cameraZ <= 190 && cameraZ >= 160) {
        texto1.style.opacity = '1'; // Mostrar texto 1
        texto2.style.opacity = '0'; // Ocultar texto 2
        texto3.style.opacity = '0'; // Ocultar texto 3
    } else if (cameraZ <= 155 && cameraZ >= 120) {
        texto1.style.opacity = '0'; // Ocultar texto 1
        texto2.style.opacity = '1'; // Mostrar texto 2
        texto3.style.opacity = '0'; // Ocultar texto 3
    } else if (cameraZ <= 115 && cameraZ >= 90) {
        texto1.style.opacity = '0'; // Ocultar texto 1
        texto2.style.opacity = '0'; // Ocultar texto 2
        texto3.style.opacity = '1'; // Mostrar texto 3
    } else {
        texto1.style.opacity = '0'; // Ocultar todos los textos
        texto2.style.opacity = '0';
        texto3.style.opacity = '0';
    }


    renderer.render(scene, camera);
}

// Llamar a la función init para comenzar
init();
