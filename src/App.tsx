import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { ParticleBackground } from './components/ParticleBackground';
import { SeaFooter } from './components/SeaFooter';
import { ScrollControls } from './components/ScrollControls';
import { SplashLoader } from './components/SplashLoader';

import { HomePage } from './pages/HomePage';
import { UpdatesPage } from './pages/UpdatesPage';
import { BuyProjectsPage } from './pages/BuyProjectsPage';
import { AllWorkPage } from './pages/AllWorkPage';
import { AdminPage } from './pages/AdminPage';
import { ResumePage } from './pages/ResumePage';
import { CertificationsPage } from './pages/CertificationsPage';
import { ContactPage } from './pages/ContactPage';
import { PythonDsaPage } from './pages/PythonDsaPage';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Fullscreen alert banner ──────────────────────────────────────────────────
const FullscreenAlert: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/90 to-accent/80 backdrop-blur-sm text-black font-mono text-xs font-bold shadow-lg">
      <span className="flex items-center gap-2">
        <span className="text-base">🔊</span>
        For the best experience — unmute audio &amp; use full screen (F11)
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto shrink-0 w-6 h-6 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-black transition-all"
        aria-label="Dismiss"
      >✕</button>
    </div>
  );
};

// ─── Music widget with volume & playlist integration ─────────────────────────
import { audioManager } from './lib/audioManager';

const MusicWidget: React.FC = () => {
  const [audioState, setAudioState] = useState(audioManager.getState());
  const [showVolume, setShowVolume] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return audioManager.subscribe(() => {
      setAudioState(audioManager.getState());
    });
  }, []);

  const { isPlaying, currentTrack, volume, isSeaViewActive } = audioState;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setIsHidden(height > 0 && scrollY >= height - 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const forcePlayOnInteraction = () => {
      if (!audioState.isPlaying) {
        audioManager.setIsPlaying(true);
      }
      window.removeEventListener('click', forcePlayOnInteraction);
      window.removeEventListener('keydown', forcePlayOnInteraction);
      window.removeEventListener('touchstart', forcePlayOnInteraction);
    };
    window.addEventListener('click', forcePlayOnInteraction, { once: true });
    window.addEventListener('keydown', forcePlayOnInteraction, { once: true });
    window.addEventListener('touchstart', forcePlayOnInteraction, { once: true });
    return () => {
      window.removeEventListener('click', forcePlayOnInteraction);
      window.removeEventListener('keydown', forcePlayOnInteraction);
      window.removeEventListener('touchstart', forcePlayOnInteraction);
    };
  }, []);

  const setYtVolume = (v: number) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [v] }),
        '*'
      );
    } catch { /* cross-origin, harmless */ }
  };

  // Control YouTube player play/pause state dynamically without unmounting
  useEffect(() => {
    try {
      if (!isPlaying) {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      } else {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
        if (isSeaViewActive) {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: [] }),
            '*'
          );
        } else {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
            '*'
          );
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
            '*'
          );
        }
      }
    } catch { /* cross-origin, harmless */ }
  }, [isPlaying, isSeaViewActive, volume]);

  return (
    <div
      className={`fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-[45] flex items-center gap-2 max-w-[calc(100vw-2rem)] transition-all duration-500 ${
        isHidden ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => audioManager.togglePlay()}
        className="glass flex items-center gap-2 rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold font-orbitron tracking-wider uppercase text-primary border-primary/30 hover:border-primary hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] transition-all shrink-0"
        title="Toggle Music Playback"
      >
        {!isPlaying || isSeaViewActive ? (
          <>
            <VolumeX size={14} className="text-secondary animate-pulse" />
            <span className="text-[11px] sm:text-xs">Muted</span>
          </>
        ) : (
          <>
            <Volume2 size={14} className="text-primary animate-bounce" />
            <span className="text-gradient text-[11px] sm:text-xs truncate max-w-[110px] sm:max-w-[160px]">
              {currentTrack.title}
            </span>
          </>
        )}
      </button>

      {/* Volume button to expand slider cleanly on mobile & desktop */}
      <button
        onClick={() => setShowVolume(!showVolume)}
        className="glass p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-primary border-white/10 transition-colors shrink-0"
        title="Adjust Volume"
      >
        <Volume2 size={14} />
      </button>

      {/* Volume slider — shows when expanded */}
      {showVolume && (
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 border-white/10 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{volume}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => audioManager.setVolume(Number(e.target.value))}
            className="w-16 sm:w-20 accent-primary cursor-pointer"
            title="Music Volume"
          />
        </div>
      )}

      {/* Hidden YouTube audio player - Kept mounted to preserve playback position seamlessly */}
      <iframe
        ref={iframeRef}
        key={currentTrack.youtubeId}
        src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${currentTrack.youtubeId}&volume=${volume}`}
        allow="autoplay"
        className="hidden w-0 h-0 absolute pointer-events-none"
        title="Background Music Player"
        frameBorder="0"
        onLoad={() => setTimeout(() => setYtVolume(volume), 1500)}
      />
    </div>
  );
};

import { CommandPalette } from './components/CommandPalette';
import { CyberTerminalModal } from './components/CyberTerminalModal';
import { SuggestionModal } from './components/SuggestionModal';

const AppContent: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    // Force amoled black and orange theme
    document.documentElement.dataset.theme = 'amoled';
    localStorage.setItem('portfolio-theme', 'amoled');
  }, []);

  return (
    <>
      <FullscreenAlert />
      <SplashLoader />
      <ParticleBackground />
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenTerminal={() => setIsTerminalOpen(true)} />
      <main className="min-h-screen z-10 relative">
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/buy-projects" element={<BuyProjectsPage />} />
            <Route path="/all-work" element={<AllWorkPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/python-dsa" element={<PythonDsaPage />} />
          </Routes>
        </PageTransition>
      </main>
      <SeaFooter />
      <ScrollControls />
      <MusicWidget />
      <SuggestionModal />

      {/* Cyber Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
      />

      {/* Cyber Interactive Terminal CLI Modal */}
      <CyberTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
