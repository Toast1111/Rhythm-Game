// noteGenerator.js
console.log('noteGenerator.js loaded');

class Note {
    constructor(time, lane) {
        this.time = time;
        this.lane = lane;
    }
}

class NoteGenerator {
    constructor(numLanes = 4) {
        console.log('NoteGenerator constructor called');
        this.numLanes = numLanes;
        this.notes = [];
    }

    generateNotes(rhythmData) {
        console.log('Generating notes based on rhythm data');
        this.notes = [];
        const beats = rhythmData.beats;
        const onsets = rhythmData.onsets;

        // Combine beats and onsets, sort, and remove duplicates
        const noteTimes = Array.from(new Set([...beats, ...onsets])).sort((a, b) => a - b);

        noteTimes.forEach(time => {
            if (Math.random() < 0.8) {  // 80% chance to generate a note
                const lane = Math.floor(Math.random() * this.numLanes);
                const note = new Note(time, lane);
                this.notes.push(note);
            }
        });

        // Add some random notes to make the game more interesting
        const totalDuration = Math.max(...noteTimes);
        const numExtraNotes = Math.floor(totalDuration / 2); // Add an extra note every 2 seconds on average
        for (let i = 0; i < numExtraNotes; i++) {
            const time = Math.random() * totalDuration;
            const lane = Math.floor(Math.random() * this.numLanes);
            const note = new Note(time, lane);
            this.notes.push(note);
        }

        // Sort notes by time
        this.notes.sort((a, b) => a.time - b.time);
        
        console.log(`Generated ${this.notes.length} notes`);

        // Remove notes that are too close to each other
        this.removeCloseNotes();
    }

    removeCloseNotes() {
        const minTimeBetweenNotes = 0.3; // Minimum time between notes in seconds
        this.notes = this.notes.filter((note, index, array) => {
            if (index === 0) return true;
            return note.time - array[index - 1].time >= minTimeBetweenNotes;
        });
        console.log(`After removing close notes: ${this.notes.length} notes`);
    }

    getNotes() {
        return this.notes;
    }
}

console.log('NoteGenerator class defined');
