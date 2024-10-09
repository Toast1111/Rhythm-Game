// audioAnalyzer.js
console.log('audioAnalyzer.js file started loading');

class AudioAnalyzer {
    constructor() {
        console.log('AudioAnalyzer constructor started');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.source = null;
        this.audioBuffer = null;
        this.duration = 0;
        this.rhythmData = null;
        console.log('AudioAnalyzer constructor completed');
    }

    async loadAudio(url) {
    console.log('loadAudio method started with URL:', url);
    try {
        console.log('Fetching audio file');
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Audio file fetched, getting array buffer');
        const arrayBuffer = await response.arrayBuffer();
        console.log('Array buffer obtained, decoding audio data');
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log('Audio data decoded successfully');
        this.duration = this.audioBuffer.duration;
        console.log('Audio duration:', this.duration);
        this._precomputeRhythmData();
        console.log('Rhythm data precomputed');
        return true;
    } catch (error) {
        console.error("Error in loadAudio:", error.message);
        if (error.name === 'EncodingError') {
            console.error("This might be due to an unsupported audio format or a corrupted file.");
        }
        return false;
    }
}

    _precomputeRhythmData() {
        console.log('_precomputeRhythmData method started');
        if (!this.audioBuffer) {
            console.error('No audio buffer available for rhythm data computation');
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
        console.log('_detectBeats method started');
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
            console.log('Not enough beats detected, adding artificial beats');
            const beatInterval = this.duration / 20;
            beats = Array.from({length: 20}, (_, i) => i * beatInterval);
        }

        console.log(`Detected ${beats.length} beats`);
        return beats;
    }

    _detectOnsets() {
        console.log('_detectOnsets method started');
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
            console.log('Not enough onsets detected, adding artificial onsets');
            const onsetInterval = this.duration / 40;
            onsets = Array.from({length: 40}, (_, i) => i * onsetInterval);
        }

        console.log(`Detected ${onsets.length} onsets`);
        return onsets;
    }

    _extractFrequencies() {
        console.log('_extractFrequencies method started');
        const bufferData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks

        let frequencies = [];

        for (let i = 0; i < bufferData.length; i += chunkSize) {
            const chunk = bufferData.slice(i, i + chunkSize);
            if (chunk.length > 0) {
                const dominantFrequency = this._getDominantFrequency(chunk, sampleRate);
                frequencies.push([i * 0.05, dominantFrequency]); // [time, frequency]
            }
        }

        console.log(`Extracted ${frequencies.length} frequency data points`);
        return frequencies;
    }

    _getDominantFrequency(signal, sampleRate) {
        const fft = new FFT(signal.length, sampleRate);
        fft.forward(signal);
        const spectrum = fft.spectrum;
        const maxIndex = spectrum.indexOf(Math.max(...spectrum));
        return maxIndex * sampleRate / signal.length;
    }

    getRhythmData() {
        console.log('getRhythmData method called');
        return this.rhythmData;
    }

    getPlayer() {
        console.log('getPlayer method called');
        return {
            play: () => {
                console.log('Player play method called');
                if (this.source) {
                    this.source.stop();
                }
                this.source = this.audioContext.createBufferSource();
                this.source.buffer = this.audioBuffer;
                this.source.connect(this.audioContext.destination);
                this.source.start();
                console.log('Audio playback started');
            },
            pause: () => {
                console.log('Player pause method called');
                if (this.source) {
                    this.source.stop();
                    console.log('Audio playback paused');
                }
            }
        };
    }
}

// Simple FFT implementation
class FFT {
    constructor(bufferSize, sampleRate) {
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;
        this.real = new Float32Array(bufferSize);
        this.imag = new Float32Array(bufferSize);
        this.spectrum = new Float32Array(bufferSize / 2);
    }

    forward(buffer) {
        // Perform FFT
        for (let i = 0; i < this.bufferSize; i++) {
            this.real[i] = buffer[i];
            this.imag[i] = 0;
        }
        this._fft(this.real, this.imag);

        // Calculate spectrum
        for (let i = 0; i < this.bufferSize / 2; i++) {
            this.spectrum[i] = Math.sqrt(this.real[i] * this.real[i] + this.imag[i] * this.imag[i]);
        }
    }

    _fft(real, imag) {
        // Simple FFT implementation (Cooley-Tukey algorithm)
        const n = real.length;
        if (n <= 1) return;

        const half = Math.floor(n / 2);
        const even_real = new Float32Array(half);
        const even_imag = new Float32Array(half);
        const odd_real = new Float32Array(half);
        const odd_imag = new Float32Array(half);

        for (let i = 0; i < half; i++) {
            even_real[i] = real[2 * i];
            even_imag[i] = imag[2 * i];
            odd_real[i] = real[2 * i + 1];
            odd_imag[i] = imag[2 * i + 1];
        }

        this._fft(even_real, even_imag);
        this._fft(odd_real, odd_imag);

        for (let k = 0; k < half; k++) {
            const theta = -2 * Math.PI * k / n;
            const re = Math.cos(theta);
            const im = Math.sin(theta);
            const tpre = odd_real[k] * re - odd_imag[k] * im;
            const tpim = odd_real[k] * im + odd_imag[k] * re;
            real[k] = even_real[k] + tpre;
            imag[k] = even_imag[k] + tpim;
            real[k + half] = even_real[k] - tpre;
            imag[k + half] = even_imag[k] - tpim;
        }
    }
}

console.log('audioAnalyzer.js file finished loading');
