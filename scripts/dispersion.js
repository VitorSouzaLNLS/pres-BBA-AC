import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const container = document.getElementById("dispersion-three-container");
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
labelRenderer.domElement.style.top = "8em";
labelRenderer.domElement.style.left = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

scene.background = null;


////////////////////////////////////////////////////////////////////////

// Dipolo: retângulo central
const dipolo = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 3),
    new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.2 })
);
scene.add(dipolo);
dipolo.position.set(0, 0, 0);

function createTrajectory(bend, x = 6 / 2, y = 3 / 2, color, desvc=0.0, desvin=0.0, ang=1) {
    const start = new THREE.Vector3(-x, desvin, 0);
    const control = new THREE.Vector3(desvc, bend + desvin, 0);
    const end = new THREE.Vector3(x, bend - y + desvin, 0);
    const N = 33;
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = [];
    for (let i = 0; i < N + 1; i++) {
        const xi = (i / N) * x - 2 * x;
        const yi = (i / N) * y - y;
        points.push(new THREE.Vector3(xi, yi + desvin, 0));
    }
    points.push(...curve.getPoints(Math.ceil(N*2)));
    for (let i = 0; i < N + 1; i++) {
        const xi = (i / N) * x + x;
        const yi = -(i / N) * y * ang + bend - y;
        points.push(new THREE.Vector3(xi, yi + desvin, 0));
    }

    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color })
    );
    scene.add(line);

    const particle = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 20),
        new THREE.MeshBasicMaterial({ color })
    );
    particle.position.copy(start);
    scene.add(particle);

    return { line, particle, points};
}

const morenrg = createTrajectory(1.7, 3, 1.5, 0x0000ff, -0.2, 0.03, 0.9);
const nominal = createTrajectory(1.5, 3, 1.5, 0x000000, 0, 0);
const lessnrg = createTrajectory(1.3, 3, 1.5, 0xff0000, 0.2, -0.03, 1.1);

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

const depos = createText("#label-depos", "blue");
const deneg = createText("#label-deneg", "red");
const denom = createText("#label-denom");
const dipole = createText("#label-dipole");
scene.add(depos, deneg, denom, dipole);

dipole.position.set(0, -1.2, 0);

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

const pos0 = nominal.points[0];
nominal.particle.position.set(pos0.x, pos0.y, pos0.z);
lessnrg.particle.position.set(pos0.x, pos0.y, pos0.z);
morenrg.particle.position.set(pos0.x, pos0.y, pos0.z);

function updateFrame(delta, theta) {
    let t = theta * 0.4;
    let part = null;
    let label = null;
    let yshift = 0;
    let pos = null;
    if (t > 3) {
        t = t % 3;
        nominal.particle.position.set(pos0.x, pos0.y, pos0.z);
        lessnrg.particle.position.set(pos0.x, pos0.y, pos0.z);
        morenrg.particle.position.set(pos0.x, pos0.y, pos0.z);
    }

    if (0 < t && t <= 1) {
        part = nominal;
        label = denom;
        yshift = 0.3;
        nominal.particle.visible = true;
        lessnrg.particle.visible = false;
        morenrg.particle.visible = false;
        denom.visible = true;
        deneg.visible = false;
        depos.visible = false;
    }
    else if (1 < t && t <= 2) {
        t -= 1;
        part = lessnrg;
        label = deneg;
        yshift = -0.3;
        nominal.particle.visible = false;
        lessnrg.particle.visible = true;
        morenrg.particle.visible = false;
        denom.visible = false;
        deneg.visible = true;
        depos.visible = false;
    }
    else if (2 < t && t <= 3) {
        t -= 2;
        part = morenrg;
        label = depos;
        yshift = 0.3;
        nominal.particle.visible = false;
        lessnrg.particle.visible = false;
        morenrg.particle.visible = true;
        denom.visible = false;
        deneg.visible = false;
        depos.visible = true;
    }

    if (part) {
        const idx = Math.floor(t*(part.points.length - 1)) - 1;
        pos = part.points[idx];
        if (pos) {
            part.particle.position.set(pos.x, pos.y, pos.z);
            label.position.set(pos.x, pos.y + yshift, pos.z);
        }
    }

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
