// ==========================================
// CONFIGURACIÓN DE PUNTUACIÓN Y TIEMPO
// ==========================================
const LEVEL_MINUTES = 30; // Minutos asignados por cada nivel
const PENALTY_PER_MISTAKE = 0.5; // Puntos restados a la nota (sobre 10) por error

let mistakes = 0;
let timeLeft = 0;
let timerInterval = null;

// ==========================================
// FUNCIONES GENERALES Y HERRAMIENTAS
// ==========================================
let audioCtx;
function playTick() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
}

function registerMistake(errorId) {
    mistakes++;
    document.getElementById('mistake-counter').innerText = mistakes;
    const errorMsg = document.getElementById(errorId);
    errorMsg.classList.remove('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 3000);
}

// ==========================================
// CONTROL DEL TEMPORIZADOR
// ==========================================
function startLevelTimer(minutes) {
    clearInterval(timerInterval);
    timeLeft = minutes * 60;
    updateTimerUI();
    document.getElementById('status-bar').classList.remove('hidden');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            triggerGameOver();
        }
    }, 1000);
}

function updateTimerUI() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.innerText = `${m < 10 ? '0':''}${m}:${s < 10 ? '0':''}${s}`;
    
    if (timeLeft <= 60 && timeLeft > 10) {
        timerDisplay.className = "time-warning";
    } else if (timeLeft <= 10) {
        timerDisplay.className = "time-critical";
    } else {
        timerDisplay.className = "";
    }
}

function triggerGameOver() {
    document.getElementById('boot-screen').classList.add('hidden');
    document.getElementById('level-1').classList.add('hidden');
    document.getElementById('level-2').classList.add('hidden');
    document.getElementById('level-3').classList.add('hidden');
    document.getElementById('status-bar').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function insertSymbol(inputId, symbol) {
    playTick();
    const input = document.getElementById(inputId);
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    input.value = text.substring(0, start) + symbol + text.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + symbol.length;
}

function renderMathDirectly(elementId, latexStr, color = '#00ff41') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `\\( ${latexStr} \\)`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([el]).then(() => {
            const mjx = el.querySelector('mjx-container');
            if (mjx) mjx.style.color = color; 
        }).catch(err => console.warn("MathJax error:", err));
    }
}

function simulateDownload(nextLevelFunction) {
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    clearInterval(timerInterval);
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5; 
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (nextLevelFunction) setTimeout(nextLevelFunction, 1000); 
        }
        progressBar.style.width = progress + '%';
        progressText.innerText = progress + '%';
        if(progress % 2 === 0) playTick(); 
    }, 250);
}

function skipToLevel(levelNumber) {
    playTick();
    document.getElementById('boot-screen').classList.add('hidden');
    document.getElementById('level-1').classList.add('hidden');
    document.getElementById('level-2').classList.add('hidden');
    document.getElementById('level-3').classList.add('hidden');
    document.getElementById('success-screen').classList.add('hidden');
    
    if (levelNumber === 2) startLevel2();
    else if (levelNumber === 3) startLevel3();
}

// ==========================================
// CONTROL DE EXPONENTES EN TEXTO ENRIQUECIDO
// ==========================================
let expTimer = null;

function enableExponent(id) {
    playTick();
    const el = document.getElementById(id);
    el.focus();
    if (!document.queryCommandState('superscript')) {
        document.execCommand('superscript', false, null);
    }
    startExpTimer();
}

function checkExpState() {
    if (document.queryCommandState('superscript')) {
        startExpTimer();
    } else {
        if (expTimer) clearTimeout(expTimer);
    }
}

function startExpTimer() {
    if(expTimer) clearTimeout(expTimer);
    expTimer = setTimeout(() => {
        if (document.queryCommandState('superscript')) {
            document.execCommand('superscript', false, null);
            document.execCommand('insertHTML', false, '&#8203;'); 
        }
    }, 1500);
}

function getRichText(id) {
    let html = document.getElementById(id).innerHTML;
    html = html.replace(/<sup[^>]*>/gi, '^');
    html = html.replace(/<\/sup>/gi, '');
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || "";
    return text.replace(/[\u200B\uFEFF]/g, '');
}

// ==========================================
// LÓGICA DEL NIVEL 1: IGUALACIÓN
// ==========================================
let currentEq = {};
let solvedNodes = 0;
const nodesRequired = 4;
let availableEqs = [];

function startLevel1() {
    playTick();
    document.getElementById('boot-screen').classList.add('hidden');
    document.getElementById('level-1').classList.remove('hidden');
    solvedNodes = 0;
    availableEqs = [...db.level1]; 
    updateCounterDisplay();
    startLevelTimer(LEVEL_MINUTES);
    loadNextEquation();
}

function loadNextEquation() {
    if(availableEqs.length === 0) availableEqs = [...db.level1];
    const randomIndex = Math.floor(Math.random() * availableEqs.length);
    currentEq = availableEqs.splice(randomIndex, 1)[0];
    
    document.getElementById('step-1-a').classList.remove('hidden');
    document.getElementById('step-1-b').classList.add('hidden');
    document.getElementById('step-1-c').classList.add('hidden');
    
    document.getElementById('base-left').value = '';
    document.getElementById('exp-left').value = '';
    document.getElementById('base-right').value = '';
    document.getElementById('exp-right').value = '';
    document.getElementById('dist-left').value = '';
    document.getElementById('dist-right').value = '';
    document.getElementById('x-input').value = '';
    
    renderMathDirectly('math-display-level-1', currentEq.latexEq, '#00ff41');
}

function updateCounterDisplay() {
    document.getElementById('node-counter').innerText = `${solvedNodes} / ${nodesRequired}`;
}

function checkBase() {
    playTick();
    const baseL = document.getElementById('base-left').value;
    const expL = document.getElementById('exp-left').value;
    const baseR = document.getElementById('base-right').value;
    const expR = document.getElementById('exp-right').value;
    
    if (baseL === currentEq.base && expL === currentEq.leftExp && 
        baseR === currentEq.base && expR === currentEq.rightExp) {
        document.getElementById('step-1-a').classList.add('hidden');
        document.getElementById('step-1-b').classList.remove('hidden');
        renderMathDirectly('math-display-level-1', currentEq.latexSuccess, '#ffff00');
    } else {
        registerMistake('error-1a');
    }
}

function checkDist() {
    playTick();
    const distL = document.getElementById('dist-left').value.replace(/\s+/g, '').toLowerCase();
    const distR = document.getElementById('dist-right').value.replace(/\s+/g, '').toLowerCase();
    
    if (currentEq.distLeft.includes(distL) && currentEq.distRight.includes(distR)) {
        document.getElementById('step-1-b').classList.add('hidden');
        document.getElementById('step-1-c').classList.remove('hidden');
        renderMathDirectly('math-display-level-1', `${distL} = ${distR}`, '#ffff00');
    } else {
        registerMistake('error-1b');
    }
}

function checkX() {
    playTick();
    const xVal = document.getElementById('x-input').value;
    
    if (xVal === currentEq.x) {
        solvedNodes++;
        updateCounterDisplay();
        if (solvedNodes < nodesRequired) {
            document.querySelector('#step-1-c .success-text').innerText = "> Nodo vulnerado. Cargando siguiente IP...";
            setTimeout(() => {
                document.querySelector('#step-1-c .success-text').innerText = "> ¡Ecuación lineal expuesta!";
                loadNextEquation();
            }, 1500);
        } else {
            document.getElementById('level-1').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS MATEMÁTICO VULNERADO. ENRUTANDO A PRECEPTORÍA...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(startLevel2);
        }
    } else {
        registerMistake('error-1c');
    }
}

// ==========================================
// LÓGICA DEL NIVEL 2: FACTOR COMÚN
// ==========================================
let currentEq2 = {};
let solvedLayers = 0;
const layersRequired = 4;
let availableEqs2 = [];

function startLevel2() {
    playTick();
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('level-2').classList.remove('hidden');
    solvedLayers = 0;
    availableEqs2 = [...db.level2]; 
    updateLayerCounterDisplay();
    startLevelTimer(LEVEL_MINUTES);
    loadNextEquation2();
}

function addCascadeLine(id, latexStr) {
    const display = document.getElementById('math-display-level-2');
    const newLine = document.createElement('div');
    newLine.id = id;
    newLine.style.verticalAlign = "middle";
    display.appendChild(newLine);
    renderMathDirectly(id, latexStr, '#00ff41');
}

function loadNextEquation2() {
    if(availableEqs2.length === 0) availableEqs2 = [...db.level2];
    const randomIndex = Math.floor(Math.random() * availableEqs2.length);
    currentEq2 = availableEqs2.splice(randomIndex, 1)[0];
    
    const display = document.getElementById('math-display-level-2');
    display.innerHTML = '<div id="eq-line-0"></div>';
    renderMathDirectly('eq-line-0', currentEq2.latexEq, '#00ff41');
    
    document.getElementById('step-2-a').classList.remove('hidden');
    document.getElementById('step-2-b').classList.add('hidden');
    document.getElementById('step-2-c').classList.add('hidden');
    document.getElementById('step-2-d').classList.add('hidden');
    document.getElementById('step-2-e').classList.add('hidden');
    
    document.getElementById('expansion-input').innerHTML = '';
    document.getElementById('fc-base').value = '';
    document.getElementById('fc-exp').value = '';
    document.getElementById('parenthesis-input').innerHTML = '';
    document.getElementById('sum-input').value = '';
    document.getElementById('reduced-target').value = '';
    document.getElementById('x-input-2').value = '';
    
    document.getElementById('target-original-2').innerText = currentEq2.target;
    document.getElementById('target-original-3').innerText = currentEq2.target;
}

function updateLayerCounterDisplay() {
    document.getElementById('layer-counter').innerText = `${solvedLayers} / ${layersRequired}`;
}

function checkExpansion() {
    playTick();
    let rawText = getRichText('expansion-input');
    if (rawText.includes('=')) rawText = rawText.split('=')[0];
    let userInput = rawText.replace(/\s+/g, '').replace(/\*/g, '.').toLowerCase();
    
    if (currentEq2.expansion.includes(userInput)) {
        document.getElementById('step-2-a').classList.add('hidden');
        addCascadeLine('eq-line-1', currentEq2.latexExpansion + " = " + currentEq2.target);
        document.getElementById('step-2-b').classList.remove('hidden');
    } else {
        registerMistake('error-2a');
    }
}

function checkFactor() {
    playTick();
    const base = document.getElementById('fc-base').value;
    const exp = document.getElementById('fc-exp').value.replace(/\s+/g, '').toLowerCase();
    
    if (base === currentEq2.fcBase && exp === currentEq2.fcExp) {
        document.getElementById('step-2-b').classList.add('hidden');
        
        let latexStr = `${currentEq2.fcBase}^{${currentEq2.fcExp}} \\cdot ( \\dots ) = ${currentEq2.target}`;
        addCascadeLine('eq-line-2', latexStr);
        
        document.getElementById('fc-display').innerHTML = `${currentEq2.fcBase}<sup>${currentEq2.fcExp}</sup>`;
        document.getElementById('fc-display-2').innerHTML = `${currentEq2.fcBase}<sup>${currentEq2.fcExp}</sup>`;
        document.getElementById('step-2-c').classList.remove('hidden');
    } else {
        registerMistake('error-2b');
    }
}

function checkParenthesis() {
    playTick();
    let rawText = getRichText('parenthesis-input');
    const userInput = rawText.replace(/\s+/g, '').toLowerCase();
    
    if (currentEq2.validParenthesis.includes(userInput)) {
        document.getElementById('step-2-c').classList.add('hidden');
        
        let latexStr = `${currentEq2.fcBase}^{${currentEq2.fcExp}} \\cdot ( ${currentEq2.latexParenthesis} ) = ${currentEq2.target}`;
        renderMathDirectly('eq-line-2', latexStr, '#00ff41');
        
        document.getElementById('step-2-d').classList.remove('hidden');
    } else {
        registerMistake('error-2c');
    }
}

function checkSum() {
    playTick();
    const userInput = document.getElementById('sum-input').value.replace(/\s+/g, '');
    
    if (currentEq2.sumResult.includes(userInput)) {
        document.getElementById('step-2-d').classList.add('hidden');
        
        let latexFrac = userInput;
        if (userInput.includes('/')) {
            let partes = userInput.split('/');
            latexFrac = `\\frac{${partes[0]}}{${partes[1]}}`;
        }
        
        let latexStr = `${currentEq2.fcBase}^{${currentEq2.fcExp}} \\cdot ${latexFrac} = ${currentEq2.target}`;
        addCascadeLine('eq-line-3', latexStr);
        
        document.getElementById('fc-display-3').innerHTML = `${currentEq2.fcBase}<sup>${currentEq2.fcExp}</sup>`;
        document.getElementById('step-2-e').classList.remove('hidden');
    } else {
        registerMistake('error-2d');
    }
}

function checkLevel2Final() {
    playTick();
    const reducedTarget = document.getElementById('reduced-target').value;
    const xVal = document.getElementById('x-input-2').value;
    
    if (reducedTarget === currentEq2.reducedTarget && xVal === currentEq2.x) {
        renderMathDirectly('eq-line-3', `${currentEq2.fcBase}^{${currentEq2.fcExp}} = ${currentEq2.reducedTarget}`, '#ffff00');
        
        solvedLayers++;
        updateLayerCounterDisplay();
        
        if (solvedLayers < layersRequired) {
            document.querySelector('#step-2-e .success-text').innerText = "> Capa vulnerada. Accediendo a la siguiente...";
            setTimeout(() => {
                document.querySelector('#step-2-e .success-text').innerText = "> Suma procesada en el sistema.";
                loadNextEquation2();
            }, 2500); 
        } else {
            document.getElementById('level-2').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS DESTRUIDO. ACCEDIENDO AL NÚCLEO (CAMBIO DE VARIABLE)...";
            document.getElementById('success-screen').classList.remove('hidden');
            
            simulateDownload(() => {
                skipToLevel(3);
            });
        }
    } else {
        registerMistake('error-2e');
    }
}

// ==========================================
// LÓGICA DEL NIVEL 3: EL NÚCLEO (SUSTITUCIÓN)
// ==========================================
let currentEq3 = {};
let solvedCores = 0;
const coresRequired = 4;
let availableEqs3 = [];

// NUEVAS VARIABLES PARA CONTROLAR RUTAS DOBLES
let activeRouteNum = 1; 
let routesSolvedForCurrentEq = 0;
let totalValidRoutes = 0;

function startLevel3() {
    playTick();
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('level-3').classList.remove('hidden');
    solvedCores = 0;
    availableEqs3 = [...db.level3]; 
    updateCoreCounterDisplay();
    startLevelTimer(LEVEL_MINUTES);
    loadNextEquation3();
}

function updateCoreCounterDisplay() {
    document.getElementById('core-counter').innerText = `${solvedCores} / ${coresRequired}`;
}

function addCascadeLine3(id, latexStr, color = '#00ff41') {
    const display = document.getElementById('math-display-level-3');
    // CORRECCIÓN: Verifica si la línea ya existe para no duplicarla
    let newLine = document.getElementById(id);
    if (!newLine) {
        newLine = document.createElement('div');
        newLine.id = id;
        newLine.style.verticalAlign = "middle";
        display.appendChild(newLine);
    }
    renderMathDirectly(id, latexStr, color);
}

function loadNextEquation3() {
    if(availableEqs3.length === 0) availableEqs3 = [...db.level3];
    const randomIndex = Math.floor(Math.random() * availableEqs3.length);
    currentEq3 = availableEqs3.splice(randomIndex, 1)[0];
    
    // Contar cuántas rutas válidas tiene la ecuación actual
    routesSolvedForCurrentEq = 0;
    totalValidRoutes = (currentEq3.route1 && currentEq3.route1.isValid ? 1 : 0) + 
                       (currentEq3.route2 && currentEq3.route2.isValid ? 1 : 0);
    
    const display = document.getElementById('math-display-level-3');
    display.innerHTML = '<div id="eq3-line-0"></div>';
    renderMathDirectly('eq3-line-0', currentEq3.latexEq, '#00ff41');
    
    document.getElementById('step-3-a').classList.remove('hidden');
    document.getElementById('step-3-b').classList.add('hidden');
    document.getElementById('step-3-c').classList.add('hidden');
    document.getElementById('step-3-d').classList.add('hidden');
    
    document.getElementById('u-base').value = '';
    document.getElementById('u-exp').value = '';
    document.getElementById('u-root-1').value = '';
    document.getElementById('u-root-2').value = '';
    
    if (document.getElementById('log-inject-left')) document.getElementById('log-inject-left').innerHTML = '';
    if (document.getElementById('log-inject-right')) document.getElementById('log-inject-right').value = '';
    if (document.getElementById('log-power-input')) document.getElementById('log-power-input').value = '';
    if (document.getElementById('log-final-num')) document.getElementById('log-final-num').value = '';
    if (document.getElementById('log-final-den')) document.getElementById('log-final-den').value = '';
    
    // Restablecer cajas de rutas
    document.getElementById('route-1-box').style.opacity = "1";
    document.getElementById('route-1-box').style.display = "block";
    document.getElementById('route-2-box').style.opacity = "1";
    document.getElementById('route-2-box').style.display = "block";
    
    renderMathDirectly('bhaskara-formula', "u = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "#ffff00");
}

function checkMask3() {
    playTick();
    const base = document.getElementById('u-base').value;
    const exp = document.getElementById('u-exp').value.replace(/\s+/g, '').toLowerCase();
    
    if (base === currentEq3.uBase && exp === currentEq3.uExp) {
        document.getElementById('step-3-a').classList.add('hidden');
        addCascadeLine3('eq3-line-1', currentEq3.latexIntermediate);
        addCascadeLine3('eq3-line-2', currentEq3.latexQuad, '#ffff00');
        document.getElementById('step-3-b').classList.remove('hidden');
    } else {
        registerMistake('error-3a');
    }
}

function checkRoots3() {
    playTick();
    const r1 = document.getElementById('u-root-1').value;
    const r2 = document.getElementById('u-root-2').value;
    
    const isCorrect = (r1 === currentEq3.root1 && r2 === currentEq3.root2) || 
                      (r1 === currentEq3.root2 && r2 === currentEq3.root1);
                      
    if (isCorrect) {
        document.getElementById('step-3-b').classList.add('hidden');
        addCascadeLine3('eq3-line-3', `u_1 = ${currentEq3.root1} \\quad \\text{|} \\quad u_2 = ${currentEq3.root2}`);
        renderMathDirectly('route-1-math', currentEq3.route1.latex);
        renderMathDirectly('route-2-math', currentEq3.route2.latex);
        document.getElementById('step-3-c').classList.remove('hidden');
    } else {
        registerMistake('error-3b');
    }
}

function discardRoute(routeNum) {
    playTick();
    const route = routeNum === 1 ? currentEq3.route1 : currentEq3.route2;
    const errorMsg = document.getElementById('error-3c');
    
    if (!route.isValid) {
        document.getElementById(`route-${routeNum}-box`).style.opacity = "0.2";
        errorMsg.innerText = "> Ruta descartada: Al aplicar logaritmo a ambos miembros, este no está definido para números menores o iguales a cero.";
        errorMsg.style.color = "#00ff41";
        errorMsg.classList.remove('hidden');
    } else {
        mistakes++;
        document.getElementById('mistake-counter').innerText = mistakes;
        errorMsg.innerText = "> Error: Esta ruta posee una solución real válida. No debes descartarla.";
        errorMsg.style.color = "#ff3333";
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
    }
}

function selectRoute(routeNum) {
    playTick();
    activeRouteNum = routeNum; // Guardar qué ruta estamos resolviendo
    const route = routeNum === 1 ? currentEq3.route1 : currentEq3.route2;
    const errorMsg = document.getElementById('error-3c');
    
    if (route.isValid) {
        document.getElementById('step-3-c').classList.add('hidden');
        // Separamos la cascada por ID de ruta
        addCascadeLine3('eq3-line-4-' + activeRouteNum, route.latex, '#00ff41');
        document.getElementById('step-3-d').classList.remove('hidden');
        
        if (route.type === "log") {
            document.getElementById('log-inject-left').innerHTML = '';
            document.getElementById('log-inject-right').value = '';
            document.getElementById('sub-step-log-1').classList.remove('hidden');
            document.getElementById('sub-step-log-2').classList.add('hidden');
            document.getElementById('sub-step-log-3').classList.add('hidden');
            if (document.getElementById('sub-step-base-1')) document.getElementById('sub-step-base-1').classList.add('hidden');
        } else if (route.type === "base") {
            document.getElementById('base-exp-left').value = '';
            document.getElementById('base-exp-right').value = '';
            document.getElementById('sub-step-base-1').classList.remove('hidden');
            document.getElementById('sub-step-log-1').classList.add('hidden');
            document.getElementById('sub-step-log-2').classList.add('hidden');
            document.getElementById('sub-step-log-3').classList.add('hidden');
        }
    } else {
        mistakes++;
        document.getElementById('mistake-counter').innerText = mistakes;
        errorMsg.innerText = "> Error: No puedes desencriptar una raíz negativa en los reales.";
        errorMsg.style.color = "#ff3333";
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

function checkLogInject() {
    playTick();
    let rawLeft = getRichText('log-inject-left').replace(/\s+/g, '').toLowerCase();
    let rawRight = document.getElementById('log-inject-right').value.replace(/\s+/g, '').toLowerCase();
    
    const currentRoute = activeRouteNum === 1 ? currentEq3.route1 : currentEq3.route2;
    
    let expectedLeft = `${currentEq3.uBase}^${currentEq3.uExp}`.toLowerCase();
    let expectedRight = currentRoute.logArg;

    if (rawLeft === expectedLeft && rawRight === expectedRight) {
        document.getElementById('sub-step-log-1').classList.add('hidden');
        addCascadeLine3('eq3-line-log1-' + activeRouteNum, `\\log(${currentEq3.uBase}^{${currentEq3.uExp}}) = \\log(${currentRoute.logArg})`, '#00ff41');
        document.getElementById('log-base-display').innerText = `log(${currentEq3.uBase})`;
        document.getElementById('log-arg-display').innerText = `log(${currentRoute.logArg})`;
        document.getElementById('log-power-input').value = '';
        document.getElementById('sub-step-log-2').classList.remove('hidden');
    } else {
        registerMistake('error-log-1');
    }
}

function checkLogPower() {
    playTick();
    let expInput = document.getElementById('log-power-input').value.replace(/\s+/g, '').toLowerCase();
    const currentRoute = activeRouteNum === 1 ? currentEq3.route1 : currentEq3.route2;
    
    if (expInput === currentEq3.uExp.toLowerCase()) {
        document.getElementById('sub-step-log-2').classList.add('hidden');
        addCascadeLine3('eq3-line-log2-' + activeRouteNum, `${currentEq3.uExp} \\cdot \\log(${currentEq3.uBase}) = \\log(${currentRoute.logArg})`, '#00ff41');
        document.getElementById('log-final-num').value = '';
        document.getElementById('log-final-den').value = '';
        document.getElementById('sub-step-log-3').classList.remove('hidden');
    } else {
        registerMistake('error-log-2');
    }
}

function checkFinalLog3() {
    playTick();
    let numInput = document.getElementById('log-final-num').value.replace(/\s+/g, '').toLowerCase();
    let denInput = document.getElementById('log-final-den').value.replace(/\s+/g, '').toLowerCase();
    
    const currentRoute = activeRouteNum === 1 ? currentEq3.route1 : currentEq3.route2;
    
    let expectedNum = `log(${currentRoute.logArg})`;
    let expectedDen = `log(${currentEq3.uBase})`;
    let altNum = currentRoute.logArg;
    let altDen = currentEq3.uBase;
    
    let numCorrect = (numInput === expectedNum || numInput === altNum);
    let denCorrect = (denInput === expectedDen || denInput === altDen);

    if (numCorrect && denCorrect) {
        addCascadeLine3('eq3-line-log3-' + activeRouteNum, `x = \\frac{\\log(${currentRoute.logArg})}{\\log(${currentEq3.uBase})}`, '#00ff41');
        addCascadeLine3('eq3-line-5-' + activeRouteNum, `x = \\log_{${currentEq3.uBase}}(${currentRoute.logArg})`, '#ffff00');
        
        routesSolvedForCurrentEq++;
        
        if (routesSolvedForCurrentEq < totalValidRoutes) {
            // AÚN FALTAN RUTAS DE ESTA ECUACIÓN
            const feedbackText = document.querySelector('#step-3-d p.success-text');
            const originalText = feedbackText.innerText;
            feedbackText.innerText = "> ¡Primera ruta desencriptada! Vuelve a seleccionar la ruta restante...";
            
            setTimeout(() => {
                feedbackText.innerText = originalText;
                document.getElementById('step-3-d').classList.add('hidden');
                document.getElementById('step-3-c').classList.remove('hidden');
                document.getElementById(`route-${activeRouteNum}-box`).style.display = 'none'; // Oculta la resuelta
            }, 3000);
            
        } else {
            // TODAS LAS RUTAS RESUELTAS
            solvedCores++;
            updateCoreCounterDisplay();
            
            if (solvedCores < coresRequired) {
                const step3D_P = document.getElementById('log-instructions-text');
                const originalText = step3D_P.innerText;
                
                step3D_P.innerText = `> ¡Solución encontrada! Ecuación ${solvedCores} de ${coresRequired} superada.`;
                step3D_P.style.color = "#ffff00";
                
                setTimeout(() => {
                    step3D_P.innerText = "> Inicializando siguiente secuencia encriptada...";
                    step3D_P.style.color = "#00ff41";
                }, 2500);

                setTimeout(() => {
                    step3D_P.innerText = originalText;
                    step3D_P.style.color = "";
                    loadNextEquation3();
                }, 4500); 
            } else {
                document.getElementById('level-3').classList.add('hidden');
                document.getElementById('status-bar').classList.add('hidden');
                document.getElementById('success-message').innerText = "> PROTOCOLO SUPERADO. Modificando promedios a 10 en la base de datos...";
                document.getElementById('success-screen').classList.remove('hidden');
                
                simulateDownload(() => {
                    document.getElementById('success-screen').classList.add('hidden');
                    document.getElementById('final-prank-screen').classList.remove('hidden');
                });
            }
        }
    } else {
        registerMistake('error-log-3');
    }
}

function checkBaseMatch3() {
    playTick();
    let expL = document.getElementById('base-exp-left').value.replace(/\s+/g, '').toLowerCase();
    let expR = document.getElementById('base-exp-right').value.replace(/\s+/g, '').toLowerCase();
    
    const currentRoute = activeRouteNum === 1 ? currentEq3.route1 : currentEq3.route2;
    
    if (expL === currentRoute.matchExpLeft && expR === currentRoute.matchExpRight) {
        document.getElementById('sub-step-base-1').classList.add('hidden');
        addCascadeLine3('eq3-line-5-' + activeRouteNum, `x = ${currentRoute.finalX}`, '#ffff00');
        
        routesSolvedForCurrentEq++;
        
        if (routesSolvedForCurrentEq < totalValidRoutes) {
             // AÚN FALTAN RUTAS DE ESTA ECUACIÓN
             const feedbackText = document.querySelector('#step-3-d p.success-text');
             const originalText = feedbackText.innerText;
             feedbackText.innerText = "> ¡Primera ruta desencriptada! Vuelve a seleccionar la ruta restante...";
             
             setTimeout(() => {
                 feedbackText.innerText = originalText;
                 document.getElementById('step-3-d').classList.add('hidden');
                 document.getElementById('step-3-c').classList.remove('hidden');
                 document.getElementById(`route-${activeRouteNum}-box`).style.display = 'none'; // Oculta la resuelta
             }, 3000);
        } else {
            // TODAS LAS RUTAS RESUELTAS
            solvedCores++;
            updateCoreCounterDisplay();
            
            if (solvedCores < coresRequired) {
                const step3D_P = document.querySelector('#step-3-d p.success-text');
                const originalText = step3D_P.innerText;
                
                step3D_P.innerText = `> ¡Solución encontrada! Ecuación ${solvedCores} de ${coresRequired} superada.`;
                
                setTimeout(() => {
                    step3D_P.innerText = "> Inicializando siguiente secuencia encriptada...";
                }, 2500);

                setTimeout(() => {
                    step3D_P.innerText = originalText;
                    loadNextEquation3();
                }, 4500); 
            } else {
                document.getElementById('level-3').classList.add('hidden');
                document.getElementById('status-bar').classList.add('hidden');
                document.getElementById('success-message').innerText = "> PROTOCOLO SUPERADO. Modificando promedios a 10 en la base de datos...";
                document.getElementById('success-screen').classList.remove('hidden');
                
                simulateDownload(() => {
                    document.getElementById('success-screen').classList.add('hidden');
                    document.getElementById('final-prank-screen').classList.remove('hidden');
                });
            }
        }
    } else {
        registerMistake('error-base-1');
    }
}

// ==========================================
// LÓGICA DE LA BROMA FINAL Y NOTAS
// ==========================================

// Array con las frases que se van a ir repitiendo
const taunts = [
    "¡Casi!",
    "Tenés que ser más rápido...",
    "¿No podés?",
    "Mmm... falta velocidad.",
    "¡Esforzate un poquito más!",
    "¡Se escapó!"
];
let tauntIndex = 0;

function dodgeButton(btn, event) {
    if (event) {
        event.preventDefault();
    }

    // Crea el elemento de texto dinámicamente si es la primera vez que se mueve
    let tauntLabel = document.getElementById('taunt-message');
    if (!tauntLabel) {
        tauntLabel = document.createElement('p');
        tauntLabel.id = 'taunt-message';
        tauntLabel.style.color = '#ff3333'; // Rojo alerta
        tauntLabel.style.fontSize = '1.3em';
        tauntLabel.style.fontWeight = 'bold';
        tauntLabel.style.marginTop = '-10px';
        tauntLabel.style.marginBottom = '20px';
        tauntLabel.style.textAlign = 'center';
        
        // Lo inserta justo arriba del contenedor donde saltan los botones
        const container = btn.parentElement;
        container.parentElement.insertBefore(tauntLabel, container);
    }

    // Actualiza el texto con la frase actual y avanza en el ciclo
    tauntLabel.style.color = '#ff3333';
    tauntLabel.innerText = "> " + taunts[tauntIndex];
    tauntIndex = (tauntIndex + 1) % taunts.length;

    const container = btn.parentElement;
    const btnDiciembre = document.getElementById('btn-diciembre');
    
    const maxX = container.clientWidth - btn.clientWidth;
    const maxY = container.clientHeight - btn.clientHeight;
    
    let randomX, randomY;
    let isOverlapping = true;
    let attempts = 0;

    while (isOverlapping && attempts < 50) {
        randomX = Math.floor(Math.random() * maxX);
        randomY = Math.floor(Math.random() * Math.max(maxY, 100));

        if (btnDiciembre) {
            const margin = 10;
            const rectA = { x: randomX, y: randomY, width: btn.clientWidth, height: btn.clientHeight };
            const rectD = { 
                x: btnDiciembre.offsetLeft, 
                y: btnDiciembre.offsetTop, 
                width: btnDiciembre.clientWidth, 
                height: btnDiciembre.clientHeight 
            };

            isOverlapping = (
                rectA.x < rectD.x + rectD.width + margin &&
                rectA.x + rectA.width + margin > rectD.x &&
                rectA.y < rectD.y + rectD.height + margin &&
                rectA.y + rectA.height + margin > rectD.y
            );
        } else {
            isOverlapping = false;
        }
        attempts++;
    }
    
    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
}

function catchMeIfYouCan() {
    // Si por algún milagro táctil o glitch logran hacerle clic, no salta un alert, 
    // sino que la frase cambia a un color especial amarillo y el botón huye de nuevo.
    let tauntLabel = document.getElementById('taunt-message');
    if (tauntLabel) {
        tauntLabel.innerText = "> ¡Epa! ¡Casi lo atrapás haciendo trampa!";
        tauntLabel.style.color = "#ffff00"; 
    }
    dodgeButton(document.getElementById('btn-aprobaste'));
}

function acceptDefeat() {
    playTick();
    clearInterval(timerInterval); // Cortar cualquier timer residual
    
    // Calcular Nota: Arranca en 10, resta 0.5 por cada error, piso mínimo en 1
    let baseScore = 10;
    let penalty = mistakes * PENALTY_PER_MISTAKE; 
    let finalGrade = Math.max(1, baseScore - penalty);
    
    let perfectMessage = mistakes === 0 ? "<br><span style='color:#00ff41;'>(¡HACKEO PERFECTO!)</span>" : "";

    document.getElementById('final-prank-screen').innerHTML = `
        <h2 style="color: #ff3333; font-size: 2em; text-align: center;">> SISTEMA BLOQUEADO</h2>
        <div style="background: rgba(0, 255, 65, 0.1); border: 1px solid #00ff41; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: left;">
            <p style="color: #00ff41; font-size: 1.3em; margin: 0 0 10px 0;">> ANÁLISIS DE RENDIMIENTO:</p>
            <p style="color: #ffff00; font-size: 1.1em; margin: 5px 0;">- Nivel de Seguridad Superado: <strong>3/3</strong></p>
            <p style="color: #ff3333; font-size: 1.1em; margin: 5px 0;">- Alertas Disparadas (Errores): <strong>${mistakes}</strong></p>
            <p style="color: #00ff41; font-size: 1.5em; margin: 15px 0 0 0; text-align: center;">
                <strong>NOTA FINAL: ${finalGrade.toFixed(2)} / 10</strong> ${perfectMessage}
            </p>
        </div>
        <p style="color: #00ff41; font-size: 1.2em; text-align: center; margin-top: 20px;">
            ¡Excelente trabajo vulnerando las ecuaciones exponenciales!<br><br>
            ¡Aprobaste!... ¿Pero elegiste Diciembre?<br> 
            <span style="color: #ffff00; font-size: 0.8em;">(No te preocupes, te comparto las fechas).</span>
        </p>
    `;
}

// ==========================================
// HERRAMIENTA DE DESARROLLADOR: BYPASS
// ==========================================
function bypassExercise() {
    playTick();
    
    if (!document.getElementById('level-1').classList.contains('hidden')) {
        solvedNodes++;
        updateCounterDisplay();
        if (solvedNodes < nodesRequired) {
            loadNextEquation();
        } else {
            document.getElementById('level-1').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS MATEMÁTICO VULNERADO. ENRUTANDO A PRECEPTORÍA...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(startLevel2);
        }
    } 
    else if (!document.getElementById('level-2').classList.contains('hidden')) {
        solvedLayers++;
        updateLayerCounterDisplay();
        if (solvedLayers < layersRequired) {
            loadNextEquation2();
        } else {
            document.getElementById('level-2').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS DESTRUIDO. ACCEDIENDO AL NÚCLEO (CAMBIO DE VARIABLE)...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => { skipToLevel(3); });
        }
    } 
    else if (!document.getElementById('level-3').classList.contains('hidden')) {
        solvedCores++;
        updateCoreCounterDisplay();
        if (solvedCores < coresRequired) {
            loadNextEquation3();
        } else {
            document.getElementById('level-3').classList.add('hidden');
            document.getElementById('status-bar').classList.add('hidden');
            document.getElementById('success-message').innerText = "> PROTOCOLO SUPERADO. Modificando promedios a 10 en la base de datos...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => {
                document.getElementById('success-screen').classList.add('hidden');
                document.getElementById('final-prank-screen').classList.remove('hidden');
            });
        }
    }
}
/*
// ==========================================
// HERRAMIENTA DE DESARROLLADOR: BYPASS
// ==========================================
function bypassExercise() {
    playTick();
    
    // Verifica qué nivel está activo para aplicar el salto
    if (!document.getElementById('level-1').classList.contains('hidden')) {
        solvedNodes++;
        updateCounterDisplay();
        if (solvedNodes < nodesRequired) {
            loadNextEquation();
        } else {
            document.getElementById('level-1').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS MATEMÁTICO VULNERADO. ENRUTANDO A PRECEPTORÍA...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(startLevel2);
        }
    } 
    else if (!document.getElementById('level-2').classList.contains('hidden')) {
        solvedLayers++;
        updateLayerCounterDisplay();
        if (solvedLayers < layersRequired) {
            loadNextEquation2();
        } else {
            document.getElementById('level-2').classList.add('hidden');
            document.getElementById('success-message').innerText = "> CORTAFUEGOS DESTRUIDO. ACCEDIENDO AL NÚCLEO (CAMBIO DE VARIABLE)...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => { skipToLevel(3); });
        }
    } 
    else if (!document.getElementById('level-3').classList.contains('hidden')) {
        solvedCores++;
        updateCoreCounterDisplay();
        if (solvedCores < coresRequired) {
            loadNextEquation3();
        } else {
            document.getElementById('level-3').classList.add('hidden');
            document.getElementById('status-bar').classList.add('hidden');
            document.getElementById('success-message').innerText = "> PROTOCOLO SUPERADO. Modificando promedios a 10 en la base de datos...";
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => {
                document.getElementById('success-screen').classList.add('hidden');
                document.getElementById('final-prank-screen').classList.remove('hidden');
            });
        }
    }
}
    */
