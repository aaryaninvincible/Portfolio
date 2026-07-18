import React, { useEffect, useState } from 'react';
import { Download, FileText, Maximize2, Trophy, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { subscribeToResume, subscribeToCertificates } from '../lib/realtime';
import { linkedInCertificates } from '../data/profile';
import { CertificateModal } from '../components/CertificateModal';
import type { Certificate, ResumeProfile } from '../types';

export const ResumePage: React.FC = () => {
  const [resume, setResume] = useState<ResumeProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubResume = subscribeToResume(setResume);
    const unsubCertificates = subscribeToCertificates(setCertificates);
    return () => {
      unsubResume();
      unsubCertificates();
    };
  }, []);

  const resumeUrl = resume?.fileUrl || '/AryanRaikwarResume.pdf';
  const visibleCertificates = certificates.length > 0 ? certificates : linkedInCertificates;

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-5">
        <span className="section-kicker">Resume</span>
        <h1 className="text-5xl font-orbitron font-black">
          Aryan Raikwar <span className="text-gradient">Resume</span>
        </h1>
        <p className="text-slate-300">View the latest resume directly here. Admin uploads will replace this file.</p>
        <a href={resumeUrl} download="Aryan_Raikwar_Resume.pdf" target="_blank" rel="noreferrer" className="glass inline-flex items-center gap-2 rounded-lg px-5 py-3 text-primary font-bold">
          <Download size={18} /> Open / Download
        </a>
      </div>

      <GlassCard className="p-3 min-h-[70vh]" disableTilt>
        {resumeUrl ? (
          <div className="overflow-hidden rounded-lg bg-white">
            <object data={`${resumeUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="hidden h-[78vh] w-full md:block">
              <div className="flex min-h-[60vh] items-center justify-center p-6 text-center text-slate-900">
                <div>
                  <FileText className="mx-auto mb-4 h-12 w-12" />
                  PDF preview is not supported in this browser.
                </div>
              </div>
            </object>
            <div className="flex min-h-[55vh] items-center justify-center p-6 text-center text-slate-900 md:hidden">
              <div>
                <FileText className="mx-auto mb-4 h-12 w-12" />
                <p className="mb-5 font-bold">Resume preview opens best in full screen on mobile.</p>
                <a href={resumeUrl} download="Aryan_Raikwar_Resume.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-white">
                  <Maximize2 size={18} /> Open Resume
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center text-center text-slate-300">
            <div>
              <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
              Resume will appear here after upload.
            </div>
          </div>
        )}
      </GlassCard>

      <section className="space-y-10 pt-10 border-t border-white/10">
        <div className="text-center space-y-4">
          <span className="section-kicker">Certifications</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Professional Credentials</h2>
        </div>
        {visibleCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleCertificates.map((certificate) => (
              <GlassCard 
                key={certificate.id} 
                className="overflow-hidden flex flex-col h-full cursor-pointer hover:border-accent/40 transition-all duration-300"
                onClick={() => {
                  setSelectedCert(certificate);
                  setIsModalOpen(true);
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCert(certificate);
                          setIsModalOpen(true);
                        }}
                        className="text-xs font-bold text-accent hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        View <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center text-slate-300">Certificates will appear here after upload.</GlassCard>
        )}
      </section>

      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
