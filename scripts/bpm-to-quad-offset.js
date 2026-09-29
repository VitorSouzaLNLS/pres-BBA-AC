import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const container = document.getElementById("bpm-to-quad-offset-container");
const scene = new THREE.Scene();

const frustumHeight = 4.5;
const camera = new THREE.OrthographicCamera(
    (-frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    (frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    1000,
);
camera.position.set(0, 0, 20);
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
labelRenderer.domElement.style.top = "0em";
labelRenderer.domElement.style.left = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

scene.background = null;


////////////////////////////////////////////////////////////////////////

// Dipolo: retângulo central
const bpm = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.8),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
);
scene.add(bpm);
bpm.position.set(-2, 0.7, 0);

const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 2),
    new THREE.MeshBasicMaterial({ color: 0xff6e00, transparent: true, opacity: 0.7 })
);
scene.add(quad);
quad.position.set(0, 0, 0); 

function createTrajectory(x, y, ang=0, color=0x4cc9f0) {
    const points = [];
    const N = 10;
    for (let i = 0; i < N + 1; i++) {
        const xi = (i / N) * x - 2 * x;
        const yi = (i / N) * y - y;
        points.push(new THREE.Vector3(xi, yi, 0));
    }
    
    for (let i = 0; i < N + 1; i++) {
        const xi = (i / N) * x + x;
        const yi = -(i / N) * y * ang - y;
        points.push(new THREE.Vector3(xi, yi, 0));
    }

    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color })
    );
    scene.add(line);

    return { line, points};
}

// const nominal = createTrajectory(0, 0);

// /////////////////////////////////////////////////////////////////////


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

const bpmlabel = createText("#label-BPM");
scene.add(bpmlabel);

bpmlabel.position.set(2, 0.7, 0);

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
    let t = theta * 0.4;

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
    const theta = 1.65 * Math.PI;
    updateFrame(delta, theta); // posiciona tudo

    // 1. Renderiza e captura só 3D (órbita, setas, etc.)
    renderer.render(scene, camera);
    const threeDataURL = renderer.domElement.toDataURL("image/png", 1.0);

    // 2. Renderiza e captura só labels (transparente)
    labelRenderer.render(scene, camera);
    // const labelsDataURL = labelRenderer.domElement.toDataURL("image/png", 1.0);

    // 3. Cria canvas temporário para COMBINAR as duas imagens
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Desenha 3D primeiro
    const img3D = new Image();
    img3D.src = threeDataURL;
    img3D.onload = () => {
        ctx.drawImage(img3D, 0, 0);

        // Desenha labels por cima
        const imgLabels = new Image();
        // imgLabels.src = labelsDataURL;
        imgLabels.onload = () => {
            ctx.drawImage(imgLabels, 0, 0);

            // FINAL: canvas combinado como imagem única
            const finalDataURL = canvas.toDataURL("image/png", 1.0);
            const finalImg = document.createElement("img");
            finalImg.src = finalDataURL;
            finalImg.style.width = "100%";
            finalImg.style.height = "100%";
            finalImg.style.objectFit = "contain";

            // Limpa renderers e coloca imagem final
            container.removeChild(renderer.domElement);
            const labelDom = labelRenderer.domElement;
            if (labelDom.parentNode) {
                labelDom.parentNode.removeChild(labelDom);
            }
            container.appendChild(finalImg);
        };
    };
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
