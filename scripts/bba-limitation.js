import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const container = document.getElementById("bbalim-three-container");
const scene = new THREE.Scene();

const frustumHeight = 10;
const camera = new THREE.OrthographicCamera(
    (-frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    (frustumHeight * (container.clientWidth / container.clientHeight)) / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    1000,
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true, // ADICIONE ISSO: permite capturar o canvas
});
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "4em";
labelRenderer.domElement.style.left = "50%";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

scene.background = null;


////////////////////////////////////////////////////////////////////////

const idealOrbitPoints = [
    new THREE.Vector3(9, 0, 0), // Começa na mesma posição X do feixe
    new THREE.Vector3(-9, 0, 0) // Termina na mesma posição X do final da tela
];

const idealOrbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(idealOrbitPoints),
    new THREE.LineDashedMaterial({
        color: 0x000000, // Cinza claro
        dashSize: 0.5, // Tamanho do traço
        gapSize: 0.2, // Tamanho do espaço
        scale: 1, // Escala geral do tracejado
        transparent: true,
        opacity: 0.8 // Ligeiramente transparente
    })
);
idealOrbit.computeLineDistances(); // Essencial para LineDashedMaterial funcionar
scene.add(idealOrbit);


////////////////////////////////////////////////////////////////////////

const shape = new THREE.Shape();

const larg = 2;
const alt = 6;
// Começa no topo esquerdo
shape.moveTo(-larg / 2, alt / 2);
// Linha para o topo direito
shape.lineTo(larg / 2, alt / 2);
// Linha para o centro (o "pescoço" da ampulheta)
shape.lineTo(0, 0);
// Linha para a base direita
shape.lineTo(larg / 2, -alt / 2);
// Linha para a base esquerda
shape.lineTo(-larg / 2, -alt / 2);
// Fecha voltando para o centro e depois para o início
shape.lineTo(0, 0);
shape.lineTo(-larg / 2, alt / 2);

const geometry = new THREE.ShapeGeometry(shape);
const material = new THREE.MeshBasicMaterial({
    color: 0xff6e00,
    side: THREE.DoubleSide, // Importante para ver os dois lados no 3D
    transparent: true,
    opacity: 0.8
});


const quad = new THREE.Mesh(geometry, material);
scene.add(quad);

const xshift = 3;
quad.position.set(xshift, 0, 0);
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

const quadlabel = createText("#bbalim-label-Quad");
const beamlabel = createText("#bbalim-label-beam", "red");
scene.add(quadlabel, beamlabel);

quadlabel.position.set(xshift + 0, 3.5, 0);

const points = [
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 0, 0)
];

const beam1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
);

scene.add(beam1);

////////////////////

// Adicionar após a criação da órbita ideal

// 2. Criar Régua do BPM
function createBpmRegua(x_bpm, offset) {
    const bpmReguaX = - 4 + x_bpm; // Posicionada à esquerda do quadrupolo, por exemplo, a -4 em X
    const bpmReguaYMin = -4; // Limite inferior em Y
    const bpmReguaYMax = 4; // Limite superior em Y
    const numMarcadores = 31; // Número total de marcadores, incluindo 0

    // Linha vertical principal da régua
    const bpmMainReguaPoints = [
        new THREE.Vector3(xshift + bpmReguaX, bpmReguaYMin, 0),
        new THREE.Vector3(xshift + bpmReguaX, bpmReguaYMax, 0)
    ];
    const bpmMainReguaGeometry = new THREE.BufferGeometry().setFromPoints(bpmMainReguaPoints);
    const bpmMainReguaMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const bpmMainRegua = new THREE.Line(bpmMainReguaGeometry, bpmMainReguaMaterial);
    scene.add(bpmMainRegua);

    // Marcadores de traços
    const marcadorMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const sizeMarcadorSmall = 0.3; // Comprimento dos marcadores menores
    const sizeMarcadorLarge = 0.8; // Comprimento dos marcadores principais (ex: 0)

    for (let i = 0; i < numMarcadores; i++) {
        // Calcula a posição Y de cada marcador
        const yPos = bpmReguaYMin + i * (bpmReguaYMax - bpmReguaYMin) / (numMarcadores - 1);

        const size = (i === offset) ? sizeMarcadorLarge : sizeMarcadorSmall; // Marcador central (Y=0) é maior

        const marcadorPoints = [
            new THREE.Vector3(xshift + bpmReguaX - size / 2, yPos, 0),
            new THREE.Vector3(xshift + bpmReguaX + size / 2, yPos, 0)
        ];
        const marcadorGeometry = new THREE.BufferGeometry().setFromPoints(marcadorPoints);
        const marcador = new THREE.Line(marcadorGeometry, marcadorMaterial);
        scene.add(marcador);
    }
}
////////////////////
const bpmlabel = createText("#bbalim-label-BPM");
const zerolabel = createText("#bbalim-label-zero");
scene.add(bpmlabel, zerolabel);
const xbpm = 1;
createBpmRegua(xbpm, 6);
bpmlabel.position.set(xshift - 4 + xbpm, 4.5, 0);
zerolabel.position.set(xshift - 4.7 + xbpm, -2.4, 0);

const bpmlabel1 = createText("#bbalim-label-BPM1");
const zerolabel1 = createText("#bbalim-label-zero1");
scene.add(bpmlabel1, zerolabel1);
const xbpm1 = -3;
createBpmRegua(xbpm1, 22);
bpmlabel1.position.set(xshift - 4 + xbpm1, 4.5, 0);
zerolabel1.position.set(xshift - 4.7 + xbpm1, 1.9, 0);


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

// No topo do seu arquivo bba-principle.js
let currentStep = -1; // -1 significa nenhum fragmento ativo

// Escuta os eventos do Reveal.js
if (window.Reveal) {
    window.Reveal.on('fragmentshown', event => {
        if (event.fragment.classList.contains('bba-step')) {
            currentStep = parseInt(event.fragment.getAttribute('data-fragment-index'));
        }
    });

    window.Reveal.on('fragmenthidden', event => {
        if (event.fragment.classList.contains('bba-step')) {
            currentStep = parseInt(event.fragment.getAttribute('data-fragment-index')) - 1;
        }
    });
}

// Sua função getStep agora apenas retorna essa variável
let lastStep = -1;
function getStep() {
    return currentStep;
}

lastStep = getStep() - 1;
currentStep = getStep();


// Parâmetros físicos (ajuste para a escala visual do seu container)
let K = 0; // Força do quadrupolo (mudar conforme o step)
const quadX = xshift + 0; // Posição X do centro do quadrupolo

const K_list = [0.6, 0.7, 0.5];

const screenEndX = 8; // Onde o feixe termina na tela
const beamSourceX = -8; // Onde o feixe começa

function updateFrame(delta, t) {
    // 1. Define a força K baseada no fragmento ativo do Reveal
    const step = getStep();
    console.log("step", step);

    if (step !== lastStep) {
        clock.reset();
        t = 0;
        lastStep = step;
        return; // Pula um frame para evitar t=0 estranho
    }

    let move = 0;
    if (step === 0) {
        move = 1;
    }
    else {
        move = 0;
    }

    const dy_prime = move * 3 * Math.sin(t * 0.9);

    for (const [i, beam] of [beam1, ].entries()) {

        const positions = beam.geometry.attributes.position.array;

        positions[0] = beamSourceX;
        positions[1] = dy_prime;

        positions[3] = quadX;
        positions[4] = 0;

        const distance = (screenEndX - quadX) / (beamSourceX - quadX);
        positions[6] = screenEndX;
        positions[7] = dy_prime * distance;

        beam.geometry.attributes.position.needsUpdate = true;

        beamlabel.position.set(positions[0] + 0.5, positions[1] + 0.5, 0);
    }

    // bpmlabel.position.set(positions[6], positions[7], 0);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

let animationId = null;
let isAnimating = false;

let lastTime = 0;
const fps = 30;
const frameTime = 1000 / fps;

function renderAnimation(now = 0) {
    if (!isAnimating) return;

    animationId = requestAnimationFrame(renderAnimation);

    if (now - lastTime < frameTime) return;
    lastTime = now;

    clock.update();
    const delta = clock.getDelta();
    const t = clock.getElapsed();
    updateFrame(delta, t);


}

function getStepForPrint() {
    // No modo print, o Reveal isola cada estado de fragmento em um "pdf-page"
    // Procuramos o fragmento que está marcado como atual nesta página específica
    const slide = container.closest('section');
    const fragments = Array.from(slide.querySelectorAll('.fragment.bba-step'));

    // O Reveal marca até onde os fragmentos são visíveis
    const visibleFragments = fragments.filter(f => f.classList.contains('visible'));

    if (visibleFragments.length === 0) return -1;

    // Retorna o índice do último fragmento visível
    return Math.max(...visibleFragments.map(f => parseInt(f.getAttribute('data-fragment-index'))));
}

function renderImage() {
    // 1. Forçar o resize para o tamanho do container no PDF
    onResize();

    // 2. Identificar em qual "página" de fragmento estamos
    const printStep = getStepForPrint();

    // 3. Forçar o estado visual (t=1.745 -> seno = 1 -> deflexão máxima)
    const t_max = 1.745;

    // Forçamos o step global para o updateFrame usar a lógica certa (K_list, etc)
    currentStep = printStep;
    lastStep = printStep; // Evita o reset do clock/t dentro do updateFrame

    // 4. Desenhar o frame
    updateFrame(0, t_max);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    // 5. Captura do 3D
    const dataUrl = renderer.domElement.toDataURL("image/png");

    // 6. Criar a imagem final e limpar o container
    const img = document.createElement("img");
    img.src = dataUrl;
    img.style.width = "100%";
    img.style.display = "block";

    // Substituir o conteúdo para o PDF não tentar renderizar o canvas de novo
    container.innerHTML = '';
    container.appendChild(img);

    // Se houver labels CSS2D importantes, eles precisam de tratamento especial
    // mas como você converteu o 3D para imagem, os labels estáticos do HTML 
    // (BPM, Quad, etc) devem aparecer se não estiverem escondidos por CSS.
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
                    // No modo PDF, não esperamos o observer. 
                    // Damos um pequeno timeout para o Reveal estabilizar os fragmentos nas páginas.
                    setTimeout(() => {
                        renderImage();
                    }, 500);
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
