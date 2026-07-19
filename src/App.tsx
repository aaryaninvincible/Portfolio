import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { CursorFollower } from './components/CursorFollower';
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

// ─── Music widget with volume ─────────────────────────────────────────────────
const MusicWidget: React.FC = () => {
  const [unmuted, setUnmuted] = useState(true);   // unmuted by default
  const [volume, setVolume]   = useState(10);      // 0–100, default 10%
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Send volume to YouTube iframe via postMessage
  const setYtVolume = (v: number) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [v] }),
        '*'
      );
    } catch { /* cross-origin, harmless */ }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    setYtVolume(v);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[45] flex items-center gap-2">
      <button
        onClick={() => setUnmuted(!unmuted)}
        className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold font-orbitron tracking-widest uppercase text-primary border-primary/30 hover:border-primary hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] transition-all"
        title="Toggle Background Music"
      >
        {!unmuted ? (
          <>
            <VolumeX size={14} className="text-secondary animate-pulse" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <Volume2 size={14} className="text-primary animate-bounce" />
            <span className="text-gradient">Playing</span>
          </>
        )}
      </button>

      {/* Volume slider — shows when unmuted */}
      {unmuted && (
        <div className="glass flex items-center gap-2 rounded-full px-3 py-2 border-white/10">
          <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{volume}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-primary cursor-pointer"
            title="Music Volume"
          />
        </div>
      )}

      {/* Hidden YouTube audio player */}
      {unmuted && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk&enablejsapi=1&volume=${volume}`}
          allow="autoplay"
          className="hidden w-0 h-0 absolute pointer-events-none"
          title="Background Music Player"
          frameBorder="0"
          onLoad={() => setTimeout(() => setYtVolume(volume), 1500)}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
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
      <CursorFollower />
      <Navbar />
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
          </Routes>
        </PageTransition>
      </main>
      <SeaFooter />
      <ScrollControls />
      <MusicWidget />
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
