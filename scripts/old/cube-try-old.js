import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const container = document.getElementById("three-container");
const scene = new THREE.Scene();

const frustumHeight = 5;  // Altura visível (ajuste para caber a órbita rho=2)
const camera = new THREE.OrthographicCamera(
  -frustumHeight * (container.clientWidth / container.clientHeight) / 2,
  frustumHeight * (container.clientWidth / container.clientHeight) / 2,
  frustumHeight / 2,
  -frustumHeight / 2,
  0.1,
  1000
);
camera.position.set(2.5, 1.5, 2.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement); // Appenda na section!

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( container.clientWidth, container.clientHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'; // ou ajusta conforme sua interação
container.appendChild( labelRenderer.domElement );

scene.background = null;

const controls = new OrbitControls(camera, renderer.domElement);

// Pega o valor da variável CSS --r-main-color
const root = document.documentElement;  // Equivale a :root
const mainColor = getComputedStyle(root).getPropertyValue('--r-main-color').trim();
const halfColor = getComputedStyle(root).getPropertyValue('--r-half-color').trim();

console.log(mainColor);  // Ex: "rgb(255, 0, 0)" ou "#ff0000"

function createText(text_to_render="", color=mainColor) {
  var labelDiv = document.createElement("div");
  labelDiv.textContent = text_to_render;
  labelDiv.style.color = color;
  labelDiv.style.fontSize = "20px";
  return new CSS2DObject(labelDiv);
}

const x_text = createText("$\\hat{x}$");
const y_text = createText("$\\hat{y}$");
const s_text = createText("$\\hat{s}$");
scene.add(x_text, y_text, s_text);

const rho = 2;
const orbitGeometry = new THREE.TorusGeometry(
  rho,
  0.01,
  16,
  80
);

const orbitMaterial = new THREE.MeshBasicMaterial({
  color: mainColor,
  wireframe: false,
});

const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
orbit.rotation.x = Math.PI / 2; // se quiser que o furo do torus fique na vertical
scene.add(orbit);

// create labframe origin vectors
const origin = new THREE.Vector3(0, 0, 0);
const dirx = new THREE.Vector3(1, 0, 0);
const arrowx = new THREE.ArrowHelper(dirx, origin, 1, 'red');
const diry = new THREE.Vector3(0, 1, 0);
const arrowy = new THREE.ArrowHelper(diry, origin, 1, 'green');
const dirz = new THREE.Vector3(0, 0, 1);
const arrowz = new THREE.ArrowHelper(dirz, origin, 1, 'blue');
// scene.add(arrowx, arrowy, arrowz);

const arrowS = new THREE.ArrowHelper(origin, dirx, 1, mainColor); // Tangente (Azul)
const arrowX = new THREE.ArrowHelper(origin, dirx, 1, mainColor); // Normal (Verde)
const arrowY = new THREE.ArrowHelper(origin, dirx, 1, mainColor); // Binormal (Vermelho)
scene.add(arrowS, arrowX, arrowY);

const arrowR = new THREE.ArrowHelper(origin, dirx, 1, halfColor);
scene.add(arrowR);

const labelR = createText("$\\hat{r}_0$", halfColor);
scene.add(labelR);

const electron = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 16),
  new THREE.MeshBasicMaterial({ color: 'red' })
);
scene.add(electron);

// Adicione após electron
const arrowVel = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 0.3, 'red');
arrowVel.constantLengthInScreenSpace = false;  // Não precisa em ortho
scene.add(arrowVel);
let prevPos = null;

const v_text = createText("$\\vec{v}$", 'red');
scene.add(v_text);

function onResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const aspect = width / height;
  camera.left = -frustumHeight * aspect / 2;
  camera.right = frustumHeight * aspect / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = -frustumHeight / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
}
window.addEventListener("resize", onResize);

const clock = new THREE.Clock(); // substitui Date.now()

function fx(t) {
  return 0.3 + 0.3 * Math.cos(2*t);
}
function fy(t) {
  return 0.3 + 0.3 * Math.cos(2*t);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta(); // tempo em segundos desde o último frame
  const theta = clock.getElapsedTime(); // tempo acumulado
  const t = theta % (2 * Math.PI);

  controls.update();

  // ---
  x_text.lookAt(camera.position);
  
  // ---
  const x = rho * Math.cos(t);
  const y = rho * Math.sin(t);
  
  x_text.position.set(x, 0, y);
  s_text.position.set(x, 0, y);
  
  arrowX.position.set(x, 0, y);
  var dirx = new THREE.Vector3(x, 0, y);
  dirx.normalize();
  arrowX.setDirection(dirx);
  arrowX.setLength(1);
  x_text.position.set(x + 1.3*dirx.x, -0.9, y + 1.3*dirx.z);
  labelR.position.set(0.7*dirx.x, -1.3, 0.7*dirx.z);

  arrowR.position.set(0, 0, 0);
  arrowR.setDirection(dirx);
  arrowR.setLength(rho);

  arrowS.position.set(x, 0, y);
  var dir = new THREE.Vector3(-y, 0, x);
  dir.normalize();
  arrowS.setDirection(dir);
  arrowS.setLength(1);
  s_text.position.set(x + 1.3*dir.x, -0.9, y + 1.3*dir.z);

  arrowY.position.set(x, 0, y);
  var dir = new THREE.Vector3(0, 1, 0);
  dir.normalize();
  arrowY.setDirection(dir);
  arrowY.setLength(1);
  y_text.position.set(x, 0.5, y);

  electron.position.set(x + fx(t)*dirx.x, fy(t)*dir.y, y + fx(t)*dirx.z);

  // Velocidade: derivada simples (posição anterior)
  const vel = new THREE.Vector3();
  vel.subVectors(electron.position, prevPos || new THREE.Vector3()).multiplyScalar(1 / delta);
  arrowVel.setDirection(vel.normalize());
  arrowVel.setLength(0.7);  // Comprimento fixo
  arrowVel.position.copy(electron.position);

  v_text.position.set(electron.position.x + vel.x, electron.position.y + vel.y - 0.9, electron.position.z + vel.z);

  prevPos = electron.position.clone();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

renderer.render(scene, camera);
labelRenderer.render(scene, camera);
animate();