import * as THREE from "three";
import { OrbitControls } from "three/addons/Addons.js";

const container = document.getElementById("canvas-container");
const width = container.clientWidth;
const height = container.clientHeight;

// 1. Cena e Câmera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
camera.position.set(2, 2, 4);

// 2. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 3. Iluminação
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 4. Objetos (Órbita e Partícula)
const orbit = new THREE.Mesh(
  new THREE.TorusGeometry(2, 0.005, 16, 100),
  new THREE.MeshBasicMaterial({ color: 0 }),
);
orbit.rotation.x = Math.PI / 2;
scene.add(orbit);

// 5. Vetores de Frenet-Serret (Setas)
const createArrow = (color) =>
  new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    0.8,
    color,
    0.2,
    0.1,
  );
const arrowS = createArrow(0); // Tangente (Azul)
const arrowX = createArrow(0); // Normal (Verde)
const arrowY = createArrow(0); // Binormal (Vermelho)
scene.add(arrowS, arrowX, arrowY);

// 6. Loop de Animação
const rho = 2;
const Amp = 0.5;

function animate() {
  requestAnimationFrame(animate);
  const t = Date.now() * 0.001; // Tempo em segundos

  // Ângulo da órbita principal
  const theta = t * 1;

  // Vetores de base na órbita circular
  const r0 = new THREE.Vector3(rho * Math.cos(theta), 0, rho * Math.sin(theta));
  const u_tangent = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
  const u_radial = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
  const u_vertical = new THREE.Vector3(0, 1, 0);

  arrowS.position.copy(r0);
  arrowS.setDirection(u_tangent);

  arrowX.position.copy(r0);
  arrowX.setDirection(u_radial);

  arrowY.position.copy(r0);
  arrowY.setDirection(u_vertical);

  controls.update();
  renderer.render(scene, camera);
}

// Integração com Reveal.js
if (window.Reveal) {
    Reveal.addEventListener('slidechanged', function(event) {
        if (container.contains(event.currentSlide)) {
            onSlideVisible();
        } else {
            onSlideHidden();
        }
    });
    
    // Inicia se já estiver no slide
    setTimeout(() => {
        const currentSlide = Reveal.getCurrentSlide();
        if (container.contains(currentSlide)) {
            onSlideVisible();
        }
    }, 100);
}

// Resize handler
window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

