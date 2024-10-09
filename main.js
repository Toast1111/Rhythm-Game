// main.js

class RhythmGame {
    constructor(songPath) {
        console.log('RhythmGame constructor called with songPath:', songPath);
        this.songPath = songPath;
        this.player = null;
        this.paused = false;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    setup() {
        console.log('RhythmGame setup method called');
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

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    loadSong(songPath) {
        console.log('Attempting to load song:', songPath);
        this.audioAnalyzer.loadAudio(songPath)
            .then(() => {
                console.log('Song loaded successfully');
                const rhythmData = this.audioAnalyzer.getRhythmData();
                this.noteGenerator.generateNotes(rhythmData);
                this.generatedNotes = this.noteGenerator.getNotes();
                this.player = this.audioAnalyzer.getPlayer();
                console.log(`Loaded ${this.generatedNotes.length} notes`);
                this.debugLabel.textContent = `Loaded ${this.generatedNotes.length} notes. Tap to start.`;
            })
            .catch(error => {
                console.error('Failed to load audio file:', error);
                this.debugLabel.textContent = 'Failed to load audio file.';
            });
    }

    gameLoop(timestamp) {
        const dt = (timestamp - this.lastTimestamp) / 1000;
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

        // Spawn notes
        while (this.generatedNotes.length && this.generatedNotes[0].time <= currentTime + this.noteFallTime) {
            const genNote = this.generatedNotes.shift();
            const note = {
                lane: genNote.lane,
                time: genNote.time,
                x: this.laneWidth * (genNote.lane + 0.5),
                y: this.height + 25
            };
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
            this.player.play();
            console.log('Audio playback started');
        }, 3000);
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
        console.log('Key pressed:', event.key);
        if (event.key === 'p') {
            this.togglePause();
        } else {
            this.playerControls.handleKey(event.key);
        }
    }
}
