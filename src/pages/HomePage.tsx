import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Github,
  Instagram,
  Languages,
  Layers,
  Linkedin,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Utensils,
  X,
  Activity,
  Youtube,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { InteractiveWidgets } from '../components/InteractiveWidgets';
import { MiniGames } from '../components/MiniGames';
import { MusicPlaylistWidget } from '../components/MusicPlaylist';
import { TechStackShowcase } from '../components/TechStackShowcase';
import { LiquidGlassDrop } from '../components/LiquidGlassDrop';
import { mainBigProjects } from '../data/mainProjects';
import { linkedInCertificates } from '../data/profile';
import { fetchGitHubProjects } from '../lib/github';
import {
  subscribeToCertificates,
  subscribeToProjects,
} from '../lib/realtime';
import type { Certificate, PortfolioProject } from '../types';

const skillCategories = [
  { title: 'Frontend Mastery', skills: ['React.js', 'Next.js', 'Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'HTML5/CSS3', 'WebGL / Three.js'] },
  { title: 'Backend & APIs', skills: ['Node.js', 'Express', 'Python', 'Flask', 'FastAPI', 'PHP', 'REST APIs', 'WebSockets'] },
  { title: 'Databases & Storage', skills: ['MongoDB', 'PostgreSQL', 'Firebase Realtime / Firestore', 'MySQL', 'Redis', 'SQL'] },
  { title: 'AI, ML & Models', skills: ['Machine Learning', 'PyTorch / TensorFlow', 'OpenAI API', 'Gemini API', 'LLMs & RAG', 'Computer Vision'] },
  { title: 'Cloud & Engineering', skills: ['AWS', 'Vercel', 'Docker', 'Git & GitHub', 'CI/CD Pipelines', 'IoT Dashboards'] }
];

const projectCategories = [
  'All Innovations',
  'Cyber-Physical & Security',
  'AI & Deep Learning',
  'Computer Vision',
  'Full Stack & Mobile',
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

export const HomePage: React.FC = () => {
  const [adminProjects, setAdminProjects] = useState<PortfolioProject[]>([]);
  const [githubProjects, setGithubProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('All Innovations');
  const [visibleProjectCount, setVisibleProjectCount] = useState(6);
  const [selectedSpecProject, setSelectedSpecProject] = useState<PortfolioProject | null>(null);

  const [showScrollPopup, setShowScrollPopup] = useState(false);

  useEffect(() => {
    const unsubProjects = subscribeToProjects(setAdminProjects);
    const unsubCertificates = subscribeToCertificates(setCertificates);

    fetchGitHubProjects()
      .then(setGithubProjects)
      .catch(() => setGithubProjects([]));

    const timerShow = setTimeout(() => {
      setShowScrollPopup(true);
    }, 4000);

    const timerHide = setTimeout(() => {
      setShowScrollPopup(false);
    }, 12000);

    return () => {
      unsubProjects();
      unsubCertificates();
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, []);

  const projects = useMemo(() => {
    const byId = new Map<string, PortfolioProject>();
    // Priority: mainBigProjects first, then adminProjects, then githubProjects
    mainBigProjects.forEach((project) => {
      byId.set(project.id, project);
    });
    adminProjects.forEach((project) => {
      byId.set(project.id, { ...byId.get(project.id), ...project });
    });
    githubProjects.forEach((project) => {
      if (!byId.has(project.id)) {
        byId.set(project.id, project);
      }
    });
    return Array.from(byId.values());
  }, [adminProjects, githubProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedProjectCategory === 'All Innovations') {
      return projects.filter((p) => p.featured !== false);
    }
    return projects.filter((p) => {
      const text = `${p.category} ${p.title} ${p.technologies.join(' ')}`.toLowerCase();
      if (selectedProjectCategory === 'Cyber-Physical & Security') {
        return text.includes('scada') || text.includes('cyber') || text.includes('security') || text.includes('challan') || text.includes('twin') || text.includes('solarfiber');
      }
      if (selectedProjectCategory === 'AI & Deep Learning') {
        return text.includes('ai') || text.includes('gemini') || text.includes('pytorch') || text.includes('learning') || text.includes('counseling') || text.includes('research') || text.includes('prompt') || text.includes('nlp') || text.includes('humanize');
      }
      if (selectedProjectCategory === 'Computer Vision') {
        return text.includes('vision') || text.includes('opencv') || text.includes('mediapipe') || text.includes('gesture') || text.includes('sam');
      }
      if (selectedProjectCategory === 'Full Stack & Mobile') {
        return text.includes('full stack') || text.includes('flutter') || text.includes('mobile') || text.includes('next.js') || text.includes('react') || text.includes('downloader') || text.includes('tree') || text.includes('prepforge') || text.includes('dialer') || text.includes('wellness');
      }
      return true;
    });
  }, [projects, selectedProjectCategory]);

  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleProjectCount);
  }, [filteredProjects, visibleProjectCount]);

  const allCertificates = useMemo(() => {
    const map = new Map<string, Certificate>();
    linkedInCertificates.forEach((c) => map.set(c.id, c));
    certificates.forEach((c) => {
      map.set(c.id, { ...map.get(c.id), ...c });
    });
    return Array.from(map.values());
  }, [certificates]);

  const topCertIds = [
    'oracle-cloud-infrastructure-architect-associate',
    'oracle-agentic-ai-foundations-associate',
    'google-hack2skill-promptwars',
    'coursera-google-ai',
    'coursera-iot-systems-specialization',
    'python-by-meta',
    'mastercard-cybersecurity',
    'linkedin-accenture-data-analytics',
    'coursera-aws-prompt-engineering'
  ];
  const visibleCertificates = allCertificates.filter(cert => topCertIds.includes(cert.id)).slice(0, 9);

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 sm:space-y-24 md:space-y-28">
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-8 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 sm:space-y-8">
          <span className="section-kicker">Full stack + AI/ML + freelance builds</span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-orbitron font-black text-light drop-shadow-[0_0_10px_rgba(255,115,0,0.7)]">
            Aryan <span className="text-gradient">Raikwar</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-sans leading-relaxed">
            I build full-stack apps, AI/ML tools, IoT dashboards, student major projects, and freelance software systems
            with clean demos, admin panels, and production-ready workflows.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
            <a href="#projects" className="liquid-glass-capsule inline-flex items-center justify-center px-6 py-3 rounded-full text-primary font-bold hover:text-white transition-all text-sm font-sans shadow-[0_0_20px_rgba(255,115,0,0.25)]">
              View Projects
            </a>
            <a href="/resume" className="liquid-glass-capsule inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-secondary font-bold hover:text-white transition-all text-sm font-sans">
              <Download size={16} /> Resume
            </a>
            <a href="/buy-projects" className="liquid-glass-capsule inline-flex items-center justify-center px-6 py-3 rounded-full text-accent font-bold hover:text-white transition-all text-sm font-sans">
              Buy Projects
            </a>
            <LiquidGlassDrop
              variant="drop"
              title="Explore Tech Stack"
              onClick={() => {
                const el = document.getElementById('tech-stack');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-12 h-12 shrink-0 hidden sm:inline-flex"
            >
              <Sparkles size={18} className="text-primary animate-pulse" />
            </LiquidGlassDrop>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm mb-12 sm:mb-0">
          <div className="relative rounded-[2rem] border border-white/20 glass p-3 shadow-[0_0_60px_rgba(255,115,0,0.2)]">
            <picture>
              <source srcSet="/aryan.webp" type="image/webp" />
              <source srcSet="/aryan.jpg" type="image/jpeg" />
              <img
                src="/aryan.jpg"
                alt="Aryan Raikwar"
                width={400}
                height={500}
                loading="eager"
                decoding="async"
                className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              />
            </picture>
            <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[88%] liquid-glass-capsule rounded-2xl p-3 sm:p-4 border-white/25 shadow-2xl">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-center">
                <div>
                  <p className="font-orbitron text-lg sm:text-xl text-primary font-bold">13K+</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Followers</p>
                </div>
                <div>
                  <p className="font-orbitron text-lg sm:text-xl text-secondary font-bold">AI/ML</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Focus</p>
                </div>
                <div>
                  <p className="font-orbitron text-lg sm:text-xl text-accent font-bold">Full</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Stack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <GlassCard className="w-full h-[380px] sm:h-[550px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(255,115,0,0.15)] relative" disableTilt>
          <iframe
            srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                        margin: 0;
                        overflow: hidden;
                        background-color: #000000;
                        font-family: 'Inter', -apple-system, sans-serif;
                        color: #fff;
                    }
                    canvas { display: block; }
                    #overlay {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        padding: 40px;
                        background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%);
                        z-index: 10;
                    }
                    .header { text-align: center; }
                    .title {
                        font-size: 1.2rem;
                        letter-spacing: 0.8em;
                        text-transform: uppercase;
                        color: #fff;
                        margin-bottom: 12px;
                        font-weight: 300;
                        opacity: 0.9;
                    }
                    .status-pill {
                        display: inline-block;
                        padding: 6px 20px;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 30px;
                        font-size: 0.65rem;
                        letter-spacing: 0.25em;
                        text-transform: uppercase;
                        transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .hud-bottom {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem;
                        opacity: 0.6;
                        letter-spacing: 1px;
                    }
                    .metric { margin-bottom: 6px; }
                    .val { color: #00f3ff; font-weight: bold; transition: color 1.5s ease; }
                    #vignette {
                        position: fixed;
                        inset: 0;
                        background: radial-gradient(circle, transparent 50%, black 150%);
                        pointer-events: none;
                        z-index: 5;
                    }
                    @media (max-width: 640px) {
                        #overlay {
                            padding: 15px;
                        }
                        .title {
                            font-size: 0.85rem !important;
                            letter-spacing: 0.4em !important;
                            margin-bottom: 6px !important;
                        }
                        .status-pill {
                            padding: 4px 12px !important;
                            font-size: 0.55rem !important;
                            letter-spacing: 0.15em !important;
                        }
                        .hud-bottom {
                            font-size: 0.55rem !important;
                            letter-spacing: 0.5px !important;
                        }
                    }
                  </style>

                  <script async src="https://unpkg.com/es-module-shims@1.8.0/dist/es-module-shims.js"></script>
                  <script type="importmap">
                    {
                        "imports": {
                            "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
                            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
                            "gsap": "https://unpkg.com/gsap@3.12.5/index.js"
                        }
                    }
                  </script>
                </head>
                <body>
                  <div id="vignette"></div>
                  <div id="overlay">
                      <div class="header">
                          <div class="title" id="main-title">Stable Singularity</div>
                          <div class="status-pill" id="status-text">Topology: Nominal</div>
                      </div>
                      <div class="hud-bottom">
                          <div>
                              <div class="metric">MASS_INDEX: <span class="val">4.2M SOL</span></div>
                              <div class="metric">LENSING: <span class="val" id="lensing-val">SCHWARZSCHILD</span></div>
                          </div>
                          <div style="text-align: right">
                              <div class="metric">RELATIVITY: <span class="val" id="vel-val">0.45c</span></div>
                              <div class="metric">RADIATION: <span class="val">DETECTION ON</span></div>
                          </div>
                      </div>
                  </div>

                  <script type="module">
                      import * as THREE from 'three';
                      import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
                      import gsap from 'gsap';

                      const scene = new THREE.Scene();
                      const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
                      camera.position.set(60, 30, 60);

                      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
                      renderer.setSize(window.innerWidth, window.innerHeight);
                      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                      renderer.toneMapping = THREE.ACESFilmicToneMapping;
                      renderer.toneMappingExposure = 1.6;
                      document.body.appendChild(renderer.domElement);

                      const isTouchScreen = window.innerWidth < 768;
                      const controls = new OrbitControls(camera, renderer.domElement);
                      controls.enableDamping = true;
                      controls.dampingFactor = 0.03;
                      controls.autoRotate = true;
                      controls.autoRotateSpeed = 0.4;
                      if (isTouchScreen) {
                          controls.enableRotate = false;
                          controls.enableZoom = false;
                          controls.enablePan = false;
                          renderer.domElement.style.touchAction = 'pan-y';
                      }

                      const noiseChunk = [
                          "vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
                          "vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
                          "vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }",
                          "vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }",
                          "float snoise(vec3 v) {",
                          "    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;",
                          "    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);",
                          "    vec3 i  = floor(v + dot(v, C.yyy) );",
                          "    vec3 x0 = v - i + dot(i, C.xxx) ;",
                          "    vec3 g = step(x0.yzx, x0.xyz);",
                          "    vec3 l = 1.0 - g;",
                          "    vec3 i1 = min( g.xyz, l.zxy );",
                          "    vec3 i2 = max( g.xyz, l.zxy );",
                          "    vec3 x1 = x0 - i1 + C.xxx;",
                          "    vec3 x2 = x0 - i2 + C.yyy;",
                          "    vec3 x3 = x0 - D.yyy;",
                          "    i = mod289(i);",
                          "    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));",
                          "    float n_ = 0.142857142857;",
                          "    vec3  ns = n_ * D.wyz - D.xzx;",
                          "    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);",
                          "    vec4 x_ = floor(j * ns.z);",
                          "    vec4 y_ = floor(j - 7.0 * x_ );",
                          "    vec4 x = x_ *ns.x + ns.yyyy;",
                          "    vec4 y = y_ *ns.x + ns.yyyy;",
                          "    vec4 h = 1.0 - abs(x) - abs(y);",
                          "    vec4 b0 = vec4( x.xy, y.xy );",
                          "    vec4 b1 = vec4( x.zw, y.zw );",
                          "    vec4 s0 = floor(b0)*2.0 + 1.0;",
                          "    vec4 s1 = floor(b1)*2.0 + 1.0;",
                          "    vec4 sh = -step(h, vec4(0.0));",
                          "    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;",
                          "    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;",
                          "    vec3 p0 = vec3(a0.xy,h.x);",
                          "    vec3 p1 = vec3(a0.zw,h.y);",
                          "    vec3 p2 = vec3(a1.xy,h.z);",
                          "    vec3 p3 = vec3(a1.zw,h.w);",
                          "    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));",
                          "    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;",
                          "    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);",
                          "    m = m * m;",
                          "    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );",
                          "}"
                      ].join('\\n');

                      const coreGroup = new THREE.Group();
                      scene.add(coreGroup);

                      const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                      const bhGeo = new THREE.SphereGeometry(4, 64, 64);
                      coreGroup.add(new THREE.Mesh(bhGeo, bhMat));

                      const auraMat = new THREE.ShaderMaterial({
                          uniforms: { uTime: { value: 0 }, uIntensity: { value: 1.0 } },
                          vertexShader: [
                              "varying vec3 vNormal;",
                              "varying vec3 vView;",
                              "void main() {",
                              "    vNormal = normalize(normalMatrix * normal);",
                              "    vView = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);",
                              "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                              "}"
                          ].join('\\n'),
                          fragmentShader: [
                              "uniform float uIntensity;",
                              "varying vec3 vNormal;",
                              "varying vec3 vView;",
                              "void main() {",
                              "    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 4.0);",
                              "    gl_FragColor = vec4(vec3(1.0, 0.45, 0.1) * rim * uIntensity * 5.0, 1.0);",
                              "}"
                          ].join('\\n'),
                          side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending
                      });
                      coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(4.25, 64, 64), auraMat));

                      const isMobile = window.innerWidth < 768;
                      const instanceCount = isMobile ? 1800 : 5000;
                      const streakGeo = new THREE.CylinderGeometry(0.01, 0.12, 2.2, 3);
                      streakGeo.rotateX(Math.PI / 2);
                      
                      const diskMaterial = new THREE.ShaderMaterial({
                          uniforms: {
                              uTime: { value: 0 },
                              uMorph: { value: 0.1 },
                              uCompression: { value: 1.0 },
                              uIntensity: { value: 1.0 },
                              uOrbitScale: { value: 1.0 }
                          },
                          vertexShader: [
                              noiseChunk,
                              "uniform float uTime;",
                              "uniform float uMorph;",
                              "uniform float uCompression;",
                              "uniform float uIntensity;",
                              "uniform float uOrbitScale;",
                              "varying vec3 vColor;",
                              "varying float vOpacity;",
                              "void main() {",
                              "    vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);",
                              "    float rOriginal = length(instPos.xz);",
                              "    float r = rOriginal * uCompression;",
                              "    float initialAngle = atan(instPos.z, instPos.x);",
                              "    float orbitalVelocity = (1.5 / sqrt(rOriginal)) * uOrbitScale;",
                              "    float currentAngle = initialAngle + (uTime * orbitalVelocity);",
                              "    vec3 morphedWorldPos = vec3(cos(currentAngle) * r, instPos.y, sin(currentAngle) * r);",
                              "    float noise = snoise(vec3(morphedWorldPos.x * 0.08, morphedWorldPos.z * 0.08, uTime * 0.3));",
                              "    morphedWorldPos.y += noise * uMorph * 4.0;",
                              "    vec3 viewDir = normalize(cameraPosition - morphedWorldPos);",
                              "    vec3 orbitDir = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));",
                              "    float doppler = dot(orbitDir, viewDir);",
                              "    vec3 hot = vec3(1.0, 0.95, 0.9);",
                              "    vec3 warm = vec3(1.0, 0.45, 0.1);",
                              "    vec3 cool = vec3(0.1, 0.35, 1.0);",
                              "    vec3 color = mix(cool, warm, smoothstep(45.0, 12.0, r));",
                              "    color = mix(color, hot, smoothstep(10.0, 4.0, r));",
                              "    vColor = color * (1.3 + doppler * 0.7) * uIntensity;",
                              "    vOpacity = (smoothstep(3.8, 5.5, r) * (1.0 - smoothstep(38.0, 48.0, r))) * 0.8;",
                              "    float deltaAngle = currentAngle - initialAngle;",
                              "    float c = cos(deltaAngle);",
                              "    float s = sin(deltaAngle);",
                              "    mat3 rotY = mat3(",
                              "        c, 0, s,",
                              "        0, 1, 0,",
                              "       -s, 0, c",
                              "    );",
                              "    vec3 localPos = (instanceMatrix * vec4(position, 0.0)).xyz;",
                              "    vec3 rotatedLocalPos = rotY * localPos;",
                              "    gl_Position = projectionMatrix * viewMatrix * vec4(morphedWorldPos + rotatedLocalPos, 1.0);",
                              "}"
                          ].join('\\n'),
                          fragmentShader: [
                              "varying vec3 vColor;",
                              "varying float vOpacity;",
                              "void main() {",
                              "    gl_FragColor = vec4(vColor, vOpacity);",
                              "}"
                          ].join('\\n'),
                          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
                      });

                      const instancedDisk = new THREE.InstancedMesh(streakGeo, diskMaterial, instanceCount);
                      const dummy = new THREE.Object3D();

                      for (let i = 0; i < instanceCount; i++) {
                          const r = 5 + Math.pow(Math.random(), 1.3) * 40;
                          const angle = Math.random() * Math.PI * 2;
                          dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * (8 / r), Math.sin(angle) * r);
                          dummy.lookAt(dummy.position.x + Math.sin(angle), dummy.position.y, dummy.position.z - Math.cos(angle));
                          dummy.updateMatrix();
                          instancedDisk.setMatrixAt(i, dummy.matrix);
                      }
                      scene.add(instancedDisk);

                      const config = [
                          { 
                              title: "Stable Singularity", status: "Topology: Nominal", 
                              morph: 0.1, compress: 1.0, intensity: 1.0, rotate: 0.4, camY: 25, camDist: 85, orbit: 1.0,
                              color: "#00f3ff", vel: "0.45c"
                          },
                          { 
                              title: "Accretion Turbulence", status: "Topology: Fluctuating", 
                              morph: 4.5, compress: 1.15, intensity: 1.4, rotate: 1.5, camY: 45, camDist: 95, orbit: 1.8,
                              color: "#ffaa00", vel: "0.78c"
                          },
                          { 
                              title: "Relativistic Collapse", status: "Topology: Critical", 
                              morph: 0.8, compress: 0.38, intensity: 3.5, rotate: 5.0, camY: 12, camDist: 55, orbit: 4.5,
                              color: "#ff0044", vel: "0.99c"
                          }
                      ];

                      let stateIdx = 0;
                      const mainTitle = document.getElementById('main-title');
                      const statusText = document.getElementById('status-text');
                      const velVal = document.getElementById('vel-val');
                      const camControl = { distance: 85 };

                      function transition() {
                          stateIdx = (stateIdx + 1) % config.length;
                          const s = config[stateIdx];
                          const tl = gsap.timeline({ defaults: { duration: 4.0, ease: "power2.inOut" } });
                          tl.to(diskMaterial.uniforms.uMorph, { value: s.morph }, 0);
                          tl.to(diskMaterial.uniforms.uCompression, { value: s.compress }, 0);
                          tl.to(diskMaterial.uniforms.uIntensity, { value: s.intensity }, 0);
                          tl.to(diskMaterial.uniforms.uOrbitScale, { value: s.orbit }, 0);
                          tl.to(auraMat.uniforms.uIntensity, { value: s.intensity }, 0);
                          tl.to(controls, { autoRotateSpeed: s.rotate }, 0);
                          tl.to(camera.position, { y: s.camY }, 0);
                          tl.to(camControl, { distance: s.camDist }, 0);
                          gsap.to([mainTitle, statusText, '.val'], { opacity: 0, duration: 0.8, onComplete: () => {
                              mainTitle.innerText = s.title;
                              statusText.innerText = s.status;
                              statusText.style.color = s.color;
                              statusText.style.borderColor = s.color;
                              velVal.innerText = s.vel;
                              velVal.style.color = s.color;
                              gsap.to([mainTitle, statusText, '.val'], { opacity: 1, duration: 1.2 });
                          }});
                      }

                      setInterval(transition, 10000);

                      const clock = new THREE.Clock();
                      function animate() {
                          const time = clock.getElapsedTime();
                          diskMaterial.uniforms.uTime.value = time;
                          auraMat.uniforms.uTime.value = time;
                          instancedDisk.rotation.y += 0.0005;
                          const currentDir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
                          camera.position.x = controls.target.x + currentDir.x * camControl.distance;
                          camera.position.z = controls.target.z + currentDir.z * camControl.distance;
                          controls.update();
                          renderer.render(scene, camera);
                          requestAnimationFrame(animate);
                      }

                      window.addEventListener('resize', () => {
                          camera.aspect = window.innerWidth / window.innerHeight;
                          camera.updateProjectionMatrix();
                          renderer.setSize(window.innerWidth, window.innerHeight);
                      });

                      animate();
                  </script>
                </body>
                </html>
              `}
              className="w-full h-full border-0 rounded-2xl"
              title="Stable Singularity"
            />
          </GlassCard>
      </motion.div>

      <InteractiveWidgets />

      <TechStackShowcase />

      <section id="playlist" className="space-y-6 scroll-mt-28">
        <div className="text-center space-y-3">
          <span className="section-kicker font-mono uppercase tracking-widest text-xs">Aryan's Jukebox</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">Aryan's Favorite <span className="text-gradient">Playlist 🎵</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-mono leading-relaxed">
            Enjoy my all-time favorite handpicked tracks (Michael Jackson - Billie Jean &amp; Beat It, Ariana Grande, &amp; Young, Black &amp; Rich) while exploring my portfolio!
          </p>
        </div>
        <MusicPlaylistWidget />
      </section>

      <section id="about" className="space-y-8 max-w-4xl mx-auto scroll-mt-28">
        <div className="text-center space-y-4">
          <span className="section-kicker">About Me</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">Software That <span className="text-gradient">Ships</span></h2>
          <p className="text-slate-300 font-mono text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            I work across frontend, backend, Firebase, AI/ML, IoT, and automation. I can help with free learning
            projects, paid freelance builds, BTech/MTech final year projects, demos, documentation, and deployment.
          </p>
        </div>

        <div className="space-y-6 overflow-hidden relative w-full max-w-full pt-4">
          <style>{`
            @keyframes scrollLeft {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scrollLeft 25s linear infinite;
              width: max-content;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          {skillCategories.map((category, idx) => (
            <div key={category.title} className="w-full">
              <h4 className="text-secondary font-orbitron text-xs sm:text-sm mb-3 uppercase tracking-wider pl-2 border-l-2 border-primary/30 ml-2">{category.title}</h4>
              {/* Marquee Container */}
              <div className="flex gap-3 animate-scroll py-2 pl-2" style={{ animationDirection: idx % 2 !== 0 ? 'reverse' : 'normal' }}>
                {[...category.skills, ...category.skills, ...category.skills, ...category.skills].map((skill, i) => (
                  <div key={`${skill}-${i}`} className="glass px-4 py-2 shrink-0 rounded-lg border-white/5 hover:border-primary/40 hover:text-primary transition-colors cursor-default">
                    <span className="font-bold text-light text-xs whitespace-nowrap tracking-wide">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standalone Centered Gaming Arcade Section ── */}
      <section id="arcade" className="space-y-8 max-w-6xl mx-auto text-center scroll-mt-28">
        <div className="text-center space-y-3">
          <span className="section-kicker">Retro Arcade</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light flex items-center justify-center gap-3">
            <Bot className="text-primary" /> Gaming <span className="text-gradient">Highlights</span>
          </h2>
          <p className="text-slate-300 font-mono text-sm max-w-lg mx-auto">
            Five interactive 2D games with live global leaderboards built for mobile and desktop play.
          </p>
        </div>

        <GlassCard className="p-4 sm:p-8 max-w-6xl mx-auto border border-white/10 flex flex-col items-center justify-center" disableTilt>
          <MiniGames />
        </GlassCard>
      </section>

      <section id="projects" className="space-y-10 scroll-mt-28">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono mb-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Proprietary IP Protected &bull; Source Code Safeguarded Against Theft</span>
          </div>
          <span className="section-kicker font-mono uppercase tracking-widest text-xs">Flagship Portfolio &amp; Major Systems</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">
            Engineered <span className="text-gradient">Innovations</span>
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto font-mono text-sm sm:text-base leading-relaxed">
            Showcasing physics-aware cyber-physical digital twins, computer vision suites, generative AI assistants, and enterprise production software.
          </p>
        </div>

        {/* Project Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {projectCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedProjectCategory(cat);
                setVisibleProjectCount(6);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                selectedProjectCategory === cat
                  ? 'bg-primary text-black font-bold shadow-[0_0_20px_rgba(255,115,0,0.4)]'
                  : 'glass text-slate-300 hover:text-white hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-center">
          <span className="text-xs font-mono text-slate-400">
            Showing top <span className="text-primary font-bold">{displayedProjects.length}</span> of{' '}
            <span className="text-light font-bold">{filteredProjects.length}</span> Flagship Innovations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project, index) => (
            <GlassCard key={project.id} className="group flex flex-col h-full overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,115,0,0.15)] transition-all duration-300">
              <div className="h-48 sm:h-52 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex items-center justify-center border-b border-white/10">
                {project.videoUrl ? (
                  <video src={project.videoUrl} className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                ) : project.imageUrl ? (
                  <img src={project.imageUrl} className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" alt={project.title} loading="lazy" />
                ) : (
                  <ProjectIcon index={index} />
                )}
                {project.badge && (
                  <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-primary/40 text-primary text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5">
                    <Sparkles size={12} className="text-secondary" />
                    <span>{project.badge}</span>
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">{project.category}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSpecProject(project)}
                      className="px-2.5 py-1 rounded-full liquid-glass-capsule text-[11px] font-sans font-semibold text-primary hover:text-white transition-all flex items-center gap-1 shrink-0"
                      title="Open Deep Architecture & Telemetry Specs"
                    >
                      <Layers size={12} />
                      <span>Deep Specs</span>
                    </button>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl text-primary font-bold group-hover:text-white transition-colors line-clamp-2 mb-2">
                    {project.title}
                  </h3>

                  {project.highlights && (
                    <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-1.5 truncate">
                      <span className="truncate">⚡ {project.highlights}</span>
                    </div>
                  )}

                  {/* Clean 2-line summary preventing giant text walls on homepage */}
                  <p className="text-slate-300 text-xs sm:text-sm mb-4 font-sans leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-mono border border-primary/20">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center pt-3 border-t border-white/5">
                    {project.demoUrl && (!project.demoUrl.includes('github.com') || project.demoUrl.includes('.github.io')) && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-light hover:text-primary inline-flex items-center gap-1 transition-colors">
                        Demo <ExternalLink size={13} />
                      </a>
                    )}
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.12)] cursor-default select-none" title="Source code is protected by proprietary IP security against unauthorized duplication">
                      <ShieldCheck size={13} className="text-emerald-400" /> Source Protected
                    </span>
                    <a href={`/buy-projects?select=${encodeURIComponent(project.id)}`} className="text-xs sm:text-sm font-bold text-accent hover:text-white inline-flex items-center gap-1 transition-colors">
                      Buy Project <ShoppingBag size={13} />
                    </a>
                    <ProjectViewsBadge />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Liquid Glass Deep Architecture & Specs Modal */}
        <AnimatePresence>
          {selectedSpecProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl liquid-glass-header border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">
                      {selectedSpecProject.category} &bull; Architecture Dossier
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
                      {selectedSpecProject.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecProject(null)}
                    className="p-2 rounded-full liquid-glass-capsule text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Key Metrics / Highlights Pill */}
                {selectedSpecProject.highlights && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <Activity size={18} className="text-emerald-400 shrink-0" />
                    <span>{selectedSpecProject.highlights}</span>
                  </div>
                )}

                {/* Full Architecture Description */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-primary font-mono font-bold">
                    System Architecture &amp; Methodology
                  </h4>
                  <p className="text-slate-200 text-sm sm:text-base font-sans leading-relaxed">
                    {selectedSpecProject.description}
                  </p>
                </div>

                {/* Impact & Use Case */}
                {selectedSpecProject.useCase && (
                  <div className="space-y-2 p-4 rounded-2xl liquid-glass-capsule border-white/10">
                    <h4 className="text-xs uppercase tracking-widest text-secondary font-mono font-bold">
                      Operational Impact &amp; Domain Application
                    </h4>
                    <p className="text-slate-300 text-sm font-sans italic">
                      {selectedSpecProject.useCase}
                    </p>
                  </div>
                )}

                {/* Full Tech Stack */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono font-bold">
                    Technologies &amp; Libraries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecProject.technologies.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs border border-white/15">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {selectedSpecProject.demoUrl && (!selectedSpecProject.demoUrl.includes('github.com') || selectedSpecProject.demoUrl.includes('.github.io')) && (
                      <a
                        href={selectedSpecProject.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold font-sans text-sm hover:brightness-110 transition-all inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,115,0,0.4)]"
                      >
                        Live Demo <ExternalLink size={15} />
                      </a>
                    )}
                    <a
                      href={`/buy-projects?select=${encodeURIComponent(selectedSpecProject.id)}`}
                      className="px-5 py-2.5 rounded-xl liquid-glass-capsule text-white font-bold font-sans text-sm hover:border-primary/50 transition-all inline-flex items-center gap-1.5"
                    >
                      Buy Verified Source <ShoppingBag size={15} />
                    </a>
                  </div>

                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                    <ShieldCheck size={14} /> Proprietary Code Protected
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Project Controls: Show More / Show Less & View All Showcase */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
          {filteredProjects.length > visibleProjectCount && (
            <button
              onClick={() => setVisibleProjectCount((prev) => Math.min(prev + 6, filteredProjects.length))}
              className="glass px-6 py-3 rounded-xl text-light hover:text-white hover:border-primary/40 transition-all inline-flex items-center gap-2 font-mono text-sm shadow-[0_0_15px_rgba(255,115,0,0.15)]"
            >
              <ChevronDown size={16} className="text-primary" />
              Show More Projects (+{filteredProjects.length - visibleProjectCount} remaining)
            </button>
          )}

          {visibleProjectCount > 6 && (
            <button
              onClick={() => setVisibleProjectCount(6)}
              className="glass px-6 py-3 rounded-xl text-slate-300 hover:text-white hover:border-white/30 transition-all inline-flex items-center gap-2 font-mono text-sm"
            >
              <ChevronUp size={16} className="text-secondary" />
              Show Less (Top 6)
            </button>
          )}

          <a href="/all-work" className="glass px-8 py-3.5 rounded-xl text-primary font-bold hover:bg-white/10 hover:border-primary/40 transition-all inline-flex items-center gap-2 font-orbitron tracking-wider text-sm shadow-[0_0_20px_rgba(255,115,0,0.2)]">
            Explore All {projects.length}+ Projects in Showcase <ExternalLink size={16} />
          </a>
        </div>
      </section>

      <section id="certificates" className="space-y-10 scroll-mt-28">
        <div className="text-center space-y-4">
          <span className="section-kicker font-mono uppercase tracking-widest text-xs inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> Verified Credentials ({allCertificates.length}+ Total)
          </span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">
            Industry <span className="text-gradient">Certifications</span>
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto font-mono text-sm sm:text-base leading-relaxed">
            Verified credentials from Oracle, Google, LearnQuest, Meta, AWS, and leading industry institutions.
          </p>
        </div>
        {visibleCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCertificates.map((certificate) => (
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
                <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-sm border-b border-white/10">
                  {certificate.imageUrl ? (
                    certificate.imageUrl.toLowerCase().endsWith('.pdf') ? (
                      <div className="flex h-52 flex-col items-center justify-center bg-white/[0.01] px-6 text-center gap-2">
                        <FileText className="h-10 w-10 text-primary animate-pulse" />
                        <span className="font-orbitron text-sm text-slate-300">PDF Credential</span>
                      </div>
                    ) : (
                      <img src={certificate.imageUrl} alt={certificate.title} className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-white/[0.01] px-6 text-center">
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
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">{certificate.issuer}</span>
                    <h3 className="font-orbitron text-lg sm:text-xl text-primary mt-1 font-bold group-hover:text-white transition-colors">{certificate.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">{certificate.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-mono">
                      {certificate.date}
                    </p>
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
          <GlassCard className="p-8 text-center text-slate-300">Certificates will appear here.</GlassCard>
        )}
        <div className="flex justify-center pt-6">
          <a href="/certifications" className="glass px-8 py-3.5 rounded-xl text-primary font-bold hover:bg-white/10 hover:border-primary/40 transition-all inline-flex items-center gap-2 font-orbitron tracking-wider text-sm shadow-[0_0_20px_rgba(255,115,0,0.15)]">
            Explore All {allCertificates.length}+ Certifications <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* ── Flex / Creators & Community Realm ────────────────────────────── */}
      <section id="creators-hub" className="space-y-10 scroll-mt-28">
        <div className="text-center space-y-3">
          <span className="section-kicker font-mono uppercase tracking-widest text-xs">Social Impact &amp; Community</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">
            Creators <span className="text-gradient">&amp; Gaming Realm</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto font-mono text-sm">
            Empowering 13,000+ developers on Instagram with technical tutorials &amp; streaming live gameplay on YouTube.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Instagram Liquid Jelly Card */}
          <motion.div
            whileHover={{ scale: 1.025, y: -6 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="liquid-jelly-card p-6 sm:p-8 flex flex-col justify-between group border-pink-500/30 hover:border-pink-500/70"
          >
            {/* Ambient moving caustic back-glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-pink-500/30 via-purple-600/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="/codesworld_logo_new.png"
                    alt="codesworld.exe logo"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/80 shadow-[0_0_24px_rgba(225,48,108,0.5)] group-hover:rotate-3 transition-transform duration-300"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-black"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-orbitron text-xl font-bold text-light">@codesworld.exe</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-400 border border-pink-500/40">VERIFIED</span>
                  </div>
                  <p className="text-xs font-mono text-pink-400 font-semibold tracking-wide">13K+ Dev Community · 5M+ Views</p>
                </div>
              </div>

              <p className="text-slate-300 font-mono text-xs leading-relaxed">
                Dedicated technical engineering channel sharing modern web development architectures, interactive UI breakdowns, full-stack tips, and daily developer hacks.
              </p>

              <div className="grid grid-cols-3 gap-2.5 text-center font-mono py-3 px-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="space-y-0.5">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-primary">13.2K+</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Developers</p>
                </div>
                <div className="space-y-0.5 border-x border-white/10">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-pink-400">5M+</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Impressions</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-400">120+</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Tutorials</p>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <a
                href="https://www.instagram.com/codesworld.exe?igsh=MnFqbThoOWdkbWE2"
                target="_blank"
                rel="noreferrer"
                className="w-full relative overflow-hidden group/btn py-3.5 px-4 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600 hover:to-purple-600 text-white border border-pink-500/50 shadow-[0_8px_25px_rgba(225,48,108,0.3)] hover:shadow-[0_12px_35px_rgba(225,48,108,0.5)]"
              >
                <Instagram size={17} className="text-pink-300 group-hover/btn:text-white transition-colors" />
                <span>Explore Instagram (@codesworld.exe)</span>
              </a>
            </div>
          </motion.div>

          {/* YouTube Gaming Liquid Jelly Card */}
          <motion.div
            whileHover={{ scale: 1.025, y: -6 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="liquid-jelly-card p-6 sm:p-8 flex flex-col justify-between group border-red-500/30 hover:border-red-500/70"
          >
            {/* Ambient moving caustic back-glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-red-600/30 via-orange-600/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-black font-orbitron text-xl shadow-[0_0_24px_rgba(255,0,0,0.5)] border-2 border-red-500/80 overflow-hidden group-hover:-rotate-3 transition-transform duration-300">
                    <img src="/youtube_logo.png" alt="Aryan Invincible TV" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-black"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-orbitron text-xl font-bold text-light">Aryan Invincible TV</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">LIVE CASTER</span>
                  </div>
                  <p className="text-xs font-mono text-red-400 font-semibold tracking-wide">@aryaninvincible78 · Valorant Arena</p>
                </div>
              </div>

              <p className="text-slate-300 font-mono text-xs leading-relaxed">
                Official gaming &amp; interactive live broadcasts! Streaming high-octane Valorant competitive matches, custom lobbies, superhero lore, and community game nights.
              </p>

              <div className="grid grid-cols-3 gap-2.5 text-center font-mono py-3 px-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="space-y-0.5">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-red-400">VALORANT</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Ranked Matches</p>
                </div>
                <div className="space-y-0.5 border-x border-white/10">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-primary">WEEKENDS</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Live Streams</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-orbitron font-extrabold text-base sm:text-lg text-amber-400">1080p 60</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Crystal Feed</p>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <a
                href="https://youtube/@aryaninvincible78?si=B66qwBq-TyVFlo-M"
                target="_blank"
                rel="noreferrer"
                className="w-full relative overflow-hidden group/btn py-3.5 px-4 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-red-600/30 to-orange-600/30 hover:from-red-600 hover:to-orange-600 text-white border border-red-500/50 shadow-[0_8px_25px_rgba(255,0,0,0.3)] hover:shadow-[0_12px_35px_rgba(255,0,0,0.5)]"
              >
                <Youtube size={17} className="text-red-300 group-hover/btn:text-white transition-colors" />
                <span>Watch YouTube Live (@aryaninvincible78)</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Interactive Code Curtain ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="space-y-6"
      >
        <div className="text-center space-y-3">
          <span className="section-kicker">Interactive</span>
          <h2 className="text-3xl md:text-4xl font-orbitron font-black text-light">
            Neural <span className="text-gradient">Matrix Fabric</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm max-w-lg mx-auto">
            Hover or drag the curtain — the source code itself hangs like fabric in the breeze.
          </p>
        </div>

        <GlassCard className="overflow-hidden p-0 border border-white/10 rounded-2xl relative" disableTilt>
          {/* Overlay label */}
          <div className="absolute top-3 right-3 z-10 glass border-white/10 px-3 py-1 rounded-full font-mono text-[10px] text-slate-400 pointer-events-none select-none">
            🖱 hover · drag to stretch
          </div>

          <iframe
            src="/curtain.html"
            title="Code Curtain"
            className="w-full border-0"
            style={{ height: '380px' }}
            sandbox="allow-scripts"
            loading="lazy"
          />
        </GlassCard>
      </motion.section>

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

      <AnimatePresence>
        {showScrollPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-[100] max-w-[calc(100vw-2rem)] sm:max-w-sm glass-elevated border border-primary/40 rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_35px_rgba(255,115,0,0.25)] flex gap-3 items-center pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-[#ff7300]/25 flex items-center justify-center text-primary animate-bounce">
              ✨
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-light font-orbitron">Discover Creativity</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed">
                Scroll to the bottom to see a beautiful creativity by Aryan!
              </p>
            </div>
            <button 
              onClick={() => setShowScrollPopup(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
