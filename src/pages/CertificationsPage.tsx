import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Trophy, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { linkedInCertificates } from '../data/profile';
import { subscribeToCertificates } from '../lib/realtime';
import type { Certificate } from '../types';

export const CertificationsPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsub = subscribeToCertificates(setCertificates);
    return () => unsub();
  }, []);

  const visibleCertificates = certificates.length > 0 ? certificates : linkedInCertificates;

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </a>
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-light">
          All <span className="text-gradient">Certifications</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto font-mono">
          A complete collection of my verified learning, certifications, and training programs.
        </p>
      </motion.div>

      {visibleCertificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCertificates.map((certificate) => (
            <GlassCard 
              key={certificate.id} 
              className="overflow-hidden flex flex-col h-full cursor-pointer hover:border-accent/40 transition-all duration-300"
              onClick={() => {
                const targetUrl = certificate.pdfUrl || certificate.imageUrl;
                if (targetUrl) {
                  window.open(targetUrl, '_blank');
                }
              }}
            >
              {certificate.imageUrl ? (
                certificate.imageUrl.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex h-56 flex-col items-center justify-center border-b border-white/10 bg-black/50 px-6 text-center gap-2">
                    <FileText className="h-10 w-10 text-primary animate-pulse" />
                    <span className="font-orbitron text-sm text-slate-300">PDF Credential</span>
                  </div>
                ) : (
                  <img src={certificate.imageUrl} alt={certificate.title} className="h-56 w-full object-cover" />
                )
              ) : (
                <div className="flex h-40 items-center justify-center border-b border-white/10 bg-black/50 px-6 text-center">
                  <Trophy className="mr-3 h-8 w-8 shrink-0 text-primary" />
                  <span className="font-orbitron text-lg text-light">{certificate.issuer || 'Certificate'}</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-orbitron text-xl text-primary">{certificate.title}</h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{certificate.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-mono">
                    {[certificate.issuer, certificate.date].filter(Boolean).join(' - ')}
                  </p>
                  {(certificate.pdfUrl || certificate.imageUrl) && (
                    <a 
                      href={certificate.pdfUrl || certificate.imageUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-bold text-accent hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      View <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center text-slate-300">Certificates will appear here after upload from admin.</GlassCard>
      )}
    </div>
  );
};
