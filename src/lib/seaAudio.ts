// Web Audio API Ambient Sea & Rain Sound Synthesizer
// 0 KB external file size, immediate playback, realistic procedural audio

class SeaAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Wave nodes
  private waveGain: GainNode | null = null;
  private waveFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;

  // Rain nodes
  private rainGain: GainNode | null = null;

  // Air / Wind nodes
  private windGain: GainNode | null = null;

  private weather: 'CLEAR' | 'RAIN' = 'CLEAR';

  public getWeather() {
    return this.weather;
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create a 5-second buffer of pink noise for natural water texture
  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // scale down
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public start(weather: 'CLEAR' | 'RAIN' = 'CLEAR') {
    this.weather = weather;
    this.initCtx();
    if (!this.ctx) return;
    if (this.isPlaying) {
      this.updateWeather(weather);
      return;
    }

    const now = this.ctx.currentTime;

    // Master Gain with smooth fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 2);
    this.masterGain.connect(this.ctx.destination);

    // 1. Ocean Waves Generator
    const noiseBuf = this.createPinkNoiseBuffer(this.ctx);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;
    noiseSource.loop = true;

    // Filter for wave depth
    this.waveFilter = this.ctx.createBiquadFilter();
    this.waveFilter.type = 'lowpass';
    this.waveFilter.frequency.setValueAtTime(350, now);

    // LFO for wave modulation (sine cycle every ~7 seconds)
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.14, now); // ~7.1s wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, now); // Modulate filter between 100Hz and 600Hz

    this.lfo.connect(lfoGain);
    lfoGain.connect(this.waveFilter.frequency);

    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.setValueAtTime(0.6, now);

    noiseSource.connect(this.waveFilter);
    this.waveFilter.connect(this.waveGain);
    this.waveGain.connect(this.masterGain);

    noiseSource.start(now);
    this.lfo.start(now);

    // 2. Air / Gentle Sea Wind Generator
    const windNoiseBuf = this.createPinkNoiseBuffer(this.ctx);
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windNoiseBuf;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(800, now);
    windFilter.Q.setValueAtTime(1.5, now);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.15, now);

    windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windSource.start(now);

    // 3. Rain Sound Generator (if RAIN weather)
    const rainNoiseBuf = this.createPinkNoiseBuffer(this.ctx);
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainNoiseBuf;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.setValueAtTime(1200, now);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(weather === 'RAIN' ? 0.35 : 0.0001, now);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start(now);

    this.isPlaying = true;
  }

  public updateWeather(weather: 'CLEAR' | 'RAIN') {
    this.weather = weather;
    if (!this.ctx || !this.rainGain || !this.waveFilter || !this.waveGain) return;
    const now = this.ctx.currentTime;
    if (weather === 'RAIN') {
      this.rainGain.gain.linearRampToValueAtTime(0.4, now + 1.5);
      this.waveGain.gain.linearRampToValueAtTime(0.8, now + 1.5);
      this.waveFilter.frequency.linearRampToValueAtTime(500, now + 1.5);
    } else {
      this.rainGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      this.waveGain.gain.linearRampToValueAtTime(0.6, now + 1.5);
      this.waveFilter.frequency.linearRampToValueAtTime(350, now + 1.5);
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    const now = this.ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
    } catch { /* ignore */ }
    this.ctx = null;
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const normalized = Math.max(0, Math.min(1, vol / 100));
      this.masterGain.gain.linearRampToValueAtTime(normalized * 0.4, this.ctx.currentTime + 0.1);
    }
  }
}

export const seaAudio = new SeaAudioSynthesizer();
