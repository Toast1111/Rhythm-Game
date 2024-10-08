// noteGenerator.js
class NoteGenerator {
    constructor() {
        this.notes = [];
    }

    generateNotes(audioData) {
        const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;

        if (average > 100 && Math.random() < 0.1) {
            this.notes.push({ y: 0, lane: Math.floor(Math.random() * 4) });
        }
    }

    updateNotes(canvasHeight) {
        this.notes = this.notes.filter(note => {
            note.y += 5; // Adjust speed as needed
            return note.y < canvasHeight;
        });
    }

    getNotes() {
        return this.notes;
    }
}

const noteGenerator = new NoteGenerator();
