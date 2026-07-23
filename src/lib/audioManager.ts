// Centralized Audio Manager for Background Music & Sea View Ambient Sound

export interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  genre: string;
}

export const PLAYLIST: Track[] = [
  {
    id: 'billie-jean',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    youtubeId: 'aTovqVl16o8',
    genre: 'Pop / R&B',
  },
  {
    id: 'beat-it',
    title: 'Beat it',
    artist: 'Michael Jackson',
    youtubeId: '0lcSZSY1glg',
    genre: 'Pop / Rock',
  },
  {
    id: 'bye',
    title: 'Bye',
    artist: 'Ariana Grande',
    youtubeId: '-EdPhiR7ddw',
    genre: 'Pop',
  },
  {
    id: 'young-black-rich',
    title: 'Young, Black & Rich',
    artist: 'Various',
    youtubeId: 'qygCiWrTcog',
    genre: 'Hip Hop',
  },
];

type AudioListener = () => void;

class AudioManager {
  private isPlaying: boolean = true;
  private currentTrackIndex: number = 0;
  private volume: number = 20;
  private isSeaViewActive: boolean = false;
  private listeners: Set<AudioListener> = new Set();

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrackIndex: this.currentTrackIndex,
      currentTrack: PLAYLIST[this.currentTrackIndex],
      volume: this.volume,
      isSeaViewActive: this.isSeaViewActive,
    };
  }

  public setIsPlaying(playing: boolean) {
    this.isPlaying = playing;
    this.notify();
  }

  public togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    this.notify();
  }

  public selectTrack(index: number) {
    if (index >= 0 && index < PLAYLIST.length) {
      this.currentTrackIndex = index;
      this.isPlaying = true;
      this.notify();
    }
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    this.isPlaying = true;
    this.notify();
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    this.isPlaying = true;
    this.notify();
  }

  public setSeaViewActive(active: boolean) {
    if (this.isSeaViewActive !== active) {
      this.isSeaViewActive = active;
      this.notify();
    }
  }
}

export const audioManager = new AudioManager();
