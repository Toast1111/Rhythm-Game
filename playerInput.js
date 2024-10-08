// playerInput.js
class PlayerInput {
    constructor() {
        this.keysPressed = new Set();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keysPressed.add(event.code);
        });

        document.addEventListener('keyup', (event) => {
            this.keysPressed.delete(event.code);
        });
    }

    isKeyPressed(keyCode) {
        return this.keysPressed.has(keyCode);
    }
}

const playerInput = new PlayerInput();
