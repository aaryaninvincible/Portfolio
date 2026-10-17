import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

interface TechItem {
  name: string;
  category: 'Languages' | 'Frontend' | 'Backend & Cloud' | 'AI & ML';
  level: string;
  projectsCount: string;
  iconSvg: React.ReactNode;
  accentColor: string;
}

export const TechStackShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  const technologies: TechItem[] = [
    {
      name: 'Python',
      category: 'Languages',
      level: 'Mastery / Production',
      projectsCount: '25+ Projects',
      accentColor: '#3776AB',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#3776AB" d="M63.7 3.3c-15.6 0-25.2 6.8-25.2 19.9v14.7h25.7v3.7H25.4C11.5 41.6 0 51.1 0 67.5c0 16.4 10.6 25.8 24.5 25.8h8.8V79.6c0-10.8 9.4-19.8 20.3-19.8h25.6V39.6c0-13.8-11.4-36.3-35.5-36.3zm-11 9.9c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" />
          <path fill="#FFD43B" d="M64.3 124.7c15.6 0 25.2-6.8 25.2-19.9V90.1H63.8v-3.7h38.8c13.9 0 25.4-9.5 25.4-25.9 0-16.4-10.6-25.8-24.5-25.8h-8.8v13.7c0 10.8-9.4 19.8-20.3 19.8H48.8v20.2c0 13.8 11.4 36.3 35.5 36.3zm11-9.9c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      category: 'Languages',
      level: 'Advanced Full Stack',
      projectsCount: '18+ Systems',
      accentColor: '#3178C6',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#3178C6" d="M1.5 0h125v128H1.5z" />
          <path fill="#FFF" d="M69.7 73.1h13.9c1.9 8.2 8.7 13.3 18.5 13.3 9.4 0 15.6-4.8 15.6-11.9 0-7.3-5-10.4-16.7-15.5-16.3-7.1-23.7-14.7-23.7-28 0-16.1 12.8-27.4 32.4-27.4 18.3 0 30.6 10.7 32.6 26.6h-14.1c-1.7-8.1-7.8-12.7-17.7-12.7-9.3 0-15.6 5.1-15.6 12 0 6.6 4.6 9.7 15.8 14.7 17.5 7.7 24.8 14.8 24.8 28.7 0 17.9-13.4 28.6-34 28.6-20.2 0-33.6-11.2-35.8-28.4zm-48.4-46v15.6h17v58.8H54V42.7h17V27.1H21.3z" />
        </svg>
      ),
    },
    {
      name: 'C++',
      category: 'Languages',
      level: 'Low-latency / Systems',
      projectsCount: '8+ Engines',
      accentColor: '#00599C',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#00599C" d="M64 4.5L12 34.5v60L64 124.5l52-30v-60L64 4.5zm0 15.3l38.7 22.3v44.6L64 109 25.3 86.7V42.1L64 19.8z" />
          <path fill="#004482" d="M64 29.8c-18.9 0-34.2 15.3-34.2 34.2s15.3 34.2 34.2 34.2c12.4 0 23.3-6.6 29.2-16.6H78.8c-4.1 4.8-10.3 8-17.2 8-12.7 0-23-10.3-23-23s10.3-23 23-23c7.4 0 13.9 3.5 17.8 8.9h14.8c-6.1-10.4-17.3-17.3-30.2-17.3z" />
          <path fill="#00599C" d="M88.7 57.5h-5.4v5h5.4v5.4h5v-5.4h5.4v-5h-5.4v-5.4h-5v5.4zm18.3 0h-5.4v5h5.4v5.4h5v-5.4h5.4v-5h-5.4v-5.4h-5v5.4z" />
        </svg>
      ),
    },
    {
      name: 'React.js',
      category: 'Frontend',
      level: 'Advanced Architecture',
      projectsCount: '30+ Apps',
      accentColor: '#61DAFB',
      iconSvg: (
        <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      ),
    },
    {
      name: 'Next.js',
      category: 'Frontend',
      level: 'SSR & App Router',
      projectsCount: '12+ SaaS Platforms',
      accentColor: '#FFFFFF',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="64" cy="64" r="64" fill="#000" stroke="#FFF" strokeWidth="4" />
          <path fill="#FFF" d="M83.9 94.6L44.8 44.2h-9.6v45.2h7.8V55.6l34.8 44.8c2.1-1.8 4.2-3.7 6.1-5.8z" />
          <path fill="#FFF" d="M82.8 44.2h8.2v32.6l-8.2-10.6z" />
        </svg>
      ),
    },
    {
      name: 'PyTorch',
      category: 'AI & ML',
      level: 'Deep Sequence / NLP',
      projectsCount: '14+ Models',
      accentColor: '#EE4C2C',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#EE4C2C" d="M85.3 17.5l-9.1 9.1c16.3 16.3 16.3 42.7 0 59-16.3 16.3-42.7 16.3-59 0-16.3-16.3-16.3-42.7 0-59l-9.1-9.1c-21.3 21.3-21.3 55.9 0 77.2 21.3 21.3 55.9 21.3 77.2 0 21.3-21.3 21.3-55.9 0-77.2z" />
          <circle cx="86.8" cy="18.9" r="6.7" fill="#EE4C2C" />
          <path fill="#EE4C2C" d="M64 36.8l-12.8 12.8h25.6z" />
        </svg>
      ),
    },
    {
      name: 'Three.js',
      category: 'Frontend',
      level: '3D WebGL / Shaders',
      projectsCount: '7+ Virtual Worlds',
      accentColor: '#00F3FF',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#FFF" d="M64 12L12 108h104L64 12zm0 28l36 60H28l36-60z" />
          <path fill="#00F3FF" d="M64 40l18 30H46l18-30z" />
        </svg>
      ),
    },
    {
      name: 'Flutter',
      category: 'Frontend',
      level: 'Cross-platform Mobile',
      projectsCount: '6+ Production Apps',
      accentColor: '#02569B',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#02569B" d="M12.8 67.2L68.8 11.2h36.8L31.2 85.6z" />
          <path fill="#0175C2" d="M68.8 116.8l-18.4-18.4 18.4-18.4h36.8L87.2 98.4l18.4 18.4z" />
          <path fill="#29B6F6" d="M68.8 80l18.4 18.4-18.4 18.4z" />
        </svg>
      ),
    },
    {
      name: 'Node.js',
      category: 'Backend & Cloud',
      level: 'REST APIs & Microservices',
      projectsCount: '22+ Services',
      accentColor: '#339933',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#339933" d="M64 4.5l52 30v60l-52 30-52-30v-60l52-30zm0 13.8L22.6 42.1v45.1L64 110.9l41.4-23.7V42.1L64 18.3z" />
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      category: 'Frontend',
      level: 'Design Systems',
      projectsCount: '35+ Projects',
      accentColor: '#38BDF8',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#38BDF8" d="M64 28c-18 0-29.3 9-34 27 6.7-9 14.7-12.3 24-10 5.3 1.3 9.1 5.2 13.3 9.5C70.2 61.4 78 69.3 98 69.3c18 0 29.3-9 34-27-6.7 9-14.7 12.3-24 10-5.3-1.3-9.1-5.2-13.3-9.5C87.8 35.9 80 28 64 28zM30 69.3c-18 0-29.3 9-34 27 6.7-9 14.7-12.3 24-10 5.3 1.3 9.1 5.2 13.3 9.5 6.9 6.9 14.7 14.8 34.7 14.8 18 0 29.3-9 34-27-6.7 9-14.7 12.3-24 10-5.3-1.3-9.1-5.2-13.3-9.5C57.8 77.2 50 69.3 30 69.3z" />
        </svg>
      ),
    },
    {
      name: 'Docker',
      category: 'Backend & Cloud',
      level: 'Containerization / CI',
      projectsCount: '15+ Deployments',
      accentColor: '#2496ED',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#2496ED" d="M123.6 57.3c-2.4-1.8-7.7-2.6-12-1.4-1.2-4.5-4.5-8.2-9-10.5l-3.3-1.6-.9 3.5c-1.5 6.1-5.5 10.6-11.7 13.1-2.9 1.1-7 1.8-12 1.8H6.5c-2.3 9.5.4 19.3 6.9 26.6C26.1 103 48.7 108 69 108c35.6 0 54.4-15.6 58.7-43.1.2-1.3.1-2.7-.1-4-1.3-1.6-2.6-2.8-4-3.6zM28.4 56.6h11.4v11.4H28.4V56.6zm14.3 0h11.4v11.4H42.7V56.6zm14.3 0h11.4v11.4H57V56.6zm14.3 0h11.4v11.4H71.3V56.6zm-42.9-14.3h11.4v11.4H28.4V42.3zm14.3 0h11.4v11.4H42.7V42.3zm14.3 0h11.4v11.4H57V42.3zm14.3 0h11.4v11.4H71.3V42.3z" />
        </svg>
      ),
    },
    {
      name: 'PostgreSQL',
      category: 'Backend & Cloud',
      level: 'Relational DB & SQL',
      projectsCount: '16+ Databases',
      accentColor: '#4169E1',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#4169E1" d="M64 8.5C33.4 8.5 8.5 33.4 8.5 64S33.4 119.5 64 119.5 119.5 94.6 119.5 64 94.6 8.5 64 8.5zm31.7 64.9c-2.4 11.2-11.7 17.6-22.8 17.6-13.6 0-21.7-8.9-24.8-17.6-1.6-4.5-2.2-9.6-2.2-14.4 0-14.7 9.8-26.6 25.4-26.6 14.8 0 25.1 10.9 25.1 26 0 5-.3 10.1-.7 15z" />
        </svg>
      ),
    },
    {
      name: 'Firebase',
      category: 'Backend & Cloud',
      level: 'Auth & Firestore',
      projectsCount: '20+ Full Apps',
      accentColor: '#FFCA28',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#FFA000" d="M20.5 94.2L41.3 12.6c.5-2.1 3.4-2.7 4.7-.9l17.4 24.3-42.9 58.2z" />
          <path fill="#F57C00" d="M69.8 47.9l-14.6-20.4c-.9-1.3-2.9-1.3-3.8 0l-38 52.7 56.4-32.3z" />
          <path fill="#FFCA28" d="M107.5 94.2L91.2 28.5c-.5-2.1-3.4-2.7-4.7-.9L13.4 100.4l46.9 26.2c2.3 1.3 5.1 1.3 7.4 0l46.9-26.2c-2.4-2.2-5-4.4-7.1-6.2z" />
        </svg>
      ),
    },
    {
      name: 'OpenCV / Vision',
      category: 'AI & ML',
      level: 'Detection & SAM',
      projectsCount: '9+ Systems',
      accentColor: '#5C3EE8',
      iconSvg: (
        <svg viewBox="0 0 128 128" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="64" cy="38" r="24" fill="#EE2A24" />
          <circle cx="40" cy="86" r="24" fill="#008FD5" />
          <circle cx="88" cy="86" r="24" fill="#00B050" />
          <circle cx="64" cy="62" r="12" fill="#000" />
        </svg>
      ),
    },
  ];

  const categories = ['All', 'Languages', 'Frontend', 'Backend & Cloud', 'AI & ML'];

  const filtered = activeTab === 'All'
    ? technologies
    : technologies.filter((t) => t.category === activeTab);

  return (
    <section id="tech-stack" className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono shadow-[0_0_15px_rgba(255,115,0,0.18)]">
          <Terminal size={14} className="text-secondary" />
          <span>Core Engineering Stack &bull; Verified Production Competencies</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">
          Languages &amp; <span className="text-gradient">Technologies</span>
        </h2>
        <p className="text-slate-300 font-sans max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Production toolchains, languages, and architectures powering enterprise systems, AI pipelines, and interactive digital experiences.
        </p>
      </div>

      {/* Category Pills (iOS VisionOS Style) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-sans font-medium transition-all duration-300 ${
              activeTab === cat
                ? 'liquid-glass-capsule text-white border-primary/50 shadow-[0_0_20px_rgba(255,115,0,0.35)] font-semibold'
                : 'glass-pill text-slate-300 hover:text-white hover:border-white/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Floating Liquid Glass Droplet Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4 pt-2">
        {filtered.map((tech) => (
          <div
            key={tech.name}
            onMouseEnter={() => setHoveredTech(tech)}
            onMouseLeave={() => setHoveredTech(null)}
            className="group relative flex flex-col items-center justify-center p-4 rounded-2xl liquid-glass-drop cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-white/50"
            style={{
              minHeight: '115px',
            }}
          >
            {/* SVG Logo Container with liquid lens glow */}
            <div
              className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
              style={{
                filter: `drop-shadow(0 4px 12px ${tech.accentColor}55)`,
              }}
            >
              {tech.iconSvg}
            </div>

            <span className="mt-2 text-xs font-semibold text-light font-sans group-hover:text-primary transition-colors tracking-wide text-center">
              {tech.name}
            </span>

            <span className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-80">
              {tech.projectsCount}
            </span>
          </div>
        ))}
      </div>

      {/* Dynamic Inspector Preview Bar */}
      {hoveredTech && (
        <div className="mx-auto max-w-md p-3 rounded-2xl liquid-glass-capsule flex items-center justify-between gap-4 animate-fadeIn border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 shrink-0">
              {hoveredTech.iconSvg}
            </div>
            <div>
              <p className="text-xs font-bold text-white font-sans">{hoveredTech.name}</p>
              <p className="text-[11px] text-primary font-mono">{hoveredTech.level}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-mono font-bold border border-primary/30">
            {hoveredTech.projectsCount}
          </span>
        </div>
      )}
    </section>
  );
};
