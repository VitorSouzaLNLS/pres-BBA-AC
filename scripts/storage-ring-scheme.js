import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const container = document.getElementById("storage-ring-three-container");
const scene = new THREE.Scene();

const frustumHeight = 1.5;
const camera = new THREE.OrthographicCamera(
    (-frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    (frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    1000,
);
camera.position.set(-1, 1.2, 1);
camera.lookAt(0, 0, 0);

// const controls = new OrbitControls(camera, container);
// controls.enableDamping = true;

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
labelRenderer.domElement.style.top = "0px";
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

/////////////////////////////////////////////////////////
/////////////////      The  Scene     ///////////////////
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
/////////////////     The  Scene     ///////////////////
/////////////////////////////////////////////////////////

// Parâmetros do Anel
const R = 1;
const n = 10;
const res = 8.0 / n;

// Paleta de Cores
const vchambColor = 0x888888; // Cinza (Câmara de vácuo)
const quadColor = 0xffa500;   // Laranja (Quadrupolos)
const dipColor = 0x0000cd;    // Azul médio (Dipolos)
const sextColor = 0x228b22;   // Verde forte (Sextupolos)
const cavityColor = 0xd3d3d3; // Cinza claro (Cavidade RF)

// Iluminação (Necessária para enxergar materiais 3D)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(2, 5, 3);
scene.add(dirLight);

// Função equivalente ao xyline (interpolação vetorial)
function xyline(p1, p2, rate = 0.5) {
    return p1.clone().lerp(p2, rate);
}

// ---------------- Criadores de Geometria ----------------

function createQuad(p, t, color_=quadColor, depth=0.2, height=0.8, width=0.8) {
    const geom = new THREE.BoxGeometry(res * depth / 10, res * height / 10, res * width / 10);
    const mat = new THREE.MeshStandardMaterial({ color: color_ });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.y = t; // Equivalente ao -t*180/pi do Asymptote
    mesh.position.copy(p);
    scene.add(mesh);
}

function createDip(p, t) {
    const geom = new THREE.BoxGeometry(res * 1.4 / 10, res * 0.8 / 10, res * 0.8 / 10);
    const mat = new THREE.MeshStandardMaterial({ color: dipColor });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.y = t;
    mesh.position.copy(p);
    scene.add(mesh);
}

function createSext(p, t) {
    const group = new THREE.Group();
    const siz = 0.04;
    const a = -15 * Math.PI / 180;
    
    // Dimensões simulando a interseção de caixas do Asymptote
    const sz = res * siz * 0.4;
    const sx = res * siz * 1.3;
    const sy = res * siz * (2 - Math.sin(a));
    
    const geom = new THREE.BoxGeometry(sx, sz, sy);
    const mat = new THREE.MeshStandardMaterial({ color: sextColor });
    
    // Cria a forma de "estrela" de 6 pontas
    for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.y = i * Math.PI / 3; // 0, 60, 120 graus
        group.add(mesh);
    }

    group.rotation.z = Math.PI / 2;
    // group.rotation.x = Math.PI / 2;
    group.rotation.y = t;
    group.position.copy(p);
    scene.add(group);
}

function createCavity(p, t) {
    const group = new THREE.Group();
    const siz = 1 / 17;
    const radius = res * siz;
    const height = res * 3 * siz;
    
    // Cilindro central (com 16 faces para ficar arredondado)
    const geom = new THREE.CylinderGeometry(radius, radius, height, 16);
    const mat = new THREE.MeshStandardMaterial({ color: cavityColor });
    const mesh = new THREE.Mesh(geom, mat);
    
    mesh.rotation.x = Math.PI / 2; // Alinha cilindro com o eixo do tubo
    group.add(mesh);
    
    group.rotation.y = (t - Math.PI / 2);
    group.position.copy(p);
    scene.add(group);
}

function createVacuumChamber(p1, p2) {
    const dist = p1.distanceTo(p2);
    // Usamos um cilindro fino no lugar da linha para renderizar melhor em 3D
    const geom = new THREE.CylinderGeometry(0.004, 0.004, dist, 8);
    const mat = new THREE.MeshStandardMaterial({ color: vchambColor });
    const mesh = new THREE.Mesh(geom, mat);
    
    // Posiciona no meio e aponta para o próximo nó
    mesh.position.copy(p1).lerp(p2, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    scene.add(mesh);
}

// ---------------- Lógica Principal do Anel ----------------
const dip_text = createText("#label-dips", "blue");
const quad_text = createText("#label-quads", "darkorange");
const sext_text = createText("#label-sexts", "green");
const vchamb_text = createText("#label-vchambs", "gray");
const rf_text = createText("#label-rfcavs", "gray");
const bpm_text = createText("#label-bpms", "black");
const inj_text = createText("#label-inj", "gray");

const yshift = -0.15 * R;
const rshift = 1.3 * R;
dip_text.position.set(0, yshift, 1.3*R);

quad_text.position.set(-0.3*R, yshift, -1.2*R);

rf_text.position.set(0.9*R, yshift, 0.8*R);

sext_text.position.set(0.9*rshift, yshift, 0.2*rshift);

vchamb_text.position.set(-1.3*R, yshift, -0.1*R);

bpm_text.position.set(0.4*R, yshift, -0.5*R);

inj_text.position.set(-0.1*R, yshift, 0.6*R);

scene.add(dip_text, quad_text, sext_text, vchamb_text, rf_text, bpm_text, inj_text);

for (let i = 0; i < n; i++) {
    let theta = i * 2 * Math.PI / n;
    let thetan = (i + 1) * 2 * Math.PI / n;
    
    // Mapeando a trigonometria do Asymptote pro plano XZ (Y é altura no Threejs)
    let p = new THREE.Vector3(R * Math.sin(theta), 0, R * Math.cos(theta));
    let pn = new THREE.Vector3(R * Math.sin(thetan), 0, R * Math.cos(thetan));
    let t_mid = (thetan + theta) / 2;

    // Tubo da Câmara de Vácuo
    createVacuumChamber(p, pn);

    // Feixe de Injeção (Seta)
    if (i === n - 1) {
        let start = new THREE.Vector3(R / 5, 0, R / 1.4);
        
        var x0 = 0.3;
        var ll = 0.3;
        createVacuumChamber(start, xyline(p, pn, x0));
        createQuad(xyline(p, pn, x0 - ll/4), t_mid, "gray", ll, 0.6, 0.6);
        createQuad(xyline(p, pn, x0), t_mid, "gray", ll, 0.6, 0.6);
        createQuad(xyline(p, pn, x0 + ll/4), t_mid, "gray", ll, 0.6, 0.6);
        
    }

    // Componentes ao longo do tubo
    if (i !== 1) {
        let r1 = 0.2;
        createQuad(xyline(p, pn, 1 - r1), t_mid);
        if (i !== n - 1) {
            createQuad(xyline(p, pn, r1), t_mid);
        }

        let r2 = 0.3;
        createSext(xyline(p, pn, 1 - r2), t_mid);
        if (i !== n - 1) {
            createSext(xyline(p, pn, r2), t_mid);
        }

        let r3 = 0.35;
        createQuad(xyline(p, pn, 1 - r3), t_mid, "black", 0.2, 0.3, 0.3);
        if (i !== n - 1) {
            createQuad(xyline(p, pn, r3), t_mid, "black", 0.2, 0.3, 0.3);
        }

    } else {
        // Cavidade RF na célula 1
        let spo = xyline(p, pn, 0.5);
        createCavity(spo, t_mid);
    }

}

// Lógica independente dos Dipolos Magnéticos
for (let i = 0; i < n; i++) {
    let theta = i * 2 * Math.PI / n;
    let p_dip = new THREE.Vector3(
        (R - 0.02 * res) * Math.sin(theta), 
        0, 
        (R - 0.02 * res) * Math.cos(theta)
    );
    createDip(p_dip, theta);
}

// const Xaxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), R, "red");
// const Yaxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), R, "green");
// const Zaxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), R, "blue");
// scene.add(Xaxis, Yaxis, Zaxis);
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

const orbit_pts = [];
for (let i = 0; i < n; i++) {
    let theta = -i * 2 * Math.PI / n;
    let thetan = -(i + 1) * 2 * Math.PI / n;
    
    // Mapeando a trigonometria do Asymptote pro plano XZ (Y é altura no Threejs)
    let p = new THREE.Vector3(R * Math.sin(theta), 0, R * Math.cos(theta));
    let pn = new THREE.Vector3(R * Math.sin(thetan), 0, R * Math.cos(thetan));
    let t_mid = (thetan + theta) / 2;

    for (let j = 0; j < 6; j++) {
        orbit_pts.push(xyline(p, pn, j/6));
    }
}

const orbit = new THREE.CatmullRomCurve3(orbit_pts);

const eletron = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshBasicMaterial({ color: 'red' })
);
scene.add(eletron);
eletron.position.copy(orbit.getPoint(0));

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////


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

function updateFrame(progresso) {

    // controls.update();

    if (progresso > 1) progresso %= 1;

    eletron.position.copy(orbit.getPoint(progresso));

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

let animationId = null;
let isAnimating = false;
let progresso = 0;

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
    progresso += delta * 0.2;
    updateFrame(progresso);
}

function renderImage() {
    onResize();
    clock.reset();
    clock.update();

    updateFrame(progresso); // posiciona tudo

    // 1. Renderiza e captura só 3D (órbita, setas, etc.)
    renderer.render(scene, camera);
    const threeDataURL = renderer.domElement.toDataURL("image/png", 1.0);
    renderer.dispose();
    container.removeChild(renderer.domElement);

    const a = document.createElement("img");
    a.src = threeDataURL;
    container.appendChild(a);
    a.style.zIndex = 1;
    a.style.scale = 1.07;

    // 2. Renderiza e captura só labels (transparente)
    [dip_text, quad_text, sext_text, vchamb_text, rf_text, bpm_text, inj_text].forEach(
        t => {
            t.style.margin = 0;
            t.style.padding = 0;
        }
    );
    labelRenderer.render(scene, camera);
    // const labelsDataURL = labelRenderer.domElement.toDataURL("image/png", 1.0);

    // 3. Cria canvas temporário para COMBINAR as duas imagens
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
    //         finalImg.id = "finalImg";
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
    //         container.id = "finalContainer";
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
