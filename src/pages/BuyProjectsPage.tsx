import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, ShoppingBag, X, Trash2, ExternalLink, CheckCircle2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { subscribeToStoreProducts, createOrder, uploadAsset } from '../lib/realtime';
import type { StoreProject } from '../types';

const fallbackStoreProjects: StoreProject[] = [
  {
    id: 'store-windows11-clone',
    title: 'Windows 11 Clone',
    description: 'A premium CSS & React reproduction of the Windows 11 desktop experience, complete with an interactive Start Menu, taskbar, widgets, and draggable windows.',
    price: 399,
    imageUrl: 'https://images.unsplash.com/photo-1628277613967-6abca504d0ac?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-excel-ai',
    title: 'Excel AI Editor',
    description: 'AI-powered spreadsheet editor featuring inline formulas, batch text cleaning, data formatting, and smart sheet operations.',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-spotify-clone',
    title: 'Spotify Web Player',
    description: 'Fully responsive HTML/CSS/JS clone of the Spotify web player UI with custom playlists, animated music player bars, and hover utilities.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-youtube-clone',
    title: 'YouTube Portal Clone',
    description: 'Sleek frontend dashboard clone of YouTube\'s video portal, complete with collapsible sidebars, video player grids, and category filter bars.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-myntra-clone',
    title: 'Myntra Design Clone',
    description: 'E-commerce store clone mimicking the Myntra design, featuring responsive shopping categories, wishlist, and sliding banners.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-billing-software',
    title: 'Billing & Invoice System',
    description: 'Standalone system equipped to catalog sales, calculate GST/VAT, generate invoices, and print receipt summaries in one-click.',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-socketio-chat',
    title: 'Socket.IO Chat App',
    description: 'Real-time communication app built with Node.js and Socket.io, featuring multiple rooms, message timestamps, and active user list.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-drawing-pad',
    title: 'HTML5 Drawing Pad',
    description: 'HTML5 canvas drawing board with custom brushes, color palettes, size controls, eraser tool, and export-to-image option.',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-sorting-visualizer',
    title: 'Sorting Visualizer',
    description: 'Interactive algorithm visualizer showing Bubble Sort, Merge Sort, and Quick Sort operations with adjustable execution speeds.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-mindstate-analyzer',
    title: 'MindState Analyzer',
    description: 'AI health application designed to analyze journal logs and evaluate stress and focus metrics with visual charting.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-2048-game',
    title: '2048 Game Classic',
    description: 'Responsive slider puzzle game built in Vanilla Javascript with smooth sliding cell animations and local high score tracking.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-bawarchi2',
    title: 'Bawarchi 2.0 Website',
    description: 'Premium restaurant ordering landing page featuring interactive menus, shopping drawers, and polished responsive sections.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-pdf-opener',
    title: 'PDF Password Opener',
    description: 'A utility program that uses key processing algorithms to safely unlock and decrypt password-protected PDF files.',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-pdf-editor',
    title: 'PDF Editor WebApp',
    description: 'A browser-based editor built to split, merge, rotate, annotate, and manage PDF documents with instant exports.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-notepad',
    title: 'Rich Note Pad',
    description: 'Clean text writing application featuring rich formatting tools, category tagging, search filters, and automatic local storage.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-attendance-tracker',
    title: 'Attendance Tracker System',
    description: 'Responsive database logger built to track student/employee logs, check-in timestamps, and generate monthly reports.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-qr-scanner',
    title: 'QR Code Camera Scanner',
    description: 'Utility app utilizing browser media devices to scan, decode, and open links embedded within QR codes instantly.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-mock-test',
    title: 'Online Mock Test System',
    description: 'Responsive educational portal featuring multiple-choice questions, automated timer thresholds, and grading summaries.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-screen-recorder',
    title: 'Web Screen Recorder',
    description: 'Browser capturing utility that records active window, tab, or full screen video and audio, exporting ready-to-use webm clips.',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1461151304267-38cd8907a900?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-wordle-clone',
    title: 'Wordle Guessing Game',
    description: 'Interactive clone of the viral word game Wordle, featuring key styling animations, stat analytics, and win streak counters.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-typing-game',
    title: 'Typing Speed Assessor',
    description: 'Game UI measuring keystroke accuracy, word counts, and WPM speeds over customizable training periods.',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-watch-store',
    title: 'Luxury Watch Store Portal',
    description: 'Minimalist product showroom for luxury timepieces with dynamic sliding banners and custom cart integrations.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-nebula-chat',
    title: 'Nebula Chat Interface',
    description: 'Responsive chat environment utilizing Firebase Realtime Database for persistent global and channel text messaging.',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1577563906417-a0a84594612d?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-disk-scheduling',
    title: 'Disk Scheduling Simulator',
    description: 'Academic visualizer charting operating system disk arm movements (FCFS, SCAN, SSTF) with responsive data grids.',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-linguistic',
    title: 'Linguistic Academy Portal',
    description: 'Educational website offering interactive foreign language courses, clean student navigation, and signup forms.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-weather-app',
    title: 'Forecast Weather App',
    description: 'Real-time forecasting tool requesting open weather API statistics to display humidity, wind speeds, and temperature overlays.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-todo-list',
    title: 'Responsive To-Do List',
    description: 'Modern task organizer featuring category grouping, completion tracking, list sorting, and state memory.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-password-gen',
    title: 'Secure Password Generator',
    description: 'Developer utility configuring cryptographic character sets to generate custom, crack-resistant keys.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'store-analog-watch',
    title: 'Analog Clock ticking UI',
    description: 'Elegant CSS grid stopwatch and analog clock widget matching precise system time events.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60',
  }
];

export const BuyProjectsPage: React.FC = () => {
  const [dbProducts, setDbProducts] = useState<StoreProject[]>([]);
  const [cart, setCart] = useState<Array<{ product: StoreProject; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price, 0);
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
  const subtotal = getSubtotal();
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
            Purchase verified source codes, documentation, and Major/Minor software projects. Maintained and sent securely via Gmail.
          </p>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="glass border-primary/30 text-primary px-6 py-3.5 rounded-xl flex items-center gap-3 font-orbitron text-sm font-bold tracking-wider hover:border-primary hover:shadow-[0_0_20px_rgba(255,115,0,0.25)] transition-all"
        >
          <ShoppingCart size={18} className="animate-pulse" />
          <span>Cart ({cart.length})</span>
          <span className="text-white font-bold ml-1 font-mono">₹{subtotal}</span>
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

            return (
              <GlassCard key={product.id} className="flex flex-col h-full group overflow-hidden relative">
                {/* Image / Screenshots Carousel */}
                <div className="h-56 bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  <img src={allImages[currentIdx]} className="h-full w-full object-cover opacity-85 hover:scale-105 transition-all duration-500" alt={product.title} />
                  
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
                    <span className="font-mono font-bold text-light text-lg">₹{product.price}</span>
                  </div>

                  <p className="text-slate-300 text-xs font-mono leading-relaxed flex-grow">{product.description}</p>

                  <div className="flex flex-wrap gap-2.5 pt-4">
                    {product.demoUrl && (
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="glass border-white/5 text-slate-300 hover:text-primary hover:border-primary/20 px-4 py-2 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 transition-colors"
                      >
                        Live Demo <ExternalLink size={12} />
                      </a>
                    )}
                    {isInCart ? (
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex-grow glass border-primary/40 text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-xs font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check size={13} /> In Cart (Open)
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-grow bg-primary text-black hover:bg-primary/95 px-4 py-2 rounded-lg text-xs font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,115,0,0.15)] hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] transition-all"
                      >
                        <ShoppingBag size={13} /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-mono">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-dark border-l border-white/10 shadow-2xl p-6 flex flex-col h-full relative">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-primary" size={20} />
                  <h2 className="font-orbitron text-lg font-bold text-light uppercase tracking-wider">Your Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center hover:border-primary text-slate-300 hover:text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Steps indicators */}
              <div className="grid grid-cols-3 gap-2 py-4 text-[10px] text-center text-slate-400 font-bold border-b border-white/5">
                <span className={checkoutStep === 'cart' ? 'text-primary' : ''}>1. Items</span>
                <span className={checkoutStep === 'details' ? 'text-primary' : ''}>2. Delivery Info</span>
                <span className={checkoutStep === 'payment' ? 'text-primary' : ''}>3. Pay UPI</span>
              </div>

              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto py-4 space-y-6">
                
                {/* STEP 1: CART ITEMS */}
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ShoppingBag size={36} className="opacity-40" />
                        <span className="text-xs">Your cart is empty.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 items-center">
                            <img src={item.product.imageUrl} className="w-16 h-16 object-cover rounded-lg" alt={item.product.title} />
                            <div className="flex-grow">
                              <h4 className="font-bold text-light text-sm">{item.product.title}</h4>
                              <p className="text-accent text-xs font-bold mt-1">₹{item.product.price}</p>
                              
                              <span className="text-[10px] text-slate-400 mt-1 block">Full Source Code License</span>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-red-400 p-2"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
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
                    <h3 className="font-orbitron text-sm font-bold text-light mb-4">Delivery & Contact Information</h3>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 uppercase">Gmail Address (for delivery)*</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-shell text-xs"
                        placeholder="yourname@gmail.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 uppercase">Your Name*</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-shell text-xs"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 uppercase">WhatsApp / Phone (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-shell text-xs"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/5">
                      Information is strictly used to send the software source code, setup files, and project repositories directly to your Gmail account.
                    </p>
                  </div>
                )}

                {/* STEP 3: UPI PAYMENT */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-5 flex flex-col items-center">
                    <h3 className="font-orbitron text-sm font-bold text-light self-start">UPI Payments Gateway</h3>
                    
                    <div className="flex flex-col items-center gap-3 w-full bg-black/40 border border-white/5 rounded-xl p-4">
                      {/* QR Code */}
                      <div className="bg-white p-2 border border-primary/30 rounded-lg">
                        <img src="/payment_qr.png" className="w-48 h-56 object-contain" alt="Scan QR code" />
                      </div>
                      
                      <p className="text-[10px] text-slate-400 text-center font-bold">
                        Scan with GPay, PhonePe, Paytm, BHIM or any UPI App
                      </p>

                      <div className="w-full border-t border-white/5 pt-3 mt-1 flex flex-col gap-1.5 text-center text-xs">
                        <div>UPI ID: <span className="text-primary font-bold">{upiId}</span></div>
                        <div>Payee: <span className="text-light">{upiName}</span></div>
                        <div className="text-sm font-bold text-accent">Total Amount: ₹{subtotal}</div>
                      </div>

                      {/* Mobile Launch Button */}
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
                      <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                        Upload screenshot and enter UTR. We will verify and email download files to <span className="text-light font-bold">{email}</span>.
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting || !upiTxnId.trim() || !screenshotFile}
                        className="w-full bg-primary text-black py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] disabled:opacity-50 font-orbitron"
                      >
                        {isSubmitting ? 'Submitting Receipt...' : 'Confirm Payment & Order'}
                      </button>
                    </form>
                  </div>
                )}

                {/* SUCCESS SCREEN */}
                {checkoutStep === 'success' && (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <CheckCircle2 size={48} className="text-primary animate-pulse" />
                    <h3 className="font-orbitron text-lg font-bold text-light">Order Submitted!</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      Your order reference is <span className="text-primary font-bold">{orderId}</span>. 
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Aryan Raikwar will verify the UPI Transaction ID (<span className="text-light font-bold">{upiTxnId}</span>) and email the repository link or zip download to <span className="text-light font-bold">{email}</span> shortly.
                    </p>
                    <button
                      onClick={() => {
                        setCheckoutStep('cart');
                        setIsCartOpen(false);
                      }}
                      className="glass text-xs font-bold px-6 py-2.5 rounded-lg text-primary hover:bg-white/5 border-primary/20"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Drawer Footer */}
              {checkoutStep !== 'success' && checkoutStep !== 'payment' && cart.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-auto">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-slate-400">Total Items:</span>
                    <span className="text-light font-bold">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-6">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-primary font-bold text-lg">₹{subtotal}</span>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-primary text-black py-3 rounded-lg text-xs font-bold font-orbitron uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(255,115,0,0.2)]"
                  >
                    <span>Proceed to {checkoutStep === 'cart' ? 'Delivery Details' : 'UPI Payment'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
