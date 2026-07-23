import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Disc } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { audioManager, PLAYLIST } from '../lib/audioManager';

export const MusicPlaylistWidget: React.FC = () => {
  const [audioState, setAudioState] = useState(audioManager.getState());

  useEffect(() => {
    return audioManager.subscribe(() => {
      setAudioState(audioManager.getState());
    });
  }, []);

  const { isPlaying, currentTrackIndex, currentTrack, volume, isSeaViewActive } = audioState;

  return (
    <GlassCard className="p-6 md:p-8 relative overflow-hidden" disableTilt>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-white/10 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,115,0,0.3)]">
            <Disc className={`w-9 h-9 text-primary ${isPlaying && !isSeaViewActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            {isPlaying && !isSeaViewActive && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {currentTrack.genre}
              </span>
              {isSeaViewActive && (
                <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#7fffd4]/10 text-[#7fffd4] border border-[#7fffd4]/30 animate-pulse">
                  Sea View Mode (Music Paused)
                </span>
              )}
            </div>
            <h3 className="font-orbitron font-bold text-xl md:text-2xl text-light mt-1 drop-shadow">
              {currentTrack.title}
            </h3>
            <p className="text-sm font-mono text-slate-400">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => audioManager.prevTrack()}
            className="p-2.5 rounded-full glass hover:text-primary text-slate-300 transition-all border-white/10"
            title="Previous Track"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            onClick={() => audioManager.togglePlay()}
            className="p-4 rounded-full bg-gradient-to-r from-primary to-accent text-black font-bold shadow-[0_0_20px_rgba(255,115,0,0.4)] hover:scale-105 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying && !isSeaViewActive ? <Pause size={22} fill="black" /> : <Play size={22} fill="black" className="ml-0.5" />}
          </button>

          <button
            onClick={() => audioManager.nextTrack()}
            className="p-2.5 rounded-full glass hover:text-primary text-slate-300 transition-all border-white/10"
            title="Next Track"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase tracking-widest px-2 mb-1">
          <span className="flex items-center gap-1.5"><Music size={12} className="text-primary" /> Playlist ({PLAYLIST.length} Tracks)</span>
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-slate-400" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => audioManager.setVolume(Number(e.target.value))}
              className="w-20 accent-primary cursor-pointer"
            />
            <span className="w-7 text-right text-light font-bold">{volume}%</span>
          </div>
        </div>

        <div className="grid gap-2">
          {PLAYLIST.map((track, idx) => {
            const isActive = idx === currentTrackIndex;
            return (
              <button
                key={track.id}
                onClick={() => audioManager.selectTrack(idx)}
                className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between border ${
                  isActive
                    ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(255,115,0,0.15)] text-primary font-bold'
                    : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`font-orbitron text-xs w-5 text-center ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="font-mono text-sm font-semibold flex items-center gap-2">
                      {track.title}
                      {isActive && (
                        <span className="inline-flex gap-0.5 items-end h-3">
                          <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_100ms] h-full" />
                          <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_300ms] h-2/3" />
                          <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_200ms] h-4/5" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono font-normal">
                      {track.artist}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                  {track.genre}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
