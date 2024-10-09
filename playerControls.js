// playerControls.js
console.log('playerControls.js loaded');

class PlayerControls {
    constructor(game) {
        console.log('PlayerControls constructor called');
        this.game = game;
        this.keyMap = {
            'a': 0,
            's': 1,
            'd': 2,
            'f': 3
        };
    }

    handleKey(key) {
        console.log('handleKey called with:', key);
        const lowerKey = key.toLowerCase();
        if (lowerKey in this.keyMap) {
            this.hitNote(this.keyMap[lowerKey]);
        }
    }

    handleTouch(touchPos) {
        console.log('handleTouch called with:', touchPos);
        const lane = Math.floor(touchPos.x / (this.game.width / 4));
        this.hitNote(lane);
    }

    hitNote(lane) {
        console.log('hitNote called for lane:', lane);
        const currentTime = this.game.gameTime - this.game.startDelay;
        const hitThreshold = 0.15; // 150 milliseconds

        let hitNotes = this.game.notes.filter(note => 
            note.lane === lane && 
            Math.abs(note.time - currentTime) < hitThreshold
        );

        if (hitNotes.length > 0) {
            hitNotes.sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));
            const hitNote = hitNotes[0];
            
            this.game.removeNote(hitNote, true);
            this.game.addScore(this.calculateScore(Math.abs(hitNote.time - currentTime)));
            this.game.increaseCombo();
            
            console.log('Note hit successfully');
        } else {
            this.game.resetCombo();
            console.log('Note missed');
        }
    }

    calculateScore(timeDifference) {
        // Convert time difference to milliseconds
        const msDifference = timeDifference * 1000;
        
        // Perfect: 0-50ms, Great: 51-100ms, Good: 101-150ms
        if (msDifference <= 50) {
            return 100; // Perfect hit
        } else if (msDifference <= 100) {
            return 75; // Great hit
        } else {
            return 50; // Good hit
        }
    }
}

console.log('PlayerControls class defined');
