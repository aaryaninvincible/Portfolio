import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashLoader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-darker"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="font-orbitron text-sm tracking-[0.35em] text-primary">ARYAN ZONE</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
