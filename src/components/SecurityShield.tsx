import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SecurityShield: React.FC = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: 'Proprietary IP Protection Active',
    detail: 'Source code and architecture are proprietary assets. Direct cloning or extraction is restricted.'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Contextmenu protection for project cards and sensitive areas
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const isProjectCard = target.closest('#projects') || target.closest('[data-protected="true"]') || target.closest('.group');
      if (isProjectCard) {
        e.preventDefault();
        setToastMessage({
          title: 'Source Code Protected Against Scraping',
          detail: 'Direct source code inspection and asset scraping are disabled to protect intellectual property.'
        });
        setToastVisible(true);
      }
    };

    // Copy event intercept on protected cards
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || '';
      const target = e.target as HTMLElement | null;
      const isProjectCard = target?.closest('#projects') || target?.closest('[data-protected="true"]');
      
      if (isProjectCard && selection.length > 50) {
        // Append copyright attribution notice
        setToastMessage({
          title: 'Copyright & IP Protected',
          detail: 'Proprietary project content. Unauthorized reproduction or reverse engineering is prohibited.'
        });
        setToastVisible(true);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  return (
    <AnimatePresence>
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] p-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.25)] text-light font-mono"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Lock size={12} />
                  {toastMessage.title}
                </span>
                <button
                  onClick={() => setToastVisible(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {toastMessage.detail}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setToastVisible(false);
                    navigate('/buy-projects');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                >
                  Acquire License <ArrowRight size={12} />
                </button>
                <span className="text-[10px] text-slate-400">Verified IP Safe</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
