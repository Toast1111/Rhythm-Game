// noteGenerator.js
class NoteGenerator {
    constructor() {
        this.notes = [];
        this.lastBeatTime = 0;
    }

    generateNotes(audioData, currentTime) {
        const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;
        const beatThreshold = 150; // Adjust this value to change sensitivity
        const minTimeBetweenBeats = 300; // Minimum time between beats in milliseconds

        if (average > beatThreshold && currentTime - this.lastBeatTime > minTimeBetweenBeats) {
            this.notes.push({ 
                lane: Math.floor(Math.random() * 4), 
                y: 0,
                hitTime: currentTime + 2000 // Note reaches bottom after 2 seconds
            });
            this.lastBeatTime = currentTime;
        }
    }

    updateNotes(currentTime, canvasHeight) {
        this.notes = this.notes.filter(note => {
            const progress = (currentTime - (note.hitTime - 2000)) / 2000;
            note.y = progress * canvasHeight;
            return note.y < canvasHeight;
        });
    }

    getNotes() {
        return this.notes;
    }

    clearNotes() {
        this.notes = [];
    }
}

const noteGenerator = new NoteGenerator();
