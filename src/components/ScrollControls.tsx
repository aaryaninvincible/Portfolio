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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  return (
    <div className="fixed bottom-20 right-3.5 sm:bottom-24 sm:right-6 z-30 flex flex-col gap-2 sm:gap-3 pointer-events-auto">
      {showTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-pill border border-white/20 text-[#ff9500] hover:text-white hover:border-primary/60 transition-all shadow-xl hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] flex items-center justify-center active:scale-90"
          aria-label="Scroll to Top"
          title="Scroll to Top"
        >
          <ArrowUp size={18} />
        </button>
      )}
      {showBottom && (
        <button
          onClick={scrollToBottom}
          className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-pill border border-white/20 text-[#ff9500] hover:text-white hover:border-primary/60 transition-all shadow-xl hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] items-center justify-center active:scale-90"
          aria-label="Scroll to Bottom"
          title="Scroll to Bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
};
