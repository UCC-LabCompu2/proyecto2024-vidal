import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const canvas = document.querySelector('#canvas');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);



const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 400;
controls.enableDamping = true;
        // Función de renderizado
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    }

animate();