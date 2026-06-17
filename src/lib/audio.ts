// Web Audio API Retro Sound Generator

let audioCtx: AudioContext | null = null;
let musicTimer: number | null = null;
let isMusicMuted = true;
let isGameMuted = false;

// Simple chiptune melody
const melody = [
  { note: 'C4', dur: 0.4 }, { note: 'E4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'C5', dur: 0.4 },
  { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.4 },
  { note: 'C4', dur: 0.4 }, { note: 'E4', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 0.4 },
  { note: 'C5', dur: 0.4 }, { note: 'D5', dur: 0.4 }, { note: 'C5', dur: 0.8 }
];

const freqs: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00, 'A4': 440.00,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25
};

let noteIndex = 0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playMusicNote = () => {
  if (isMusicMuted) return;
  try {
    const ctx = getAudioContext();
    const item = melody[noteIndex];
    const freq = freqs[item.note];
    if (freq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + item.dur - 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + item.dur);
    }
    noteIndex = (noteIndex + 1) % melody.length;
    musicTimer = window.setTimeout(playMusicNote, item.dur * 1000);
  } catch (e) {
    console.error('Failed to play music note', e);
  }
};

export const startBackgroundMusic = () => {
  isMusicMuted = false;
  if (musicTimer) clearTimeout(musicTimer);
  playMusicNote();
};

export const stopBackgroundMusic = () => {
  isMusicMuted = true;
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
};

export const toggleGlobalMusic = () => {
  if (isMusicMuted) {
    startBackgroundMusic();
    return true;
  } else {
    stopBackgroundMusic();
    return false;
  }
};

export const getMusicMuteState = () => isMusicMuted;

// Game Sound Effects
export const playSound = (type: 'jump' | 'score' | 'crash') => {
  if (isGameMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.error('Failed to play sound effect', e);
  }
};

export const toggleGameMute = () => {
  isGameMuted = !isGameMuted;
  return isGameMuted;
};

export const getGameMuteState = () => isGameMuted;
