import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Trophy, ArrowLeft, Search, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { linkedInCertificates } from '../data/profile';
import { subscribeToCertificates } from '../lib/realtime';
import type { Certificate } from '../types';

const categories = [
  'All',
  'Cloud & Architecture',
  'AI & GenAI',
  'IoT & Automation',
  'Data Science & Analytics',
  'Cybersecurity & Engineering',
];

export const CertificationsPage: React.FC = () => {
  const [dbCertificates, setDbCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsub = subscribeToCertificates(setDbCertificates);
    return () => unsub();
  }, []);

  // Merge static certificates with any DB certificates so neither is lost
  const allCertificates = useMemo(() => {
    const map = new Map<string, Certificate>();
    linkedInCertificates.forEach((c) => map.set(c.id, c));
    dbCertificates.forEach((c) => {
      map.set(c.id, { ...map.get(c.id), ...c });
    });
    return Array.from(map.values());
  }, [dbCertificates]);

  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((cert) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cert.title.toLowerCase().includes(q) ||
        (cert.issuer && cert.issuer.toLowerCase().includes(q)) ||
        (cert.description && cert.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      const t = (cert.title + ' ' + (cert.issuer || '') + ' ' + cert.description).toLowerCase();

      if (selectedCategory === 'Cloud & Architecture') {
        return t.includes('oracle') || t.includes('cloud') || t.includes('architect') || t.includes('aws');
      }
      if (selectedCategory === 'AI & GenAI') {
        return t.includes('ai') || t.includes('prompt') || t.includes('agentic') || t.includes('claude') || t.includes('generative');
      }
      if (selectedCategory === 'IoT & Automation') {
        return t.includes('iot') || t.includes('arduino') || t.includes('automation') || t.includes('sensor');
      }
      if (selectedCategory === 'Data Science & Analytics') {
        return t.includes('data') || t.includes('analytics') || t.includes('sql') || t.includes('science');
      }
      if (selectedCategory === 'Cybersecurity & Engineering') {
        return t.includes('cyber') || t.includes('security') || t.includes('software') || t.includes('python') || t.includes('internship') || t.includes('hackathon');
      }
      return true;
    });
  }, [allCertificates, searchQuery, selectedCategory]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-2 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </a>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-2">
          <ShieldCheck size={14} /> Verified Industry Certifications ({allCertificates.length})
        </div>
        <h1 className="text-4xl md:text-6xl font-orbitron font-black text-light">
          Professional <span className="text-gradient">Certifications</span>
        </h1>
        <p className="text-slate-300 max-w-3xl mx-auto font-mono text-sm sm:text-base leading-relaxed">
          Comprehensive collection of verified credentials across Oracle Cloud Infrastructure, Agentic AI, Google Generative AI, IoT Systems Specialization, and Software Engineering.
        </p>
      </motion.div>

      {/* Search and Category Filters */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by certificate title, issuer (Oracle, Google, LearnQuest...), or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm font-mono transition-all backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(255,115,0,0.4)]'
                  : 'glass text-slate-300 hover:text-white hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCertificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCertificates.map((certificate) => (
            <GlassCard
              key={certificate.id}
              className="overflow-hidden flex flex-col h-full cursor-pointer hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,115,0,0.15)] transition-all duration-300 group"
              onClick={() => {
                const targetUrl = certificate.pdfUrl || certificate.imageUrl;
                if (targetUrl) {
                  window.open(targetUrl, '_blank');
                }
              }}
            >
              <div className="relative overflow-hidden bg-black/60 border-b border-white/10">
                {certificate.imageUrl ? (
                  certificate.imageUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex h-56 flex-col items-center justify-center bg-black/50 px-6 text-center gap-2">
                      <FileText className="h-10 w-10 text-primary animate-pulse" />
                      <span className="font-orbitron text-sm text-slate-300">PDF Credential</span>
                    </div>
                  ) : (
                    <img
                      src={certificate.imageUrl}
                      alt={certificate.title}
                      loading="lazy"
                      className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : (
                  <div className="flex h-56 items-center justify-center bg-black/50 px-6 text-center">
                    <Trophy className="mr-3 h-8 w-8 shrink-0 text-primary" />
                    <span className="font-orbitron text-lg text-light">{certificate.issuer || 'Certificate'}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 size={12} />
                  <span>Verified</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">
                      {certificate.issuer || 'Verified Credential'}
                    </span>
                  </div>
                  <h3 className="font-orbitron text-lg sm:text-xl text-primary font-bold leading-snug group-hover:text-primary transition-colors">
                    {certificate.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                    {certificate.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {certificate.date || 'Issued Credential'}
                  </span>
                  {(certificate.pdfUrl || certificate.imageUrl) && (
                    <a
                      href={certificate.pdfUrl || certificate.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-accent hover:text-white inline-flex items-center gap-1.5 transition-colors bg-accent/10 px-2.5 py-1 rounded border border-accent/20"
                    >
                      {certificate.pdfUrl ? 'View PDF' : 'View Image'} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center text-slate-300 max-w-md mx-auto">
          <Sparkles className="mx-auto h-8 w-8 text-primary mb-3 opacity-60" />
          <p className="font-orbitron text-lg text-white mb-1">No certificates matched</p>
          <p className="text-xs text-slate-400 font-mono">Try adjusting your search terms or selecting another category.</p>
        </GlassCard>
      )}
    </div>
  );
};
