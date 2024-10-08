// main.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('score-value');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const startButton = document.getElementById('start-button');

let isPlaying = false;
let score = 0;

uploadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
startButton.addEventListener('click', startGame);

async function handleFileUpload(event) {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    await audioAnalyzer.setupAudioContext(arrayBuffer);
    startButton.disabled = false;
}

function startGame() {
    isPlaying = true;
    score = 0;
    scoreValue.textContent = score;
    audioAnalyzer.start();
    startButton.disabled = true;
    gameLoop();
}

function gameLoop() {
    if (!isPlaying) return;

    const audioData = audioAnalyzer.getAudioData();
    noteGenerator.generateNotes(audioData);
    noteGenerator.updateNotes(canvas.height);
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
            } else {
                score -= 50;
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
