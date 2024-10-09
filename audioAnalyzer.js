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
            console.log('Audio file fetched, getting array buffer');
            const arrayBuffer = await response.arrayBuffer();
            console.log('Array buffer obtained, decoding audio data');
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio data decoded successfully');
            this.duration = this.audioBuffer.duration;
            console.log('Audio duration:', this.duration);
            this._analyzeAudio();
            console.log('Audio analyzed');
            return true;
        } catch (error) {
            console.error("Error in loadAudio:", error.message);
            return false;
        }
    }

    _analyzeAudio() {
        console.log('_analyzeAudio method started');
        const bufferData = this.audioBuffer.getChannelData(0); // Analyze first channel
        const sampleRate = this.audioBuffer.sampleRate;
        
        const chunkSize = Math.floor(sampleRate * 0.05); // 50ms chunks
        const chunks = [];

        for (let i = 0; i < bufferData.length; i += chunkSize) {
            const chunk = bufferData.slice(i, i + chunkSize);
            chunks.push(chunk);
        }

        const energyProfile = this._calculateEnergyProfile(chunks);

        this.rhythmData = {
            beats: this._detectBeats(chunks),
            onsets: this._detectOnsets(chunks),
            frequencies: this._extractFrequencies(chunks, sampleRate),
            energyProfile: energyProfile,
            duration: this.duration
        };

        console.log('Audio analysis completed');
    }

    _calculateEnergyProfile(chunks) {
        const rmsValues = chunks.map(this._getRMSAmplitude);
        const maxRMS = Math.max(...rmsValues);
        return rmsValues.map((rms, index) => [index * 0.05, rms / maxRMS]);
    }

    _getRMSAmplitude(chunk) {
        return Math.sqrt(chunk.reduce((sum, val) => sum + val * val, 0) / chunk.length);
    }

    _detectBeats(chunks) {
        const rmsValues = chunks.map(this._getRMSAmplitude);
        const threshold = this._calculateThreshold(rmsValues);
        return rmsValues.map((rms, index) => rms > threshold ? index * 0.05 : null).filter(time => time !== null);
    }

    _detectOnsets(chunks) {
        const rmsValues = chunks.map(this._getRMSAmplitude);
        const rmsDiff = rmsValues.slice(1).map((val, index) => val - rmsValues[index]);
        const threshold = this._calculateThreshold(rmsDiff);
        return rmsDiff.map((diff, index) => diff > threshold ? (index + 1) * 0.05 : null).filter(time => time !== null);
    }

    _extractFrequencies(chunks, sampleRate) {
        return chunks.map((chunk, index) => {
            const dominantFreq = this._getDominantFrequency(chunk, sampleRate);
            return [index * 0.05, dominantFreq];
        });
    }

    _getDominantFrequency(signal, sampleRate) {
        const fft = new FFT(signal.length, sampleRate);
        fft.forward(signal);
        const spectrum = fft.spectrum;
        const maxIndex = spectrum.indexOf(Math.max(...spectrum));
        return maxIndex * sampleRate / signal.length;
    }

    _calculateThreshold(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return mean + Math.sqrt(variance);
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
