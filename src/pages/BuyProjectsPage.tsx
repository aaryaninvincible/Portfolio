import React, { useEffect, useState } from 'react';
import { ShoppingCart, ShoppingBag, X, Plus, Minus, Trash2, ExternalLink, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { subscribeToStoreProducts, createOrder } from '../lib/realtime';
import type { StoreProject } from '../types';

export const BuyProjectsPage: React.FC = () => {
  const [products, setProducts] = useState<StoreProject[]>([]);
  const [cart, setCart] = useState<Array<{ product: StoreProject; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carousel screenshots index tracker
  const [activeScreenshot, setActiveScreenshot] = useState<Record<string, number>>({});

  useEffect(() => {
    return subscribeToStoreProducts(setProducts);
  }, []);

  const addToCart = (product: StoreProject) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const qty = item.quantity + delta;
            return { ...item, quantity: qty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
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

  const upiId = 'aryanraikwar78@okaxis';
  const subtotal = getSubtotal();
  const upiName = 'Aryan Raikwar';
  
  // Format items description for payment reference
  const itemNames = cart.map(c => `${c.product.title} x${c.quantity}`).join(', ');
  const upiPaymentUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${subtotal}&tn=${encodeURIComponent(itemNames.substring(0, 40))}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=255-115-0&bgcolor=0-0-0&data=${encodeURIComponent(upiPaymentUri)}`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiTxnId.trim()) {
      alert('Please enter your UPI Transaction Ref/UTR to complete checkout.');
      return;
    }
    setIsSubmitting(true);

    try {
      const generatedId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      
      // Save each product in the cart as a separate order
      for (const item of cart) {
        await createOrder({
          name: fullName,
          email: email,
          phone: phone,
          projectId: item.product.id,
          projectTitle: item.product.title,
          price: item.product.price * item.quantity,
          upiTxnId: upiTxnId,
          status: 'pending'
        });
      }

      setOrderId(generatedId);
      setCheckoutStep('success');
      setCart([]);
      setUpiTxnId('');
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
          <span>Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          <span className="text-white font-bold ml-1 font-mono">₹{cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}</span>
        </button>
      </div>

      {products.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-300 font-mono">
          No projects listed for sale yet. Check back soon or visit Admin Panel to list.
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const hasScreenshots = product.screenshots && product.screenshots.length > 0;
            const currentIdx = activeScreenshot[product.id] || 0;
            const allImages = hasScreenshots ? [product.imageUrl, ...product.screenshots!] : [product.imageUrl];

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
                    <h3 className="font-orbitron text-xl text-primary font-bold">{product.title}</h3>
                    <span className="font-mono font-bold text-accent text-lg">₹{product.price}</span>
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
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-grow bg-primary text-black hover:bg-primary/95 px-4 py-2 rounded-lg text-xs font-bold font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,115,0,0.15)] hover:shadow-[0_0_15px_rgba(255,115,0,0.3)] transition-all"
                    >
                      <ShoppingBag size={13} /> Buy Project
                    </button>
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
                              
                              {/* Quantity selectors */}
                              <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded bg-white/10 hover:bg-primary/20 hover:text-white flex items-center justify-center text-xs">
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs text-light w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-primary/20 hover:text-white flex items-center justify-center text-xs">
                                  <Plus size={10} />
                                </button>
                              </div>
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
                      <div className="bg-black p-2 border border-primary/30 rounded-lg">
                        <img src={qrCodeUrl} className="w-40 h-40 object-contain" alt="Scan QR code" />
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
                        Enter UTR reference after payment. We will verify and email download files to <span className="text-light font-bold">{email}</span>.
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting || !upiTxnId.trim()}
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
