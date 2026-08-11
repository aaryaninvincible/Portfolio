import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { fetchGitHubProjects } from '../lib/github';
import { subscribeToProjects } from '../lib/realtime';
import { githubPagesProjects } from '../data/githubPagesProjects';
import type { PortfolioProject } from '../types';

const categoryThumbnails: Record<string, string> = {
  'Games & Interactive': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60',
  'Tools & Utilities': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60',
  'Forms & Auth': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=60',
  'UI & Animations': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60',
  'Portfolios & Sites': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60',
  'AI': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60',
  'AI/ML': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60',
  'Security': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
  'Web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&auto=format&fit=crop&q=60',
  'IoT': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60',
  'Clones & Apps': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60',
};

const getProjectThumbnail = (project: PortfolioProject) => {
  if (project.imageUrl) return project.imageUrl;
  return categoryThumbnails[project.category || ''] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60';
};

const fallbackProjects: PortfolioProject[] = [
  {
    id: 'fitness-rewired',
    title: 'Fitness Rewired',
    description: 'A premium human performance ecosystem designed to transform how people move, think, and live.',
    category: 'Web',
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
    demoUrl: 'https://fitness-rewired.vercel.app/',
    imageUrl: '/fitness_demo.png',
  },
  {
    id: 'e-challan-detector',
    title: 'E-Challan Scam Detector',
    description: 'Professional screening workflow for SMS, URL, and PDF challan evidence with explainable risk scoring.',
    category: 'Security',
    technologies: ['AI/ML', 'Python', 'React', 'Tailwind'],
    demoUrl: 'https://challanchecker.vercel.app/',
    imageUrl: '/echallan_demo.png',
  },
  {
    id: 'synapse-ai',
    title: 'Synapse AI',
    description: 'Advanced AI voice and screen assistant designed to help with queries, screen-sharing, and real-time interactive tasks.',
    category: 'AI',
    technologies: ['React', 'Vite', 'Gemini API', 'AI'],
    demoUrl: 'https://aaryan-synapse-ai.vercel.app/',
    imageUrl: '/synapse_demo.png',
  },
  {
    id: 'ambulance-booking',
    title: 'Ambulance Booking System',
    description: 'Emergency ambulance booking platform with booking workflow and admin-oriented management.',
    category: 'Web',
    technologies: ['PHP', 'SQL', 'JavaScript', 'SCSS'],
    imageUrl: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'smart-agriculture',
    title: 'Smart Agriculture Device',
    description: 'IoT agriculture monitoring system for real-time sensor data and automated control use cases.',
    category: 'IoT',
    technologies: ['IoT', 'Sensors', 'Dashboard'],
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'ai-career-counseling',
    title: 'AI Career Counseling',
    description: 'AI-powered student guidance concept using NLP and recommendation workflows.',
    category: 'AI',
    technologies: ['AI/ML', 'NLP', 'Python'],
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
  },
];

const ProjectViewsBadge = () => {
  const [views, setViews] = useState(() => Math.floor(Math.random() * 500) + 50);

  useEffect(() => {
    const interval = setInterval(() => {
      setViews(prev => prev + Math.floor(Math.random() * 3));
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold shrink-0 ml-auto">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      <span>{views.toLocaleString()} Live Views</span>
    </div>
  );
};

export const AllWorkPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [adminProjects, setAdminProjects] = useState<PortfolioProject[]>([]);
  const [githubProjects, setGithubProjects] = useState<PortfolioProject[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToProjects(setAdminProjects);
    fetchGitHubProjects()
      .then(setGithubProjects)
      .catch(() => setGithubProjects([]));
    return unsubscribe;
  }, []);

  const projects = useMemo(() => {
    const byTitle = new Map<string, PortfolioProject>();
    [...githubPagesProjects, ...fallbackProjects, ...githubProjects, ...adminProjects].forEach((project) => {
      byTitle.set(project.title.toLowerCase(), project);
    });
    return Array.from(byTitle.values());
  }, [adminProjects, githubProjects]);

  const categories = ['All', ...Array.from(new Set(projects.map((project) => project.category || 'Software')))].sort();
  const filtered = filter === 'All' ? projects : projects.filter((project) => project.category === filter);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-6">
        <span className="section-kicker">All projects</span>
        <h1 className="text-5xl font-orbitron font-black text-light">
          Project <span className="text-gradient">Gallery</span>
        </h1>
        <p className="text-xl text-slate-300 font-mono max-w-3xl mx-auto">
          Explore full-stack software systems, AI models, and interactive web tools. Buy source code or claim free projects.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-5 py-2 rounded-full font-mono text-sm transition-all border ${
              filter === category ? 'bg-primary/20 text-primary border-primary' : 'glass text-light hover:border-primary/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((project) => (
          <GlassCard key={project.id} className="group flex flex-col h-full overflow-hidden">
            <div className="h-48 overflow-hidden relative border-b border-light/5 bg-black/50 flex items-center justify-center">
              {project.videoUrl ? (
                <video src={project.videoUrl} className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
              ) : (
                <img src={getProjectThumbnail(project)} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={project.title} />
              )}
              <span className="absolute top-4 left-4 text-xs font-mono font-bold text-light bg-dark/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {project.source === 'github' ? 'GitHub Live' : project.category}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-orbitron font-bold text-xl text-primary capitalize">{project.title}</h3>
              <p className="font-mono text-sm text-slate-300 leading-relaxed mt-3 flex-grow">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {project.technologies.slice(0, 6).map((tech) => (
                  <span key={tech} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-6 items-center">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-light hover:text-primary inline-flex items-center gap-1">
                    Demo <ExternalLink size={14} />
                  </a>
                )}
                <a href={`/buy-projects?select=${encodeURIComponent(project.id)}`} className="text-sm font-bold text-accent hover:text-white inline-flex items-center gap-1">
                  Buy Project <ShoppingBag size={14} />
                </a>
                <ProjectViewsBadge />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
