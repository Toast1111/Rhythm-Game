// playerControls.js

class PlayerControls {
    constructor(game) {
        this.game = game;
        this.keyMap = {
            'a': 0,
            's': 1,
            'd': 2,
            'f': 3
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (key in this.keyMap) {
            this.hitNote(this.keyMap[key]);
        } else if (key === 'p') {
            this.game.togglePause();
        }
    }

    hitNote(lane) {
        const hitThreshold = 50; // milliseconds
        const currentTime = this.game.getCurrentTime();
        
        let hitNotes = this.game.notes.filter(note => 
            note.lane === lane && 
            Math.abs(note.time - currentTime) < hitThreshold / 1000
        );

        if (hitNotes.length > 0) {
            // Sort by closest to current time if multiple notes are within threshold
            hitNotes.sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));
            const hitNote = hitNotes[0];
            
            this.game.removeNote(hitNote, true);
            this.game.addScore(this.calculateScore(Math.abs(hitNote.time - currentTime)));
            this.game.increaseCombo();
            
            // Visual feedback
            this.game.showHitEffect(lane);
        } else {
            this.game.resetCombo();
            // Visual feedback for miss
            this.game.showMissEffect(lane);
        }
    }

    calculateScore(timeDifference) {
        // Convert time difference to milliseconds
        const msDifference = timeDifference * 1000;
        
        // Perfect: 0-25ms, Great: 26-50ms
        if (msDifference <= 25) {
            return 100; // Perfect hit
        } else if (msDifference <= 50) {
            return 50; // Great hit
        }
        return 0; // Should not happen due to hitThreshold, but just in case
    }
}

// Example usage in main game file:
// 
// class RhythmGame {
//     constructor() {
//         // ... other initializations ...
//         this.playerControls = new PlayerControls(this);
//     }
//
//     getCurrentTime() {
//         return this.gameTime - this.startDelay;
//     }
//
//     removeNote(note, hit) {
//         // Remove the note from the game
//         this.notes = this.notes.filter(n => n !== note);
//     }
//
//     addScore(points) {
//         this.score += points;
//         this.updateScoreDisplay();
//     }
//
//     increaseCombo() {
//         this.combo++;
//         this.updateComboDisplay();
//     }
//
//     resetCombo() {
//         this.combo = 0;
//         this.updateComboDisplay();
//     }
//
//     showHitEffect(lane) {
//         // Implement visual feedback for successful hit
//     }
//
//     showMissEffect(lane) {
//         // Implement visual feedback for miss
//     }
//
//     // ... other game methods ...
// }