import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ShieldCheck,
  Trophy,
  Utensils,
  Youtube,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { InteractiveWidgets } from '../components/InteractiveWidgets';
import { MiniGames } from '../components/MiniGames';
import { MusicPlaylistWidget } from '../components/MusicPlaylist';
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

const fallbackProjects: PortfolioProject[] = [
  {
    id: 'fitness-rewired',
    title: 'Fitness Rewired',
    description: 'A premium human performance ecosystem designed to transform how people move, think, and live.',
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
    category: 'Web',
    demoUrl: 'https://fitness-rewired.vercel.app/',
    imageUrl: '/fitness_demo.png',
    featured: true,
  },
  {
    id: 'e-challan-detector',
    title: 'E-Challan Scam Detector',
    description: 'Professional screening workflow for SMS, URL, and PDF challan evidence with explainable risk scoring.',
    technologies: ['AI/ML', 'Python', 'React', 'Tailwind'],
    category: 'Security',
    demoUrl: 'https://challanchecker.vercel.app/',
    imageUrl: '/echallan_demo.png',
    featured: true,
  },
  {
    id: 'synapse-ai',
    title: 'Synapse AI',
    description: 'Advanced AI voice and screen assistant designed to help with queries, screen-sharing, and real-time interactive tasks.',
    technologies: ['React', 'Vite', 'Gemini API', 'AI'],
    category: 'AI',
    demoUrl: 'https://aaryan-synapse-ai.vercel.app/',
    imageUrl: '/synapse_demo.png',
    featured: true,
  },
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

  const [isMobile, setIsMobile] = useState(false);
  const [showScrollPopup, setShowScrollPopup] = useState(false);

  useEffect(() => {
    const unsubProjects = subscribeToProjects(setAdminProjects);
    const unsubCertificates = subscribeToCertificates(setCertificates);

    fetchGitHubProjects()
      .then(setGithubProjects)
      .catch(() => setGithubProjects([]));

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const timerShow = setTimeout(() => {
      setShowScrollPopup(true);
    }, 4000);

    const timerHide = setTimeout(() => {
      setShowScrollPopup(false);
    }, 12000);

    return () => {
      unsubProjects();
      unsubCertificates();
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timerShow);
      clearTimeout(timerHide);
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
  
  const allCertificates = certificates.length > 0 ? certificates : linkedInCertificates;
  const bestCertIds = [
    'coursera-google-ai', 
    'linkedin-krishi-verse-web-dev', 
    'python-by-meta', 
    'google-analytics', 
    'mastercard-cybersecurity', 
    'linkedin-accenture-data-analytics'
  ];
  const visibleCertificates = allCertificates.filter(cert => bestCertIds.includes(cert.id)).slice(0, 6);

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
            <a href="/contact" className="glass px-6 py-3 rounded-lg text-accent font-bold hover:bg-white/10">
              Contact / Ask Repo
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative rounded-[2rem] border border-primary/30 bg-black p-3 shadow-[0_0_60px_rgba(255,115,0,0.25)]">
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {isMobile ? (
          <GlassCard className="w-full h-[320px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(255,115,0,0.15)] relative flex flex-col items-center justify-center bg-[#010103] p-6 text-center" disableTilt>
            <div className="w-36 h-36 rounded-full bg-black relative shadow-[0_0_60px_20px_rgba(255,115,0,0.65),0_0_100px_40px_rgba(255,45,0,0.45)] border border-orange-500/20 flex items-center justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-black shadow-inner" />
            </div>
            <h3 className="font-orbitron text-xl text-light mb-2">Stable Singularity</h3>
            <p className="text-xs text-slate-400 font-mono max-w-xs leading-relaxed">
              Relativistic 3D simulation optimized for desktop view.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="w-full h-[550px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(255,115,0,0.15)] relative" disableTilt>
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
                        background-color: #010103;
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

                      const controls = new OrbitControls(camera, renderer.domElement);
                      controls.enableDamping = true;
                      controls.dampingFactor = 0.03;
                      controls.autoRotate = true;
                      controls.autoRotateSpeed = 0.4;

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
                              " rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 4.0);",
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
        )}
      </motion.div>

      <InteractiveWidgets />

      <section id="playlist" className="space-y-6">
        <div className="text-center space-y-3">
          <span className="section-kicker">Audio Experience</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Cyber Lofi Lounge</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-mono">
            Listen to curated lo-fi beats &amp; ambient tracks while exploring the portfolio.
          </p>
        </div>
        <MusicPlaylistWidget />
      </section>

      <section id="about" className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <span className="section-kicker">About</span>
          <h2 className="text-3xl md:text-5xl font-orbitron">Software that ships</h2>
          <p className="text-slate-300 font-mono text-lg leading-relaxed">
            I work across frontend, backend, Firebase, AI/ML, IoT, and automation. I can help with free learning
            projects, paid freelance builds, BTech/MTech final year projects, demos, documentation, and deployment.
          </p>
          <div className="space-y-6 overflow-hidden relative w-full max-w-full">
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
                <h4 className="text-secondary font-orbitron text-sm mb-3 uppercase tracking-wider pl-2 border-l-2 border-primary/30 ml-2">{category.title}</h4>
                {/* Marquee Container */}
                <div className="flex gap-3 animate-scroll py-2 pl-2" style={{ animationDirection: idx % 2 !== 0 ? 'reverse' : 'normal' }}>
                  {/* Duplicate the items multiple times for seamless scrolling */}
                  {[...category.skills, ...category.skills, ...category.skills, ...category.skills].map((skill, i) => (
                    <div key={`${skill}-${i}`} className="glass px-4 py-2 shrink-0 rounded-lg border-white/5 hover:border-primary/40 hover:text-primary transition-colors cursor-default">
                      <span className="font-bold text-light text-xs whitespace-nowrap tracking-wide">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
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
          <span className="section-kicker font-mono uppercase tracking-widest text-xs">Flagship Portfolio</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">Engineered Innovations &amp; Flagship Builds</h2>
          <p className="text-slate-300 max-w-3xl mx-auto font-mono text-sm">
            Showcasing full-stack web platforms, AI/ML models, IoT dashboards, and production software.
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
                  <a href="/contact" className="text-sm font-bold text-accent hover:text-white inline-flex items-center gap-1">
                    Ask For Repo <ShieldCheck size={14} />
                  </a>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <a href="/all-work" className="glass px-8 py-3.5 rounded-xl text-primary font-bold hover:bg-white/10 hover:border-primary/40 transition-all inline-flex items-center gap-2 font-orbitron tracking-wider text-sm shadow-[0_0_20px_rgba(255,115,0,0.15)]">
            View All Projects ({projects.length}) <ExternalLink size={16} />
          </a>
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
        <div className="flex justify-center pt-8">
          <a href="/certifications" className="glass px-8 py-3 rounded-lg text-primary font-bold hover:bg-white/10 transition-colors inline-flex items-center gap-2">
            View All Certifications <ExternalLink size={18} />
          </a>
        </div>
      </section>

      {/* ── Flex / Creators & Community Realm ────────────────────────────── */}
      <section id="creators-hub" className="space-y-10">
        <div className="text-center space-y-3">
          <span className="section-kicker font-mono uppercase tracking-widest text-xs">Social Impact &amp; Community</span>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-light">
            Creators <span className="text-gradient">&amp; Gaming Realm</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto font-mono text-sm">
            Empowering 13,000+ developers on Instagram with technical tutorials &amp; streaming live gameplay on YouTube.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Instagram Card */}
          <GlassCard className="p-8 relative overflow-hidden group flex flex-col justify-between border-E1306C/30 hover:border-[#E1306C]/60 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E1306C]/20 to-purple-600/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src="/codesworld_logo_new.png"
                  alt="codesworld.exe logo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E1306C] shadow-[0_0_15px_rgba(225,48,108,0.4)]"
                />
                <div>
                  <h3 className="font-orbitron text-xl font-bold text-light">@codesworld.exe</h3>
                  <p className="text-xs font-mono text-[#E1306C] font-bold">13K+ Followers · Millions of Views</p>
                </div>
              </div>

              <p className="text-slate-300 font-mono text-xs leading-relaxed">
                Dedicated technical teaching channel sharing modern web development tips, full-stack architecture, project walkthroughs, and developer hacks.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center font-mono py-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                <div>
                  <p className="font-orbitron font-bold text-primary">13K+</p>
                  <p className="text-[10px] text-slate-400">Devs</p>
                </div>
                <div>
                  <p className="font-orbitron font-bold text-accent">Millions</p>
                  <p className="text-[10px] text-slate-400">Views</p>
                </div>
                <div>
                  <p className="font-orbitron font-bold text-secondary">100+</p>
                  <p className="text-[10px] text-slate-400">Reels</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://www.instagram.com/codesworld.exe?igsh=MnFqbThoOWdkbWE2"
                target="_blank"
                rel="noreferrer"
                className="w-full glass border-[#E1306C]/40 text-light hover:text-[#E1306C] hover:border-[#E1306C] py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(225,48,108,0.2)]"
              >
                <Instagram size={16} className="text-[#E1306C]" /> Visit Instagram (@codesworld.exe)
              </a>
            </div>
          </GlassCard>

          {/* YouTube Gaming Card */}
          <GlassCard className="p-8 relative overflow-hidden group flex flex-col justify-between border-red-500/30 hover:border-red-500/60 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600/20 to-orange-600/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-black font-orbitron text-xl shadow-[0_0_15px_rgba(255,0,0,0.4)] border-2 border-red-500 overflow-hidden">
                  <img src="/youtube_logo.png" alt="Aryan Invincible TV" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-orbitron text-xl font-bold text-light">Aryan Invincible TV</h3>
                  <p className="text-xs font-mono text-red-400 font-bold">@aryaninvincible78 · Valorant Live</p>
                </div>
              </div>

              <p className="text-slate-300 font-mono text-xs leading-relaxed">
                Official gaming &amp; superhero channel! Streaming live Valorant gameplay every weekend, community matches, and interactive streams.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center font-mono py-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                <div>
                  <p className="font-orbitron font-bold text-red-400">VALORANT</p>
                  <p className="text-[10px] text-slate-400">Live Streams</p>
                </div>
                <div>
                  <p className="font-orbitron font-bold text-primary">Sat + Sun</p>
                  <p className="text-[10px] text-slate-400">Schedule</p>
                </div>
                <div>
                  <p className="font-orbitron font-bold text-accent">Gaming</p>
                  <p className="text-[10px] text-slate-400">Community</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://youtube/@aryaninvincible78?si=B66qwBq-TyVFlo-M"
                target="_blank"
                rel="noreferrer"
                className="w-full glass border-red-500/40 text-light hover:text-red-400 hover:border-red-500 py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)]"
              >
                <Youtube size={16} className="text-red-500" /> Watch YouTube Channel (@aryaninvincible78)
              </a>
            </div>
          </GlassCard>
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

        {isMobile ? (
          <div className="h-[280px] w-full flex flex-col items-center justify-center bg-[#0d0d12]/90 border border-white/5 rounded-2xl text-center px-6">
            <code className="text-primary font-bold text-lg mb-2">{"{ neural_matrix_fabric }"}</code>
            <p className="text-xs text-slate-400 font-mono max-w-xs leading-relaxed">
              Interactive cloth simulation is optimized for desktop view to preserve battery life and performance.
            </p>
          </div>
        ) : (
          <GlassCard className="overflow-hidden p-0 border border-white/10 rounded-2xl relative" disableTilt>
            {/* Overlay label */}
            <div className="absolute top-3 right-3 z-10 glass border-white/10 px-3 py-1 rounded-full font-mono text-[10px] text-slate-400 pointer-events-none select-none">
              🖱 hover · drag to stretch
            </div>

            <iframe
              src="/curtain.html"
              title="Code Curtain"
              className="w-full border-0"
              style={{ height: '420px' }}
              sandbox="allow-scripts"
              loading="lazy"
            />
          </GlassCard>
        )}
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
            className="fixed bottom-6 right-6 z-[100] max-w-sm glass border border-[#ff7300]/40 rounded-xl p-4 shadow-[0_10px_30px_rgba(255,115,0,0.15)] flex gap-3 items-center pointer-events-auto"
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
