import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { Check, FileUp, Lock, LogIn, LogOut, Mail, Plus, Trash2, ShoppingCart, Tag } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { auth } from '../lib/firebase';
import {
  deleteCertificate,
  deleteMessage,
  deleteProject,
  deleteRepoRequest,
  saveCertificate,
  saveProject,
  saveResume,
  subscribeToCertificates,
  subscribeToMessages,
  subscribeToProjects,
  subscribeToRepoRequests,
  updateMessage,
  updateRepoRequest,
  uploadAsset,
  subscribeToStoreProducts,
  subscribeToOrders,
  saveStoreProduct,
  deleteStoreProduct,
  updateOrder,
  deleteOrder
} from '../lib/realtime';
import type { Certificate, ContactMessage, PortfolioProject, RepoRequest, StoreProject, Order } from '../types';

type AdminTab = 'messages' | 'requests' | 'projects' | 'certificates' | 'resume' | 'store_products' | 'store_orders';

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'messages', label: 'Messages' },
  { id: 'requests', label: 'Repo Requests' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'resume', label: 'Resume' },
  { id: 'store_products', label: 'Store Products' },
  { id: 'store_orders', label: 'Store Orders' }
];

const formatDate = (value?: number) => (value ? new Date(value).toLocaleString() : 'Just now');

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('aryanraikwar78@gmail.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<AdminTab>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [requests, setRequests] = useState<RepoRequest[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Store states
  const [storeProducts, setStoreProducts] = useState<StoreProject[]>([]);
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  
  const [busy, setBusy] = useState('');

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return undefined;

    const unsubMessages = subscribeToMessages(setMessages);
    const unsubRequests = subscribeToRepoRequests(setRequests);
    const unsubProjects = subscribeToProjects(setProjects);
    const unsubCertificates = subscribeToCertificates(setCertificates);
    const unsubStoreProducts = subscribeToStoreProducts(setStoreProducts);
    const unsubOrders = subscribeToOrders(setStoreOrders);

    return () => {
      unsubMessages();
      unsubRequests();
      unsubProjects();
      unsubCertificates();
      unsubStoreProducts();
      unsubOrders();
    };
  }, [user]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setAuthError('Login failed. Create this admin user in Firebase Authentication or check password.');
    }
  };

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mediaFile = form.get('media') as File;
    setBusy('Saving project...');

    try {
      const mediaUrl = mediaFile?.size ? await uploadAsset('projects', mediaFile) : '';
      const mediaType = mediaFile?.type || '';
      await saveProject({
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        technologies: String(form.get('technologies') || '')
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
        category: String(form.get('category') || 'Software'),
        useCase: String(form.get('useCase') || ''),
        demoUrl: String(form.get('demoUrl') || ''),
        imageUrl: mediaType.startsWith('image/') ? mediaUrl : '',
        videoUrl: mediaType.startsWith('video/') ? mediaUrl : '',
        featured: form.get('featured') === 'on',
        source: 'admin',
      });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  const handleStoreProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const primaryImgFile = form.get('primaryImage') as File;
    if (!primaryImgFile?.size) {
      alert('Please upload a primary image.');
      return;
    }
    setBusy('Listing store product...');

    try {
      const imageUrl = await uploadAsset('projects', primaryImgFile);
      const screenshotsStr = String(form.get('screenshots') || '');
      const screenshots = screenshotsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await saveStoreProduct({
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        price: Number(form.get('price') || 0),
        demoUrl: String(form.get('demoUrl') || ''),
        imageUrl,
        screenshots
      });
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      alert('Error creating store product listing.');
    } finally {
      setBusy('');
    }
  };

  const handleCertificateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('certificate') as File;
    if (!file?.size) return;
    setBusy('Uploading certificate...');

    try {
      const imageUrl = await uploadAsset('certificates', file);
      await saveCertificate({
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        issuer: String(form.get('issuer') || ''),
        date: String(form.get('date') || ''),
        imageUrl,
      });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  const handleResumeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('resume') as File;
    if (!file?.size) return;
    setBusy('Uploading resume...');

    try {
      const fileUrl = await uploadAsset('resume', file);
      await saveResume({ title: String(form.get('title') || 'Aryan Raikwar Resume'), fileUrl });
      event.currentTarget.reset();
    } finally {
      setBusy('');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <GlassCard className="w-full max-w-md p-10">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/50">
              <Lock className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-3xl font-orbitron font-bold text-light">
              Admin <span className="text-gradient">Access</span>
            </h1>
            <p className="text-sm font-mono text-slate-400">Firebase Auth protected dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input className="input-shell" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" required />
            <input className="input-shell" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
            {authError && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{authError}</p>}
            <button type="submit" className="w-full glass text-primary border-primary/30 py-3 rounded-lg font-orbitron tracking-widest uppercase flex justify-center items-center gap-2">
              <LogIn size={18} /> Login
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-8 font-mono">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="section-kicker">Admin panel</span>
          <h1 className="text-4xl font-orbitron font-black text-light">Portfolio Control Room</h1>
        </div>
        <button onClick={() => signOut(auth)} className="glass rounded-lg px-4 py-3 text-red-300 inline-flex items-center gap-2 self-start">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              tab === item.id ? 'bg-primary text-black font-bold' : 'glass text-light hover:text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {busy && <div className="glass rounded-lg p-4 text-primary text-sm">{busy}</div>}

      {tab === 'messages' && (
        <div className="grid gap-5">
          {messages.map((message) => (
            <GlassCard key={message.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-orbitron text-xl text-primary">{message.name}</h2>
                  <p className="text-sm text-slate-400">{message.email} {message.phone ? `- ${message.phone}` : ''}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(message.createdAt)} - {message.topic}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{message.status || 'new'}</span>
              </div>
              <p className="mt-5 text-slate-300 text-xs whitespace-pre-wrap">{message.message}</p>
              <textarea
                className="input-shell mt-5 min-h-24 text-xs"
                placeholder="Write reply note here..."
                defaultValue={message.reply || ''}
                onBlur={(event) => updateMessage(message.id, { reply: event.target.value })}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <a className="glass rounded-lg px-4 py-2 text-primary inline-flex items-center gap-2 text-xs" href={`mailto:${message.email}?subject=Reply from Aryan Raikwar&body=${encodeURIComponent(message.reply || '')}`}>
                  <Mail size={16} /> Open Mail
                </a>
                <button className="glass rounded-lg px-4 py-2 text-accent inline-flex items-center gap-2 text-xs" onClick={() => updateMessage(message.id, { status: 'replied' })}>
                  <Check size={16} /> Mark Replied
                </button>
                <button className="glass rounded-lg px-4 py-2 text-red-300 inline-flex items-center gap-2 text-xs" onClick={() => deleteMessage(message.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
          {messages.length === 0 && <GlassCard className="p-8 text-center text-slate-300 text-xs">No messages yet.</GlassCard>}
        </div>
      )}

      {tab === 'requests' && (
        <div className="grid gap-5">
          {requests.map((request) => (
            <GlassCard key={request.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-orbitron text-xl text-accent">{request.projectTitle}</h2>
                  <p className="text-sm text-slate-400">{request.name} - {request.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(request.createdAt)}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{request.status || 'pending'}</span>
              </div>
              <p className="mt-5 text-slate-300 text-xs whitespace-pre-wrap">{request.reason}</p>
              <textarea className="input-shell mt-5 min-h-24 text-xs" placeholder="Decision/reply note..." defaultValue={request.reply || ''} onBlur={(event) => updateRepoRequest(request.id, { reply: event.target.value })} />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="glass rounded-lg px-4 py-2 text-accent text-xs" onClick={() => updateRepoRequest(request.id, { status: 'approved' })}>Approve</button>
                <button className="glass rounded-lg px-4 py-2 text-secondary text-xs" onClick={() => updateRepoRequest(request.id, { status: 'mailed' })}>Mark Mailed</button>
                <a className="glass rounded-lg px-4 py-2 text-primary inline-flex items-center gap-2 text-xs" href={`mailto:${request.email}?subject=Repo access for ${encodeURIComponent(request.projectTitle)}&body=${encodeURIComponent(request.reply || 'Hi, your repo request has been reviewed.')}`}>
                  <Mail size={16} /> Mail User
                </a>
                <button className="glass rounded-lg px-4 py-2 text-red-300 inline-flex items-center gap-2 text-xs" onClick={() => deleteRepoRequest(request.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
          {requests.length === 0 && <GlassCard className="p-8 text-center text-slate-300 text-xs">No repo requests yet.</GlassCard>}
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <h2 className="font-orbitron text-xl text-primary mb-5">Add Portfolio Project</h2>
            <form onSubmit={handleProjectSubmit} className="space-y-4 text-xs">
              <input name="title" className="input-shell text-xs" placeholder="Project title" required />
              <textarea name="description" className="input-shell min-h-24 text-xs" placeholder="Description" required />
              <input name="technologies" className="input-shell text-xs" placeholder="React, Firebase, AI/ML" required />
              <input name="category" className="input-shell text-xs" placeholder="Web, AI, IoT, BTech Project" required />
              <input name="useCase" className="input-shell text-xs" placeholder="Use case" />
              <input name="demoUrl" className="input-shell text-xs" placeholder="Demo URL optional" />
              <input name="media" className="input-shell text-xs" type="file" accept="image/*,video/*" />
              <label className="flex items-center gap-3 text-slate-300">
                <input name="featured" type="checkbox" className="h-4 w-4" /> Show as featured
              </label>
              <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2 text-xs">
                <Plus size={18} /> Save Project
              </button>
            </form>
          </GlassCard>
          <div className="grid gap-4">
            {projects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h3 className="font-orbitron text-sm text-light">{project.title}</h3>
                  <p className="text-[11px] text-slate-400">{project.category} - {project.technologies?.join(', ')}</p>
                </div>
                {project.source !== 'github' && (
                  <button className="text-red-300" onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.title}`}>
                    <Trash2 size={18} />
                  </button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <h2 className="font-orbitron text-xl text-primary mb-5">Upload Certificate</h2>
            <form onSubmit={handleCertificateSubmit} className="space-y-4 text-xs">
              <input name="title" className="input-shell text-xs" placeholder="Certificate title" required />
              <input name="issuer" className="input-shell text-xs" placeholder="Issuer" />
              <input name="date" className="input-shell text-xs" placeholder="Date / year" />
              <textarea name="description" className="input-shell min-h-24 text-xs" placeholder="Description" required />
              <input name="certificate" className="input-shell text-xs" type="file" accept="image/*" required />
              <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2 text-xs">
                <FileUp size={18} /> Upload Certificate
              </button>
            </form>
          </GlassCard>
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((certificate) => (
              <GlassCard key={certificate.id} className="overflow-hidden">
                <img src={certificate.imageUrl} alt={certificate.title} className="h-40 w-full object-cover" />
                <div className="p-4 text-xs">
                  <h3 className="font-orbitron text-primary">{certificate.title}</h3>
                  <button className="mt-3 text-red-300 inline-flex items-center gap-2" onClick={() => deleteCertificate(certificate.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'resume' && (
        <GlassCard className="p-6 max-w-2xl">
          <h2 className="font-orbitron text-xl text-primary mb-5">Upload Resume PDF</h2>
          <form onSubmit={handleResumeSubmit} className="space-y-4 text-xs">
            <input name="title" className="input-shell text-xs" placeholder="Resume title" defaultValue="Aryan Raikwar Resume" />
            <input name="resume" className="input-shell text-xs" type="file" accept="application/pdf" required />
            <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2 text-xs">
              <FileUp size={18} /> Upload Resume
            </button>
          </form>
        </GlassCard>
      )}

      {/* STORE PRODUCTS TAB */}
      {tab === 'store_products' && (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6">
            <h2 className="font-orbitron text-xl text-primary mb-5 flex items-center gap-2"><Tag size={18}/> List Product For Sale</h2>
            <form onSubmit={handleStoreProductSubmit} className="space-y-4 text-xs">
              <input name="title" className="input-shell text-xs" placeholder="Project Title" required />
              <textarea name="description" className="input-shell min-h-24 text-xs" placeholder="Detailed product description (e.g. Major project setup files, features)" required />
              <input name="price" type="number" className="input-shell text-xs" placeholder="Price (INR)" required />
              <input name="demoUrl" className="input-shell text-xs" placeholder="Live Demo URL (Optional)" />
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Primary Product Image*</label>
                <input name="primaryImage" className="input-shell text-xs" type="file" accept="image/*" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Screenshots URLs (Comma separated)</label>
                <textarea name="screenshots" className="input-shell min-h-16 text-xs" placeholder="https://image-url-1.png, https://image-url-2.png" />
              </div>

              <button className="glass rounded-lg px-5 py-3 text-primary font-bold inline-flex items-center gap-2 text-xs">
                <Plus size={18} /> List Project For Sale
              </button>
            </form>
          </GlassCard>

          <div className="grid gap-4">
            {storeProducts.map((prod) => (
              <GlassCard key={prod.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex gap-4 items-center">
                  <img src={prod.imageUrl} className="w-14 h-14 object-cover rounded-lg border border-white/10" alt={prod.title} />
                  <div>
                    <h3 className="font-orbitron text-sm text-light">{prod.title}</h3>
                    <p className="text-[11px] text-accent font-bold mt-1">₹{prod.price}</p>
                  </div>
                </div>
                <button className="text-red-300 hover:text-red-500 p-2" onClick={() => deleteStoreProduct(prod.id)} aria-label={`Delete ${prod.title}`}>
                  <Trash2 size={18} />
                </button>
              </GlassCard>
            ))}
            {storeProducts.length === 0 && <GlassCard className="p-8 text-center text-slate-400 text-xs">No products listed in store.</GlassCard>}
          </div>
        </div>
      )}

      {/* STORE ORDERS TAB */}
      {tab === 'store_orders' && (
        <div className="grid gap-5">
          {storeOrders.map((ord) => (
            <GlassCard key={ord.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between text-xs">
                <div>
                  <h2 className="font-orbitron text-lg text-primary flex items-center gap-2"><ShoppingCart size={16}/> {ord.projectTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1">Customer: <span className="text-light">{ord.name}</span> - Gmail: <span className="text-primary underline">{ord.email}</span></p>
                  {ord.phone && <p className="text-xs text-slate-400">WhatsApp: <span className="text-light">{ord.phone}</span></p>}
                  <p className="text-[11px] text-slate-500 mt-2">Placed: {formatDate(ord.createdAt)} - Reference Ref: <span className="text-slate-300 font-bold">{ord.id}</span></p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-bold text-sm text-accent">₹{ord.price}</span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    ord.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    ord.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                  }`}>{ord.status || 'pending'}</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs mt-4">
                <div>UPI Ref / Transaction UTR: <span className="text-primary font-bold">{ord.upiTxnId || 'N/A'}</span></div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5 text-xs">
                <button className="glass rounded-lg px-4 py-2 text-green-400 font-bold" onClick={() => updateOrder(ord.id, { status: 'completed' })}>Approve / Completed</button>
                <button className="glass rounded-lg px-4 py-2 text-red-400 font-bold" onClick={() => updateOrder(ord.id, { status: 'failed' })}>Mark Failed</button>
                
                <a 
                  className="glass rounded-lg px-4 py-2 text-primary inline-flex items-center gap-2" 
                  href={`mailto:${ord.email}?subject=${encodeURIComponent('Your Project Order: ' + ord.projectTitle)}&body=${encodeURIComponent(
                    `Hi ${ord.name},\n\nThank you for purchasing ${ord.projectTitle}.\n\nYour order has been approved. You can access/download the files here:\n[INSERT REPOSITORY OR ZIP DOWNLOAD LINK HERE]\n\nLet me know if you need setup help!\n\nRegards,\nAryan Raikwar`
                  )}`}
                >
                  <Mail size={14} /> Send Software Mail
                </a>

                <button className="glass rounded-lg px-4 py-2 text-red-300 inline-flex items-center gap-1.5" onClick={() => deleteOrder(ord.id)}>
                  <Trash2 size={14} /> Delete Record
                </button>
              </div>
            </GlassCard>
          ))}
          {storeOrders.length === 0 && <GlassCard className="p-8 text-center text-slate-400 text-xs">No store purchase orders yet.</GlassCard>}
        </div>
      )}

    </div>
  );
};
