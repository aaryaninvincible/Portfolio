import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';
import type { Certificate } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, certificate }) => {
  if (!certificate) return null;

  const isPdf = certificate.pdfUrl || certificate.imageUrl.toLowerCase().endsWith('.pdf');
  const targetUrl = certificate.pdfUrl || certificate.imageUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c0e]/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_80px_rgba(255,115,0,0.15)] backdrop-blur-xl"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-[20%] -left-[20%] -z-10 w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[20%] -z-10 w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/25 relative z-10">
              <div>
                <h3 className="font-orbitron text-lg md:text-xl text-primary font-bold">{certificate.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {[certificate.issuer, certificate.date].filter(Boolean).join(' - ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {targetUrl && (
                  <a
                    href={targetUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Open in new tab / Download"
                  >
                    <Download size={20} />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[300px] relative z-10">
              {isPdf ? (
                <div className="w-full h-[60vh] flex flex-col rounded-xl overflow-hidden bg-black/40 border border-white/5">
                  <object
                    data={`${targetUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center gap-4 text-slate-300">
                      <FileText className="h-16 w-16 text-primary animate-pulse" />
                      <p className="font-mono text-sm max-w-sm">
                        PDF preview is not supported on this device. Click the button below to download or view the document.
                      </p>
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="glass px-5 py-3 text-sm text-primary font-bold rounded-lg hover:bg-white/5 transition-all"
                      >
                        Open Original PDF
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="relative group max-w-full max-h-[60vh] rounded-xl overflow-hidden border border-white/5 bg-black/20 flex items-center justify-center">
                  <img
                    src={certificate.imageUrl}
                    alt={certificate.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              )}

              {certificate.description && (
                <div className="w-full max-w-3xl mt-6 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm text-center">
                  <p className="text-sm text-slate-300 font-mono leading-relaxed">{certificate.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
