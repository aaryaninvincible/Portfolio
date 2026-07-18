import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Github,
  Instagram,
  Languages,
  Linkedin,
  Mail,
  Rocket,
  Send,
  ShieldCheck,
  Trophy,
  Utensils,
  Youtube,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { InteractiveWidgets } from '../components/InteractiveWidgets';
import { MiniGames } from '../components/MiniGames';
import { linkedInAchievements, linkedInCertificates } from '../data/profile';
import { fetchGitHubProjects } from '../lib/github';
import {
  submitContactMessage,
  submitRepoRequest,
  subscribeToCertificates,
  subscribeToProjects,
} from '../lib/realtime';
import type { Certificate, PortfolioProject } from '../types';

const skills = [
  'JavaScript',
  'Python',
  'React.js',
  'Node.js',
  'IoT',
  'MongoDB',
  'PHP',
  'SQL',
  'AI/ML',
  'Firebase',
  'Flask',
  'AWS',
];

const fallbackProjects: PortfolioProject[] = [
  {
    id: 'excel-ai-editor',
    title: 'Excel AI Editor',
    description: 'AI-powered spreadsheet editor for data cleanup, analysis, and advanced Excel workflows.',
    technologies: ['AI', 'JavaScript', 'HTML', 'CSS'],
    category: 'AI',
    demoUrl: '../ExcelAI Editor/index.html',
    featured: true,
  },
  {
    id: 'bawarchi-2',
    title: 'Bawarchi 2.0',
    description: 'Restaurant website with a polished menu, responsive design, and customer-first layout.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    category: 'Web',
    demoUrl: '../Bawarchi_2.0/index.html',
    featured: true,
  },
  {
    id: 'linguistic-academy',
    title: 'Linguistic Academy',
    description: 'Language learning interface with interactive lessons and clean student navigation.',
    technologies: ['HTML', 'CSS', 'Vanilla JS'],
    category: 'Education',
    demoUrl: '../Linguistic Academy/index.html',
    featured: true,
  },
];

const storyPanels = [
  {
    title: 'Idea to MVP',
    copy: 'Fast prototypes for BTech, MTech, startup, and freelance software needs.',
  },
  {
    title: 'Build + Integrate',
    copy: 'React, Firebase, Node, AI/ML, IoT dashboards, admin panels, and automations.',
  },
  {
    title: 'Demo Ready',
    copy: 'Clean project pages with media, use cases, live demos, and approval-based repo access.',
  },
];

const ProjectIcon = ({ index }: { index: number }) => {
  const icons = [
    <FileSpreadsheet className="h-12 w-12 text-primary" />,
    <Utensils className="h-12 w-12 text-primary" />,
    <Languages className="h-12 w-12 text-primary" />,
    <Bot className="h-12 w-12 text-primary" />,
  ];
  return icons[index % icons.length];
};

export const HomePage: React.FC = () => {
  const [adminProjects, setAdminProjects] = useState<PortfolioProject[]>([]);
  const [githubProjects, setGithubProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [contactStatus, setContactStatus] = useState('');
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    const unsubProjects = subscribeToProjects(setAdminProjects);
    const unsubCertificates = subscribeToCertificates(setCertificates);

    fetchGitHubProjects()
      .then(setGithubProjects)
      .catch(() => setGithubProjects([]));

    return () => {
      unsubProjects();
      unsubCertificates();
    };
  }, []);

  const projects = useMemo(() => {
    const byTitle = new Map<string, PortfolioProject>();
    [...fallbackProjects, ...githubProjects, ...adminProjects].forEach((project) => {
      byTitle.set(project.title.toLowerCase(), project);
    });
    return Array.from(byTitle.values());
  }, [adminProjects, githubProjects]);

  const featuredProjects = projects.filter((project) => project.featured || project.source === 'github').slice(0, 9);
  const visibleCertificates = certificates.length > 0 ? certificates : linkedInCertificates;

  const handleContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setContactStatus('Sending...');
    await submitContactMessage({
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      topic: String(form.get('topic') || 'General inquiry'),
      message: String(form.get('message') || ''),
    });
    event.currentTarget.reset();
    setContactStatus('Message received. Aryan can reply from the admin panel.');
  };

  const handleRepoRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setRequestStatus('Sending request...');
    await submitRepoRequest({
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      projectTitle: String(form.get('projectTitle') || ''),
      reason: String(form.get('reason') || ''),
    });
    event.currentTarget.reset();
    setRequestStatus('Request received. You will receive a mail for repo access after review.');
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-28">
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <span className="section-kicker">Full stack + AI/ML + freelance builds</span>
          <h1 className="text-5xl md:text-7xl font-orbitron font-black text-light drop-shadow-[0_0_10px_rgba(255,115,0,0.7)]">
            Aryan <span className="text-gradient">Raikwar</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl font-mono leading-relaxed">
            I build full-stack apps, AI/ML tools, IoT dashboards, student major projects, and freelance software systems
            with clean demos, admin panels, and production-ready workflows.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="glass px-6 py-3 rounded-lg text-primary font-bold hover:bg-white/10">
              View Projects
            </a>
            <a href="/resume" className="glass px-6 py-3 rounded-lg text-secondary font-bold hover:bg-white/10 inline-flex items-center gap-2">
              <Download size={18} /> Resume
            </a>
            <a href="#repo-request" className="glass px-6 py-3 rounded-lg text-accent font-bold hover:bg-white/10">
              Ask For Repo
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative rounded-[2rem] border border-primary/30 bg-black p-3 shadow-[0_0_60px_rgba(255,115,0,0.25)]">
            <img src="/aryan.png" alt="Aryan Raikwar" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
            <div className="absolute -bottom-6 left-6 right-6 glass rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-orbitron text-xl text-primary">13K+</p>
                  <p className="text-xs text-slate-400">Followers</p>
                </div>
                <div>
                  <p className="font-orbitron text-xl text-secondary">AI/ML</p>
                  <p className="text-xs text-slate-400">Focus</p>
                </div>
                <div>
                  <p className="font-orbitron text-xl text-accent">Full</p>
                  <p className="text-xs text-slate-400">Stack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="grid gap-8 lg:grid-cols-3">
        {storyPanels.map((panel, index) => (
          <motion.div
            key={panel.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.12 }}
          >
            <GlassCard className="p-8 h-full">
              <div className="mb-8 h-40 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
                <motion.div
                  className="h-full w-full bg-[linear-gradient(120deg,rgba(255,115,0,0.15),rgba(255,150,0,0.35),rgba(255,85,0,0.15))]"
                  whileInView={{ x: ['-20%', '20%', '-10%'], scale: [1, 1.12, 1.05] }}
                  transition={{ duration: 2.8, repeat: Infinity, repeatType: 'mirror' }}
                />
              </div>
              <h2 className="font-orbitron text-2xl text-light mb-3">{panel.title}</h2>
              <p className="text-slate-300 leading-relaxed">{panel.copy}</p>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      <InteractiveWidgets />

      <section id="about" className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <span className="section-kicker">About</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Software that ships</h2>
          <p className="text-slate-300 font-mono text-lg leading-relaxed">
            I work across frontend, backend, Firebase, AI/ML, IoT, and automation. I can help with free learning
            projects, paid freelance builds, BTech/MTech final year projects, demos, documentation, and deployment.
          </p>
          <div className="flex flex-wrap gap-4">
            {skills.map((skill) => (
              <GlassCard key={skill} className="px-5 py-3">
                <span className="font-bold text-light text-sm">{skill}</span>
              </GlassCard>
            ))}
          </div>
        </div>

        <GlassCard className="p-8" disableTilt>
          <h3 className="font-orbitron text-2xl mb-4 text-light flex items-center gap-2">
            <Bot className="text-primary" /> Gaming Highlights
          </h3>
          <p className="font-mono text-slate-300 text-sm leading-relaxed mb-6">
            Three quick 2D games built for mobile and desktop play.
          </p>
          <MiniGames />
        </GlassCard>
      </section>

      <section id="projects" className="space-y-10">
        <div className="text-center space-y-4">
          <span className="section-kicker">Projects</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Latest Work From GitHub + Admin</h2>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Repo links are private by request. Public visitors can view project details, demos, media, and ask for access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <GlassCard key={project.id} className="group flex flex-col h-full">
              <div className="h-48 bg-black/60 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {project.videoUrl ? (
                  <video src={project.videoUrl} className="h-full w-full object-cover opacity-80" autoPlay muted loop playsInline />
                ) : project.imageUrl ? (
                  <img src={project.imageUrl} className="h-full w-full object-cover opacity-80" alt={project.title} />
                ) : (
                  <ProjectIcon index={index} />
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">{project.category}</span>
                <h3 className="font-orbitron text-2xl text-primary mt-3 mb-2 font-bold capitalize">{project.title}</h3>
                <p className="text-slate-300 text-sm mb-4 font-mono leading-relaxed flex-grow">{project.description}</p>
                {project.useCase && <p className="text-xs text-slate-400 mb-4">Use case: {project.useCase}</p>}
                <div className="flex gap-2 flex-wrap mb-6">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span key={tech} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-mono border border-primary/20">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-light hover:text-primary inline-flex items-center gap-1">
                      Demo <ExternalLink size={14} />
                    </a>
                  )}
                  <a href="#repo-request" className="text-sm font-bold text-accent hover:text-white inline-flex items-center gap-1">
                    Ask For Repo <ShieldCheck size={14} />
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="certificates" className="space-y-10">
        <div className="text-center space-y-4">
          <span className="section-kicker">Certificates</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Verified Learning</h2>
        </div>
        {visibleCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleCertificates.map((certificate) => (
              <GlassCard key={certificate.id} className="overflow-hidden flex flex-col h-full">
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
                    {certificate.imageUrl && (
                      <a 
                        href={certificate.imageUrl} 
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
      </section>

      <section id="achievements" className="space-y-10">
        <div className="text-center space-y-4">
          <span className="section-kicker">Achievements</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">LinkedIn Profile Highlights</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {linkedInAchievements.map((achievement) => (
            <GlassCard key={achievement.title} className="p-6">
              <h3 className="font-orbitron text-xl text-accent">{achievement.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{achievement.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="repo-request" className="grid gap-8 lg:grid-cols-2">
        <GlassCard className="p-8">
          <span className="section-kicker">Repo access</span>
          <h2 className="font-orbitron text-3xl mt-3 mb-4">Ask for a project repo</h2>
          <p className="text-slate-300 mb-6">
            Repo links are not shown publicly. Send a request and Aryan will review it from the admin panel.
          </p>
          <form onSubmit={handleRepoRequest} className="space-y-4">
            <input name="name" className="input-shell" placeholder="Your name" required />
            <input name="email" type="email" className="input-shell" placeholder="Email address" required />
            <input name="projectTitle" className="input-shell" placeholder="Project name" required />
            <textarea name="reason" className="input-shell min-h-28" placeholder="Why do you need repo access?" required />
            <button className="glass px-5 py-3 rounded-lg text-accent font-bold inline-flex items-center gap-2" type="submit">
              <Send size={18} /> Send Request
            </button>
            {requestStatus && <p className="text-sm text-accent">{requestStatus}</p>}
          </form>
        </GlassCard>

        <GlassCard className="p-8" id="contact">
          <span className="section-kicker">Contact</span>
          <h2 className="font-orbitron text-3xl mt-3 mb-4">Project, freelancing, BTech/MTech help</h2>
          <form onSubmit={handleContact} className="space-y-4">
            <input name="name" className="input-shell" placeholder="Your name" required />
            <input name="email" type="email" className="input-shell" placeholder="Email address" required />
            <input name="phone" className="input-shell" placeholder="Phone / WhatsApp optional" />
            <input name="topic" className="input-shell" placeholder="Topic: freelancing, AI/ML, BTech project..." />
            <textarea name="message" className="input-shell min-h-28" placeholder="Tell me what you want to build" required />
            <button className="glass px-5 py-3 rounded-lg text-primary font-bold inline-flex items-center gap-2" type="submit">
              <Rocket size={18} /> Send Message
            </button>
            {contactStatus && <p className="text-sm text-primary">{contactStatus}</p>}
          </form>
        </GlassCard>
      </section>

      <footer className="text-center pt-16 border-t border-white/10">
        <div className="flex justify-center gap-4 md:gap-6 mb-10 flex-wrap">
          <a href="https://github.com/aaryaninvincible" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:text-primary transition-all">
            <Github size={24} />
          </a>
          <a href="https://instagram.com/codesworld.exe" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:text-[#E1306C] transition-all">
            <Instagram size={24} />
          </a>
          <a href="https://linkedin.com/in/aryanraikwar" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:text-[#0077b5] transition-all">
            <Linkedin size={24} />
          </a>
          <a href="https://www.youtube.com/@codesworld.exe" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:text-[#FF0000] transition-all">
            <Youtube size={24} />
          </a>
          <a href="mailto:aryanraikwar78@gmail.com" className="w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:text-accent transition-all">
            <Mail size={24} />
          </a>
        </div>
        <p className="text-slate-400 font-mono text-sm inline-flex items-center gap-2">
          <CheckCircle2 size={16} /> {new Date().getFullYear()} Aryan Zone / aaryaninvincible.
        </p>
      </footer>
    </div>
  );
};
