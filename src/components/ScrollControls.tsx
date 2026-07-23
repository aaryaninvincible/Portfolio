import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const ScrollControls: React.FC = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      
      setShowTop(scrollY > 300);
      setShowBottom(scrollY < height - 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  return (
    <div className="hidden md:flex fixed bottom-24 right-6 z-[60] flex-col gap-3 pointer-events-auto">
      {showTop && (
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[#7fffd4] hover:bg-black/80 hover:text-white transition-all shadow-lg hover:shadow-[#7fffd4]/20"
          aria-label="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}
      {showBottom && (
        <button
          onClick={scrollToBottom}
          className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[#7fffd4] hover:bg-black/80 hover:text-white transition-all shadow-lg hover:shadow-[#7fffd4]/20"
          aria-label="Scroll to Bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}
    </div>
  );
};
