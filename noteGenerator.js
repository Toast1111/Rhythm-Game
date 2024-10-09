// noteGenerator.js

class Note {
    constructor(time, lane) {
        this.time = time;
        this.lane = lane;
    }
}

class NoteGenerator {
    constructor(numLanes = 4) {
        this.numLanes = numLanes;
        this.notes = [];
    }

    generateNotes(rhythmData) {
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

        this.notes.sort((a, b) => a.time - b.time);
        
        console.log(`Generated ${this.notes.length} notes`);
    }

    getNotes() {
        return this.notes;
    }
}

// Example usage
// const rhythmData = {
//     beats: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
//     onsets: [0.2, 0.7, 1.2, 1.7, 2.2, 2.7],
//     frequencies: [[0.1, 440], [0.6, 880], [1.1, 660], [1.6, 440], [2.1, 550], [2.6, 440]]
// };
// 
// const generator = new NoteGenerator();
// generator.generateNotes(rhythmData);
// const notes = generator.getNotes();
// 
// console.log(`Generated ${notes.length} notes:`);
// notes.forEach(note => {
//     console.log(`Time: ${note.time.toFixed(2)}, Lane: ${note.lane}`);
// });