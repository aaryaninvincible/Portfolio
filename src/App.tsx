import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { CursorFollower } from './components/CursorFollower';
import { ParticleBackground } from './components/ParticleBackground';
import { SplashLoader } from './components/SplashLoader';

import { HomePage } from './pages/HomePage';
import { UpdatesPage } from './pages/UpdatesPage';
import { BuyProjectsPage } from './pages/BuyProjectsPage';
import { AllWorkPage } from './pages/AllWorkPage';
import { AdminPage } from './pages/AdminPage';
import { ResumePage } from './pages/ResumePage';

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

const MusicWidget: React.FC = () => {
  const [unmuted, setUnmuted] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-[45] flex items-center gap-2">
      <button
        onClick={() => setUnmuted(!unmuted)}
        className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold font-orbitron tracking-widest uppercase text-primary border-primary/30 hover:border-primary hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] transition-all"
        title="Background Music"
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
      
      {unmuted && (
        <iframe
          src="https://www.youtube.com/embed/PaJQx2mkCTA?autoplay=1&loop=1&playlist=PaJQx2mkCTA"
          allow="autoplay"
          className="hidden w-0 h-0 absolute pointer-events-none"
          title="Background Music Player"
          frameBorder="0"
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
          </Routes>
        </PageTransition>
      </main>
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
