// audioAnalyzer.js

class AudioAnalyzer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.source = null;
        this.audioBuffer = null;
        this.duration = 0;
        this.rhythmData = null;
    }

    async loadAudio(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.audioBuffer.duration;
            this._precomputeRhythmData();
            return true;
        } catch (error) {
            console.error("Error loading audio file:", error);
            return false;
        }
    }

    _precomputeRhythmData() {
        if (!this.audioBuffer) {
            return;
        }

        const beats = this._detectBeats();
        const onsets = this._detectOnsets();
        const frequencies = this._extractFrequencies();

        this.rhythmData = {
            beats: beats,
            onsets: onsets,
            frequencies: frequencies
        };

        console.log("Precomputed rhythm data:");
        console.log(`  Beats: ${beats.length}`);
        console.log(`  Onsets: ${onsets.length}`);
        console.log(`  Frequency data points: ${frequencies.length}`);
    }

    _detectBeats() {
        const bufferData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks
        const threshold = 1.2;

        let beats = [];
        let rmsValues = [];

        for (let i = 0; i < bufferData.length; i += chunkSize) {
            const chunk = bufferData.slice(i, i + chunkSize);
            const rms = Math.sqrt(chunk.reduce((sum, val) => sum + val * val, 0) / chunk.length);
            rmsValues.push(rms);
        }

        const averageRms = rmsValues.reduce((sum, val) => sum + val, 0) / rmsValues.length;
        const thresholdValue = averageRms * threshold;

        rmsValues.forEach((rms, index) => {
            if (rms > thresholdValue) {
                beats.push(index * 0.05); // Convert chunk index to time
            }
        });

        // Ensure we have at least some beats
        if (beats.length < 10) {
            const beatInterval = this.duration / 20;
            beats = Array.from({length: 20}, (_, i) => i * beatInterval);
        }

        return beats;
    }

    _detectOnsets() {
        const bufferData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks
        const threshold = 1.2;

        let onsets = [];
        let rmsValues = [];

        for (let i = 0; i < bufferData.length; i += chunkSize) {
            const chunk = bufferData.slice(i, i + chunkSize);
            const rms = Math.sqrt(chunk.reduce((sum, val) => sum + val * val, 0) / chunk.length);
            rmsValues.push(rms);
        }

        const rmsDiff = rmsValues.slice(1).map((val, index) => val - rmsValues[index]);
        const averageDiff = rmsDiff.reduce((sum, val) => sum + val, 0) / rmsDiff.length;
        const thresholdValue = averageDiff * threshold;

        rmsDiff.forEach((diff, index) => {
            if (diff > thresholdValue) {
                onsets.push((index + 1) * 0.05); // Convert chunk index to time
            }
        });

        // Ensure we have at least some onsets
        if (onsets.length < 20) {
            const onsetInterval = this.duration / 40;
            onsets = Array.from({length: 40}, (_, i) => i * onsetInterval);
        }

        return onsets;
    }

    _extractFrequencies() {
        const bufferData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks

        let frequencies = [];

        for (let i = 0; i < bufferData.length; i += chunkSize) {
            const chunk = bufferData.slice(i, i + chunkSize);
            if (chunk.length > 0) {
                const fft = new FFT(chunk.length, sampleRate);
                fft.forward(chunk);
                const dominantFrequency = fft.spectrum.indexOf(Math.max(...fft.spectrum)) * sampleRate / chunk.length;
                frequencies.push([i * 0.05, dominantFrequency]); // [time, frequency]
            }
        }

        return frequencies;
    }

    getRhythmData() {
        return this.rhythmData;
    }

    getPlayer() {
        return {
            play: () => {
                this.source = this.audioContext.createBufferSource();
                this.source.buffer = this.audioBuffer;
                this.source.connect(this.audioContext.destination);
                this.source.start();
            },
            pause: () => {
                if (this.source) {
                    this.source.stop();
                }
            }
        };
    }
}

// Fast Fourier Transform implementation
class FFT {
    constructor(bufferSize, sampleRate) {
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;
        this.spectrum = new Float32Array(bufferSize / 2);
        this.real = new Float32Array(bufferSize);
        this.imag = new Float32Array(bufferSize);
    }

    forward(buffer) {
        // FFT implementation goes here
        // This is a placeholder and should be replaced with an actual FFT algorithm
        // For a real implementation, consider using a library like DSP.js or writing a more optimized version
        for (let i = 0; i < this.bufferSize; i++) {
            this.real[i] = buffer[i];
            this.imag[i] = 0;
        }
        // Perform FFT calculation...
        // Calculate spectrum...
    }
}

// Example usage
// const analyzer = new AudioAnalyzer();
// analyzer.loadAudio('path_to_your_audio_file.mp3').then(() => {
//     const rhythmData = analyzer.getRhythmData();
//     console.log("Rhythm data extracted successfully.");
//     console.log(`Number of beats: ${rhythmData.beats.length}`);
//     console.log(`Number of onsets: ${rhythmData.onsets.length}`);
//     console.log(`Number of frequency data points: ${rhythmData.frequencies.length}`);
// });
