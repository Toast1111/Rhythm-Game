// main.js
let canvas, ctx, scoreValue;
let isPlaying = false;
let score = 0;
let isDynamicMode = false;
let lastFrameTime = 0;

function initializeGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    scoreValue = document.getElementById('score-value');
}

function startGame(isDynamic) {
    isDynamicMode = isDynamic;
    isPlaying = true;
    score = 0;
    scoreValue.textContent = score;
    noteGenerator.clearNotes();

    if (isDynamic) {
        audioAnalyzer.start();
    } else {
        // Load premade song and note patterns
        loadPremadeSong(audioSource);
    }

    // Apply current settings
    applySettings();

    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function loadPremadeSong(songFile) {
    console.log('Loading premade song:', songFile);
    // Placeholder for loading premade song and notes
}

function applySettings() {
    console.log('Applying settings:', gameUI.settings);
    audioAnalyzer.setVolume(gameUI.settings.songVolume);
}

function gameLoop(currentTime) {
    if (!isPlaying) return;

    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    if (isDynamicMode) {
        const audioData = audioAnalyzer.getAudioData();
        noteGenerator.generateNotes(audioData, currentTime);
    } else {
        // Update premade notes
    }

    noteGenerator.updateNotes(currentTime, canvas.height);
    handlePlayerInput();
    drawGame();

    requestAnimationFrame(gameLoop);
}

function handlePlayerInput() {
    const lanes = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
    lanes.forEach((key, index) => {
        if (playerInput.isKeyPressed(key)) {
            const hitNote = noteGenerator.getNotes().find(note => 
                note.lane === index && 
                Math.abs(note.y - (canvas.height - 50)) < 30
            );

            if (hitNote) {
                score += 100;
                noteGenerator.getNotes().splice(noteGenerator.getNotes().indexOf(hitNote), 1);
                playSoundEffect('hit');
            } else {
                score -= 50;
                playSoundEffect('miss');
            }

            scoreValue.textContent = score;
        }
    });
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lanes
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * canvas.width / 4, 0);
        ctx.lineTo(i * canvas.width / 4, canvas.height);
        ctx.stroke();
    }

    // Draw notes
    noteGenerator.getNotes().forEach(note => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(note.lane * canvas.width / 4, note.y, canvas.width / 4, 20);
    });

    // Draw hit line
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();
}

function playSoundEffect(type) {
    console.log('Playing sound effect:', type);
}

document.addEventListener('DOMContentLoaded', initializeGame);

window.startGame = startGame;
