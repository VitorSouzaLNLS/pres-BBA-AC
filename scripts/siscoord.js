import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const container = document.getElementById("siscoord-three-container");
const scene = new THREE.Scene();

const frustumHeight = 5;
const camera = new THREE.OrthographicCamera(
    (-frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    (frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    1000,
);
camera.position.set(2.5, 1.5, 2.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: false,
});
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "2.5em";
labelRenderer.domElement.style.left = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

scene.background = null;

// NOVA VARIAVEL: Detecta modo print-pdf
const isPrintPDF = !!window.location.search.match(/print-pdf/gi);

const root = document.documentElement;
const mainColor =
    getComputedStyle(root).getPropertyValue("--r-main-color").trim() || "#000000";
const halfColor =
    getComputedStyle(root).getPropertyValue("--r-half-color").trim() || "#888888";

function createText(id = "", color = mainColor) {
    var labelDiv = document.querySelector(id);

    labelDiv.style.color = color;

    const cssObject = new CSS2DObject(labelDiv);

    return cssObject;
}

const v_text = createText("#label-vecv", "red");
const labelR = createText("#label-vecr0", "gray");
const x_text = createText("#label-xhat");
const y_text = createText("#label-yhat");
const s_text = createText("#label-shat");
scene.add(x_text, y_text, s_text, v_text, labelR);

const rho = 2;
const orbitGeometry = new THREE.TorusGeometry(rho, 0.01, 16, 80);
const orbitMaterial = new THREE.MeshBasicMaterial({
    color: mainColor,
    wireframe: false,
});
const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
orbit.rotation.x = Math.PI / 2;
scene.add(orbit);

const origin = new THREE.Vector3(0, 0, 0);
const dirx = new THREE.Vector3(1, 0, 0);

const arrowS = new THREE.ArrowHelper(origin, dirx, 1, mainColor);
const arrowX = new THREE.ArrowHelper(origin, dirx, 1, mainColor);
const arrowY = new THREE.ArrowHelper(origin, dirx, 1, mainColor);
scene.add(arrowS, arrowX, arrowY);

const arrowR = new THREE.ArrowHelper(origin, dirx, 1, halfColor);
scene.add(arrowR);

const electron = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    new THREE.MeshBasicMaterial({ color: "red" }),
);
scene.add(electron);



const arrowVel = new THREE.ArrowHelper(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0.3,
    "red",
);
arrowVel.constantLengthInScreenSpace = false;
scene.add(arrowVel);


let prevPos = null;

function fx(t) {
    return 0.15 * Math.cos(9 * t);
}
function fy(t) {
    return 0.2 * Math.cos(5 * t);
}

let e_traj = [];
let t = 0;
let dirY = new THREE.Vector3(0, 1, 0);
for (let j=0; j<101; j++) {
    t = j / 100 * 2 * Math.PI;
    let x = rho * Math.cos(t);
    let y = rho * Math.sin(t);
    var dirx_update = new THREE.Vector3(x, 0, y);
    dirx_update.normalize();
    e_traj[j] = new THREE.Vector3(
        x + fx(t) * dirx_update.x,
        fy(t) * dirY.y,
        y + fx(t) * dirx_update.z,
    )
}
const geometry = new THREE.BufferGeometry().setFromPoints(e_traj);
const material = new THREE.LineBasicMaterial({ color: "red" });
const traj = new THREE.Line(geometry, material);
scene.add(traj);


function onResize() {
    if (container.clientWidth === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;
    camera.left = (-frustumHeight * aspect) / 2;
    camera.right = (frustumHeight * aspect) / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
}
window.addEventListener("resize", onResize);

const clock = new THREE.Timer();

function updateFrame(delta, theta) {
    const t = theta % (2 * Math.PI);

    // controls.update();

    const x = rho * Math.cos(t);
    const y = rho * Math.sin(t);

    x_text.position.set(x, 0, y);
    s_text.position.set(x, 0, y);

    arrowX.position.set(x, 0, y);
    var dirx_update = new THREE.Vector3(x, 0, y);
    dirx_update.normalize();
    arrowX.setDirection(dirx_update);
    arrowX.setLength(1);
    x_text.position.set(x + 1.3 * dirx_update.x, -0.7, y + 1.3 * dirx_update.z);
    labelR.position.set(0.8 * dirx_update.x, -1.0, 0.8 * dirx_update.z);

    arrowR.position.set(0, 0, 0);
    arrowR.setDirection(dirx_update);
    arrowR.setLength(rho);

    arrowS.position.set(x, 0, y);
    var dir = new THREE.Vector3(-y, 0, x);
    dir.normalize();
    arrowS.setDirection(dir);
    arrowS.setLength(1);
    s_text.position.set(x + 1.3 * dir.x, -0.7, y + 1.3 * dir.z);

    arrowY.position.set(x, 0, y);
    var dirY = new THREE.Vector3(0, 1, 0);
    arrowY.setDirection(dirY);
    arrowY.setLength(1);
    y_text.position.set(x, 0.55, y);

    electron.position.set(
        x + fx(t) * dirx_update.x,
        fy(t) * dirY.y,
        y + fx(t) * dirx_update.z,
    );

    const vel = new THREE.Vector3();
    vel
        .subVectors(electron.position, prevPos || new THREE.Vector3())
        .multiplyScalar(1 / delta);
    arrowVel.setDirection(vel.normalize());
    arrowVel.setLength(0.7);
    arrowVel.position.copy(electron.position);

    v_text.position.set(
        electron.position.x + vel.x,
        electron.position.y + vel.y - 0.75,
        electron.position.z + vel.z,
    );

    prevPos = electron.position.clone();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

let animationId = null;
let isAnimating = false;

let lastTime = 0;
const fps = 30;
const frameTime = 1000 / fps;

function renderAnimation(now=0) {
    if (!isAnimating) return;

    animationId = requestAnimationFrame(renderAnimation);

    if (now - lastTime < frameTime) return;
    lastTime = now;

    clock.update();
    const delta = clock.getDelta();
    const theta = clock.getElapsed();
    updateFrame(delta, theta);
}

function renderImage() {
    onResize();
    clock.reset();
    clock.update();

    const delta = clock.getDelta();
    const theta = 1.55 * Math.PI;
    // arrowVel.opacity = 0;
    // v_text.style.visible = false;
    updateFrame(delta, theta); // posiciona tudo

    // 1. Renderiza e captura só 3D (órbita, setas, etc.)
    renderer.render(scene, camera);
    const threeDataURL = renderer.domElement.toDataURL("image/png", 1.0);
    renderer.dispose();
    container.removeChild(renderer.domElement);

    const a = document.createElement("img");
    a.src = threeDataURL;
    container.appendChild(a);
    a.style.zIndex = 1;
    a.style.scale = 1.15;
    a.style.marginRight = "0.8em";
    a.style.marginTop = "1em";

    // 2. Renderiza e captura só labels (transparente)
    [s_text, x_text, y_text, v_text, labelR].forEach((t) => {
        t.style.margin = 0;
        t.style.padding = 0;
        // t.style.transform = "translateY(50%)";
    })
    // s_text.style.marginLeft = "1em";
    // y_text.style.marginBottom = "3em";
    // y_text.style.marginRight = "0.2em";
    labelRenderer.render(scene, camera);
    // const labelsDataURL = labelRenderer.domElement.toDataURL("image/png", 1.0);

    // // 3. Cria canvas temporário para COMBINAR as duas imagens
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // canvas.width = container.clientWidth;
    // canvas.height = container.clientHeight;

    // // Desenha 3D primeiro
    // const img3D = new Image();
    // img3D.src = threeDataURL;
    // img3D.onload = () => {
    //     ctx.drawImage(img3D, 0, 0);

    //     // Desenha labels por cima
    //     const imgLabels = new Image();
    //     // imgLabels.src = labelsDataURL;
    //     imgLabels.onload = () => {
    //         ctx.drawImage(imgLabels, 0, 0);

    //         // FINAL: canvas combinado como imagem única
    //         const finalDataURL = canvas.toDataURL("image/png", 1.0);
    //         const finalImg = document.createElement("img");
    //         finalImg.src = finalDataURL;
    //         finalImg.style.width = "100%";
    //         finalImg.style.height = "100%";
    //         finalImg.style.objectFit = "contain";

    //         // Limpa renderers e coloca imagem final
    //         container.removeChild(renderer.domElement);
    //         const labelDom = labelRenderer.domElement;
    //         if (labelDom.parentNode) {
    //             labelDom.parentNode.removeChild(labelDom);
    //         }
    //         container.appendChild(finalImg);
    //     };
    // };
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            console.log(entry);
            console.log(entry.isIntersecting);
            console.log("isPrintPDF", isPrintPDF);

            if (entry.isIntersecting) {
                // NOVA LOGICA: Se print-pdf, renderiza imagem e para
                if (isPrintPDF) {
                    renderImage();
                    return; // não inicia animação
                }

                if (!isAnimating) {
                    isAnimating = true;
                    onResize();
                    clock.reset();
                    renderAnimation();
                }
            } else {
                isAnimating = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }
        });
    },
    { threshold: 0.1 },
);

if (container) observer.observe(container);
