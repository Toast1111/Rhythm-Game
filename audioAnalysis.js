// audioAnalysis.js
class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.isPlaying = false;
    }

    async setupAudioContext(file) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            return true;
        } catch (error) {
            console.error('Error decoding audio data:', error);
            return false;
        }
    }

    start() {
        if (this.source && !this.isPlaying) {
            this.source.start(0);
            this.isPlaying = true;
        }
    }

    stop() {
        if (this.source && this.isPlaying) {
            this.source.stop();
            this.isPlaying = false;
        }
    }

    getAudioData() {
        if (!this.analyser) return new Uint8Array(128).fill(0);
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    setVolume(volume) {
        if (this.audioContext) {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(volume / 100, this.audioContext.currentTime);
            this.source.disconnect();
            this.source.connect(gainNode);
            gainNode.connect(this.analyser);
        }
    }
}

const audioAnalyzer = new AudioAnalyzer();
