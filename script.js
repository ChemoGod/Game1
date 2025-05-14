const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Dimensiones del canvas
canvas.width = 320;
canvas.height = 480;

// Cargar Sonidos
const pointSound = new Audio('sounds/point.wav'); // Asegúrate que la ruta sea correcta
const dieSound = new Audio('sounds/die.wav');   // Asegúrate que la ruta sea correcta

// Función para reproducir sonido de forma segura
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.warn("Error al reproducir sonido:", error);
    });
}

// --- NUEVO: Función para detener un sonido ---
function stopSound(sound) {
    if (sound && !sound.paused) { // Verifica si el sonido existe y se está reproduciendo
        sound.pause();
        sound.currentTime = 0; // Reinicia el sonido para la próxima vez
    }
}

// Propiedades del pájaro
let birdX = 50;
let birdY = canvas.height / 2;
const birdWidth = 34;
const birdHeight = 24;
let birdVelocityY = 0;
const gravity = 0.3;
const jumpStrength = -6;

// Propiedades de las tuberías
const pipeWidth = 52;
const pipeGap = 160; // Espacio aumentado entre tuberías
let pipeX = canvas.width;
let pipeSpeed = 2;
let pipes = [];

// Puntuación
let score = 0;
let gameOver = false;
let gameStarted = false;

function drawBird() {
    // Cuerpo del pájaro
    ctx.fillStyle = '#f1c40f'; // Un amarillo más brillante
    ctx.fillRect(birdX, birdY, birdWidth, birdHeight);

    // Ala (opcional, para un poco más de detalle)
    ctx.fillStyle = '#f39c12'; // Naranja oscuro para el ala
    ctx.beginPath();
    ctx.moveTo(birdX + birdWidth * 0.2, birdY + birdHeight * 0.5);
    ctx.lineTo(birdX + birdWidth * 0.6, birdY + birdHeight * 0.3);
    ctx.lineTo(birdX + birdWidth * 0.6, birdY + birdHeight * 0.7);
    ctx.closePath();
    ctx.fill();

    // Ojo
    const eyeRadius = birdHeight * 0.15;
    const eyeX = birdX + birdWidth * 0.7;
    const eyeY = birdY + birdHeight * 0.35;
    // Parte blanca del ojo
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    // Pupila
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(eyeX + eyeRadius * 0.2, eyeY, eyeRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Pico
    ctx.fillStyle = '#e67e22'; // Naranja
    ctx.beginPath();
    ctx.moveTo(birdX + birdWidth, birdY + birdHeight * 0.5); // Punta del pico
    ctx.lineTo(birdX + birdWidth * 0.75, birdY + birdHeight * 0.35); // Base superior del pico
    ctx.lineTo(birdX + birdWidth * 0.75, birdY + birdHeight * 0.65); // Base inferior del pico
    ctx.closePath();
    ctx.fill();
}

function drawPipe(p) {
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
    ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, canvas.height - (p.topHeight + pipeGap));
}

function generatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 180) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        pipes.push({ x: canvas.width, topHeight: topHeight, scored: false });
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        if (
            birdX < pipes[i].x + pipeWidth &&
            birdX + birdWidth > pipes[i].x &&
            (birdY < pipes[i].topHeight || birdY + birdHeight > pipes[i].topHeight + pipeGap)
        ) {
            endGame();
            return;
        }

        if (pipes[i].x + pipeWidth < birdX && !pipes[i].scored) {
            score++;
            pipes[i].scored = true;
            updateScoreDisplay();
            playSound(pointSound);
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function updateBird() {
    birdVelocityY += gravity;
    birdY += birdVelocityY;

    if (birdY + birdHeight > canvas.height || birdY < 0) {
        endGame();
    }
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Puntuación: ${score}`;
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBird();
    drawBird();

    generatePipes();
    updatePipes();
    pipes.forEach(drawPipe);

    requestAnimationFrame(gameLoop);
}

function startGame() {
    // --- MODIFICADO: Detener el sonido de muerte antes de empezar ---
    stopSound(dieSound);

    gameStarted = true;
    gameOver = false;
    birdY = canvas.height / 2;
    birdVelocityY = 0;
    pipes = [];
    score = 0;
    updateScoreDisplay();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    scoreDisplay.style.display = 'block';
    gameLoop();
}

function endGame() {
    if (gameOver) return; // Evitar que endGame se llame múltiples veces
    gameOver = true;
    gameStarted = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
    scoreDisplay.style.display = 'none';
    playSound(dieSound);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted && !gameOver) {
            startGame();
        } else if (gameStarted && !gameOver) {
            birdVelocityY = jumpStrength;
        } else if (gameOver) { // Si está en game over y presiona espacio, reinicia
             startGame();
        }
    }
});

restartButton.addEventListener('click', () => {
    startGame();
});

function initializeGame() {
    startScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
    scoreDisplay.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird(); // Dibuja el pájaro en su posición inicial en la pantalla de inicio
}

window.onload = () => {
    initializeGame();
};

// Para PWA (opcional, como se discutió antes)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => { // Asegúrate de que service-worker.js exista si usas PWA
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}