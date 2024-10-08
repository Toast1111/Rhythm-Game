// audioAnalysis.js
class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
    }

    async setupAudioContext(arrayBuffer) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    start() {
        if (this.source) {
            this.source.start(0);
        }
    }

    getAudioData() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
}

const audioAnalyzer = new AudioAnalyzer();
