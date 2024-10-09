// main.js

class RhythmGame {
    constructor(songPath) {
        this.songPath = songPath;
        this.player = null;
        this.paused = false;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    setup() {
        this.backgroundColor = 'black';
        this.laneWidth = this.width / 4;
        this.notes = [];
        this.generatedNotes = [];
        this.score = 0;
        this.combo = 0;
        this.gameTime = 0;
        this.audioStarted = false;
        this.startDelay = 3; // 3 seconds delay before audio starts
        this.noteFallTime = 2; // Time it takes for a note to fall from top to bottom

        this.scoreLabel = document.getElementById('scoreLabel');
        this.comboLabel = document.getElementById('comboLabel');
        this.debugLabel = document.getElementById('debugLabel');

        this.hitLine = { y: 100, height: 10 };

        this.audioAnalyzer = new AudioAnalyzer();
        this.noteGenerator = new NoteGenerator();
        this.loadSong(this.songPath);

        this.playerControls = new PlayerControls(this);
        this.pauseButton = new PauseButton(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    loadSong(songPath) {
        this.audioAnalyzer.loadAudio(songPath)
            .then(() => {
                const rhythmData = this.audioAnalyzer.getRhythmData();
                this.noteGenerator.generateNotes(rhythmData);
                this.generatedNotes = this.noteGenerator.getNotes();
                this.player = this.audioAnalyzer.getPlayer();
                console.log(`Loaded ${this.generatedNotes.length} notes`);
                this.debugLabel.textContent = `Loaded ${this.generatedNotes.length} notes. Tap to start.`;
            })
            .catch(error => {
                console.error("Failed to load audio file.", error);
                this.debugLabel.textContent = "Failed to load audio file.";
            });
    }

    update(dt) {
        if (this.paused) return;

        if (this.audioStarted) {
            this.gameTime += dt;
        }

        if (!this.audioStarted) {
            this.debugLabel.textContent = "Tap to start audio";
            return;
        }

        if (this.gameTime < this.startDelay) {
            this.debugLabel.textContent = `Starting in ${(this.startDelay - this.gameTime).toFixed(1)}`;
            return;
        }

        const currentTime = this.gameTime - this.startDelay;

        // Spawn notes
        while (this.generatedNotes.length && this.generatedNotes[0].time <= currentTime + this.noteFallTime) {
            const genNote = this.generatedNotes.shift();
            const note = new Note(genNote.lane, genNote.time, 
                                  this.laneWidth * (genNote.lane + 0.5), 
                                  this.height + 25);
            this.notes.push(note);
        }

        // Update note positions
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const progress = (currentTime - (note.time - this.noteFallTime)) / this.noteFallTime;
            note.y = this.height + 25 - progress * (this.height - 75);
            if (note.y < 0) {
                this.removeNote(note, false);
            }
        }

        this.debugLabel.textContent = `Game Time: ${currentTime.toFixed(2)}, Notes: ${this.notes.length}, Generated Notes: ${this.generatedNotes.length}`;
    }

    draw() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw lane lines
        this.ctx.strokeStyle = 'gray';
        for (let i = 1; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.laneWidth, 0);
            this.ctx.lineTo(i * this.laneWidth, this.height);
            this.ctx.stroke();
        }

        // Draw hit line
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, this.hitLine.y, this.width, this.hitLine.height);

        // Draw notes
        this.notes.forEach(note => {
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(note.x, note.y, 20, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        // Draw pause button
        this.pauseButton.draw(this.ctx);
    }

    removeNote(note, hit = false) {
        if (hit) {
            this.score += 10 * (this.combo + 1);
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.notes = this.notes.filter(n => n !== note);
        this.updateLabels();
    }

    updateLabels() {
        this.scoreLabel.textContent = `Score: ${this.score}`;
        this.comboLabel.textContent = `Combo: ${this.combo}`;
    }

    handleClick(event) {
        if (this.paused) return;

        if (!this.audioStarted) {
            this.startAudio();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.playerControls.handleTouch({ x, y });
    }

    startAudio() {
        this.audioStarted = true;
        this.debugLabel.textContent = "Starting in 3...";
        setTimeout(() => this.debugLabel.textContent = "Starting in 2...", 1000);
        setTimeout(() => this.debugLabel.textContent = "Starting in 1...", 2000);
        setTimeout(() => this.player.play(), 3000);
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.player.pause();
        } else {
            this.player.play();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'p') {
            this.togglePause();
        } else {
            this.playerControls.handleKey(event.key);
        }
    }
}

class Note {
    constructor(lane, time, x, y) {
        this.lane = lane;
        this.time = time;
        this.x = x;
        this.y = y;
    }
}

// This function would be called when the page loads
function main() {
    const game = new RhythmGame('path_to_your_audio_file.mp3');
    game.setup();

    let lastTime = 0;
    function gameLoop(timestamp) {
        const dt = (timestamp - lastTime) / 1000; // convert to seconds
        lastTime = timestamp;

        game.update(dt);
        game.draw();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// Call main when the window loads
window.onload = main;