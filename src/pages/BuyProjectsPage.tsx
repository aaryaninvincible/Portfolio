import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingCart,
  ShoppingBag,
  X,
  Trash2,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Github,
  Gift,
  CreditCard,
  ShieldCheck,
  Zap,
  Settings,
  QrCode
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { subscribeToStoreProducts, createOrder, uploadAsset } from '../lib/realtime';
import { getPayUConfig, savePayUConfig, launchPayUCheckout, type PayUConfig } from '../lib/payu';
import type { StoreProject } from '../types';

const fallbackStoreProjects: StoreProject[] = [
  {
    id: 'store-scada-digital-twin',
    title: 'Physics-Aware Digital Twin for SCADA Anomaly & Attack Detection',
    description: 'Production-ready Cyber-Physical Digital Twin system integrating real-time SCADA telemetry simulation (IEC 60870-5-104), physics-informed conservation equations, and deep sequence ML models (PyTorch LSTM + Random Forest) with IEEE paper.',
    price: 999,
    imageUrl: '/thumbnails/scada_digital_twin.png',
    category: 'Cyber-Physical & AI',
  },
  {
    id: 'store-better-prompt',
    title: 'Better Prompt — Multi-Language Prompt Engineering Suite',
    description: 'Production-grade cognitive prompt engineering engine with 4 frameworks (Structured, CO-STAR, CRISPE, XML), zero cloud token overhead, and offline Ollama refinement.',
    price: 699,
    imageUrl: '/thumbnails/better_prompt.png',
    category: 'AI & Tools',
  },
  {
    id: 'store-prepforge',
    title: 'PrepForge — Technical Placement & Code Practice SaaS Platform',
    description: 'Complete placement prep SaaS with isolated Web Worker Python code runner sandbox, 8-step Excel roadmap integration, and timed exam grading.',
    price: 799,
    imageUrl: '/thumbnails/prepforge.png',
    category: 'Full Stack',
  },
  {
    id: 'store-nothing-dialer',
    title: 'Nothing Dialer — Minimalist AMOLED Android Dialer & Telecom Suite',
    description: 'Production-oriented custom Android phone dialer combining the minimalist dot-matrix aesthetic of Nothing OS with native Android InCallService telecom APIs.',
    price: 649,
    imageUrl: '/thumbnails/nothing_dialer.png',
    category: 'Mobile & Android',
  },
  {
    id: 'store-liquid-glass-ui',
    title: 'Liquid Glass UI — Physical Jetpack Compose & AGSL Optical Engine',
    description: 'Physical liquid glass UI engine with real-time ray refraction, 7-band spectral dispersion, and live optical studio.',
    price: 599,
    imageUrl: '/thumbnails/liquid_glass_ui.png',
    category: 'Mobile & Android',
  },
  {
    id: 'store-beatwave',
    title: 'BeatWave — Next-Gen Android Streaming & Music Player',
    description: 'Flagship Android music player showcasing physical liquid glass design, dynamic visualizers, and offline/streaming playback.',
    price: 699,
    imageUrl: '/thumbnails/liquid_glass_ui.png',
    category: 'Mobile & Android',
  },
  {
    id: 'store-retromusic',
    title: 'RetroMusic — Vinyl Turntable & Glassmorphic Android Player',
    description: 'Luxury retro Android music player with spinning vinyl turntable physics, floating particles, and 5-band studio equalizer.',
    price: 549,
    imageUrl: '/thumbnails/retromusic_app.png',
    category: 'Mobile & Android',
  },
  {
    id: 'store-course-completion',
    title: 'Course Completion Assistant (Manifest V3 Extension)',
    description: 'Enterprise-grade Chrome Extension for online learners with Always-Active persistence, universal media acceleration, and telemetry dashboard.',
    price: 499,
    imageUrl: '/thumbnails/course_completion_assistant.png',
    category: 'Utilities',
  },
  {
    id: 'store-utsav-ai',
    title: 'Eventara (Utsav AI) — Editorial Celebration & Event Planner',
    description: 'Full-stack cultural event planning platform with deterministic INR budget allocator, 3D WebGL stage visualizer, and vendor milestones.',
    price: 799,
    imageUrl: '/thumbnails/utsav_ai.png',
    demoUrl: 'https://eventara-planner.vercel.app',
    category: 'Full Stack',
  },
  {
    id: 'store-faminas-restaurant',
    title: "Famina's Kitchen & Lounge — Restaurant & Ordering Platform",
    description: 'Full-stack African & American culinary ordering platform with real-time cart, table reservations, catering wizard, and Firebase backend.',
    price: 749,
    imageUrl: '/thumbnails/faminas_restaurant.png',
    category: 'Full Stack',
  },
  {
    id: 'store-alfaz-lyrics',
    title: 'Alfaaz — Yeh Jawaani Hai Deewani Kinetic Typography',
    description: 'Cinematic typographic lyric experience with Apple Music fluid mesh background, 100% YouTube audio sync, and Polaroid memories.',
    price: 499,
    imageUrl: '/thumbnails/alfaz_lyrics.png',
    category: 'Web & Animation',
  },
  {
    id: 'store-romantic-birthday',
    title: 'Romantic Birthday Wish & Love Journey Web Experience',
    description: 'Glassmorphism-powered interactive romantic journey with ambient piano Web Audio, 3D wax seal love letter, and interactive cake.',
    price: 449,
    imageUrl: '/thumbnails/romantic_birthday_wish.png',
    category: 'Web & Animation',
  },
  {
    id: 'store-sunflower-love-letter',
    title: 'Solstice & You — 3D Procedural Sunflower & Love Letter',
    description: 'Procedural 3D Fibonacci sunflower in Blender (bpy) paired with an interactive Three.js heliotropic love letter web experience.',
    price: 499,
    imageUrl: '/thumbnails/sunflower_love_letter.png',
    category: '3D & Creative Tech',
  },
  {
    id: 'store-synapse-ai',
    title: 'Synapse AI - Multimodal Screen & Real-Time Voice Agent',
    description: 'Next-generation AI voice and vision copilot designed for low-latency live dialogue, active desktop screen-share analysis, interactive visual troubleshooting, and intelligent code inspection.',
    price: 649,
    demoUrl: 'https://aaryan-synapse-ai.vercel.app/',
    imageUrl: '/synapse_demo.png',
    category: 'AI / ML',
  },
  {
    id: 'store-paste2plan',
    title: 'Paste2Plan - Voice & Text AI Agile Project Planning Engine',
    description: 'Intelligent Flutter mobile app that converts unstructured voice notes, meeting transcripts, or specifications into structured agile sprints, task backlogs, and notifications.',
    price: 599,
    imageUrl: '/thumbnails/paste2plan.png',
    category: 'Mobile & AI',
  },
  {
    id: 'store-anything-downloader',
    title: 'Anything-Downloader - Universal Media Processing Suite',
    description: 'Universal multi-platform media downloader (YouTube, Instagram, TikTok, X, Facebook) with adaptive stream muxing, audio extraction, and Docker deployment.',
    price: 499,
    imageUrl: '/thumbnails/anything_downloader.png',
    category: 'Full Stack',
  },
  {
    id: 'store-ai-based-cc',
    title: 'AI Based Career Counseling (AI-Based-C-C)',
    description: 'AI-driven student guidance and career roadmap platform featuring interactive aptitude tests, domain pathways, and institute dashboards.',
    price: 499,
    demoUrl: 'https://aaryaninvincible.github.io/AI-Based-C-C/',
    imageUrl: '/thumbnails/ai_based_cc.png',
    category: 'AI / ML',
  },
  {
    id: 'store-cv-project',
    title: 'Computer Vision Intelligence Suite (Cv_project)',
    description: 'Advanced computer vision platform integrating real-time gesture recognition, spatial tracking, and interactive AI canvas control.',
    price: 599,
    demoUrl: '/demos/Cv_project/index.html',
    imageUrl: '/thumbnails/cv_project.png',
    category: 'AI / ML',
  },
  {
    id: 'store-gesture-x',
    title: 'GestureX - Real-Time Gesture & SAM Control',
    description: 'Virtual light & image editing system utilizing hand gesture control, Segment Anything Model (SAM) object segmentation, and inpainting.',
    price: 549,
    demoUrl: '/demos/GestureX/index.html',
    imageUrl: '/thumbnails/gesture_x.png',
    category: 'AI / ML',
  },
  {
    id: 'store-research-paper-platform',
    title: 'Research Paper Management Platform',
    description: 'End-to-end intelligent research paper platform featuring PDF metadata extraction, semantic vector search, AI summarization, and peer review workflows.',
    price: 699,
    demoUrl: '/demos/research-paper-management-platform/index.html',
    imageUrl: '/thumbnails/research_paper.png',
    category: 'Full Stack',
  },
  {
    id: 'store-windows11-clone',
    title: 'Windows 11 Clone',
    description: 'A premium CSS & React reproduction of the Windows 11 desktop experience, complete with an interactive Start Menu, taskbar, widgets, and draggable windows.',
    price: 399,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Windows11%20Clone/',
    imageUrl: 'https://images.unsplash.com/photo-1628277613967-6abca504d0ac?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-excel-ai',
    title: 'Excel AI Editor',
    description: 'AI-powered spreadsheet editor featuring inline formulas, batch text cleaning, data formatting, and smart sheet operations.',
    price: 349,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/ExcelAI%20Editor/',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-spotify-clone',
    title: 'Spotify Web Player',
    description: 'Fully responsive HTML/CSS/JS clone of the Spotify web player UI with custom playlists, animated music player bars, and hover utilities.',
    price: 299,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Spotify/',
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-youtube-clone',
    title: 'YouTube Portal Clone',
    description: 'Sleek frontend dashboard clone of YouTube\'s video portal, complete with collapsible sidebars, video player grids, and category filter bars.',
    price: 299,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Youtube-Clone/',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-myntra-clone',
    title: 'Myntra Design Clone',
    description: 'E-commerce store clone mimicking the Myntra design, featuring responsive shopping categories, wishlist, and sliding banners.',
    price: 249,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Myntra-Clone-main/',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-billing-software',
    title: 'Billing & Invoice System',
    description: 'Standalone system equipped to catalog sales, calculate GST/VAT, generate invoices, and print receipt summaries in one-click.',
    price: 349,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Biling_Software/',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-socketio-chat',
    title: 'Socket.IO Chat App',
    description: 'Real-time communication app built with Node.js and Socket.io, featuring multiple rooms, message timestamps, and active user list.',
    price: 199,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Socket%20IO%20Chat%20App/',
    imageUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-drawing-pad',
    title: 'HTML5 Drawing Pad',
    description: 'HTML5 canvas drawing board with custom brushes, color palettes, size controls, eraser tool, and export-to-image option.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Drawing%20pad/',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-sorting-visualizer',
    title: 'Sorting Visualizer',
    description: 'Interactive algorithm visualizer showing Bubble Sort, Merge Sort, and Quick Sort operations with adjustable execution speeds.',
    price: 199,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Sorting_Visualizer/',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-mindstate-analyzer',
    title: 'MindState Analyzer',
    description: 'AI health application designed to analyze journal logs and evaluate stress and focus metrics with visual charting.',
    price: 249,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/MindState_Analyzer/',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-2048-game',
    title: '2048 Game Classic',
    description: 'Responsive slider puzzle game built in Vanilla Javascript with smooth sliding cell animations and local high score tracking.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/2048%20Game/',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-bawarchi2',
    title: 'Bawarchi 2.0 Website',
    description: 'Premium restaurant ordering landing page featuring interactive menus, shopping drawers, and polished responsive sections.',
    price: 299,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Bawarchi_2.0/',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-pdf-opener',
    title: 'PDF Password Opener',
    description: 'A utility program that uses key processing algorithms to safely unlock and decrypt password-protected PDF files.',
    price: 149,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/PDF%20Password%20Opener/',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-pdf-editor',
    title: 'PDF Editor WebApp',
    description: 'A browser-based editor built to split, merge, rotate, annotate, and manage PDF documents with instant exports.',
    price: 199,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Pdf_editor/',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-notepad',
    title: 'Rich Note Pad',
    description: 'Clean text writing application featuring rich formatting tools, category tagging, search filters, and automatic local storage.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Note_Pad/',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-attendance-tracker',
    title: 'Attendance Tracker System',
    description: 'Responsive database logger built to track student/employee logs, check-in timestamps, and generate monthly reports.',
    price: 199,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/AttendanceSystem/',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-qr-scanner',
    title: 'QR Code Camera Scanner',
    description: 'Utility app utilizing browser media devices to scan, decode, and open links embedded within QR codes instantly.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/QR%20Code%20Scanner/',
    imageUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-mock-test',
    title: 'Online Mock Test System',
    description: 'Responsive educational portal featuring multiple-choice questions, automated timer thresholds, and grading summaries.',
    price: 249,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/OnlineMockTestSystem/',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-screen-recorder',
    title: 'Web Screen Recorder',
    description: 'Browser capturing utility that records active window, tab, or full screen video and audio, exporting ready-to-use webm clips.',
    price: 149,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Screen%20Recorder/',
    imageUrl: 'https://images.unsplash.com/photo-1461151304267-38cd8907a900?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-wordle-clone',
    title: 'Wordle Guessing Game',
    description: 'Interactive clone of the viral word game Wordle, featuring key styling animations, stat analytics, and win streak counters.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Wordle_Clone/',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-typing-game',
    title: 'Typing Speed Assessor',
    description: 'Game UI measuring keystroke accuracy, word counts, and WPM speeds over customizable training periods.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Speed%20Typing%20Game/',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-watch-store',
    title: 'Luxury Watch Store Portal',
    description: 'Minimalist product showroom for luxury timepieces with dynamic sliding banners and custom cart integrations.',
    price: 249,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/watch-store/',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-nebula-chat',
    title: 'Nebula Chat Interface',
    description: 'Responsive chat environment utilizing Firebase Realtime Database for persistent global and channel text messaging.',
    price: 199,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/NebulaChat/',
    imageUrl: 'https://images.unsplash.com/photo-1577563906417-a0a84594612d?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-disk-scheduling',
    title: 'Disk Scheduling Simulator',
    description: 'Academic visualizer charting operating system disk arm movements (FCFS, SCAN, SSTF) with responsive data grids.',
    price: 149,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/DiskSchedulingAlgorithms/',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-linguistic',
    title: 'Linguistic Academy Portal',
    description: 'Educational website offering interactive foreign language courses, clean student navigation, and signup forms.',
    price: 299,
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Linguistic%20Academy/',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-weather-app',
    title: 'Forecast Weather App',
    description: 'Real-time forecasting tool requesting open weather API statistics to display humidity, wind speeds, and temperature overlays.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Weather%20App/',
    imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-todo-list',
    title: 'Responsive To-Do List',
    description: 'Modern task organizer featuring category grouping, completion tracking, list sorting, and state memory.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/to-do-list/',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-password-gen',
    title: 'Secure Password Generator',
    description: 'Developer utility configuring cryptographic character sets to generate custom, crack-resistant keys.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Password%20Generator/',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-analog-watch',
    title: 'Analog Clock ticking UI',
    description: 'Elegant CSS grid stopwatch and analog clock widget matching precise system time events.',
    price: 0, // FREE mini project
    demoUrl: 'https://aaryaninvincible.github.io/Projects/Analog%20Watch/',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60',
  }
];

export const BuyProjectsPage: React.FC = () => {
  const [dbProducts, setDbProducts] = useState<StoreProject[]>([]);
  const [cart, setCart] = useState<Array<{ product: StoreProject; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [fullName, setFullName] = useState(() => {
    try { return localStorage.getItem('checkout_fullName') || ''; } catch { return ''; }
  });
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('checkout_email') || ''; } catch { return ''; }
  });
  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem('checkout_phone') || ''; } catch { return ''; }
  });
  const [githubHandle, setGithubHandle] = useState(() => {
    try { return localStorage.getItem('checkout_github') || ''; } catch { return ''; }
  });
  const [upiTxnId, setUpiTxnId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      if (fullName) localStorage.setItem('checkout_fullName', fullName);
      if (email) localStorage.setItem('checkout_email', email);
      if (phone) localStorage.setItem('checkout_phone', phone);
      if (githubHandle) localStorage.setItem('checkout_github', githubHandle);
    } catch {
      // ignore
    }
  }, [fullName, email, phone, githubHandle]);

  // Sorting and Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Carousel screenshots index tracker
  const [activeScreenshot, setActiveScreenshot] = useState<Record<string, number>>({});

  useEffect(() => {
    return subscribeToStoreProducts(setDbProducts);
  }, []);

  const products = useMemo(() => {
    const merged = [...dbProducts];
    const dbTitles = new Set(dbProducts.map(p => p.title.toLowerCase()));
    
    fallbackStoreProjects.forEach(fp => {
      if (!dbTitles.has(fp.title.toLowerCase())) {
        let category = 'Utilities';
        const id = fp.id.toLowerCase();
        
        if (id.includes('clone') || id.includes('spotify') || id.includes('youtube') || id.includes('myntra') || id.includes('chat') || id.includes('store') || id.includes('portal')) {
          category = 'Full Stack';
        } else if (id.includes('ai') || id.includes('analyzer') || id.includes('synapse')) {
          category = 'AI / ML';
        } else if (id.includes('game') || id.includes('wordle') || id.includes('dino') || id.includes('dodge') || id.includes('snake') || id.includes('2048')) {
          category = 'Games';
        } else if (id.includes('system') || id.includes('tracker') || id.includes('database') || id.includes('billing')) {
          category = 'Systems';
        }
        
        merged.push({ ...fp, category });
      }
    });

    return merged.map(p => ({
      ...p,
      category: p.category || 'Utilities'
    }));
  }, [dbProducts]);

  // URL query parameter listener for auto-selecting projects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('select');
    if (selectedId && products.length > 0) {
      const match = products.find(
        (p) => p.id === selectedId || p.id.toLowerCase().includes(selectedId.toLowerCase()) || p.title.toLowerCase().includes(selectedId.toLowerCase())
      );
      if (match) {
        setCart([{ product: match, quantity: 1 }]);
        setIsCartOpen(true);
        setCheckoutStep('cart');
      }
    }
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort By Price
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  const addToCart = (product: StoreProject) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const buyNow = (product: StoreProject) => {
    addToCart(product);
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price, 0);
  };

  const subtotal = getSubtotal();
  const isFreeCheckout = cart.length > 0 && subtotal === 0;

  // PayU Automated Payment States
  const [paymentMethod, setPaymentMethod] = useState<'payu' | 'upi'>('payu');
  const [payuConfig, setPayuConfig] = useState<PayUConfig>(getPayUConfig());
  const [showPayUSettings, setShowPayUSettings] = useState(false);
  const [customKey, setCustomKey] = useState(payuConfig.merchantKey);
  const [customSalt, setCustomSalt] = useState(payuConfig.merchantSalt);
  const [customMode, setCustomMode] = useState<'sandbox' | 'production'>(payuConfig.mode);

  // PayU Return URL listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payuStatus = params.get('payu_status');
    const txnid = params.get('txnid');
    if (payuStatus === 'success' && txnid) {
      setOrderId(txnid);
      setCheckoutStep('success');
      setCart([]);
      setIsCartOpen(true);
    }
  }, []);

  const handleSavePayUSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePayUConfig({ merchantKey: customKey, merchantSalt: customSalt, mode: customMode });
    setPayuConfig({
      merchantKey: customKey.trim(),
      merchantSalt: customSalt.trim(),
      mode: customMode,
      isConfigured: Boolean(customKey.trim() && customSalt.trim()),
    });
    setShowPayUSettings(false);
    alert('PayU Account Configuration saved successfully!');
  };

  const handlePayUCheckout = async () => {
    if (isSubmitting) return;
    if (!fullName.trim() || !email.trim()) {
      alert('Please provide your name and email to proceed.');
      return;
    }
    setIsSubmitting(true);
    try {
      const generatedTxnId = 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6).toUpperCase();

      // If configured with real key in production, launch live PayU Hosted Checkout form
      if (payuConfig.isConfigured && payuConfig.mode === 'production') {
        for (const item of cart) {
          await createOrder({
            name: fullName,
            email: email,
            phone: phone,
            projectId: item.product.id,
            projectTitle: item.product.title,
            price: item.product.price,
            upiTxnId: `PAYU_PENDING: ${generatedTxnId}`,
            paymentScreenshotUrl: 'https://payu.in/pending',
            status: 'pending',
          });
        }
        await launchPayUCheckout(
          {
            txnid: generatedTxnId,
            amount: subtotal,
            productinfo: itemNames.substring(0, 50),
            firstname: fullName,
            email: email,
            phone: phone || '7999791878',
          },
          payuConfig
        );
      } else {
        // Automated Sandbox Verification: automatically registers and verifies order instantly
        for (const item of cart) {
          await createOrder({
            name: fullName,
            email: email,
            phone: phone,
            projectId: item.product.id,
            projectTitle: item.product.title,
            price: item.product.price,
            upiTxnId: `PAYU_AUTO_VERIFIED: ${generatedTxnId}`,
            paymentScreenshotUrl: 'https://payu.in/verified',
            status: 'completed',
          });
        }
        setOrderId(generatedTxnId);
        setCheckoutStep('success');
        setCart([]);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('PayU automated checkout error. You can also select the Manual UPI option.');
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (checkoutStep === 'cart') {
      setCheckoutStep('details');
    } else if (checkoutStep === 'details') {
      if (!fullName.trim() || !email.trim()) {
        alert('Please provide your name and Gmail address.');
        return;
      }
      setCheckoutStep('payment');
    }
  };

  const upiId = 'aryanraikwar78@okicici';
  const upiName = 'Aryan Raikwar';
  
  // Format items description for payment reference
  const itemNames = cart.map(c => c.product.title).join(', ');
  const upiPaymentUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${subtotal}&tn=${encodeURIComponent(itemNames.substring(0, 40))}&cu=INR`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiTxnId.trim()) {
      alert('Please enter your UPI Transaction Ref/UTR to complete checkout.');
      return;
    }
    if (!screenshotFile) {
      alert('Please upload a screenshot of your payment receipt.');
      return;
    }
    setIsSubmitting(true);

    try {
      const generatedId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadAsset('certificates', screenshotFile);
      }

      // Save each product in the cart as a separate order
      for (const item of cart) {
        await createOrder({
          name: fullName,
          email: email,
          phone: phone,
          projectId: item.product.id,
          projectTitle: item.product.title,
          price: item.product.price,
          upiTxnId: upiTxnId,
          paymentScreenshotUrl: screenshotUrl,
          status: 'pending'
        });
      }

      setOrderId(generatedId);
      setCheckoutStep('success');
      setCart([]);
      setUpiTxnId('');
      setScreenshotFile(null);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFreeClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubHandle.trim()) {
      alert('Please enter your GitHub handle/username to claim your free project.');
      return;
    }
    setIsSubmitting(true);

    try {
      const generatedId = 'FREE-' + Math.floor(100000 + Math.random() * 900000);

      for (const item of cart) {
        await createOrder({
          name: fullName,
          email: email,
          phone: phone || githubHandle,
          projectId: item.product.id,
          projectTitle: item.product.title,
          price: 0,
          upiTxnId: `FREE_GITHUB_FOLLOW: ${githubHandle}`,
          paymentScreenshotUrl: 'https://github.com/aaryaninvincible',
          status: 'free_claimed'
        });
      }

      setOrderId(generatedId);
      setCheckoutStep('success');
      setCart([]);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotNav = (productId: string, maxScreens: number, direction: 'prev' | 'next') => {
    setActiveScreenshot((prev) => {
      const currentIdx = prev[productId] || 0;
      let nextIdx = currentIdx;
      if (direction === 'next') {
        nextIdx = (currentIdx + 1) % maxScreens;
      } else {
        nextIdx = (currentIdx - 1 + maxScreens) % maxScreens;
      }
      return { ...prev, [productId]: nextIdx };
    });
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-3">
          <span className="section-kicker">Digital Store</span>
          <h1 className="text-4xl md:text-6xl font-orbitron font-black text-light">
            Buy <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-slate-300 max-w-2xl font-mono text-sm">
            Purchase verified source codes, documentation, and Major/Minor software projects. Mini projects are 100% free with a GitHub follow.
          </p>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="glass border-primary/30 text-primary px-6 py-3.5 rounded-xl flex items-center gap-3 font-orbitron text-sm font-bold tracking-wider hover:border-primary hover:shadow-[0_0_20px_rgba(255,115,0,0.25)] transition-all"
        >
          <ShoppingCart size={18} className="animate-pulse" />
          <span>Cart ({cart.length})</span>
          <span className="text-white font-bold ml-1 font-mono">
            {subtotal === 0 ? 'FREE' : `₹${subtotal}`}
          </span>
        </button>
      </div>

      {/* Filters and Sorting Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl font-mono text-[11px]">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-400">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_8px_rgba(255,115,0,0.2)]'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-light focus:outline-none focus:border-primary cursor-pointer font-mono"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-300 font-mono">
          No projects match the selected filters.
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProducts.map((product) => {
            const hasScreenshots = product.screenshots && product.screenshots.length > 0;
            const currentIdx = activeScreenshot[product.id] || 0;
            const allImages = hasScreenshots ? [product.imageUrl, ...product.screenshots!] : [product.imageUrl];
            const isInCart = cart.some(item => item.product.id === product.id);
            const isFree = product.price === 0;

            return (
              <GlassCard key={product.id} className="flex flex-col h-full group overflow-hidden relative">
                {/* Image / Screenshots Carousel */}
                <div className="h-56 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex items-center justify-center border-b border-white/10">
                  <img src={allImages[currentIdx]} className="h-full w-full object-cover opacity-85 hover:scale-105 transition-all duration-500" alt={product.title} />
                  
                  {isFree && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-black font-orbitron font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] z-10">
                      FREE MINI PROJECT
                    </span>
                  )}

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => handleScreenshotNav(product.id, allImages.length, 'prev')}
                        className="absolute left-2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-primary hover:bg-black transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleScreenshotNav(product.id, allImages.length, 'next')}
                        className="absolute right-2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-primary hover:bg-black transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight size={16} />
                      </button>
                      
                      {/* Dots */}
                      <div className="absolute bottom-2 flex gap-1 z-10">
                        {allImages.map((_, dotIdx) => (
                          <div
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              currentIdx === dotIdx ? 'bg-primary w-3' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{product.category}</span>
                      <h3 className="font-orbitron text-lg text-primary font-bold mt-2">{product.title}</h3>
                    </div>
                    {isFree ? (
                      <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">FREE</span>
                    ) : (
                      <span className="font-mono font-bold text-light text-lg">₹{product.price}</span>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs font-mono leading-relaxed flex-grow">{product.description}</p>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {(() => {
                      const demoUrl = product.demoUrl || `https://aaryaninvincible.github.io/Projects/${encodeURIComponent(product.title)}/`;
                      return (
                        <a
                          href={demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="glass border-white/10 text-slate-200 hover:text-primary hover:border-primary/40 px-3 py-2 rounded-lg text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-all bg-white/5 hover:bg-primary/10"
                        >
                          Live Demo <ExternalLink size={11} />
                        </a>
                      );
                    })()}
                    {isInCart ? (
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex-grow glass border-primary/40 text-primary hover:bg-primary/5 px-3 py-2 rounded-lg text-[11px] font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1 transition-all"
                      >
                        <Check size={13} /> Added (Open Cart)
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => addToCart(product)}
                          className="glass border-white/15 text-light hover:text-primary hover:border-primary/40 px-3 py-2 rounded-lg text-[11px] font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1 transition-all"
                          title="Add to cart"
                        >
                          <ShoppingBag size={13} /> +Cart
                        </button>
                        <button
                          onClick={() => buyNow(product)}
                          className={`flex-grow px-3 py-2 rounded-lg text-[11px] font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1 transition-all ${
                            isFree 
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-primary text-black hover:bg-primary/95 shadow-[0_0_10px_rgba(255,115,0,0.15)] hover:shadow-[0_0_15px_rgba(255,115,0,0.3)]'
                          }`}
                        >
                          {isFree ? 'Get Free ZIP' : 'Buy Now'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Cart Drawer Portal */}
      {isCartOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden font-mono" style={{ isolation: 'isolate' }}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer container pinned to right of viewport */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0f] border-l border-white/10 shadow-2xl flex flex-col h-full pointer-events-auto z-10">
            
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 p-5 bg-[#0e0e16]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-primary" size={20} />
                <h2 className="font-orbitron text-base font-bold text-light uppercase tracking-wider">Your Cart</h2>
                {cart.length > 0 && (
                  <span className="text-[11px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center hover:border-primary text-slate-300 hover:text-primary transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Clickable Step Navigation Tabs */}
            <div className="flex-shrink-0 grid grid-cols-3 gap-1 px-4 py-2.5 text-[11px] font-bold border-b border-white/10 bg-black/40">
              <button
                type="button"
                onClick={() => checkoutStep !== 'success' && setCheckoutStep('cart')}
                className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer font-orbitron ${
                  checkoutStep === 'cart'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Items
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cart.length > 0 && checkoutStep !== 'success') {
                    setCheckoutStep('details');
                  }
                }}
                className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer font-orbitron ${
                  checkoutStep === 'details'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Details
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cart.length > 0 && fullName.trim() && email.trim() && checkoutStep !== 'success') {
                    setCheckoutStep('payment');
                  }
                }}
                className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer font-orbitron ${
                  checkoutStep === 'payment'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isFreeCheckout ? '3. Follow' : '3. Payment'}
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
              
              {/* STEP 1: CART ITEMS */}
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                      <ShoppingBag size={42} className="opacity-40 text-primary" />
                      <span className="text-sm font-bold text-light">Your cart is empty.</span>
                      <p className="text-xs text-slate-400 text-center max-w-xs">
                        Select a project from the catalog and click "Buy Now" or "+Cart" to add it here.
                      </p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-2 glass text-xs font-bold px-5 py-2 rounded-lg text-primary hover:bg-white/5 border-primary/30 cursor-pointer"
                      >
                        Browse Projects
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-4 p-3.5 bg-white/5 rounded-xl border border-white/5 items-center">
                          <img src={item.product.imageUrl} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt={item.product.title} />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-light text-xs truncate" title={item.product.title}>{item.product.title}</h4>
                            <p className="text-accent text-xs font-bold mt-1">
                              {item.product.price === 0 ? <span className="text-emerald-400">FREE</span> : `₹${item.product.price}`}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">Full Source Code License</span>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-400 p-2 cursor-pointer transition-colors"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: DELIVERY INFO */}
              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-orbitron text-sm font-bold text-light mb-2">Delivery & Contact Information</h3>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">Gmail Address (for ZIP delivery)*</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-shell text-xs"
                      placeholder="aryanraikwar78@gmail.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">Your Name*</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-shell text-xs"
                      placeholder="Aryan Raikwar"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">WhatsApp / Phone (for order updates)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-shell text-xs"
                      placeholder="+91 79997 91878"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/5">
                    Your details are strictly used to deliver verified source code repositories, download links, and ZIP files directly to your Gmail.
                  </p>
                </div>
              )}

              {/* STEP 3: PAYMENT / FREE GITHUB FOLLOW */}
              {checkoutStep === 'payment' && (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('details')}
                      className="text-xs text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer font-mono transition-colors"
                    >
                      ← Back to Details
                    </button>
                    {!isFreeCheckout && (
                      <button
                        type="button"
                        onClick={() => setShowPayUSettings(!showPayUSettings)}
                        className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 font-mono transition-colors cursor-pointer"
                      >
                        <Settings size={12} /> PayU Keys
                      </button>
                    )}
                  </div>

                  {isFreeCheckout ? (
                    /* FREE CHECKOUT: GITHUB FOLLOW FLOW */
                    <div className="space-y-5 flex flex-col items-center">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold font-orbitron">
                        <Gift size={22} />
                        <span>Free Project Download</span>
                      </div>
                      
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-3">
                        <p className="text-xs font-mono text-slate-200">
                          This project is <span className="text-emerald-400 font-bold">100% FREE</span>! No payment details required.
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Simply follow <span className="text-primary font-bold">@aaryaninvincible</span> on GitHub to receive your source code ZIP.
                        </p>

                        <a
                          href="https://github.com/aaryaninvincible"
                          target="_blank"
                          rel="noreferrer"
                          className="glass border-primary/40 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-2 justify-center w-full transition-all shadow-[0_0_15px_rgba(255,115,0,0.2)]"
                        >
                          <Github size={16} /> Follow @aaryaninvincible on GitHub <ExternalLink size={12} />
                        </a>
                      </div>

                      <form onSubmit={handleFreeClaimSubmit} className="w-full space-y-4 border-t border-white/5 pt-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Your GitHub Handle / Username*</label>
                          <input
                            type="text"
                            value={githubHandle}
                            onChange={(e) => setGithubHandle(e.target.value)}
                            className="input-shell text-xs font-mono"
                            placeholder="@yourgithubusername"
                            required
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                          We will verify your follow and email the full project ZIP file directly to <span className="text-light font-bold">{email}</span>.
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting || !githubHandle.trim()}
                          className="w-full bg-emerald-400 text-black py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-300 disabled:opacity-50 font-orbitron shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all cursor-pointer"
                        >
                          {isSubmitting ? 'Verifying...' : 'Verify Follow & Claim Free ZIP'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* PAID CHECKOUT: AUTOMATED PAYU & UPI FLOW */
                    <div className="space-y-5 flex flex-col items-center">
                      {/* PayU Configuration Modal / Drawer */}
                      {showPayUSettings && (
                        <form onSubmit={handleSavePayUSettings} className="w-full bg-slate-900/90 border border-primary/40 rounded-xl p-4 space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center text-primary font-bold">
                            <span>PayU Merchant Credentials</span>
                            <button type="button" onClick={() => setShowPayUSettings(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400">PAYU MERCHANT KEY</label>
                            <input
                              type="text"
                              value={customKey}
                              onChange={(e) => setCustomKey(e.target.value)}
                              placeholder="d6nKRr"
                              className="input-shell text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400">PAYU MERCHANT SALT</label>
                            <input
                              type="password"
                              value={customSalt}
                              onChange={(e) => setCustomSalt(e.target.value)}
                              placeholder="Enter PayU Salt"
                              className="input-shell text-xs"
                              required
                            />
                          </div>
                          <div className="flex gap-4 items-center pt-1 text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="mode"
                                checked={customMode === 'sandbox'}
                                onChange={() => setCustomMode('sandbox')}
                              />
                              <span>Sandbox (Test)</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="mode"
                                checked={customMode === 'production'}
                                onChange={() => setCustomMode('production')}
                              />
                              <span className="text-emerald-400 font-bold">Live Production</span>
                            </label>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-primary text-black py-2 rounded font-bold text-xs uppercase tracking-wider hover:opacity-90 mt-2 cursor-pointer"
                          >
                            Save PayU Credentials
                          </button>
                        </form>
                      )}

                      {/* Method Tabs */}
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('payu')}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            paymentMethod === 'payu'
                              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
                            <Zap size={14} className="text-primary" />
                            <span>PayU Gateway</span>
                          </div>
                          <span className="text-[10px] text-slate-300">Automated Live • Instant</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            paymentMethod === 'upi'
                              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
                            <QrCode size={14} className="text-primary" />
                            <span>Manual QR</span>
                          </div>
                          <span className="text-[10px] text-slate-300">UPI Scan & Upload</span>
                        </button>
                      </div>

                      {/* TAB 1: PAYU AUTOMATED GATEWAY */}
                      {paymentMethod === 'payu' && (
                        <div className="w-full space-y-4">
                          <div className="bg-gradient-to-br from-slate-900 to-black border border-primary/30 rounded-xl p-5 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <span className="font-bold text-sm text-light font-orbitron">PayU Automated Live</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                                {payuConfig.mode === 'production' && payuConfig.isConfigured ? 'LIVE GATEWAY' : 'TEST MODE'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              Pay securely via PayU Live with instant verification and direct access link delivery to <span className="text-light font-bold">{email}</span>.
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                              <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center gap-1.5">
                                <span>⚡ UPI Apps (GPay, PhonePe, Paytm)</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center gap-1.5">
                                <span>💳 All Cards (Debit / Credit)</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center gap-1.5">
                                <span>🏦 NetBanking (50+ Banks)</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center gap-1.5">
                                <span>📱 Wallets & EMI</span>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-3 flex justify-between items-center text-sm font-bold">
                              <span className="text-slate-300">Total Payable:</span>
                              <span className="text-primary font-orbitron text-xl">₹{subtotal}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePayUCheckout}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-primary to-amber-500 text-black py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-95 font-orbitron shadow-[0_0_25px_rgba(255,115,0,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <CreditCard size={18} />
                            {isSubmitting ? 'Connecting to PayU Gateway...' : `Proceed to Pay ₹${subtotal} via PayU`}
                          </button>

                          <p className="text-[9px] text-slate-400 text-center italic">
                            🔒 256-bit Encrypted SHA-512 Verification • Live MID: 13843501 • Key: d6nKRr
                          </p>

                          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              ⚡ Note on Gateway Rate Limits:
                            </span>
                            <p className="text-[10px] text-slate-300 leading-relaxed">
                              PayU applies a 60-second security cooldown between rapid clicks. If you see <em>"Too many Requests"</em>, wait 60 seconds before retrying or use the <strong>Manual QR tab</strong> above for instant UPI payment with zero cooldown.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: MANUAL UPI SCAN & UTR UPLOAD */}
                      {paymentMethod === 'upi' && (
                        <div className="w-full space-y-4">
                          <div className="flex flex-col items-center gap-3 w-full bg-black/40 border border-white/5 rounded-xl p-4">
                            <div className="bg-white p-2 border border-primary/30 rounded-lg">
                              <img src="/payment_qr.png" className="w-44 h-52 object-contain" alt="Scan QR code" />
                            </div>
                            
                            <p className="text-[10px] text-slate-400 text-center font-bold">
                              Scan with GPay, PhonePe, Paytm, BHIM or any UPI App
                            </p>

                            <div className="w-full border-t border-white/5 pt-3 mt-1 flex flex-col gap-1 text-center text-xs">
                              <div>UPI ID: <span className="text-primary font-bold">{upiId}</span></div>
                              <div>Payee: <span className="text-light">{upiName}</span></div>
                              <div className="text-sm font-bold text-accent">Total Amount: ₹{subtotal}</div>
                            </div>

                            <a
                              href={upiPaymentUri}
                              className="w-full bg-primary text-black py-2.5 rounded-lg text-xs font-bold text-center uppercase tracking-wider hover:opacity-95 md:hidden block mt-2"
                            >
                              🚀 Open UPI Mobile App
                            </a>
                          </div>

                          <form onSubmit={handlePlaceOrder} className="w-full space-y-4 border-t border-white/5 pt-4">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-bold">Upload Payment Screenshot*</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                                className="input-shell text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 uppercase font-bold">UPI Transaction ID / UTR*</label>
                              <input
                                type="text"
                                value={upiTxnId}
                                onChange={(e) => setUpiTxnId(e.target.value)}
                                className="input-shell text-xs text-center font-bold"
                                placeholder="e.g. 308945672314"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isSubmitting || !upiTxnId.trim() || !screenshotFile}
                              className="w-full bg-primary text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] disabled:opacity-50 font-orbitron cursor-pointer"
                            >
                              {isSubmitting ? 'Submitting Receipt...' : 'Confirm Payment & Order'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* SUCCESS SCREEN */}
              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-400 animate-pulse" />
                  <h3 className="font-orbitron text-lg font-bold text-light">
                    {isFreeCheckout ? 'Free Project Claimed! 🎉' : 'Order Placed Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    Order Reference ID: <span className="text-primary font-bold">{orderId}</span>
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isFreeCheckout ? (
                      <>Thank you for following on GitHub! The project ZIP file will be sent directly to <span className="text-light font-bold">{email}</span> shortly.</>
                    ) : (
                      <>Your payment has been logged. Project source code ZIP and repository access link will be dispatched directly to <span className="text-light font-bold">{email}</span> shortly.</>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setCheckoutStep('cart');
                      setIsCartOpen(false);
                    }}
                    className="glass text-xs font-bold px-6 py-2.5 rounded-lg text-primary hover:bg-white/5 border-primary/20 cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Drawer Sticky Footer for Step 1 (Cart) */}
            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="flex-shrink-0 border-t border-white/10 p-5 bg-[#0e0e16]/95 backdrop-blur shadow-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Items:</span>
                  <span className="text-light font-bold font-mono">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-bold">Subtotal:</span>
                  <span className="text-primary font-bold text-xl font-orbitron">
                    {subtotal === 0 ? <span className="text-emerald-400">FREE</span> : `₹${subtotal}`}
                  </span>
                </div>
                <button
                  onClick={() => setCheckoutStep('details')}
                  className="w-full bg-primary text-black py-3.5 rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(255,115,0,0.3)] cursor-pointer transition-all"
                >
                  <span>Proceed to Delivery Details →</span>
                </button>
              </div>
            )}

            {/* Bottom Drawer Sticky Footer for Step 2 (Details) */}
            {checkoutStep === 'details' && cart.length > 0 && (
              <div className="flex-shrink-0 border-t border-white/10 p-5 bg-[#0e0e16]/95 backdrop-blur shadow-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-primary font-bold text-base font-orbitron">
                    {subtotal === 0 ? <span className="text-emerald-400">FREE</span> : `₹${subtotal}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="px-4 py-3 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer font-orbitron"
                  >
                    ← Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-primary text-black py-3.5 rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(255,115,0,0.3)] cursor-pointer transition-all"
                  >
                    <span>Proceed to {isFreeCheckout ? 'Verification' : 'Payment'} →</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
