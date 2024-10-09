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
        console.log('Generating notes based on rhythm data:', rhythmData);
        this.notes = [];
        const { beats, onsets, frequencies } = rhythmData;

        // Combine beats and onsets, sort, and remove duplicates
        const events = Array.from(new Set([...beats, ...onsets])).sort((a, b) => a - b);

        console.log(`Combined ${events.length} potential note times`);

        events.forEach((time, index) => {
            // Use frequency data to determine lane
            const nearestFreq = this.findNearestFrequency(time, frequencies);
            const lane = this.frequencyToLane(nearestFreq);

            // Add some variation to prevent too many notes
            if (Math.random() < 0.8) {  // 80% chance to generate a note
                const note = new Note(time, lane);
                this.notes.push(note);
            }
        });

        console.log(`Generated ${this.notes.length} notes`);

        // Sort notes by time
        this.notes.sort((a, b) => a.time - b.time);

        // Remove notes that are too close to each other
        this.removeCloseNotes();

        console.log(`Final note count after removing close notes: ${this.notes.length}`);
    }

    findNearestFrequency(time, frequencies) {
        return frequencies.reduce((nearest, current) => {
            return (Math.abs(current[0] - time) < Math.abs(nearest[0] - time)) ? current : nearest;
        })[1];
    }

    frequencyToLane(frequency) {
        // Map frequency ranges to lanes
        // This is a simple example and can be adjusted based on your game's needs
        if (frequency < 200) return 0;
        if (frequency < 400) return 1;
        if (frequency < 800) return 2;
        return 3;
    }

    removeCloseNotes() {
        const minTimeBetweenNotes = 0.2; // Minimum time between notes in seconds
        this.notes = this.notes.filter((note, index, array) => {
            if (index === 0) return true;
            return note.time - array[index - 1].time >= minTimeBetweenNotes;
        });
    }

    getNotes() {
        return this.notes;
    }
}

console.log('NoteGenerator class defined');
