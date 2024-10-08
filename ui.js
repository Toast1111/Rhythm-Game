// ui.js
class GameUI {
    constructor() {
        this.currentScreen = 'main-menu';
        this.container = document.getElementById('game-container');
        this.settings = {
            songVolume: 50,
            sfxVolume: 50,
            calibration: 0
        };
        this.setupMainMenu();
    }

    setupMainMenu() {
        this.currentScreen = 'main-menu';
        this.container.innerHTML = `
            <h1>Dynamic Rhythm Game</h1>
            <div id="main-menu">
                <button id="dynamic-button">Dynamic Start</button>
                <button id="premade-button">Premade Songs</button>
                <button id="settings-button">Settings</button>
            </div>
        `;

        document.getElementById('dynamic-button').addEventListener('click', () => this.showDynamicMode());
        document.getElementById('premade-button').addEventListener('click', () => this.showPremadeSongs());
        document.getElementById('settings-button').addEventListener('click', () => this.showSettings());
    }

    showDynamicMode() {
        this.currentScreen = 'dynamic-mode';
        this.container.innerHTML = `
            <h2>Dynamic Mode</h2>
            <input type="file" id="file-input" accept="audio/mpeg, audio/mp3" style="display:none;">
            <button id="upload-button">Select Audio File</button>
            <div id="file-name"></div>
            <button id="start-button" disabled>Start Game</button>
            <button id="back-button">Back to Main Menu</button>
            <div id="score" style="display:none;">Score: <span id="score-value">0</span></div>
            <canvas id="game-canvas" width="400" height="600" style="display:none;"></canvas>
        `;

        document.getElementById('upload-button').addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('file-input').addEventListener('change', (event) => this.handleFileUpload(event));
        document.getElementById('start-button').addEventListener('click', () => this.startDynamicGame());
        document.getElementById('back-button').addEventListener('click', () => this.setupMainMenu());
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
            alert('Please upload an MP3 file.');
            return;
        }
        
        document.getElementById('file-name').textContent = `Selected file: ${file.name}`;
        
        const success = await audioAnalyzer.setupAudioContext(file);
        if (success) {
            document.getElementById('start-button').disabled = false;
            alert('MP3 file loaded successfully!');
        } else {
            alert('Failed to load MP3 file. Please try another file.');
        }
    }

    startDynamicGame() {
        console.log('Starting dynamic game');
        this.showGameScreen(true);
        startGame(true);  // Call the startGame function from main.js
    }

    showPremadeSongs() {
        this.currentScreen = 'premade-songs';
        this.container.innerHTML = `
            <h2>Select Premade Song</h2>
            <ul id="song-list" class="animated-list">
                <li><button class="song-button" data-song="song1.mp3">Funky Beats</button></li>
                <li><button class="song-button" data-song="song2.mp3">Electric Dreams</button></li>
                <li><button class="song-button" data-song="song3.mp3">Pixel Paradise</button></li>
            </ul>
            <button id="back-button">Back to Main Menu</button>
        `;

        document.querySelectorAll('.song-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const songFile = event.target.getAttribute('data-song');
                const songName = event.target.textContent;
                this.startPremadeGame(songFile, songName);
            });
        });

        document.getElementById('back-button').addEventListener('click', () => this.setupMainMenu());

        // Add animation to the list
        const list = document.getElementById('song-list');
        list.style.opacity = '0';
        list.style.transform = 'translateY(20px)';
        list.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        setTimeout(() => {
            list.style.opacity = '1';
            list.style.transform = 'translateY(0)';
        }, 100);
    }

    startPremadeGame(songFile, songName) {
        console.log(`Starting premade game with song: ${songName} (${songFile})`);
        this.showGameScreen(false);
        startGame(false, songFile);
    }

    showSettings() {
        this.currentScreen = 'settings';
        this.container.innerHTML = `
            <h2>Settings</h2>
            <div>
                <label for="song-volume">Song Volume:</label>
                <input type="range" id="song-volume" min="0" max="100" value="${this.settings.songVolume}">
                <span id="song-volume-value">${this.settings.songVolume}%</span>
            </div>
            <div>
                <label for="sfx-volume">Sound Effects Volume:</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="${this.settings.sfxVolume}">
                <span id="sfx-volume-value">${this.settings.sfxVolume}%</span>
            </div>
            <div>
                <label for="calibration">Calibration (ms):</label>
                <input type="number" id="calibration" value="${this.settings.calibration}" step="10">
            </div>
            <button id="calibrate-button">Calibrate Screen</button>
            <button id="save-settings">Save Settings</button>
            <button id="back-button">Back to Main Menu</button>
        `;

        document.getElementById('song-volume').addEventListener('input', (e) => {
            this.settings.songVolume = e.target.value;
            document.getElementById('song-volume-value').textContent = `${e.target.value}%`;
        });

        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            this.settings.sfxVolume = e.target.value;
            document.getElementById('sfx-volume-value').textContent = `${e.target.value}%`;
        });

        document.getElementById('calibrate-button').addEventListener('click', () => this.calibrateScreen());

        document.getElementById('save-settings').addEventListener('click', () => {
            this.settings.calibration = document.getElementById('calibration').value;
            console.log('Saving settings:', this.settings);
            audioAnalyzer.setVolume(this.settings.songVolume);
            alert('Settings saved!');
            this.setupMainMenu();
        });

        document.getElementById('back-button').addEventListener('click', () => this.setupMainMenu());
    }

    calibrateScreen() {
        alert('Calibration feature not implemented yet. This would help users sync their inputs with the game.');
    }

    showGameScreen(isDynamic) {
        this.currentScreen = 'game';
        this.container.innerHTML = `
            <div id="score">Score: <span id="score-value">0</span></div>
            <canvas id="game-canvas" width="400" height="600"></canvas>
            <button id="back-button">Back to Main Menu</button>
        `;

        document.getElementById('back-button').addEventListener('click', () => {
            audioAnalyzer.stop();
            noteGenerator.clearNotes();
            this.setupMainMenu();
        });

        console.log(`Showing ${isDynamic ? 'dynamic' : 'premade'} game screen`);
    }
}

const gameUI = new GameUI();
