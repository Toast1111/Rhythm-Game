// main.js
console.log('main.js file started loading');

class RhythmGame {
    constructor(songPath) {
        console.log('RhythmGame constructor started');
        console.log('RhythmGame constructor called with songPath:', songPath);
        this.songPath = songPath;
        this.player = null;
        this.paused = false;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.backgroundColor = 'black';
        this.laneWidth = this.width / 4;
        this.notes = [];
        this.notesToRemove = []; // New array to store notes that should be removed
        this.score = 0;
        this.combo = 0;
        this.gameTime = 0;
        this.audioStarted = false;
        this.startDelay = 3; // 3 seconds delay before audio starts
        this.noteFallTime = 2; // Time it takes for a note to fall from top to bottom
        this.hitLine = { y: 100, height: 10 };
        
        this.scoreLabel = document.getElementById('scoreLabel');
        this.comboLabel = document.getElementById('comboLabel');
        this.debugLabel = document.getElementById('debugLabel');

        console.log('Initializing AudioAnalyzer');
        this.audioAnalyzer = new AudioAnalyzer();
        console.log('Initializing NoteGenerator');
        this.noteGenerator = new NoteGenerator();
        console.log('Initializing PlayerControls');
        this.playerControls = new PlayerControls(this);

        console.log('RhythmGame constructor completed');
    }

    setup() {
        console.log('RhythmGame setup method started');
        this.loadSong(this.songPath);
        this.setupEventListeners();
        this.gameLoop();
        console.log('RhythmGame setup method completed');
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        console.log('Event listeners set up');
    }

    loadSong(songPath) {
        console.log('loadSong method started');
        console.log('Attempting to load song:', songPath);
        console.log('About to call audioAnalyzer.loadAudio');
        this.audioAnalyzer.loadAudio(songPath)
            .then(() => {
                console.log('audioAnalyzer.loadAudio resolved successfully');
                console.log('Song loaded successfully');
                const rhythmData = this.audioAnalyzer.getRhythmData();
                console.log('Rhythm data received:', rhythmData);
                this.noteGenerator.generateNotes(rhythmData);
                this.notes = this.noteGenerator.getNotes();
                console.log(`Generated ${this.notes.length} notes`);
                this.player = this.audioAnalyzer.getPlayer();
                console.log('Audio player created');
                this.debugLabel.textContent = `Loaded ${this.notes.length} notes. Tap to start.`;
            })
            .catch(error => {
                console.error('audioAnalyzer.loadAudio failed:', error);
                console.error('Failed to load audio file:', error);
                this.debugLabel.textContent = 'Failed to load audio file.';
            });
    }

    gameLoop(timestamp) {
        const dt = (timestamp - (this.lastTimestamp || timestamp)) / 1000;
        this.lastTimestamp = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(dt) {
        if (this.paused) return;

        if (this.audioStarted) {
            this.gameTime += dt;
        }

        if (!this.audioStarted) {
            this.debugLabel.textContent = 'Tap to start audio';
            return;
        }

        if (this.gameTime < this.startDelay) {
            this.debugLabel.textContent = `Starting in ${(this.startDelay - this.gameTime).toFixed(1)}`;
            return;
        }

        const currentTime = this.gameTime - this.startDelay;

        // Update note positions and mark notes for removal
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const progress = (currentTime - (note.time - this.noteFallTime)) / this.noteFallTime;
            note.y = this.height + 25 - progress * (this.height - 75);
            if (note.y < -50) { // Note is well off the screen
                this.notesToRemove.push(note);
            }
        }

        // Remove marked notes
        if (this.notesToRemove.length > 0) {
            this.notes = this.notes.filter(note => !this.notesToRemove.includes(note));
            console.log(`Removed ${this.notesToRemove.length} unused notes`);
            this.notesToRemove = []; // Clear the removal array
        }

        this.debugLabel.textContent = `Game Time: ${currentTime.toFixed(2)}, Notes: ${this.notes.length}`;
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
        this.ctx.fillStyle = 'white';
        for (const note of this.notes) {
            this.ctx.beginPath();
            this.ctx.arc(note.x, note.y, 20, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    removeNote(note, hit = false) {
        if (hit) {
            this.score += 10 * (this.combo + 1);
            this.combo += 1;
            console.log(`Note hit: Score +${10 * (this.combo + 1)}, Combo: ${this.combo}`);
        } else {
            this.combo = 0;
            console.log('Note missed: Combo reset');
        }
        this.notesToRemove.push(note); // Mark the note for removal instead of immediately removing it
        this.updateLabels();
    }

    updateLabels() {
        this.scoreLabel.textContent = `Score: ${this.score}`;
        this.comboLabel.textContent = `Combo: ${this.combo}`;
    }

    handleClick(event) {
        console.log('Canvas clicked');
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
        console.log('Starting audio');
        this.audioStarted = true;
        this.debugLabel.textContent = 'Starting in 3...';
        setTimeout(() => this.debugLabel.textContent = 'Starting in 2...', 1000);
        setTimeout(() => this.debugLabel.textContent = 'Starting in 1...', 2000);
        setTimeout(() => {
            if (this.player) {
                this.player.play().then(() => {
                    console.log('Audio playback started');
                }).catch(error => {
                    console.error('Failed to start audio playback:', error);
                    this.debugLabel.textContent = 'Click to start audio';
                    this.canvas.addEventListener('click', this.forceStartAudio.bind(this), { once: true });
                });
            } else {
                console.error('Audio player not initialized');
                this.debugLabel.textContent = 'Audio player not ready';
            }
        }, 3000);
    }

    forceStartAudio() {
        console.log('Attempting to force start audio');
        if (this.player) {
            this.player.play().then(() => {
                console.log('Audio playback started after user interaction');
            }).catch(error => {
                console.error('Failed to start audio playback even after user interaction:', error);
            });
        } else {
            console.error('Audio player still not initialized');
        }
    }

    togglePause() {
        this.paused = !this.paused;
        console.log(`Game ${this.paused ? 'paused' : 'resumed'}`);
        if (this.paused) {
            this.player.pause();
        } else {
            this.player.play();
        }
    }

    handleKeyPress(event) {
        console.log('Key pressed:', event.key);
        if (event.key === 'p') {
            this.togglePause();
        } else {
            this.playerControls.handleKey(event.key);
        }
    }

    addScore(points) {
        this.score += points;
        console.log(`Score increased by ${points}. New score: ${this.score}`);
        this.updateLabels();
    }

    increaseCombo() {
        this.combo++;
        console.log(`Combo increased. New combo: ${this.combo}`);
        this.updateLabels();
    }

    resetCombo() {
        this.combo = 0;
        console.log('Combo reset to 0');
        this.updateLabels();
    }
}

console.log('RhythmGame class defined');

// Initialize the game when the window loads
window.onload = function() {
    console.log('Window loaded, about to initialize game...');
    if (typeof songFileName === 'undefined') {
        console.error('Song filename not defined. Check your index.html file.');
        return;
    }
    console.log('Using song:', songFileName);
    const game = new RhythmGame(songFileName);
    console.log('RhythmGame instance created');
    game.setup();
    console.log('game.setup() called');
};

console.log('main.js file finished loading');
