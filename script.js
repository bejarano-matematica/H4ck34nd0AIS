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
    const errorMsg = document.getElementById('error-1a');
    
    if (baseL === currentEq.base && expL === currentEq.leftExp && 
        baseR === currentEq.base && expR === currentEq.rightExp) {
        document.getElementById('step-1-a').classList.add('hidden');
        document.getElementById('step-1-b').classList.remove('hidden');
        
        renderMathDirectly('math-display-level-1', currentEq.latexSuccess, '#ffff00');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

function checkDist() {
    playTick();
    const distL = document.getElementById('dist-left').value.replace(/\s+/g, '').toLowerCase();
    const distR = document.getElementById('dist-right').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-1b');
    
    if (currentEq.distLeft.includes(distL) && currentEq.distRight.includes(distR)) {
        document.getElementById('step-1-b').classList.add('hidden');
        document.getElementById('step-1-c').classList.remove('hidden');
        
        // AQUÍ ESTÁ LA CORRECCIÓN: 
        // En lugar de llamar a la ecuación con paréntesis de la base de datos, 
        // imprimimos exactamente lo que el alumno acaba de calcular y validar.
        renderMathDirectly('math-display-level-1', `${distL} = ${distR}`, '#ffff00');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
    }
}

function checkX() {
    playTick();
    const xVal = document.getElementById('x-input').value;
    const errorMsg = document.getElementById('error-1c');
    
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
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(startLevel2);
        }
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
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
    const errorMsg = document.getElementById('error-2a');
    
    if (currentEq2.expansion.includes(userInput)) {
        document.getElementById('step-2-a').classList.add('hidden');
        addCascadeLine('eq-line-1', currentEq2.latexExpansion + " = " + currentEq2.target);
        document.getElementById('step-2-b').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
    }
}

function checkFactor() {
    playTick();
    const base = document.getElementById('fc-base').value;
    const exp = document.getElementById('fc-exp').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-2b');
    
    if (base === currentEq2.fcBase && exp === currentEq2.fcExp) {
        document.getElementById('step-2-b').classList.add('hidden');
        
        let latexStr = `${currentEq2.fcBase}^{${currentEq2.fcExp}} \\cdot ( \\dots ) = ${currentEq2.target}`;
        addCascadeLine('eq-line-2', latexStr);
        
        document.getElementById('fc-display').innerHTML = `${currentEq2.fcBase}<sup>${currentEq2.fcExp}</sup>`;
        document.getElementById('fc-display-2').innerHTML = `${currentEq2.fcBase}<sup>${currentEq2.fcExp}</sup>`;
        document.getElementById('step-2-c').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

function checkParenthesis() {
    playTick();
    let rawText = getRichText('parenthesis-input');
    const userInput = rawText.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-2c');
    
    if (currentEq2.validParenthesis.includes(userInput)) {
        document.getElementById('step-2-c').classList.add('hidden');
        
        let latexStr = `${currentEq2.fcBase}^{${currentEq2.fcExp}} \\cdot ( ${currentEq2.latexParenthesis} ) = ${currentEq2.target}`;
        renderMathDirectly('eq-line-2', latexStr, '#00ff41');
        
        document.getElementById('step-2-d').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
    }
}

function checkSum() {
    playTick();
    const userInput = document.getElementById('sum-input').value.replace(/\s+/g, '');
    const errorMsg = document.getElementById('error-2d');
    
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
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

function checkLevel2Final() {
    playTick();
    const reducedTarget = document.getElementById('reduced-target').value;
    const xVal = document.getElementById('x-input-2').value;
    const errorMsg = document.getElementById('error-2e');
    
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
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => {
                alert("> CORTAFUEGOS DESTRUIDO. ACCEDIENDO AL NÚCLEO (CAMBIO DE VARIABLE)...");
                skipToLevel(3);
            });
        }
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

// ==========================================
// LÓGICA DEL NIVEL 3: EL NÚCLEO (SUSTITUCIÓN)
// ==========================================
let currentEq3 = {};
let solvedCores = 0;
const coresRequired = 4;
let availableEqs3 = [];

function startLevel3() {
    playTick();
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('level-3').classList.remove('hidden');
    solvedCores = 0;
    availableEqs3 = [...db.level3]; 
    updateCoreCounterDisplay();
    loadNextEquation3();
}

function updateCoreCounterDisplay() {
    document.getElementById('core-counter').innerText = `${solvedCores} / ${coresRequired}`;
}

function addCascadeLine3(id, latexStr, color = '#00ff41') {
    const display = document.getElementById('math-display-level-3');
    const newLine = document.createElement('div');
    newLine.id = id;
    newLine.style.verticalAlign = "middle";
    display.appendChild(newLine);
    renderMathDirectly(id, latexStr, color);
}

function loadNextEquation3() {
    if(availableEqs3.length === 0) availableEqs3 = [...db.level3];
    const randomIndex = Math.floor(Math.random() * availableEqs3.length);
    currentEq3 = availableEqs3.splice(randomIndex, 1)[0];
    
    const display = document.getElementById('math-display-level-3');
    display.innerHTML = '<div id="eq3-line-0"></div>';
    renderMathDirectly('eq3-line-0', currentEq3.latexEq, '#00ff41');
    
    document.getElementById('step-3-a').classList.remove('hidden');
    document.getElementById('step-3-b').classList.add('hidden');
    document.getElementById('step-3-c').classList.add('hidden');
    document.getElementById('step-3-d').classList.add('hidden');
    
    // Limpiar inputs
    document.getElementById('u-base').value = '';
    document.getElementById('u-exp').value = '';
    document.getElementById('u-root-1').value = '';
    document.getElementById('u-root-2').value = '';
    
    // Limpiar correctamente los inputs interactivos de log
    if (document.getElementById('log-inject-left')) document.getElementById('log-inject-left').innerHTML = '';
    if (document.getElementById('log-inject-right')) document.getElementById('log-inject-right').value = '';
    if (document.getElementById('log-power-input')) document.getElementById('log-power-input').value = '';
    if (document.getElementById('log-final-num')) document.getElementById('log-final-num').value = '';
    if (document.getElementById('log-final-den')) document.getElementById('log-final-den').value = '';
    
    // Resetear estilos de los botones de ruta
    document.getElementById('route-1-box').style.opacity = "1";
    document.getElementById('route-2-box').style.opacity = "1";
    
    // Inyectar fórmula de Bhaskara
    renderMathDirectly('bhaskara-formula', "u = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "#ffff00");
}

function checkMask3() {
    playTick();
    const base = document.getElementById('u-base').value;
    const exp = document.getElementById('u-exp').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-3a');
    
    if (base === currentEq3.uBase && exp === currentEq3.uExp) {
        document.getElementById('step-3-a').classList.add('hidden');
        
        addCascadeLine3('eq3-line-1', currentEq3.latexIntermediate);
        addCascadeLine3('eq3-line-2', currentEq3.latexQuad, '#ffff00');
        
        document.getElementById('step-3-b').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

function checkRoots3() {
    playTick();
    const r1 = document.getElementById('u-root-1').value;
    const r2 = document.getElementById('u-root-2').value;
    const errorMsg = document.getElementById('error-3b');
    
    const isCorrect = (r1 === currentEq3.root1 && r2 === currentEq3.root2) || 
                      (r1 === currentEq3.root2 && r2 === currentEq3.root1);
                      
    if (isCorrect) {
        document.getElementById('step-3-b').classList.add('hidden');
        
        addCascadeLine3('eq3-line-3', `u_1 = ${currentEq3.root1} \\quad \\text{|} \\quad u_2 = ${currentEq3.root2}`);
        
        renderMathDirectly('route-1-math', currentEq3.route1.latex);
        renderMathDirectly('route-2-math', currentEq3.route2.latex);
        
        document.getElementById('step-3-c').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
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
        errorMsg.innerText = "> Error: Esta ruta posee una solución real válida. No debes descartarla.";
        errorMsg.style.color = "#ff3333";
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
    }
}

function selectRoute(routeNum) {
    playTick();
    const route = routeNum === 1 ? currentEq3.route1 : currentEq3.route2;
    const errorMsg = document.getElementById('error-3c');
    if (route.isValid) {
        document.getElementById('step-3-c').classList.add('hidden');
        addCascadeLine3('eq3-line-4', route.latex, '#00ff41');
        
        document.getElementById('step-3-d').classList.remove('hidden');
        
        if (route.type === "log") {
            // Lógica original de logaritmos
            document.getElementById('log-inject-left').innerHTML = '';
            document.getElementById('log-inject-right').value = '';
            document.getElementById('sub-step-log-1').classList.remove('hidden');
            document.getElementById('sub-step-log-2').classList.add('hidden');
            document.getElementById('sub-step-log-3').classList.add('hidden');
            if (document.getElementById('sub-step-base-1')) document.getElementById('sub-step-base-1').classList.add('hidden');
        } else if (route.type === "base") {
            // Lógica nueva para bases iguales
            document.getElementById('base-exp-left').value = '';
            document.getElementById('base-exp-right').value = '';
            document.getElementById('sub-step-base-1').classList.remove('hidden');
            
            // Ocultamos todo lo de logaritmos por las dudas
            document.getElementById('sub-step-log-1').classList.add('hidden');
            document.getElementById('sub-step-log-2').classList.add('hidden');
            document.getElementById('sub-step-log-3').classList.add('hidden');
        }
    } else {
        errorMsg.innerText = "> Error: No puedes desencriptar una raíz negativa en los reales.";
        errorMsg.style.color = "#ff3333";
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

// VALIDADOR FASE 1: Inyectar Logaritmo
function checkLogInject() {
    playTick();
    let rawLeft = getRichText('log-inject-left').replace(/\s+/g, '').toLowerCase();
    let rawRight = document.getElementById('log-inject-right').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-log-1');
    
    let expectedLeft = `${currentEq3.uBase}^${currentEq3.uExp}`.toLowerCase();
    let expectedRight = currentEq3.route1.logArg;

    if (rawLeft === expectedLeft && rawRight === expectedRight) {
        document.getElementById('sub-step-log-1').classList.add('hidden');
        addCascadeLine3('eq3-line-log1', `\\log(${currentEq3.uBase}^{${currentEq3.uExp}}) = \\log(${currentEq3.route1.logArg})`, '#00ff41');
        
        document.getElementById('log-base-display').innerText = `log(${currentEq3.uBase})`;
        document.getElementById('log-arg-display').innerText = `log(${currentEq3.route1.logArg})`;
        document.getElementById('log-power-input').value = '';
        document.getElementById('sub-step-log-2').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

// VALIDADOR FASE 2: Bajar Exponente
function checkLogPower() {
    playTick();
    let expInput = document.getElementById('log-power-input').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-log-2');
    
    if (expInput === currentEq3.uExp.toLowerCase()) {
        document.getElementById('sub-step-log-2').classList.add('hidden');
        addCascadeLine3('eq3-line-log2', `${currentEq3.uExp} \\cdot \\log(${currentEq3.uBase}) = \\log(${currentEq3.route1.logArg})`, '#00ff41');
        
        document.getElementById('log-final-num').value = '';
        document.getElementById('log-final-den').value = '';
        document.getElementById('sub-step-log-3').classList.remove('hidden');
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2500);
    }
}

// VALIDADOR FASE 3: Despeje Final
function checkFinalLog3() {
    playTick();
    let numInput = document.getElementById('log-final-num').value.replace(/\s+/g, '').toLowerCase();
    let denInput = document.getElementById('log-final-den').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-log-3');
    
    let expectedNum = `log(${currentEq3.route1.logArg})`;
    let expectedDen = `log(${currentEq3.uBase})`;
    
    let altNum = currentEq3.route1.logArg;
    let altDen = currentEq3.uBase;
    
    let numCorrect = (numInput === expectedNum || numInput === altNum);
    let denCorrect = (denInput === expectedDen || denInput === altDen);

    if (numCorrect && denCorrect) {
        
        addCascadeLine3('eq3-line-log3', `x = \\frac{\\log(${currentEq3.route1.logArg})}{\\log(${currentEq3.uBase})}`, '#00ff41');
        addCascadeLine3('eq3-line-5', `x = \\log_{${currentEq3.uBase}}(${currentEq3.route1.logArg})`, '#ffff00');
        
        solvedCores++;
        updateCoreCounterDisplay();
        
        if (solvedCores < coresRequired) {
            // CORRECCIÓN: Usamos querySelector para cambiar el texto del párrafo correcto entre ejercicios
            const step3D_P = document.getElementById('log-instructions-text');
            const originalText = "> Variable aislada. Pasa el factor dividiendo para finalizar la extracción:";
            
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
            document.getElementById('success-screen').classList.remove('hidden');
            
            simulateDownload(() => {
                // Ocultamos la barra de carga y mostramos la trampa
                document.getElementById('success-screen').classList.add('hidden');
                document.getElementById('final-prank-screen').classList.remove('hidden');
            });
        }
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
    }
}

// ==========================================
// LÓGICA DE LA BROMA FINAL
// ==========================================

function dodgeButton(btn, event) {
    if (event) {
        event.preventDefault();
    }

    const container = btn.parentElement;
    const btnDiciembre = document.getElementById('btn-diciembre');
    
    // Obtenemos los límites del contenedor
    const maxX = container.clientWidth - btn.clientWidth;
    const maxY = container.clientHeight - btn.clientHeight;
    
    let randomX, randomY;
    let isOverlapping = true;
    let attempts = 0;

    // Bucle para buscar coordenadas que no choquen con "Diciembre"
    while (isOverlapping && attempts < 50) {
        randomX = Math.floor(Math.random() * maxX);
        randomY = Math.floor(Math.random() * Math.max(maxY, 100));

        if (btnDiciembre) {
            // Evaluamos si las nuevas coordenadas pisan el área del botón Diciembre (con 10px de margen)
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
    
    // Movemos el botón a la zona segura
    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
}
function catchMeIfYouCan() {
    // Por si algún alumno es extremadamente rápido o usa pantalla táctil
    alert("> ERROR DE SEGURIDAD. Esta opción está bloqueada por el administrador.");
    dodgeButton(document.getElementById('btn-aprobaste'));
}

function acceptDefeat() {
    playTick();
    document.getElementById('final-prank-screen').innerHTML = `
        <h2 style="color: #ff3333; font-size: 2em; text-align: center;">> SISTEMA BLOQUEADO</h2>
        <p style="color: #00ff41; font-size: 1.5em; text-align: center; margin-top: 20px;">
            ¡Excelente trabajo vulnerando las ecuaciones exponenciales!<br><br>
            ¡Aprobaste!... ¿Pero elegiste Diciembre?<br> 
            <span style="color: #ffff00; font-size: 0.8em;">(No te preocupes, te comparto las fechas).</span>
        </p>
    `;
}

// VALIDADOR FASE BIFURCADA: Bases Iguales
function checkBaseMatch3() {
    playTick();
    let expL = document.getElementById('base-exp-left').value.replace(/\s+/g, '').toLowerCase();
    let expR = document.getElementById('base-exp-right').value.replace(/\s+/g, '').toLowerCase();
    const errorMsg = document.getElementById('error-base-1');
    
    if (expL === currentEq3.route1.matchExpLeft && expR === currentEq3.route1.matchExpRight) {
        document.getElementById('sub-step-base-1').classList.add('hidden');
        addCascadeLine3('eq3-line-5', `x = ${currentEq3.route1.finalX}`, '#ffff00');
        
        solvedCores++;
        updateCoreCounterDisplay();
        
        if (solvedCores < coresRequired) {
            // Reutilizamos el párrafo superior de step-3-d para dar feedback
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
            document.getElementById('success-screen').classList.remove('hidden');
            simulateDownload(() => {
                document.getElementById('success-screen').classList.add('hidden');
                document.getElementById('final-prank-screen').classList.remove('hidden');
            });
        }
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
    }
}
