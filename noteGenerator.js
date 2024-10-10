// noteGenerator.js
console.log('noteGenerator.js loaded');

class NoteGenerator {
    constructor(numLanes = 4) {
        console.log('NoteGenerator constructor called');
        this.numLanes = numLanes;
        this.notes = [];
    }

    generateNotes(rhythmData) {
        console.log('Generating notes based on rhythm data:', rhythmData);
        this.notes = [];
        const { beats, onsets, frequencies, energyProfile } = rhythmData;

        // Combine beats and onsets, sort, and remove duplicates
        const events = Array.from(new Set([...beats, ...onsets])).sort((a, b) => a - b);

        console.log(`Processing ${events.length} events`);

        let lastNoteTime = -Infinity;
        const minTimeBetweenNotes = 0.2; // Minimum time between notes in seconds

        events.forEach((time) => {
            if (time - lastNoteTime >= minTimeBetweenNotes) {
                const nearestFreq = this.findNearestFrequency(time, frequencies);
                const lane = this.frequencyToLane(nearestFreq);
                const intensity = this.getIntensityAtTime(time, energyProfile);

                // Only create a note if the intensity is above a certain threshold
                if (intensity > 0.2) { // Adjust this threshold as needed
                    const note = {
                        time: time,
                        lane: lane,
                        intensity: intensity
                    };
                    this.notes.push(note);
                    lastNoteTime = time;
                }
            }
        });

        console.log(`Generated ${this.notes.length} notes`);

        // Sort notes by time (should already be sorted, but just in case)
        this.notes.sort((a, b) => a.time - b.time);
    }

    getNotes() {
        return this.notes;
    }

    findNearestFrequency(time, frequencies) {
        return frequencies.reduce((nearest, current) => {
            return (Math.abs(current[0] - time) < Math.abs(nearest[0] - time)) ? current : nearest;
        })[1];
    }

    frequencyToLane(frequency) {
        // Improved frequency to lane mapping
        const maxFreq = 2000; // Adjust based on your audio content
        return Math.min(Math.floor((frequency / maxFreq) * this.numLanes), this.numLanes - 1);
    }

    getIntensityAtTime(time, energyProfile) {
        // Find the nearest energy value in the profile
        const nearest = energyProfile.reduce((nearest, current) => {
            return (Math.abs(current[0] - time) < Math.abs(nearest[0] - time)) ? current : nearest;
        });
        return nearest[1]; // Return the energy value
    }
}

console.log('NoteGenerator class defined');
