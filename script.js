const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
let animationId = null;
let animationProgress = 0;
const stages = ['Admissão', 'Compressão', 'Combustão', 'Exausto'];
let animationRunning = false;
const cycleDuration = 8000;
const stageDuration = cycleDuration / 4;
let lastTime = 0;

// Configurações do desenho ajustadas para o canvas responsivo
let cylinderX, cylinderY, cylinderWidth, cylinderHeight, pistonHeight, valveY, valveRadius, crankRadius, crankX, crankY, pistonTop, pistonBottom;

function setupCanvas() {
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvasWidth * (350 / 550); // Mantém a proporção original

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    cylinderX = canvasWidth * 0.22;
    cylinderY = canvasHeight * 0.11;
    cylinderWidth = canvasWidth * 0.16;
    cylinderHeight = canvasHeight * 0.71;
    pistonHeight = canvasHeight * 0.11;
    valveY = canvasHeight * 0.11;
    valveRadius = canvasWidth * 0.015;
    crankRadius = canvasWidth * 0.045;
    crankX = canvasWidth * 0.3;
    crankY = canvasHeight * 0.89;
    pistonTop = cylinderY;
    pistonBottom = cylinderY + cylinderHeight - pistonHeight;
}

function drawScene(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStage = Math.floor(progress);
    const stageProgress = progress % 1;

    // Cilindro
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(cylinderX, cylinderY, cylinderWidth, cylinderHeight);

    // Pistão
    let pistonY;
    switch (currentStage) {
        case 0: // Admissão: desce
            pistonY = pistonTop + (pistonBottom - pistonTop) * stageProgress;
            break;
        case 1: // Compressão: sobe
            pistonY = pistonBottom - (pistonBottom - pistonTop) * stageProgress;
            break;
        case 2: // Combustão: desce
            pistonY = pistonTop + (pistonBottom - pistonTop) * stageProgress;
            break;
        case 3: // Exausto: sobe
            pistonY = pistonBottom - (pistonBottom - pistonTop) * stageProgress;
            break;
    }
    ctx.fillStyle = '#4b5e73';
    ctx.fillRect(cylinderX + 8, pistonY, cylinderWidth - 16, pistonHeight);

    // Válvulas
    ctx.fillStyle = currentStage === 0 ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(cylinderX + 25, valveY, valveRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = currentStage === 3 ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(cylinderX + 65, valveY, valveRadius, 0, Math.PI * 2);
    ctx.fill();

    // Faísca na combustão
    if (currentStage === 2 && stageProgress < 0.5) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(cylinderX + cylinderWidth / 2, pistonY - 8, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Virabrequim
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(crankX, crankY, crankRadius, 0, Math.PI * 2);
    ctx.stroke();
    const crankAngle = (progress / 4) * (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(crankX, crankY);
    ctx.lineTo(crankX + crankRadius * Math.cos(crankAngle), crankY + crankRadius * Math.sin(crankAngle));
    ctx.stroke();

    // Legendas estilizadas
    const colors = ['#22c55e', '#3b82f6', '#facc15', '#ef4444'];
    const currentColor = colors[currentStage];

    // Fundo das legendas (revertido para estilo anterior)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(250, 20, 270, 130, 8);
    ctx.fill();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Texto das legendas (revertido para estilo anterior)
    ctx.fillStyle = currentColor;
    ctx.font = 'bold 12px Roboto';
    ctx.textAlign = 'left';
    let yPos = 35;
    const lineHeight = 20;
    ctx.fillText(`Pistão: ${currentStage === 0 || currentStage === 2 ? 'Desce' : 'Sobe'}`, 260, yPos);
    yPos += lineHeight;
    ctx.fillText(`Admissão: ${currentStage === 0 ? 'Aberta' : 'Fechada'}`, 260, yPos);
    yPos += lineHeight;
    ctx.fillText(`Escape: ${currentStage === 3 ? 'Aberta' : 'Fechada'}`, 260, yPos);
    yPos += lineHeight;
    ctx.fillText(`Virabrequim: ${Math.round((progress / 4) * 360)}°`, 260, yPos);
    yPos += lineHeight;
    ctx.fillText(`${getStageDescription(currentStage)}`, 260, yPos);

    // Atualizar indicador de etapa
    const stageIndicator = document.getElementById('stageIndicator');
    stageIndicator.textContent = `Etapa: ${stages[currentStage]}`;
    stageIndicator.style.background = currentColor;
    updateExplanation(currentStage);
}

function getStageDescription(stage) {
    switch (stage) {
        case 0:
            return 'Aspira a mistura.';
        case 1:
            return 'Comprime a mistura.';
        case 2:
            return 'Explode e gera força.';
        case 3:
            return 'Expulsa os gases.';
    }
}

function updateExplanation(stage) {
    const explanation = document.getElementById('explanation');
    if (stage === 0) {
        explanation.innerHTML = '<h2>Admissão</h2><p><strong>Pistão:</strong> Desce do topo ao fundo.<br>' +
            '<strong>Válvulas:</strong> Admissão aberta, escape fechada.<br>' +
            '<strong>Virabrequim:</strong> Gira de 0° a 180°.<br>' +
            '<strong>O que acontece:</strong> O motor aspira a mistura de ar e combustível.</p>';
    } else if (stage === 1) {
        explanation.innerHTML = '<h2>Compressão</h2><p><strong>Pistão:</strong> Sobe do fundo ao topo.<br>' +
            '<strong>Válvulas:</strong> Ambas fechadas.<br>' +
            '<strong>Virabrequim:</strong> Gira de 180° a 360°.<br>' +
            '<strong>O que acontece:</strong> A mistura é comprimida para a combustão.</p>';
    } else if (stage === 2) {
        explanation.innerHTML = '<h2>Combustão</h2><p><strong>Pistão:</strong> Desce do topo ao fundo.<br>' +
            '<strong>Válvulas:</strong> Ambas fechadas.<br>' +
            '<strong>Virabrequim:</strong> Gira de 360° a 540°.<br>' +
            '<strong>O que acontece:</strong> A mistura explode, gerando força.</p>';
    } else if (stage === 3) {
        explanation.innerHTML = '<h2>Exausto</h2><p><strong>Pistão:</strong> Sobe do fundo ao topo.<br>' +
            '<strong>Válvulas:</strong> Admissão fechada, escape aberta.<br>' +
            '<strong>Virabrequim:</strong> Gira de 540° a 720°.<br>' +
            '<strong>O que acontece:</strong> Os gases queimados são expelidos.</p>';
    }
}

function animate(timestamp) {
    if (!animationRunning) return;

    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    animationProgress += (deltaTime / cycleDuration) * 4;
    if (animationProgress >= 4) {
        animationProgress -= 4;
    }

    drawScene(animationProgress);
    animationId = requestAnimationFrame(animate);
}

function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        lastTime = 0;
        animate(performance.now());
    }
}

function pauseAnimation() {
    animationRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
}

function resetAnimation() {
    pauseAnimation();
    animationProgress = 0;
    drawScene(0);
}

function checkAnswer() {
    const answer = document.getElementById('quizAnswer').value;
    const result = document.getElementById('quizResult');
    if (answer === '4') {
        result.textContent = 'Correto! A válvula de escape está aberta na etapa de Exausto.';
        result.style.color = '#22c55e';
    } else {
        result.textContent = 'Incorreto. A válvula de escape está aberta no Exausto. Tente novamente!';
        result.style.color = '#ef4444';
    }
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
};

window.addEventListener('resize', () => {
    setupCanvas();
    drawScene(animationProgress);
});

setupCanvas();
drawScene(0);